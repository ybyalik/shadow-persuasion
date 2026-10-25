'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { BookRef, Button, Card, Label, Notice, PageHeader, friendlyError, inputClass } from '@/components/app/ui';
import { DIFFICULTY_NAMES, ScenarioCard, type SceneSummary } from '@/components/app/ScenarioCard';

const tabCls = (on: boolean) =>
  `min-h-[44px] rounded-lg px-4 text-[15px] font-semibold transition-colors ${
    on ? 'bg-[color:var(--app-ink)] text-[color:var(--app-paper)]' : 'text-[color:var(--app-muted)] hover:bg-[color:var(--app-paper-2)]'
  }`;

const chipCls = (on: boolean) =>
  `min-h-[44px] rounded-full border px-4 text-[14px] transition-colors ${
    on
      ? 'border-[color:var(--app-ink)] bg-[color:var(--app-ink)] text-[color:var(--app-paper)]'
      : 'border-[color:var(--app-line)] bg-[color:var(--app-card)] text-[color:var(--app-muted)] hover:border-[color:var(--app-accent)]'
  }`;

function PracticeScenes() {
  const params = useSearchParams();
  const router = useRouter();
  const tab = params.get('tab') === 'reps' ? 'reps' : 'scenes';

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        kicker="Get ready"
        title="Practice Scenes"
        subtitle="Real moments like the ones in the book. You type what you'd say, the other person answers, and you get a short, kind debrief."
      />
      <div className="mb-6 flex gap-2 rounded-xl border border-[color:var(--app-line)] bg-[color:var(--app-card)] p-1.5">
        <button type="button" className={`flex-1 ${tabCls(tab === 'scenes')}`} onClick={() => router.replace('/app/training', { scroll: false })}>
          Scenes
        </button>
        <button type="button" className={`flex-1 ${tabCls(tab === 'reps')}`} onClick={() => router.replace('/app/training?tab=reps', { scroll: false })}>
          Quick Reps
        </button>
      </div>
      {tab === 'reps' ? <QuickReps /> : <SceneList />}
    </div>
  );
}

function SceneList() {
  const router = useRouter();
  const [scenes, setScenes] = useState<SceneSummary[]>([]);
  const [mine, setMine] = useState<SceneSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [area, setArea] = useState('All');

  const [situation, setSituation] = useState('');
  const [genLevel, setGenLevel] = useState(2);
  const [making, setMaking] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [safety, setSafety] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/scenarios/list');
        if (!res.ok) {
          setError(await friendlyError(res, "We couldn't load the scenes. Please try again."));
          return;
        }
        const d = await res.json();
        setScenes(d.scenes ?? []);
        setMine(d.mine ?? []);
      } catch {
        setError("We couldn't reach the server. Please check your connection.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const areas = useMemo(() => ['All', ...Array.from(new Set(scenes.map((s) => s.category)))], [scenes]);
  const shown = scenes.filter((s) => (level === 0 || s.difficulty === level) && (area === 'All' || s.category === area));

  const makeScene = async () => {
    if (making || situation.trim().length < 15) return;
    setMaking(true);
    setGenError(null);
    setSafety(null);
    try {
      const res = await apiFetch('/api/scenarios/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation: situation.trim(), difficulty: genLevel }),
      });
      if (!res.ok) {
        setGenError(await friendlyError(res, "We couldn't build that scene. Please try again."));
        return;
      }
      const d = await res.json();
      if (d.safety) {
        setSafety(d.message);
        return;
      }
      router.push(`/app/training/${d.scene.id}`);
    } catch {
      setGenError("We couldn't reach the server. Please check your connection.");
    } finally {
      setMaking(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <Label>Make a scene from my situation</Label>
        <p className="mb-3 text-[15px] text-[color:var(--app-muted)]">
          Who is it, and what do they usually say or do? We&apos;ll set up a scene so you can practice your answer.
        </p>
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          rows={3}
          maxLength={1500}
          placeholder="e.g. My sister asks me to babysit every Saturday and says I have no life anyway."
          className={inputClass}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-[15px] text-[color:var(--app-muted)]">
            How much pressure
            <select
              value={genLevel}
              onChange={(e) => setGenLevel(Number(e.target.value))}
              className="min-h-[44px] rounded-lg border border-[color:var(--app-line)] bg-[color:var(--app-card)] px-3 text-[15px] text-[color:var(--app-ink)]"
            >
              <option value={1}>Easy</option>
              <option value={2}>Medium</option>
              <option value={3}>Hard</option>
            </select>
          </label>
          <Button onClick={makeScene} loading={making} disabled={situation.trim().length < 15}>
            {making ? 'Setting it up...' : 'Make my scene'}
          </Button>
        </div>
        {genError && <div className="mt-3"><Notice tone="error">{genError}</Notice></div>}
        {safety && <div className="mt-3"><Notice tone="warn">{safety}</Notice></div>}
      </Card>

      {mine.length > 0 && (
        <section>
          <h2 className="app-serif mb-3 text-[26px] font-semibold">Your scenes</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {mine.map((s) => (
              <ScenarioCard key={s.id} scenario={s} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="app-serif mb-3 text-[26px] font-semibold">Scenes from the book</h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {[0, 1, 2, 3].map((l) => (
            <button key={l} type="button" className={chipCls(level === l)} onClick={() => setLevel(l)}>
              {l === 0 ? 'Any level' : DIFFICULTY_NAMES[l]}
            </button>
          ))}
        </div>
        <div className="mb-5 flex flex-wrap gap-2">
          {areas.map((a) => (
            <button key={a} type="button" className={chipCls(area === a)} onClick={() => setArea(a)}>
              {a === 'All' ? 'All areas' : a}
            </button>
          ))}
        </div>
        {error && <Notice tone="error">{error}</Notice>}
        {loading ? (
          <p className="text-[color:var(--app-muted)]">Loading scenes...</p>
        ) : shown.length === 0 && !error ? (
          <Notice>No scenes match those filters.</Notice>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {shown.map((s) => (
              <ScenarioCard key={s.id} scenario={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

type Rep = { line: string; tacticSlug: string };
type RepResult = { score: 'steady' | 'close' | 'gave'; note: string; better: string; tactic: { slug: string; name: string; chapter: number; chapter_title: string } | null };

const SECONDS = 30;
const SCORE_LABEL: Record<RepResult['score'], string> = { steady: 'Steady', close: 'Close', gave: 'Gave ground' };
const SCORE_COLOR: Record<RepResult['score'], string> = {
  steady: 'text-[color:var(--app-sage)]',
  close: 'text-[color:var(--app-accent)]',
  gave: 'text-[color:var(--app-oxblood)]',
};

function QuickReps() {
  const [rep, setRep] = useState<Rep | null>(null);
  const [answer, setAnswer] = useState('');
  const [left, setLeft] = useState(SECONDS);
  const [result, setResult] = useState<RepResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tally, setTally] = useState({ steady: 0, total: 0 });
  const startedAt = useRef(0);
  const box = useRef<HTMLTextAreaElement>(null);

  const running = !!rep && !result && left > 0;
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);

  const start = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAnswer('');
    try {
      const res = await apiFetch(`/api/quickfire/reps${rep ? `?exclude=${encodeURIComponent(rep.line)}` : ''}`);
      if (!res.ok) {
        setError(await friendlyError(res, "We couldn't find a line. Please try again."));
        return;
      }
      setRep(await res.json());
      setLeft(SECONDS);
      startedAt.current = Date.now();
      setTimeout(() => box.current?.focus(), 50);
    } catch {
      setError("We couldn't reach the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const send = async () => {
    if (!rep || scoring || !answer.trim()) return;
    setScoring(true);
    setError(null);
    try {
      const res = await apiFetch('/api/quickfire/reps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rep, answer: answer.trim(), seconds: Math.round((Date.now() - startedAt.current) / 1000) }),
      });
      if (!res.ok) {
        setError(await friendlyError(res, "We couldn't score that rep. Please try again."));
        return;
      }
      const r: RepResult = await res.json();
      setResult(r);
      setTally((t) => ({ steady: t.steady + (r.score === 'steady' ? 1 : 0), total: t.total + 1 }));
    } catch {
      setError("We couldn't reach the server. Please check your connection.");
    } finally {
      setScoring(false);
    }
  };

  if (!rep) {
    return (
      <Card>
        <Label>Quick Reps</Label>
        <p className="mb-4 text-[16px] leading-relaxed">
          You&apos;ll see one pressure line. You have about {SECONDS} seconds to type a calm answer. Short is good. Then you get a one-line score and a
          better version to try.
        </p>
        {error && <div className="mb-3"><Notice tone="error">{error}</Notice></div>}
        <Button onClick={start} loading={loading}>
          Start a rep
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tally.total > 0 && (
        <p className="app-type text-right text-[12px] text-[color:var(--app-muted)]">
          {tally.steady} steady of {tally.total} this session
        </p>
      )}
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <Label className="mb-0">They say</Label>
          {!result && (
            <span className={`app-type text-[14px] ${left <= 5 ? 'text-[color:var(--app-oxblood)]' : 'text-[color:var(--app-muted)]'}`}>
              {left > 0 ? `${left}s` : "Time's up"}
            </span>
          )}
        </div>
        {!result && (
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-[color:var(--app-paper-2)]">
            <div className="h-full bg-[color:var(--app-gold)] transition-all duration-1000 ease-linear" style={{ width: `${(left / SECONDS) * 100}%` }} />
          </div>
        )}
        <blockquote className="app-serif text-[24px] leading-snug sm:text-[27px]">&ldquo;{rep.line}&rdquo;</blockquote>
      </Card>

      {!result && (
        <>
          <textarea
            ref={box}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={3}
            maxLength={600}
            placeholder={left > 0 ? 'Type what you would say...' : 'Send what you have, even a few words.'}
            className={inputClass}
          />
          {error && <Notice tone="error">{error}</Notice>}
          <Button onClick={send} loading={scoring} disabled={!answer.trim()}>
            Send my answer
          </Button>
        </>
      )}

      {result && (
        <Card tone="gold" className="space-y-4">
          <div>
            <p className={`app-type text-[13px] uppercase tracking-[0.18em] ${SCORE_COLOR[result.score]}`}>{SCORE_LABEL[result.score]}</p>
            <p className="mt-1 text-[17px] leading-relaxed">{result.note}</p>
          </div>
          <div>
            <Label>You said</Label>
            <p className="text-[16px] text-[color:var(--app-muted)]">&ldquo;{answer}&rdquo;</p>
          </div>
          <div>
            <Label>Try this</Label>
            <p className="app-serif text-[21px] leading-snug">&ldquo;{result.better}&rdquo;</p>
          </div>
          {result.tactic && (
            <div className="flex flex-wrap items-center gap-3 text-[15px]">
              <span>The tactic: {result.tactic.name}</span>
              <BookRef chapter={result.tactic.chapter} title={result.tactic.chapter_title} />
            </div>
          )}
          <Button onClick={start} loading={loading}>
            Next rep
          </Button>
        </Card>
      )}
    </div>
  );
}

export default function TrainingPage() {
  return (
    <Suspense fallback={null}>
      <PracticeScenes />
    </Suspense>
  );
}
