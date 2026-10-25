'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Keyboard, Mic, PhoneOff, RotateCcw, Send } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { usePeople, PersonPicker } from '@/components/app/PersonPicker';
import { PageHeader, Card, Label, Button, inputClass, Notice, BookRef, friendlyError } from '@/components/app/ui';

type Phase = 'setup' | 'text' | 'connecting' | 'live' | 'debrief';
type Mode = 'text' | 'voice';
type Difficulty = 'gentle' | 'realistic' | 'tough';
type Turn = { role: 'user' | 'assistant'; text: string; safety?: boolean };
type Debrief = {
  headline: string;
  didWell: string[];
  gaveGround: { quote: string; what: string; tryInstead: string }[];
  nextTime: string;
  holdRating: number;
  bookRef: { chapter: number; title: string };
};
type Delivery = { wpm: number | null; talkRatioPct: number | null; pauses: number; steadiness: string | null };

const DIFFICULTIES: { id: Difficulty; label: string; hint: string }[] = [
  { id: 'gentle', label: 'Gentle', hint: 'Pushes back a little, then listens.' },
  { id: 'realistic', label: 'Realistic', hint: 'Pushes back the way they really would.' },
  { id: 'tough', label: 'Tough', hint: 'Guilt, silence, a raised voice, charm. Holds out.' },
];


// ---- audio helpers ----
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
  }
  return btoa(binary);
}
function float32ToPcm16Base64(input: Float32Array): string {
  const pcm = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return bytesToBase64(new Uint8Array(pcm.buffer));
}
function base64ToFloat32(b64: string): Float32Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const pcm = new Int16Array(bytes.buffer);
  const out = new Float32Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) out[i] = pcm[i] / 32768;
  return out;
}

// Rough fundamental-pitch (F0) estimate for one voiced frame, via
// autocorrelation over the human speech range (80-350 Hz). Returns Hz, or 0
// if the frame is not clearly voiced. Used only to gauge voice steadiness.
function estimatePitch(buf: Float32Array, rate: number): number {
  const minLag = Math.floor(rate / 350);
  const maxLag = Math.floor(rate / 80);
  let energy = 0;
  for (let i = 0; i < buf.length; i++) energy += buf[i] * buf[i];
  if (energy <= 0) return 0;
  let bestLag = -1;
  let bestCorr = 0;
  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let corr = 0;
    for (let i = 0; i < buf.length - lag; i += 2) corr += buf[i] * buf[i + lag];
    if (corr > bestCorr) { bestCorr = corr; bestLag = lag; }
  }
  if (bestLag <= 0 || bestCorr / energy < 0.25) return 0;
  return rate / bestLag;
}

export default function RehearsePage() {
  return (
    <Suspense fallback={null}>
      <Rehearse />
    </Suspense>
  );
}

function Rehearse() {
  const params = useSearchParams();
  const [phase, setPhase] = useState<Phase>('setup');
  const [error, setError] = useState<string | null>(null);
  const [voiceUnavailable, setVoiceUnavailable] = useState(false);

  const people = usePeople();
  const [personId, setPersonId] = useState(() => params.get('person') || '');
  const [counterpart, setCounterpart] = useState(() => params.get('who') || '');
  const [situation, setSituation] = useState(() => params.get('situation') || '');
  const [goal, setGoal] = useState(() => params.get('goal') || '');
  const [difficulty, setDifficulty] = useState<Difficulty>('realistic');
  const [mode, setMode] = useState<Mode>('text');
  const fromPlan = Boolean(params.get('situation'));
  const selectedName = people.find((p) => p.id === personId)?.name || '';

  const [transcript, setTranscript] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [feedback, setFeedback] = useState<Debrief | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [delivery, setDelivery] = useState<Delivery | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const inCtxRef = useRef<AudioContext | null>(null);
  const outCtxRef = useRef<AudioContext | null>(null);
  const procRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const playHeadRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptRef = useRef<Turn[]>([]);
  // delivery metrics captured from the mic during a voice session
  const speakingSamplesRef = useRef(0);
  const pauseCountRef = useRef(0);
  const silenceMsRef = useRef(0);
  const wasSpeakingRef = useRef(false);
  const inRateRef = useRef(24000);
  const startedAtRef = useRef(0);
  const pitchesRef = useRef<number[]>([]);
  const assistantBufRef = useRef('');
  const userPendingRef = useRef<{ text: string; committed: boolean }>({ text: '', committed: false });
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const displayName = counterpart.trim() || selectedName || 'Them';

  const cleanup = () => {
    try { wsRef.current?.close(); } catch {}
    wsRef.current = null;
    try { procRef.current?.disconnect(); } catch {}
    procRef.current = null;
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
    streamRef.current = null;
    try { inCtxRef.current?.close(); } catch {}
    inCtxRef.current = null;
    try { outCtxRef.current?.close(); } catch {}
    outCtxRef.current = null;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  useEffect(() => () => cleanup(), []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [transcript, waiting]);

  const setTurns = (next: Turn[]) => {
    transcriptRef.current = next;
    setTranscript(next);
  };
  const pushTurn = (role: 'user' | 'assistant', text: string) => {
    if (!text?.trim()) return;
    setTurns([...transcriptRef.current, { role, text: text.trim() }]);
  };

  /** Drops a "Dana:" style label if the model adds one. */
  const stripLabel = (text: string) => {
    const names = [displayName, displayName.split(' ').pop() || '', 'Them'].filter(Boolean).map((n) => n.toLowerCase());
    const m = text.match(/^\s*([^:\n]{1,40}):\s+/);
    return m && names.includes(m[1].trim().toLowerCase()) ? text.slice(m[0].length) : text;
  };

  const resetSession = () => {
    setError(null);
    setTurns([]);
    setFeedback(null);
    setDelivery(null);
    setSeconds(0);
    setDraft('');
  };

  // ---------- TYPED PRACTICE ----------
  /** Asks the other person for their next line and streams it in. */
  const nextTurn = async (history: Turn[]) => {
    setWaiting(true);
    setError(null);
    try {
      const res = await apiFetch('/api/voice/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          counterpart,
          situation,
          goal,
          difficulty,
          personId,
          history: history.filter((t) => !t.safety).map(({ role, text }) => ({ role, text })),
        }),
      });
      if (!res.ok || !res.body) {
        setError(await friendlyError(res, "They didn't answer just now. Please try sending that again."));
        return false;
      }
      const safety = res.headers.get('X-Safety') === '1';
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      const base = [...history, { role: 'assistant' as const, text: '', safety }];
      setTurns(base);
      setWaiting(false);
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setTurns([...history, { role: 'assistant', text: stripLabel(text), safety }]);
      }
      const final = stripLabel(text).trim() || '...';
      // The model can also step out of the role-play on its own; show that as a notice too.
      setTurns([...history, { role: 'assistant', text: final, safety: safety || final.includes('799-7233') }]);
      return true;
    } catch {
      setError('Could not reach the app. Check your connection and try again.');
      return false;
    } finally {
      setWaiting(false);
    }
  };

  const startText = async () => {
    resetSession();
    setPhase('text');
    await nextTurn([]);
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || waiting) return;
    const history = [...transcriptRef.current, { role: 'user' as const, text }];
    setTurns(history);
    setDraft('');
    const ok = await nextTurn(history);
    if (!ok) {
      // Put their words back so nothing is lost.
      setTurns(history.slice(0, -1));
      setDraft(text);
    }
  };

  const getDebrief = async (turns: Turn[], del: Delivery | null) => {
    setPhase('debrief');
    if (turns.filter((t) => t.role === 'user').length === 0) {
      setFeedback(null);
      return;
    }
    setLoadingFeedback(true);
    setError(null);
    try {
      const res = await apiFetch('/api/voice/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: turns.filter((t) => !t.safety).map(({ role, text }) => ({ role, text })),
          counterpart: displayName,
          situation,
          goal,
          difficulty,
          delivery: del,
        }),
      });
      if (!res.ok) {
        setError(await friendlyError(res, "I couldn't put your debrief together just now. Please try again."));
        return;
      }
      const data = await res.json();
      setFeedback(data.result);
    } catch {
      setError('Could not reach the app. Check your connection and try again.');
    } finally {
      setLoadingFeedback(false);
    }
  };

  // ---------- VOICE PRACTICE ----------
  const playDelta = (b64: string) => {
    const ctx = outCtxRef.current;
    if (!ctx) return;
    const f32 = base64ToFloat32(b64);
    if (f32.length === 0) return;
    const buf = ctx.createBuffer(1, f32.length, 24000);
    buf.getChannelData(0).set(f32);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    const now = ctx.currentTime;
    const start = Math.max(now, playHeadRef.current);
    src.start(start);
    playHeadRef.current = start + buf.duration;
    setAiSpeaking(true);
    src.onended = () => {
      if (outCtxRef.current && outCtxRef.current.currentTime >= playHeadRef.current - 0.05) {
        setAiSpeaking(false);
      }
    };
  };

  const startVoice = async () => {
    resetSession();
    setVoiceUnavailable(false);
    setPhase('connecting');
    speakingSamplesRef.current = 0;
    pauseCountRef.current = 0;
    silenceMsRef.current = 0;
    wasSpeakingRef.current = false;
    pitchesRef.current = [];
    assistantBufRef.current = '';
    userPendingRef.current = { text: '', committed: false };

    // 1) session token + persona
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let session: any;
    try {
      const res = await apiFetch('/api/voice/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ counterpart, situation, goal, difficulty, personId }),
      });
      if (res.status === 503) {
        setVoiceUnavailable(true);
        setMode('text');
        setPhase('setup');
        return;
      }
      if (!res.ok) {
        setError(await friendlyError(res, "Couldn't start voice practice. You can practice by typing instead."));
        setPhase('setup');
        return;
      }
      session = await res.json();
      if (!session?.token) {
        setError("Couldn't start voice practice. You can practice by typing instead.");
        setPhase('setup');
        return;
      }
    } catch {
      setError('Could not reach the app. Check your connection and try again.');
      setPhase('setup');
      return;
    }

    // 2) mic
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('Practicing out loud needs your microphone. Please allow it and try again, or practice by typing.');
      setPhase('setup');
      return;
    }
    streamRef.current = stream;

    const inCtx = new AudioContext();
    inCtxRef.current = inCtx;
    inRateRef.current = inCtx.sampleRate;
    const outCtx = new AudioContext({ sampleRate: 24000 });
    outCtxRef.current = outCtx;
    playHeadRef.current = outCtx.currentTime;

    // 3) websocket
    const proto = session.token.startsWith('xai-client-secret.') ? session.token : `xai-client-secret.${session.token}`;
    const ws = new WebSocket(`${session.wsUrl}?model=${session.model}`, [proto]);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: 'session.update',
          session: {
            voice: session.voice,
            instructions: session.instructions,
            turn_detection: { type: 'server_vad' },
            audio: {
              input: {
                format: { type: 'audio/pcm', rate: Math.round(inCtx.sampleRate) },
                // Transcribe the user's speech so we can show the transcript and
                // build the debrief.
                transcription: { model: 'grok-transcribe' },
              },
              output: { format: { type: 'audio/pcm', rate: 24000 } },
            },
          },
        })
      );

      // start streaming mic
      const source = inCtx.createMediaStreamSource(stream);
      const proc = inCtx.createScriptProcessor(4096, 1, 1);
      procRef.current = proc;
      proc.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return;
        const input = e.inputBuffer.getChannelData(0);
        // Delivery tracking: measure loudness to tell speech from silence.
        let sum = 0;
        for (let i = 0; i < input.length; i++) sum += input[i] * input[i];
        const rms = Math.sqrt(sum / input.length);
        const frameMs = (input.length / inRateRef.current) * 1000;
        if (rms > 0.015) {
          speakingSamplesRef.current += input.length;
          silenceMsRef.current = 0;
          wasSpeakingRef.current = true;
          const f0 = estimatePitch(input, inRateRef.current);
          if (f0 > 0 && pitchesRef.current.length < 6000) pitchesRef.current.push(f0);
        } else {
          silenceMsRef.current += frameMs;
          if (wasSpeakingRef.current && silenceMsRef.current >= 600) {
            pauseCountRef.current += 1;
            wasSpeakingRef.current = false;
          }
        }
        ws.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: float32ToPcm16Base64(input) }));
      };
      source.connect(proc);
      proc.connect(inCtx.destination);

      setPhase('live');
      startedAtRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= (session.maxSeconds || 300)) stopVoice();
          return s + 1;
        });
      }, 1000);
    };

    const flushUser = () => {
      const txt = userPendingRef.current.text.trim();
      if (txt && !userPendingRef.current.committed) {
        pushTurn('user', txt);
        userPendingRef.current = { text: '', committed: true };
      }
    };
    const flushAssistant = () => {
      const txt = assistantBufRef.current.trim();
      if (txt) pushTurn('assistant', txt);
      assistantBufRef.current = '';
    };

    ws.onmessage = (evt) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let msg: any;
      try { msg = JSON.parse(evt.data); } catch { return; }
      const t: string = msg.type || '';

      if (t === 'response.output_audio.delta' && msg.delta) {
        flushUser();
        playDelta(msg.delta);
        return;
      }
      if (t === 'response.output_audio_transcript.delta' || t === 'response.audio_transcript.delta') {
        flushUser();
        if (typeof msg.delta === 'string') assistantBufRef.current += msg.delta;
        return;
      }
      if (t === 'response.output_audio_transcript.done' || t === 'response.audio_transcript.done') {
        if (typeof msg.transcript === 'string' && msg.transcript.trim()) assistantBufRef.current = msg.transcript;
        flushAssistant();
        return;
      }
      if (t === 'response.done') {
        flushAssistant();
        return;
      }
      if (t === 'conversation.item.input_audio_transcription.completed') {
        const finalTxt = (typeof msg.transcript === 'string' ? msg.transcript : userPendingRef.current.text).trim();
        if (finalTxt) pushTurn('user', finalTxt);
        userPendingRef.current = { text: '', committed: true };
        return;
      }
      if (t === 'conversation.item.input_audio_transcription.updated' || t === 'conversation.item.input_audio_transcription.delta') {
        if (typeof msg.transcript === 'string') userPendingRef.current = { text: msg.transcript, committed: false };
        else if (typeof msg.delta === 'string') userPendingRef.current = { text: userPendingRef.current.text + msg.delta, committed: false };
        return;
      }
      if (t === 'error') console.error('[rehearse] voice error event');
    };

    ws.onerror = () => {
      setError('The voice connection dropped. You can end the practice and get your debrief, or try again.');
    };
    ws.onclose = () => {
      if (procRef.current) { try { procRef.current.disconnect(); } catch {} }
    };
  };

  const stopVoice = async () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (userPendingRef.current.text.trim() && !userPendingRef.current.committed) {
      pushTurn('user', userPendingRef.current.text.trim());
      userPendingRef.current = { text: '', committed: true };
    }
    if (assistantBufRef.current.trim()) {
      pushTurn('assistant', assistantBufRef.current.trim());
      assistantBufRef.current = '';
    }
    const turns = transcriptRef.current;

    const speakingSec = speakingSamplesRef.current / (inRateRef.current || 24000);
    const sessionSec = startedAtRef.current ? (Date.now() - startedAtRef.current) / 1000 : 0;
    const words = turns.filter((t) => t.role === 'user').reduce((n, t) => n + t.text.trim().split(/\s+/).filter(Boolean).length, 0);
    let steadiness: string | null = null;
    const pitches = pitchesRef.current;
    if (pitches.length >= 30) {
      const mean = pitches.reduce((a, b) => a + b, 0) / pitches.length;
      const deltas: number[] = [];
      for (let i = 1; i < pitches.length; i++) deltas.push(Math.abs(pitches[i] - pitches[i - 1]) / mean);
      deltas.sort((a, b) => a - b);
      const medJitter = deltas[Math.floor(deltas.length / 2)] || 0;
      steadiness = medJitter < 0.05 ? 'steady' : medJitter < 0.1 ? 'a little shaky' : 'shaky';
    }
    const del: Delivery = {
      wpm: speakingSec >= 8 && words > 0 ? Math.round(words / (speakingSec / 60)) : null,
      talkRatioPct: sessionSec > 0 ? Math.min(100, Math.round((speakingSec / sessionSec) * 100)) : null,
      pauses: pauseCountRef.current,
      steadiness,
    };
    setDelivery(del);
    cleanup();
    await getDebrief(turns, del);
  };

  const backToSetup = () => {
    cleanup();
    resetSession();
    setPhase('setup');
  };

  const canStart = Boolean((counterpart.trim() || personId) && situation.trim() && goal.trim());
  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const userTurns = transcript.filter((t) => t.role === 'user').length;

  // ---------- SETUP ----------
  if (phase === 'setup') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <PageHeader
          kicker="Get ready"
          title="Rehearse It"
          subtitle="Practice a hard conversation before the real one. I'll play the other person, guilt trips, silence and all, so you can practice holding a calm answer. Then you get a short debrief."
        />

        <div className="space-y-4">
          {fromPlan && <Notice>Filled in from your plan. Change anything you like.</Notice>}
          {voiceUnavailable && <Notice tone="warn">Practicing out loud isn&apos;t available right now. You can practice by typing instead.</Notice>}
          {error && <Notice tone="error">{error}</Notice>}

          <Card>
            <div className="space-y-5">
              <PersonPicker people={people} value={personId} onChange={setPersonId} />
              {!personId && <Field label="Who will I play?" placeholder="e.g. My sister, my manager, my ex" value={counterpart} onChange={setCounterpart} />}
              <Field
                label="What is the conversation about?"
                placeholder="e.g. Telling my manager I can't take on another project"
                value={situation}
                onChange={setSituation}
                textarea
              />
              <Field label="What do you want to walk away with?" placeholder="e.g. The project goes to someone else" value={goal} onChange={setGoal} />

              <div>
                <span className="mb-1.5 block text-[15px] font-semibold">How hard should they push?</span>
                <div className="grid grid-cols-3 gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDifficulty(d.id)}
                      aria-pressed={difficulty === d.id}
                      className={`min-h-[44px] rounded-lg border px-2 py-2 text-[15px] font-semibold transition-colors ${
                        difficulty === d.id
                          ? 'border-[color:var(--app-ink)] bg-[color:var(--app-ink)] text-[color:var(--app-paper)]'
                          : 'border-[color:var(--app-line)] hover:bg-[color:var(--app-paper-2)]'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[14px] text-[color:var(--app-muted)]">{DIFFICULTIES.find((d) => d.id === difficulty)?.hint}</p>
              </div>

              <div>
                <span className="mb-1.5 block text-[15px] font-semibold">How do you want to practice?</span>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: 'text', label: 'Type it', icon: Keyboard },
                      { id: 'voice', label: 'Say it out loud', icon: Mic },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      aria-pressed={mode === m.id}
                      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-2 py-2 text-[15px] font-semibold transition-colors ${
                        mode === m.id
                          ? 'border-[color:var(--app-ink)] bg-[color:var(--app-ink)] text-[color:var(--app-paper)]'
                          : 'border-[color:var(--app-line)] hover:bg-[color:var(--app-paper-2)]'
                      }`}
                    >
                      <m.icon className="h-4 w-4" /> {m.label}
                    </button>
                  ))}
                </div>
                {mode === 'voice' && (
                  <p className="mt-2 text-[14px] text-[color:var(--app-muted)]">Uses your microphone. Up to 5 minutes.</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <Button onClick={mode === 'voice' ? startVoice : startText} disabled={!canStart}>
                Start practicing
              </Button>
            </div>
          </Card>

          <p className="text-[14px] text-[color:var(--app-muted)]">
            This is practice, not therapy. If you feel unsafe with this person, please reach out to the National Domestic Violence Hotline at
            1-800-799-7233 (text START to 88788).
          </p>
        </div>
      </div>
    );
  }

  // ---------- CONNECTING (voice) ----------
  if (phase === 'connecting') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-[16px] text-[color:var(--app-muted)]">Connecting...</p>
      </div>
    );
  }

  // ---------- PRACTICE (typed or voice) ----------
  if (phase === 'text' || phase === 'live') {
    const voice = phase === 'live';
    return (
      <div className="mx-auto flex max-w-2xl flex-col px-4 py-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <button
            onClick={backToSetup}
            className="inline-flex min-h-[44px] items-center gap-1 text-[15px] text-[color:var(--app-muted)] hover:text-[color:var(--app-ink)]"
          >
            <ArrowLeft className="h-4 w-4" /> Change setup
          </button>
          <span className="app-type text-[11px] uppercase tracking-[0.16em] text-[color:var(--app-muted)]">
            {DIFFICULTIES.find((d) => d.id === difficulty)?.label}
            {voice ? ` · ${mmss} / 05:00` : ''}
          </span>
        </div>

        <Card className="!p-0">
          <div className="border-b border-[color:var(--app-line)] px-4 py-3">
            <Label className="!mb-0">Practicing with {displayName}</Label>
            <p className="mt-1 text-[14px] text-[color:var(--app-muted)]">
              {voice
                ? aiSpeaking
                  ? `${displayName} is talking...`
                  : 'Your turn. Speak naturally.'
                : 'Say what you want once. When they push, acknowledge, then hold.'}
            </p>
          </div>
          <div ref={scrollRef} className="h-[50vh] space-y-3 overflow-y-auto px-4 py-4">
            {transcript.length === 0 && !waiting && (
              <p className="pt-8 text-center text-[15px] text-[color:var(--app-muted)]">
                {voice ? 'What you both say will show up here.' : 'Starting the conversation...'}
              </p>
            )}
            {transcript.map((t, i) =>
              t.safety ? (
                <Notice key={i} tone="warn">
                  {t.text}
                </Notice>
              ) : (
                <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[16px] leading-relaxed ${
                      t.role === 'user'
                        ? 'rounded-br-sm bg-[color:var(--app-ink)] text-[color:var(--app-paper)]'
                        : 'rounded-bl-sm bg-[color:var(--app-paper-2)]'
                    }`}
                  >
                    {t.role === 'assistant' && (
                      <span className="app-type mb-0.5 block text-[10px] uppercase tracking-[0.16em] text-[color:var(--app-muted)]">{displayName}</span>
                    )}
                    {t.text || '...'}
                  </div>
                </div>
              )
            )}
            {waiting && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-[color:var(--app-paper-2)] px-4 py-2.5 text-[16px] text-[color:var(--app-muted)]">...</div>
              </div>
            )}
          </div>

          {!voice && (
            <div className="flex items-end gap-2 border-t border-[color:var(--app-line)] p-3">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={2}
                placeholder="Type what you'd say..."
                className={`${inputClass} resize-none`}
                aria-label="Your reply"
              />
              <button
                onClick={send}
                disabled={!draft.trim() || waiting}
                aria-label="Send"
                className="flex h-[48px] min-w-[48px] items-center justify-center rounded-lg bg-[color:var(--app-ink)] text-[color:var(--app-paper)] disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          )}
        </Card>

        {error && (
          <div className="mt-3">
            <Notice tone="error">{error}</Notice>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {voice ? (
            <Button onClick={stopVoice}>
              <PhoneOff className="h-4 w-4" /> End and get my debrief
            </Button>
          ) : (
            <Button onClick={() => getDebrief(transcriptRef.current, null)} disabled={userTurns === 0 || waiting}>
              End and get my debrief
            </Button>
          )}
          {!voice && userTurns === 0 && <span className="text-[14px] text-[color:var(--app-muted)]">Reply at least once first.</span>}
        </div>
      </div>
    );
  }

  // ---------- DEBRIEF ----------
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PageHeader kicker="Your debrief" title={`Practice with ${displayName}`} subtitle={situation} />

      <div className="space-y-4">
        {loadingFeedback && <Notice>Looking over how it went...</Notice>}
        {!loadingFeedback && !feedback && (
          <Notice tone={error ? 'error' : 'info'}>{error || "You didn't say anything this time, so there's nothing to review. Give it another go."}</Notice>
        )}

        {feedback && (
          <>
            <Card tone="night">
              <p className="app-type mb-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--app-gold)]">Held your ground</p>
              <div className="flex items-center gap-3" aria-label={`${feedback.holdRating} out of 5`}>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={`h-3.5 w-8 rounded-full ${n <= feedback.holdRating ? 'bg-[color:var(--app-gold)]' : 'bg-white/15'}`}
                    />
                  ))}
                </div>
                <span className="text-[15px] font-semibold">{feedback.holdRating} of 5</span>
              </div>
              <p className="app-serif mt-4 text-[20px] leading-snug">{feedback.headline}</p>
            </Card>

            {delivery && (delivery.wpm || delivery.talkRatioPct !== null) && (
              <Card>
                <Label>How you sounded</Label>
                <ul className="space-y-1 text-[15px] leading-relaxed">
                  {delivery.wpm && (
                    <li>
                      Pace: about {delivery.wpm} words a minute{delivery.wpm > 175 ? ', a bit fast. Slow down and pause more.' : '.'}
                    </li>
                  )}
                  {delivery.talkRatioPct !== null && (
                    <li>
                      You talked {delivery.talkRatioPct}% of the time{delivery.talkRatioPct > 65 ? '. Fewer reasons, more pauses.' : '.'}
                    </li>
                  )}
                  <li>Pauses: {delivery.pauses}{delivery.pauses < 2 ? '. Try letting a few seconds of quiet sit.' : '.'}</li>
                  {delivery.steadiness && <li>Your voice sounded {delivery.steadiness}.</li>}
                </ul>
              </Card>
            )}

            {feedback.didWell?.length > 0 && (
              <Card>
                <Label>What you did well</Label>
                <ul className="space-y-2 text-[16px] leading-relaxed">
                  {feedback.didWell.map((w, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-[color:var(--app-sage)]">&#10003;</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {feedback.gaveGround?.length > 0 && (
              <Card>
                <Label>Where you gave ground</Label>
                <div className="space-y-4">
                  {feedback.gaveGround.map((g, i) => (
                    <div key={i} className="border-t border-[color:var(--app-line)] pt-4 first:border-t-0 first:pt-0">
                      <p className="app-type text-[11px] uppercase tracking-[0.16em] text-[color:var(--app-accent)]">{g.what}</p>
                      <p className="mt-1 text-[15px] italic text-[color:var(--app-muted)]">You said: &ldquo;{g.quote}&rdquo;</p>
                      <p className="mt-1 text-[16px] leading-relaxed">
                        <span className="font-semibold">Try:</span> {g.tryInstead}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {feedback.nextTime && (
              <Card tone="gold">
                <Label>One line to try next time</Label>
                <p className="app-serif text-[19px] leading-snug">{feedback.nextTime}</p>
              </Card>
            )}

            {feedback.bookRef && <BookRef chapter={feedback.bookRef.chapter} title={feedback.bookRef.title} />}
          </>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <Button onClick={mode === 'voice' ? startVoice : startText} variant="gold">
            <RotateCcw className="h-4 w-4" /> Try it again
          </Button>
          <Button variant="ghost" onClick={backToSetup}>
            Change the setup
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  textarea,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[15px] font-semibold">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className={inputClass} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} />
      )}
    </label>
  );
}
