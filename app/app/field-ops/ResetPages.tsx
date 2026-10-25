'use client';

/* The 21-Day Power Reset (v3 edition only): check-ins, tool pages beside the days,
   weekly reviews and the after-the-reset pages, from the 21-Day Power Reset Journal.
   Page definitions: ./reset-pages.ts. Saved through /api/missions/pages (table
   reset_pages_v3, migration 032). Until that table exists, every page still shows
   its questions with a short "use your journal for now" note. */

import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Lock, RotateCcw, Sparkles } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { Button, Card, Label, Notice, friendlyError, inputClass } from '@/components/app/ui';
import {
  AFTER_RESET_INTRO,
  CHECKINS,
  DRILLS,
  MONTHLY,
  REVIEWS,
  STATEMENTS,
  STATEMENTS_SHORT,
  TOOL_PAGES,
  isEmptyAnswers,
  monthKey,
  type Answers,
  type CheckInDef,
  type Field,
  type PageDef,
} from './reset-pages';

export type PageRow = { page_key: string; answers: Answers; reflection: string | null; updated_at: string };
export type SaveFn = (key: string, answers: Answers) => Promise<string | null>;
export type ReflectFn = (key: string, reflection: string) => void;

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
const NOT_READY_NOTE = "Saving these pages isn't switched on yet. For now, use the same page in your journal.";

export function PrivateLine() {
  return (
    <p className="flex items-center gap-1.5 text-[13px] text-[color:var(--app-muted)]">
      <Lock className="h-3.5 w-3.5" aria-hidden /> Only you can see this.
    </p>
  );
}

function str(a: Answers | undefined, id: string) {
  const v = a?.[id];
  return typeof v === 'string' ? v : '';
}

function bools(a: Answers | undefined, id: string, n: number) {
  const v = a?.[id];
  return Array.from({ length: n }, (_, i) => (Array.isArray(v) ? v[i] === true : false));
}

export function scoresOf(a: Answers | undefined): (number | null)[] {
  const v = a?.scores;
  return STATEMENTS.map((_, i) => (Array.isArray(v) && typeof v[i] === 'number' ? (v[i] as number) : null));
}

/* ───────────── Field rendering ───────────── */

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  if (!text.trim()) return null;
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          /* clipboard blocked: nothing to do, the text is on screen */
        }
      }}
      className="mt-2 inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[color:var(--app-line)] px-3 text-[14px] hover:bg-[color:var(--app-paper-2)]"
    >
      {done ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {done ? 'Copied' : 'Copy'}
    </button>
  );
}

function Fields({
  idPrefix,
  fields,
  values,
  onChange,
}: {
  idPrefix: string;
  fields: Field[];
  values: Answers;
  onChange: (id: string, v: string | boolean[]) => void;
}) {
  return (
    <div className="space-y-4">
      {fields.map((f) => {
        const id = `${idPrefix}-${f.id}`;
        if (f.kind === 'checks') {
          const ticks = bools(values, f.id, f.options.length);
          return (
            <fieldset key={f.id}>
              <legend className="text-[15px] font-semibold mb-1">{f.label}</legend>
              <ul className="space-y-1">
                {f.options.map((o, i) => (
                  <li key={o}>
                    <label className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-[color:var(--app-paper-2)]">
                      <input
                        type="checkbox"
                        checked={ticks[i]}
                        onChange={(e) => onChange(f.id, ticks.map((t, j) => (j === i ? e.target.checked : t)))}
                        className="mt-0.5 h-5 w-5 shrink-0 accent-[color:var(--app-gold)]"
                      />
                      <span className="text-[15px] leading-snug">{o}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
          );
        }
        const rows = f.rows ?? 3;
        return (
          <div key={f.id}>
            <label htmlFor={id} className="block text-[15px] font-semibold">
              {f.label}
            </label>
            {f.hint && <p className="text-[14px] text-[color:var(--app-muted)] mt-0.5">{f.hint}</p>}
            {rows === 1 ? (
              <input id={id} value={str(values, f.id)} onChange={(e) => onChange(f.id, e.target.value)} maxLength={4000} className={cx(inputClass, 'mt-2')} />
            ) : (
              <textarea
                id={id}
                value={str(values, f.id)}
                onChange={(e) => onChange(f.id, e.target.value)}
                rows={rows}
                maxLength={4000}
                className={cx(inputClass, 'mt-2 resize-y leading-relaxed')}
              />
            )}
            {f.copy && <CopyButton text={str(values, f.id)} />}
          </div>
        );
      })}
    </div>
  );
}

/** What a page asks, without inputs (shown while saving isn't switched on yet). */
function FieldList({ fields }: { fields: Field[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1 text-[15px]">
      {fields.map((f) => (
        <li key={f.id}>{f.label}</li>
      ))}
    </ul>
  );
}

function useSaver(key: string, onSave: SaveFn) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  async function save(values: Answers) {
    setSaving(true);
    setError(null);
    setMsg(null);
    const err = await onSave(key, values);
    setSaving(false);
    if (err) setError(err);
    else setMsg('Saved.');
    return !err;
  }
  return { saving, error, msg, save, setMsg };
}

/* ───────────── A tool page ───────────── */

export function ToolPageCard({
  def,
  row,
  ready,
  onSave,
  prefill,
  beside,
}: {
  def: PageDef;
  row?: PageRow;
  ready: boolean;
  onSave: SaveFn;
  prefill?: Answers;
  beside?: React.ReactNode;
}) {
  const baseline = row?.answers ?? {};
  const [values, setValues] = useState<Answers>(() => (isEmptyAnswers(row?.answers) && prefill ? { ...baseline, ...prefill } : baseline));
  const { saving, error, msg, save, setMsg } = useSaver(def.key, onSave);
  useEffect(() => {
    setValues(isEmptyAnswers(row?.answers) && prefill ? { ...(row?.answers ?? {}), ...prefill } : row?.answers ?? {});
    // Only when the page itself changes, so typing is never overwritten.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [def.key]);
  const dirty = JSON.stringify(values) !== JSON.stringify(baseline);

  const form = (
    <div className="min-w-0">
      {ready ? (
        <>
          <Fields
            idPrefix={def.key}
            fields={def.fields}
            values={values}
            onChange={(id, v) => {
              setMsg(null);
              setValues((s) => ({ ...s, [id]: v }));
            }}
          />
          {error && (
            <div className="mt-3">
              <Notice tone="error">{error}</Notice>
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button variant="ghost" onClick={() => save(values)} loading={saving} disabled={!dirty}>
              Save page
            </Button>
            {msg && !dirty && <span className="text-[15px] text-[color:var(--app-sage)]">{msg}</span>}
          </div>
        </>
      ) : (
        <>
          <FieldList fields={def.fields} />
          <div className="mt-3">
            <Notice>{NOT_READY_NOTE}</Notice>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Card>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <h3 className="app-serif text-[21px] leading-snug font-semibold">{def.title}</h3>
      </div>
      <div className="mb-3">
        <PrivateLine />
      </div>
      {def.intro && <p className="text-[15px] leading-relaxed text-[color:var(--app-muted)] mb-4">{def.intro}</p>}
      {beside ? (
        <div className="grid gap-5 md:grid-cols-2 items-start">
          <div className="min-w-0">{beside}</div>
          {form}
        </div>
      ) : (
        form
      )}
      {def.after && <p className="mt-4 text-[14px] leading-relaxed text-[color:var(--app-muted)]">{def.after}</p>}
    </Card>
  );
}

/** The Day 4 replay, read-only, shown beside the Day 21 rewrite. */
export function ReplayBeside({ replay }: { replay?: Answers }) {
  const def = TOOL_PAGES.find((p) => p.key === 'replay-4')!;
  const filled = def.fields.filter((f) => str(replay, f.id).trim());
  return (
    <div className="rounded-lg bg-[color:var(--app-paper-2)] p-4">
      <Label>Your Day 4 replay</Label>
      {filled.length ? (
        <dl className="space-y-3 text-[15px]">
          {filled.map((f) => (
            <div key={f.id}>
              <dt className="font-semibold">{f.label}</dt>
              <dd className="whitespace-pre-line leading-relaxed">{str(replay, f.id)}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-[15px] text-[color:var(--app-muted)]">
          Your Day 4 replay isn&apos;t written here yet. You can fill it in on Day 4, or copy it from your journal.
        </p>
      )}
    </div>
  );
}

/* ───────────── Check-ins ───────────── */

function ScorePicker({ index, value, onChange }: { index: number; value: number | null; onChange: (n: number) => void }) {
  return (
    <div>
      <p id={`stmt-${index}`} className="text-[15px] font-semibold mb-2">
        {index + 1}. {STATEMENTS[index]}
      </p>
      <div role="radiogroup" aria-labelledby={`stmt-${index}`} className="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
        {Array.from({ length: 11 }, (_, n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            onClick={() => onChange(n)}
            className={cx(
              'min-h-[44px] rounded-lg border text-[15px] font-semibold transition-colors',
              value === n
                ? 'border-[color:var(--app-gold)] bg-[color:var(--app-gold)] text-[#0b0a08]'
                : 'border-[color:var(--app-line)] hover:bg-[color:var(--app-paper-2)]'
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[12px] text-[color:var(--app-muted)]" aria-hidden>
        <span>0 not at all</span>
        <span>10 completely</span>
      </div>
    </div>
  );
}

export type Column = { label: string; scores: (number | null)[] };

/** Check-in scores side by side (the journal's Check-in 4 grid). */
export function ComparisonGrid({ columns, showChange = false }: { columns: Column[]; showChange?: boolean }) {
  const first = columns.find((c) => c.scores.some((s) => s !== null));
  const last = [...columns].reverse().find((c) => c.scores.some((s) => s !== null));
  const canChange = showChange && first && last && first !== last;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[14px]">
        <caption className="sr-only">Your check-in scores side by side, 0 to 10</caption>
        <thead>
          <tr className="text-left text-[color:var(--app-muted)]">
            <th scope="col" className="py-2 pr-2 font-normal">
              Statement
            </th>
            {columns.map((c) => (
              <th key={c.label} scope="col" className="px-1 py-2 text-center font-normal app-type text-[11px]">
                {c.label}
              </th>
            ))}
            {canChange && (
              <th scope="col" className="px-1 py-2 text-center font-normal app-type text-[11px]">
                Change
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {STATEMENTS_SHORT.map((s, i) => {
            const a = first?.scores[i];
            const b = last?.scores[i];
            const diff = typeof a === 'number' && typeof b === 'number' ? b - a : null;
            return (
              <tr key={s} className="border-t border-[color:var(--app-line)]">
                <th scope="row" className="py-2 pr-2 text-left font-normal leading-snug">
                  {i + 1}. {s}
                </th>
                {columns.map((c) => (
                  <td key={c.label} className="px-1 py-2 text-center font-semibold">
                    {c.scores[i] ?? <span className="font-normal text-[color:var(--app-muted)]">·</span>}
                  </td>
                ))}
                {canChange && (
                  <td className="px-1 py-2 text-center text-[color:var(--app-muted)]">{diff === null ? '·' : diff > 0 ? `+${diff}` : String(diff)}</td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function CheckInCard({
  def,
  row,
  ready,
  onSave,
  columns,
  showChange,
  showPrivate,
}: {
  def: PageDef & { hideEarlier?: boolean };
  row?: PageRow;
  ready: boolean;
  onSave: SaveFn;
  /** Scores to compare with (shown after this check-in is saved, or always when hideEarlier is false). */
  columns: Column[];
  showChange?: boolean;
  /** Show "Only you can see this" (for pages that ask about other people). */
  showPrivate?: boolean;
}) {
  const baseline = row?.answers ?? {};
  const [values, setValues] = useState<Answers>(baseline);
  const { saving, error, msg, save, setMsg } = useSaver(def.key, onSave);
  useEffect(() => {
    setValues(row?.answers ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [def.key]);
  const scores = scoresOf(values);
  const savedScores = scoresOf(row?.answers);
  const isSaved = savedScores.every((s) => s !== null);
  const allRated = scores.every((s) => s !== null);
  const dirty = JSON.stringify(values) !== JSON.stringify(baseline);
  const showGrid = columns.length > 1 && (isSaved || !def.hideEarlier) && columns.some((c) => c.scores.some((s) => s !== null));

  return (
    <Card tone={isSaved ? 'plain' : 'gold'}>
      <h3 className="app-serif text-[21px] leading-snug font-semibold mb-1">{def.title}</h3>
      {showPrivate && (
        <div className="mb-3">
          <PrivateLine />
        </div>
      )}
      {def.intro && <p className="text-[15px] leading-relaxed text-[color:var(--app-muted)] mb-4">{def.intro}</p>}

      {ready ? (
        <>
          <div className="space-y-5">
            {STATEMENTS.map((_, i) => (
              <ScorePicker
                key={i}
                index={i}
                value={scores[i]}
                onChange={(n) => {
                  setMsg(null);
                  setValues((s) => ({ ...s, scores: scoresOf(s).map((x, j) => (j === i ? n : x)) }));
                }}
              />
            ))}
          </div>
          {def.fields.length > 0 && (
            <div className="mt-6">
              <Fields
                idPrefix={def.key}
                fields={def.fields}
                values={values}
                onChange={(id, v) => {
                  setMsg(null);
                  setValues((s) => ({ ...s, [id]: v }));
                }}
              />
            </div>
          )}
          {error && (
            <div className="mt-3">
              <Notice tone="error">{error}</Notice>
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button variant={isSaved ? 'ghost' : 'gold'} onClick={() => save(values)} loading={saving} disabled={!dirty || !allRated}>
              <Check className="h-4 w-4" /> {isSaved ? 'Save changes' : 'Save check-in'}
            </Button>
            {!allRated && <span className="text-[14px] text-[color:var(--app-muted)]">Rate all five to save.</span>}
            {msg && !dirty && <span className="text-[15px] text-[color:var(--app-sage)]">{msg}</span>}
          </div>
        </>
      ) : (
        <>
          <ol className="list-decimal pl-5 space-y-1 text-[15px]">
            {STATEMENTS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <div className="mt-3">
            <Notice>{NOT_READY_NOTE}</Notice>
          </div>
        </>
      )}

      {showGrid && (
        <div className="mt-6 border-t border-[color:var(--app-line)] pt-4">
          <Label>Side by side</Label>
          <ComparisonGrid columns={columns} showChange={showChange} />
        </div>
      )}
      {def.after && <p className="mt-4 text-[14px] leading-relaxed text-[color:var(--app-muted)]">{def.after}</p>}
    </Card>
  );
}

/** The four Reset check-ins as grid columns, up to and including check-in n. */
export function checkInColumns(pages: Map<string, PageRow>, upTo = 4): Column[] {
  return CHECKINS.filter((c) => c.n <= upTo).map((c) => ({ label: c.column, scores: scoresOf(pages.get(c.key)?.answers) }));
}

/* ───────────── Weekly reviews ───────────── */

export function ReviewCard({
  review,
  row,
  noteCount,
  onReflect,
}: {
  review: (typeof REVIEWS)[number];
  row?: PageRow;
  noteCount: number;
  onReflect: ReflectFn;
}) {
  const [text, setText] = useState<string | null>(row?.reflection ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setText(row?.reflection ?? null), [row?.reflection]);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/journal/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n: review.n }),
      });
      if (!res.ok) {
        setError(await friendlyError(res, 'We could not write your review just now. Please try again.'));
        return;
      }
      const d: { reflection: string } = await res.json();
      setText(d.reflection);
      onReflect(review.key, d.reflection);
    } catch {
      setError('We could not write your review just now. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  const range = review.n === 3 ? 'all 21 days' : `Days ${review.from} to ${review.to}`;
  return (
    <Card>
      <h3 className="app-serif text-[21px] leading-snug font-semibold mb-1">{review.title}</h3>
      <p className="text-[15px] leading-relaxed text-[color:var(--app-muted)] mb-4">
        {review.n === 3
          ? 'A short look back over the whole Reset: your notes, your four check-ins, and your Day 4 replay beside your new answer.'
          : `A short reflection on your notes from ${range} and your check-ins so far. Read back through the week yourself first; this is a second pair of eyes.`}
      </p>
      {text && <p className="text-[15px] leading-relaxed whitespace-pre-line rounded-lg bg-[color:var(--app-paper-2)] p-4 mb-4">{text}</p>}
      {error && (
        <div className="mb-3">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      {noteCount > 0 ? (
        <Button variant="ghost" onClick={run} loading={loading}>
          <Sparkles className="h-4 w-4" /> {text ? 'Write it again' : review.n === 3 ? 'Write my wrap-up' : 'Write my weekly review'}
        </Button>
      ) : (
        <p className="text-[14px] text-[color:var(--app-muted)]">Save a few evening notes for {range} first, then come back here.</p>
      )}
    </Card>
  );
}

/* ───────────── What sits beside each day ───────────── */

export function DayExtras({
  day,
  position,
  pages,
  ready,
  onSave,
  onReflect,
  notedDays,
}: {
  day: number;
  position: 'before' | 'after';
  pages: Map<string, PageRow>;
  ready: boolean;
  onSave: SaveFn;
  onReflect: ReflectFn;
  /** Day numbers that have an evening note. */
  notedDays: number[];
}) {
  const items: React.ReactNode[] = [];
  const checkIn = CHECKINS.find((c) => c.day === day) as CheckInDef | undefined;

  if (position === 'before') {
    // Check-in 1 comes before Day 1.
    if (checkIn?.n === 1) {
      items.push(
        <CheckInCard key={checkIn.key} def={checkIn} row={pages.get(checkIn.key)} ready={ready} onSave={onSave} columns={[]} />
      );
    }
  } else {
    for (const t of TOOL_PAGES.filter((p) => p.day === day)) {
      const isRewrite = t.key === 'rewrite-21';
      const replay = pages.get('replay-4')?.answers;
      items.push(
        <ToolPageCard
          key={t.key}
          def={t}
          row={pages.get(t.key)}
          ready={ready}
          onSave={onSave}
          prefill={isRewrite && str(replay, 'they') ? { they: str(replay, 'they') } : undefined}
          beside={isRewrite ? <ReplayBeside replay={replay} /> : undefined}
        />
      );
    }
    if (checkIn && checkIn.n > 1) {
      items.push(
        <CheckInCard
          key={checkIn.key}
          def={checkIn}
          row={pages.get(checkIn.key)}
          ready={ready}
          onSave={onSave}
          columns={checkInColumns(pages, checkIn.n)}
          showChange={checkIn.n === 4}
        />
      );
    }
    const review = REVIEWS.find((r) => r.day === day);
    if (review) {
      const noteCount = notedDays.filter((d) => d >= review.from && d <= review.to).length;
      items.push(<ReviewCard key={review.key} review={review} row={pages.get(review.key)} noteCount={noteCount} onReflect={onReflect} />);
    }
  }
  if (!items.length) return null;
  return <>{items}</>;
}

/* ───────────── After the reset ───────────── */

function DrillsCard({ row, ready, onSave }: { row?: PageRow; ready: boolean; onSave: SaveFn }) {
  const saved = row?.answers ?? {};
  const done = useMemo(() => (Array.isArray(saved.done) ? (saved.done as string[]) : []), [saved.done]);
  const round = typeof saved.round === 'number' ? saved.round : 1;
  const [notes, setNotes] = useState(str(saved, 'notes'));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const thisWeek = DRILLS.find((d) => !done.includes(d.id));

  async function put(next: Answers) {
    setBusy(true);
    setError(null);
    const err = await onSave('drills', next);
    setBusy(false);
    if (err) setError(err);
  }

  return (
    <Card>
      <h3 className="app-serif text-[21px] leading-snug font-semibold mb-1">Courage drills to rotate</h3>
      <p className="text-[15px] leading-relaxed text-[color:var(--app-muted)] mb-4">
        One drill a week is plenty. Tick each when done, and start again at the top. The day number shows where to reread it.
        {round > 1 ? ` Round ${round}.` : ''}
      </p>

      {thisWeek && (
        <div className="mb-4 rounded-lg border border-[color:var(--app-gold)] p-4">
          <Label>This week&apos;s drill</Label>
          <p className="text-[16px]">
            <strong>{thisWeek.name}.</strong> {thisWeek.text} <span className="text-[color:var(--app-muted)]">({thisWeek.days})</span>
          </p>
        </div>
      )}

      <ul className="space-y-1">
        {DRILLS.map((d) => {
          const isDone = done.includes(d.id);
          return (
            <li key={d.id}>
              <label
                className={cx(
                  'flex min-h-[44px] items-start gap-3 rounded-lg px-2 py-2',
                  ready ? 'cursor-pointer hover:bg-[color:var(--app-paper-2)]' : 'opacity-90'
                )}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  disabled={!ready || busy}
                  onChange={(e) =>
                    put({ done: e.target.checked ? [...done, d.id] : done.filter((x) => x !== d.id), round, notes: str(saved, 'notes') })
                  }
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[color:var(--app-gold)]"
                />
                <span className="text-[15px] leading-snug">
                  <strong>{d.name}.</strong> {d.text} <span className="text-[color:var(--app-muted)]">({d.days})</span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {ready && !thisWeek && (
        <div className="mt-4">
          <Button variant="gold" onClick={() => put({ done: [], round: round + 1, notes: str(saved, 'notes') })} loading={busy}>
            <RotateCcw className="h-4 w-4" /> Start again at the top
          </Button>
        </div>
      )}

      {ready ? (
        <div className="mt-5">
          <label htmlFor="drill-notes" className="block text-[15px] font-semibold">
            Notes on the drills I&apos;ve done
          </label>
          <textarea id="drill-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} maxLength={4000} className={cx(inputClass, 'mt-2 resize-y')} />
          <div className="mt-3">
            <Button variant="ghost" onClick={() => put({ done, round, notes })} loading={busy} disabled={notes.trim() === str(saved, 'notes')}>
              Save notes
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <Notice>{NOT_READY_NOTE}</Notice>
        </div>
      )}
      {error && (
        <div className="mt-3">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
    </Card>
  );
}

function monthLabel(key: string) {
  const [, y, m] = key.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
}

export function AfterReset({ pages, ready, onSave }: { pages: Map<string, PageRow>; ready: boolean; onSave: SaveFn }) {
  const key = monthKey();
  const def = { ...MONTHLY, key, title: `Monthly check-in: ${new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}` };
  // Compare with Day 21 and the last few months.
  const months = Array.from(pages.keys())
    .filter((k) => k.startsWith('monthly-') && k !== key)
    .sort()
    .slice(-3);
  const columns: Column[] = [
    { label: 'Day 21', scores: scoresOf(pages.get('checkin-4')?.answers) },
    ...months.map((k) => ({ label: monthLabel(k), scores: scoresOf(pages.get(k)?.answers) })),
    { label: monthLabel(key), scores: scoresOf(pages.get(key)?.answers) },
  ];

  return (
    <div className="space-y-4">
      <Card tone="night">
        <Label className="!text-[color:var(--app-gold)]">After the reset</Label>
        <p className="text-[15px] leading-relaxed opacity-90">{AFTER_RESET_INTRO}</p>
      </Card>
      <CheckInCard key={key} def={{ ...def, hideEarlier: false }} row={pages.get(key)} ready={ready} onSave={onSave} columns={columns} showPrivate />
      <DrillsCard row={pages.get('drills')} ready={ready} onSave={onSave} />
    </div>
  );
}
