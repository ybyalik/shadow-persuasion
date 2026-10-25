'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { BookRef, Button, Card, Label, Notice, PageHeader, friendlyError, inputClass } from '@/components/app/ui';
import { DIFFICULTY_NAMES } from '@/components/app/ScenarioCard';

type Scene = {
  id: string;
  title: string;
  category: string;
  difficulty: number;
  description: string;
  objective: string;
  chapter: number | null;
  chapter_title: string | null;
  tactic_slug: string | null;
  other_person: string | null;
  opening_line: string | null;
};

type Msg = { role: 'user' | 'assistant'; content: string };

type Debrief = {
  result: 'held' | 'mixed' | 'gave';
  summary: string;
  didWell: string;
  betterLine: { instead: string; try: string };
  tactic: string;
  tacticSlug: string | null;
  chapter: number | null;
  chapterTitle: string | null;
  safety: boolean;
  hotline: string | null;
};

const MAX_TURNS = 6;
const RESULT_TITLE: Record<Debrief['result'], string> = {
  held: 'You held your ground',
  mixed: 'You partly held your ground',
  gave: 'You gave ground this time',
};

export default function ScenePage() {
  const { id } = useParams<{ id: string }>();
  const [scene, setScene] = useState<Scene | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debrief, setDebrief] = useState<Debrief | null>(null);
  const [debriefing, setDebriefing] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(`/api/scenarios/list?id=${encodeURIComponent(id)}`);
        if (!res.ok) {
          setLoadError(await friendlyError(res, "We couldn't load this scene."));
          return;
        }
        const s: Scene = (await res.json()).scene;
        setScene(s);
        setMessages(s.opening_line ? [{ role: 'assistant', content: s.opening_line }] : []);
      } catch {
        setLoadError("We couldn't reach the server. Please check your connection.");
      }
    })();
  }, [id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, debrief]);

  const userTurns = messages.filter((m) => m.role === 'user').length;
  const done = userTurns >= MAX_TURNS || !!debrief;

  const send = async () => {
    const text = input.trim();
    if (!scene || !text || sending || done) return;
    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setSending(true);
    setError(null);
    try {
      const res = await apiFetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: scene.id, messages: next }),
      });
      if (!res.ok) {
        setError(await friendlyError(res, "We couldn't continue the scene. Please try again."));
        setMessages(messages);
        setInput(text);
        return;
      }
      const d = await res.json();
      setMessages([...next, { role: 'assistant', content: d.reply }]);
    } catch {
      setError("We couldn't reach the server. Please check your connection.");
      setMessages(messages);
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const finish = async () => {
    if (!scene || debriefing || userTurns === 0) return;
    setDebriefing(true);
    setError(null);
    try {
      const res = await apiFetch('/api/scenarios/debrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: scene.id, messages }),
      });
      if (!res.ok) {
        setError(await friendlyError(res, "We couldn't write your debrief. Please try again."));
        return;
      }
      setDebrief(await res.json());
    } catch {
      setError("We couldn't reach the server. Please check your connection.");
    } finally {
      setDebriefing(false);
    }
  };

  const restart = () => {
    if (!scene) return;
    setMessages(scene.opening_line ? [{ role: 'assistant', content: scene.opening_line }] : []);
    setDebrief(null);
    setError(null);
    setInput('');
  };

  const back = (
    <Link href="/app/training" className="mb-6 inline-flex min-h-[44px] items-center gap-2 text-[15px] text-[color:var(--app-muted)] hover:text-[color:var(--app-ink)]">
      <ArrowLeft className="h-4 w-4" /> All scenes
    </Link>
  );

  if (loadError) return <div className="mx-auto max-w-3xl">{back}<Notice tone="error">{loadError}</Notice></div>;
  if (!scene) return <div className="mx-auto max-w-3xl">{back}<p className="text-[color:var(--app-muted)]">Loading the scene...</p></div>;

  const other = scene.other_person || 'The other person';

  return (
    <div className="mx-auto max-w-3xl">
      {back}
      <PageHeader kicker={`${scene.category} · ${DIFFICULTY_NAMES[scene.difficulty] ?? 'Medium'}`} title={scene.title} />

      <Card className="mb-6 space-y-4">
        <div>
          <Label>What&apos;s happening</Label>
          <p className="text-[16px] leading-relaxed">{scene.description}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Talking with</Label>
            <p className="text-[16px]">{other}</p>
          </div>
          <div>
            <Label>Your goal</Label>
            <p className="text-[16px]">{scene.objective}</p>
          </div>
        </div>
        {scene.chapter && scene.chapter_title && <BookRef chapter={scene.chapter} title={scene.chapter_title} />}
      </Card>

      <div className="space-y-3" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-[16px] leading-relaxed ${
                m.role === 'user'
                  ? 'rounded-br-md bg-[color:var(--app-ink)] text-[color:var(--app-paper)]'
                  : 'rounded-bl-md border border-[color:var(--app-line)] bg-[color:var(--app-card)]'
              }`}
            >
              {m.role === 'assistant' && <p className="app-type mb-1 text-[11px] uppercase tracking-wide text-[color:var(--app-accent)]">{other}</p>}
              {m.content}
            </div>
          </div>
        ))}
        {sending && <p className="text-[14px] text-[color:var(--app-muted)]">{other} is typing...</p>}
      </div>

      {error && <div className="mt-4"><Notice tone="error">{error}</Notice></div>}

      {!debrief && (
        <div className="mt-6 space-y-3">
          {!done ? (
            <>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={3}
                maxLength={1200}
                placeholder="Type what you would say..."
                className={inputClass}
                disabled={sending}
              />
              <div className="flex flex-wrap gap-3">
                <Button onClick={send} loading={sending} disabled={!input.trim()}>
                  Say it
                </Button>
                {userTurns >= 2 && (
                  <Button variant={userTurns >= 3 ? 'gold' : 'ghost'} onClick={finish} loading={debriefing} disabled={sending}>
                    Finish and get my debrief
                  </Button>
                )}
              </div>
              <p className="text-[14px] text-[color:var(--app-muted)]">
                {userTurns < 2 ? 'A few back-and-forths is enough. Keep it short and calm.' : `You can keep going (up to ${MAX_TURNS} replies) or finish now.`}
              </p>
            </>
          ) : (
            <Button variant="gold" onClick={finish} loading={debriefing}>
              Finish and get my debrief
            </Button>
          )}
        </div>
      )}

      {debrief && (
        <Card tone="gold" className="mt-6 space-y-4">
          <div>
            <p className="app-type text-[12px] uppercase tracking-[0.18em] text-[color:var(--app-accent)]">Your debrief</p>
            <h2 className="app-serif mt-1 text-[28px] font-semibold">{RESULT_TITLE[debrief.result]}</h2>
            <p className="mt-2 text-[17px] leading-relaxed">{debrief.summary}</p>
          </div>
          {debrief.safety && debrief.hotline && <Notice tone="warn">{debrief.hotline}</Notice>}
          {debrief.didWell && (
            <div>
              <Label>What you did well</Label>
              <p className="text-[16px] leading-relaxed">{debrief.didWell}</p>
            </div>
          )}
          {debrief.betterLine?.try && (
            <div>
              <Label>One better line</Label>
              {debrief.betterLine.instead && <p className="mb-1 text-[15px] text-[color:var(--app-muted)]">Instead of &ldquo;{debrief.betterLine.instead}&rdquo;</p>}
              <p className="app-serif text-[21px] leading-snug">&ldquo;{debrief.betterLine.try}&rdquo;</p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3 text-[15px]">
            {debrief.tactic && (
              <span>
                The tactic:{' '}
                {debrief.tacticSlug ? (
                  <Link href={`/app/techniques/${debrief.tacticSlug}`} className="underline underline-offset-2">
                    {debrief.tactic}
                  </Link>
                ) : (
                  debrief.tactic
                )}
              </span>
            )}
            {debrief.chapter && debrief.chapterTitle && <BookRef chapter={debrief.chapter} title={debrief.chapterTitle} />}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={restart}>Try this scene again</Button>
            <Button href="/app/training" variant="ghost">
              Back to scenes
            </Button>
          </div>
        </Card>
      )}
      <div ref={endRef} />
    </div>
  );
}
