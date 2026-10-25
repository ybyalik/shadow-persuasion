'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Search, X } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { BookRef, Button, Card, Label, Notice, PageHeader, friendlyError, inputClass } from '@/components/app/ui';
import { TechniqueCard } from '@/components/app/TechniqueCard';
import { STATUS_LABEL, type SRStatus } from '@/lib/spaced-repetition';
import { IS_V3 } from '@/lib/edition';

type Tactic = {
  slug: string;
  number: number;
  name: string;
  chapter: number;
  chapter_title: string;
  looks_like: string;
  purpose: string;
  warning_sign: string;
  calm_reply: string;
  note: string | null;
  examples: string[];
  family?: string | null;
  safety?: boolean;
  edition?: 'v2' | 'v3';
  other_explanations?: string | null;
  help?: string | null;
};

/** Which guide the server sent and how many entries of each kind (from /api/techniques). */
type Meta = { edition: 'v2' | 'v3'; total: number; ordinary: number; danger: number };

/** A danger sign from the new guide: no calm reply on purpose, it points to help. */
const isDanger = (t: Pick<Tactic, 'safety' | 'calm_reply'>) => !!t.safety && !t.calm_reply;

type Progress = { tactic_slug: string; status: SRStatus };

type Round = { exampleId: string; message: string; context: string | null; choices: { slug: string; name: string }[]; dueCount: number };
type Result = { correct: boolean; answer: Tactic; chosen: { slug: string; name: string; warning_sign: string } | null; nextReviewAt: string };

const tabCls = (on: boolean) =>
  `min-h-[44px] rounded-lg px-4 text-[15px] font-semibold transition-colors ${
    on ? 'bg-[color:var(--app-ink)] text-[color:var(--app-paper)]' : 'text-[color:var(--app-muted)] hover:bg-[color:var(--app-paper-2)]'
  }`;

function SpotTheTactic() {
  const params = useSearchParams();
  const router = useRouter();
  const mode = params.get('mode') === 'train' ? 'train' : 'library';
  const trainSlug = params.get('slug');

  const [tactics, setTactics] = useState<Tactic[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [progress, setProgress] = useState<Record<string, SRStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');

  const loadProgress = useCallback(async () => {
    try {
      const res = await apiFetch('/api/spaced-repetition');
      if (!res.ok) return;
      const d = await res.json();
      setProgress(Object.fromEntries((d.cards as Progress[]).map((c) => [c.tactic_slug, c.status])));
    } catch {
      /* progress is a nice-to-have */
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/techniques');
        if (!res.ok) {
          setError(await friendlyError(res, "We couldn't load the tactics. Please try again."));
          return;
        }
        const d = await res.json();
        setTactics(d.tactics ?? []);
        setMeta(d.meta ?? null);
      } catch {
        setError("We couldn't reach the server. Please check your connection.");
      } finally {
        setLoading(false);
      }
    })();
    loadProgress();
  }, [loadProgress]);

  const setMode = (m: 'library' | 'train') => router.replace(m === 'train' ? '/app/techniques?mode=train' : '/app/techniques', { scroll: false });

  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    const match = (t: Tactic) =>
      !term ||
      [t.name, t.looks_like, t.warning_sign, t.chapter_title, t.other_explanations ?? '', ...t.examples].some((s) => s.toLowerCase().includes(term));
    // Grouped by chapter, in the order the server sends them: by chapter for the old guide,
    // the new guide's own order for v3 (its danger signs come last, on purpose).
    const byChapter = new Map<number, { title: string; items: Tactic[] }>();
    for (const t of tactics.filter(match)) {
      if (!byChapter.has(t.chapter)) byChapter.set(t.chapter, { title: t.chapter_title, items: [] });
      byChapter.get(t.chapter)!.items.push(t);
    }
    return [...byChapter.entries()];
  }, [tactics, q]);

  // Only count progress on tactics in today's list (old-guide progress stays saved but isn't shown).
  const slugs = useMemo(() => new Set(tactics.map((t) => t.slug)), [tactics]);
  const knownCount = Object.entries(progress).filter(([slug, s]) => s === 'known' && slugs.has(slug)).length;
  const due = Object.entries(progress).filter(([slug, s]) => s === 'due' && slugs.has(slug)).length;
  const newGuide = meta?.edition === 'v3';
  const trainTactic = trainSlug ? tactics.find((t) => t.slug === trainSlug) : null;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        kicker="Get ready"
        title="Spot the Tactic"
        subtitle={
          newGuide && meta
            ? `${meta.ordinary} common pressure moves from The Tactic Spotter, each with other explanations to read first and a calm reply, plus ${meta.danger} danger signs that point you to help. Browse them, or train your eye on messages that sound like real life.`
            : `${meta ? `${meta.total} pressure tactics` : 'Pressure tactics'} from the book, each with its warning signs and a calm reply. Browse them, or train your eye on messages that sound like real life.`
        }
      />

      <div className="mb-6 flex gap-2 rounded-xl border border-[color:var(--app-line)] bg-[color:var(--app-card)] p-1.5">
        <button type="button" className={`flex-1 ${tabCls(mode === 'library')}`} onClick={() => setMode('library')}>
          Library
        </button>
        <button type="button" className={`flex-1 ${tabCls(mode === 'train')}`} onClick={() => setMode('train')}>
          Train{due > 0 ? ` (${due} to review)` : ''}
        </button>
      </div>

      {error && <Notice tone="error">{error}</Notice>}

      {mode === 'train' ? (
        <TrainPanel key={trainSlug ?? 'all'} slug={trainSlug} slugName={trainTactic?.name} onAnswered={loadProgress} />
      ) : loading ? (
        <p className="text-[color:var(--app-muted)]">Loading the tactics...</p>
      ) : (
        <>
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--app-muted)]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search, e.g. guilt, silent, 'after everything'"
              className={`${inputClass} pl-10`}
              aria-label="Search tactics"
            />
          </div>
          <p className="mb-8 text-[14px] text-[color:var(--app-muted)]">
            {newGuide && meta
              ? `${meta.ordinary} pressure moves and ${meta.danger} danger signs, grouped by the chapter that covers them. A match is a reason to pay attention, not proof.`
              : `${tactics.length} tactics, grouped by the chapter ${IS_V3 ? 'of the book' : 'in Part Three'} that covers them.`}
            {knownCount > 0 && ` You know ${knownCount} so far.`}
          </p>

          {groups.length === 0 && <Notice>No tactics match that search. Try a simpler word.</Notice>}

          <div className="space-y-10">
            {groups.map(([chapter, g]) => (
              <section key={chapter}>
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="app-serif text-[26px] font-semibold">{g.items.every(isDanger) ? 'Danger signs' : g.title}</h2>
                  <BookRef chapter={chapter} title={g.title} />
                </div>
                {g.items.every(isDanger) && (
                  <div className="mb-3">
                    <Notice tone="warn">
                      These work differently. When someone uses fear, the answer is not a better sentence, so there are no scripts here. One serious threat
                      is enough. In immediate danger, call 911. US National Domestic Violence Hotline: 1-800-799-7233, or text START to 88788. For
                      thoughts of suicide or self-harm, call or text 988.
                    </Notice>
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {g.items.map((t) => (
                    <TechniqueCard key={t.slug} tactic={t} status={progress[t.slug]} statusLabel={progress[t.slug] ? STATUS_LABEL[progress[t.slug]] : undefined} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TrainPanel({ slug, slugName, onAnswered }: { slug: string | null; slugName?: string; onAnswered: () => void }) {
  const [round, setRound] = useState<Round | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tally, setTally] = useState({ right: 0, total: 0 });

  const next = useCallback(
    async (exclude?: string) => {
      setLoading(true);
      setError(null);
      setResult(null);
      setPicked(null);
      try {
        const qs = new URLSearchParams();
        if (slug) qs.set('slug', slug);
        if (exclude) qs.set('exclude', exclude);
        const res = await apiFetch(`/api/technique-practice?${qs}`);
        if (!res.ok) {
          setError(await friendlyError(res, "We couldn't set up a round. Please try again."));
          return;
        }
        setRound(await res.json());
      } catch {
        setError("We couldn't reach the server. Please check your connection.");
      } finally {
        setLoading(false);
      }
    },
    [slug]
  );

  useEffect(() => {
    next();
  }, [next]);

  const answer = async (choice: string) => {
    if (!round || checking || result) return;
    setPicked(choice);
    setChecking(true);
    setError(null);
    try {
      const res = await apiFetch('/api/technique-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exampleId: round.exampleId, choice }),
      });
      if (!res.ok) {
        setError(await friendlyError(res, "We couldn't check that answer. Please try again."));
        setPicked(null);
        return;
      }
      const r: Result = await res.json();
      setResult(r);
      setTally((t) => ({ right: t.right + (r.correct ? 1 : 0), total: t.total + 1 }));
      onAnswered();
    } catch {
      setError("We couldn't reach the server. Please check your connection.");
      setPicked(null);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[14px] text-[color:var(--app-muted)]">
        <span>
          {slug ? (
            <>
              Practicing: <strong className="text-[color:var(--app-ink)]">{slugName ?? 'one tactic'}</strong>.{' '}
              <Link href="/app/techniques?mode=train" className="underline underline-offset-2">
                Practice all instead
              </Link>
            </>
          ) : (
            'Read the message. Which tactic is it? Ones you miss come back sooner.'
          )}
        </span>
        {tally.total > 0 && (
          <span className="app-type text-[12px]">
            {tally.right} of {tally.total} right this session
          </span>
        )}
      </div>

      {error && <Notice tone="error">{error}</Notice>}

      {loading && !round && <p className="text-[color:var(--app-muted)]">Finding a message...</p>}

      {round && (
        <Card className={loading ? 'opacity-60' : ''}>
          <Label>{round.context || 'Someone says'}</Label>
          <blockquote className="app-serif text-[23px] leading-snug sm:text-[26px]">&ldquo;{round.message}&rdquo;</blockquote>
        </Card>
      )}

      {round && (
        <div className="grid gap-2 sm:grid-cols-2">
          {round.choices.map((c) => {
            const isAnswer = result && c.slug === result.answer.slug;
            const isWrongPick = result && picked === c.slug && !result.correct;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => answer(c.slug)}
                disabled={!!result || checking || loading}
                className={`flex min-h-[52px] items-center justify-between gap-2 rounded-lg border px-4 py-3 text-left text-[16px] font-medium transition-colors ${
                  isAnswer
                    ? 'border-[color:var(--app-sage)] bg-[color:var(--app-sage)]/10'
                    : isWrongPick
                      ? 'border-[color:var(--app-oxblood)] bg-[color:var(--app-oxblood)]/10'
                      : picked === c.slug
                        ? 'border-[color:var(--app-accent)]'
                        : 'border-[color:var(--app-line)] bg-[color:var(--app-card)] hover:border-[color:var(--app-accent)]'
                } disabled:cursor-default`}
              >
                <span>{c.name}</span>
                {isAnswer && <Check className="h-5 w-5 shrink-0 text-[color:var(--app-sage)]" />}
                {isWrongPick && <X className="h-5 w-5 shrink-0 text-[color:var(--app-oxblood)]" />}
              </button>
            );
          })}
        </div>
      )}

      {result && (
        <Card tone="gold" className="space-y-4">
          <div>
            <p className={`app-type text-[12px] uppercase tracking-[0.18em] ${result.correct ? 'text-[color:var(--app-sage)]' : 'text-[color:var(--app-oxblood)]'}`}>
              {result.correct ? 'You spotted it' : 'Not quite'}
            </p>
            <h3 className="app-serif mt-1 text-[26px] font-semibold">{result.answer.name}</h3>
            {!result.correct && result.chosen && (
              <p className="mt-1 text-[15px] text-[color:var(--app-muted)]">
                You picked {result.chosen.name}. This one will come back tomorrow so you can try again.
              </p>
            )}
          </div>
          <div>
            <Label>{result.answer.edition === 'v3' ? (isDanger(result.answer) ? "Why there's no script" : 'Concerning if') : 'Warning sign'}</Label>
            <p className="text-[16px] leading-relaxed">{result.answer.warning_sign}</p>
          </div>
          {isDanger(result.answer) ? (
            <div>
              <Label>What helps</Label>
              <p className="text-[16px] leading-relaxed">{result.answer.help}</p>
              <div className="mt-3">
                <Notice tone="warn">
                  There is no script for this one, on purpose. In immediate danger, call 911. US National Domestic Violence Hotline: 1-800-799-7233,
                  or text START to 88788. For thoughts of suicide or self-harm, call or text 988.
                </Notice>
              </div>
            </div>
          ) : (
            <div>
              <Label>A calm reply</Label>
              <p className="app-serif text-[21px] leading-snug">&ldquo;{result.answer.calm_reply}&rdquo;</p>
              {result.answer.note && <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--app-muted)]">{result.answer.note}</p>}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <BookRef chapter={result.answer.chapter} title={result.answer.chapter_title} />
            <Link href={`/app/techniques/${result.answer.slug}`} className="text-[15px] underline underline-offset-2">
              Read more about {result.answer.name}
            </Link>
          </div>
          <Button onClick={() => next(round?.exampleId)} loading={loading}>
            Next message
          </Button>
        </Card>
      )}
    </div>
  );
}

export default function TechniquesPage() {
  return (
    <Suspense fallback={null}>
      <SpotTheTactic />
    </Suspense>
  );
}
