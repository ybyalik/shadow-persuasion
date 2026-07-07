'use client';

import { useRef, useState, useEffect } from 'react';
import { Mic, MicOff, Loader2, Play, Square, Trophy, AlertTriangle, ArrowLeft } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { usePeople, PersonPicker } from '@/components/app/PersonPicker';

type Phase = 'setup' | 'connecting' | 'live' | 'debrief';
type Turn = { role: 'user' | 'assistant'; text: string };
type Feedback = {
  score: number;
  headline: string;
  wins: string[];
  improvements: string[];
  languageFlags: { quote: string; issue: string; betterVersion: string }[];
  nextTime: string;
};

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

export default function SparPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [error, setError] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);

  const people = usePeople();
  const [personId, setPersonId] = useState('');
  const [counterpart, setCounterpart] = useState('');
  const [situation, setSituation] = useState('');
  const [goal, setGoal] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const selectedName = people.find((p) => p.id === personId)?.name || '';

  const [transcript, setTranscript] = useState<Turn[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [delivery, setDelivery] = useState<{ wpm: number | null; talkRatioPct: number | null; pauses: number; steadiness: string | null } | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const inCtxRef = useRef<AudioContext | null>(null);
  const outCtxRef = useRef<AudioContext | null>(null);
  const procRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const playHeadRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptRef = useRef<Turn[]>([]);
  // delivery metrics captured from the mic during the session
  const speakingSamplesRef = useRef(0);
  const pauseCountRef = useRef(0);
  const silenceMsRef = useRef(0);
  const wasSpeakingRef = useRef(false);
  const inRateRef = useRef(24000);
  const startedAtRef = useRef(0);
  const pitchesRef = useRef<number[]>([]);

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

  const pushTurn = (role: 'user' | 'assistant', text: string) => {
    if (!text?.trim()) return;
    const next = [...transcriptRef.current, { role, text: text.trim() }];
    transcriptRef.current = next;
    setTranscript(next);
  };

  const start = async () => {
    setError(null);
    setNotConfigured(false);
    setPhase('connecting');
    transcriptRef.current = [];
    setTranscript([]);
    setFeedback(null);
    setSeconds(0);
    setDelivery(null);
    speakingSamplesRef.current = 0;
    pauseCountRef.current = 0;
    silenceMsRef.current = 0;
    wasSpeakingRef.current = false;
    pitchesRef.current = [];

    // 1) session token + persona
    let session: any;
    try {
      const res = await apiFetch('/api/voice/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ counterpart, situation, goal, difficulty, personId }),
      });
      session = await res.json().catch(() => ({}));
      if (res.status === 503 || session?.error === 'not_configured') {
        setNotConfigured(true);
        setPhase('setup');
        return;
      }
      if (!res.ok || !session?.token) {
        setError(session?.error || 'Could not start voice practice. Please try again.');
        setPhase('setup');
        return;
      }
    } catch {
      setError('Could not reach the server. Check your connection.');
      setPhase('setup');
      return;
    }

    // 2) mic
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('Microphone access is needed to practice out loud. Please allow it and try again.');
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
    const proto = session.token.startsWith('xai-client-secret.')
      ? session.token
      : `xai-client-secret.${session.token}`;
    const ws = new WebSocket(`${session.wsUrl}?model=${session.model}`, [proto]);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'session.update',
        session: {
          voice: session.voice,
          instructions: session.instructions,
          turn_detection: { type: 'server_vad' },
          audio: {
            input: { format: { type: 'audio/pcm', rate: Math.round(inCtx.sampleRate) } },
            output: { format: { type: 'audio/pcm', rate: 24000 } },
          },
        },
      }));

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
          if (s + 1 >= (session.maxSeconds || 300)) stop();
          return s + 1;
        });
      }, 1000);
    };

    ws.onmessage = (evt) => {
      let msg: any;
      try { msg = JSON.parse(evt.data); } catch { return; }
      if (msg.type === 'response.output_audio.delta' && msg.delta) {
        playDelta(msg.delta);
      } else if (msg.type === 'conversation.item.created' && msg.item?.type === 'message') {
        const role = msg.item.role === 'assistant' ? 'assistant' : 'user';
        const text = (msg.item.content || [])
          .map((c: any) => c.text || c.transcript || '')
          .join(' ')
          .trim();
        pushTurn(role, text);
      } else if (msg.type === 'error') {
        console.error('[spar] realtime error', msg);
      }
    };

    ws.onerror = () => {
      setError('The voice connection dropped. Please try again.');
    };
    ws.onclose = () => {
      if (procRef.current) { try { procRef.current.disconnect(); } catch {} }
    };
  };

  const stop = async () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const turns = transcriptRef.current;

    // Compute delivery metrics from the captured audio + transcript.
    const speakingSec = speakingSamplesRef.current / (inRateRef.current || 24000);
    const sessionSec = startedAtRef.current ? (Date.now() - startedAtRef.current) / 1000 : 0;
    const words = turns
      .filter((t) => t.role === 'user')
      .reduce((n, t) => n + t.text.trim().split(/\s+/).filter(Boolean).length, 0);
    // Voice steadiness from pitch wobble (rough estimate).
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

    const del = {
      wpm: speakingSec >= 8 && words > 0 ? Math.round(words / (speakingSec / 60)) : null,
      talkRatioPct: sessionSec > 0 ? Math.min(100, Math.round((speakingSec / sessionSec) * 100)) : null,
      pauses: pauseCountRef.current,
      steadiness,
    };
    setDelivery(del);

    cleanup();
    setPhase('debrief');
    if (turns.filter((t) => t.role === 'user').length === 0) {
      setFeedback(null);
      return;
    }
    setLoadingFeedback(true);
    try {
      const res = await apiFetch('/api/voice/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: turns, situation, goal, delivery: del }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.result) setFeedback(data.result);
      else setError(data?.error || 'Could not build your debrief.');
    } catch {
      setError('Could not build your debrief.');
    } finally {
      setLoadingFeedback(false);
    }
  };

  const reset = () => {
    cleanup();
    setPhase('setup');
    setTranscript([]);
    transcriptRef.current = [];
    setFeedback(null);
    setError(null);
    setSeconds(0);
  };

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const canStart = (counterpart.trim() || personId) && situation.trim() && goal.trim();
  const displayName = counterpart.trim() || selectedName || 'They';

  // ---------- SETUP ----------
  if (phase === 'setup') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Mic className="h-7 w-7 text-[#D4A017]" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F4ECD8]">Live Sparring</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Rehearse a real conversation out loud. You&apos;ll talk to an AI playing the other person, and it pushes
          back the way they will. When you&apos;re done, you get a debrief on how you did.
        </p>

        {notConfigured && (
          <div className="mb-5 rounded-lg border border-[#D4A017]/40 bg-[#D4A017]/10 p-4 text-sm text-gray-800 dark:text-[#E8E8E0]">
            Voice practice is being set up and isn&apos;t live yet. Check back soon.
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <PersonPicker people={people} value={personId} onChange={setPersonId} />
          {!personId && (
            <Field label="Who are you talking to?" placeholder="e.g. My manager, Sarah" value={counterpart} onChange={setCounterpart} />
          )}
          <Field label="What's the situation?" placeholder="e.g. Asking for a raise in my quarterly review" value={situation} onChange={setSituation} textarea />
          <Field label="What do you want to walk away with?" placeholder="e.g. A 15% raise, or a clear timeline to get there" value={goal} onChange={setGoal} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">How tough should they be?</label>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize ${
                    difficulty === d
                      ? 'border-[#D4A017] bg-[#D4A017] text-[#0A0A0A]'
                      : 'border-gray-300 dark:border-[#333] text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={start}
          disabled={!canStart}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#D4A017] px-6 py-3 font-semibold text-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="h-4 w-4" /> Start rehearsal
        </button>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Uses your microphone. Sessions are capped at 5 minutes.</p>
      </div>
    );
  }

  // ---------- CONNECTING ----------
  if (phase === 'connecting') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4A017] mx-auto" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Connecting…</p>
      </div>
    );
  }

  // ---------- LIVE ----------
  if (phase === 'live') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className={`relative flex h-3 w-3`}>
              <span className={`absolute inline-flex h-full w-full rounded-full ${aiSpeaking ? 'bg-[#D4A017] animate-ping' : 'bg-green-500'} opacity-75`} />
              <span className={`relative inline-flex h-3 w-3 rounded-full ${aiSpeaking ? 'bg-[#D4A017]' : 'bg-green-500'}`} />
            </span>
            <span className="font-medium text-gray-900 dark:text-[#F4ECD8]">
              {aiSpeaking ? `${displayName} are speaking…` : 'Your turn, speak naturally'}
            </span>
          </div>
          <span className="font-mono text-sm text-gray-500 dark:text-gray-400">{mmss} / 05:00</span>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] p-4 h-[45vh] overflow-y-auto space-y-3">
          {transcript.length === 0 && (
            <p className="text-sm text-gray-400 text-center pt-8">The conversation transcript will appear here as you talk.</p>
          )}
          {transcript.map((t, i) => (
            <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                t.role === 'user'
                  ? 'bg-[#D4A017] text-[#0A0A0A] rounded-br-none'
                  : 'bg-gray-100 dark:bg-[#222] text-gray-800 dark:text-gray-200 rounded-bl-none'
              }`}>{t.text}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button onClick={stop} className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-semibold text-white">
            <Square className="h-4 w-4" /> End & get feedback
          </button>
        </div>
      </div>
    );
  }

  // ---------- DEBRIEF ----------
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={reset} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#D4A017] mb-4">
        <ArrowLeft className="h-4 w-4" /> New rehearsal
      </button>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F4ECD8] mb-4">Your debrief</h1>

      {loadingFeedback && (
        <div className="py-12 text-center">
          <Loader2 className="h-7 w-7 animate-spin text-[#D4A017] mx-auto" />
          <p className="mt-3 text-gray-500 dark:text-gray-400">Reviewing how you did…</p>
        </div>
      )}

      {!loadingFeedback && !feedback && (
        <div className="rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] p-5 text-gray-600 dark:text-gray-400">
          {error || 'It looks like you did not speak, so there was nothing to review. Give it another go.'}
        </div>
      )}

      {feedback && (
        <div className="space-y-5">
          <div className="rounded-xl border border-[#D4A017]/40 bg-[#D4A017]/5 p-5 flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#D4A017] text-2xl font-bold text-[#0A0A0A]">
              {feedback.score}
            </div>
            <div>
              <div className="flex items-center gap-2 text-[#D4A017]"><Trophy className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wide">Score</span></div>
              <p className="text-gray-800 dark:text-[#E8E8E0]">{feedback.headline}</p>
            </div>
          </div>

          {delivery && (delivery.wpm || delivery.talkRatioPct !== null) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Pace" value={delivery.wpm ? `${delivery.wpm}` : '—'} sub={delivery.wpm ? 'words/min' : 'too short'} hint={delivery.wpm ? (delivery.wpm > 175 ? 'a bit fast' : delivery.wpm < 110 ? 'nice and measured' : 'good pace') : ''} />
              <Stat label="Talk time" value={delivery.talkRatioPct !== null ? `${delivery.talkRatioPct}%` : '—'} sub="of the convo" hint={delivery.talkRatioPct !== null ? (delivery.talkRatioPct > 65 ? 'let them talk more' : 'well balanced') : ''} />
              <Stat label="Pauses" value={`${delivery.pauses}`} sub="silences" hint={delivery.pauses < 2 ? 'try pausing more' : 'good use of silence'} />
              {delivery.steadiness && (
                <Stat label="Voice" value={delivery.steadiness === 'steady' ? 'Steady' : delivery.steadiness === 'a little shaky' ? 'Wavered' : 'Shaky'} sub="steadiness" hint={delivery.steadiness === 'steady' ? 'composed' : 'breathe, slow down'} />
              )}
            </div>
          )}

          {feedback.wins?.length > 0 && (
            <Section title="What landed">
              <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                {feedback.wins.map((w, i) => <li key={i} className="flex gap-2"><span className="text-green-500">✓</span>{w}</li>)}
              </ul>
            </Section>
          )}
          {feedback.improvements?.length > 0 && (
            <Section title="Sharpen this next time">
              <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                {feedback.improvements.map((w, i) => <li key={i} className="flex gap-2"><span className="text-[#D4A017]">→</span>{w}</li>)}
              </ul>
            </Section>
          )}
          {feedback.languageFlags?.length > 0 && (
            <Section title="Your words">
              <div className="space-y-3">
                {feedback.languageFlags.map((f, i) => (
                  <div key={i} className="text-sm">
                    <p className="text-gray-500 dark:text-gray-400 italic">&ldquo;{f.quote}&rdquo; <span className="not-italic text-orange-500">({f.issue})</span></p>
                    <p className="text-gray-800 dark:text-[#E8E8E0] mt-0.5">Try: &ldquo;{f.betterVersion}&rdquo;</p>
                  </div>
                ))}
              </div>
            </Section>
          )}
          {feedback.nextTime && (
            <div className="rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">The one thing</p>
              <p className="text-gray-900 dark:text-[#F4ECD8] font-medium">{feedback.nextTime}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, placeholder, value, onChange, textarea }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; textarea?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={2}
          className="w-full rounded-lg border border-gray-300 dark:border-[#333] bg-white dark:bg-[#1A1A1A] p-2.5 text-gray-900 dark:text-[#F4ECD8] focus:outline-none focus:ring-2 focus:ring-[#D4A017]" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 dark:border-[#333] bg-white dark:bg-[#1A1A1A] p-2.5 text-gray-900 dark:text-[#F4ECD8] focus:outline-none focus:ring-2 focus:ring-[#D4A017]" />
      )}
    </div>
  );
}

function Stat({ label, value, sub, hint }: { label: string; value: string; sub: string; hint: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] p-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-[#F4ECD8]">{value}</p>
      <p className="text-[10px] text-gray-400">{sub}</p>
      {hint && <p className="mt-1 text-[11px] text-[#D4A017]">{hint}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">{title}</h2>
      {children}
    </div>
  );
}
