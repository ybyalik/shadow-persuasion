'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Bookmark, Check, Mic, Trash2, Wind } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { usePeople, PersonPicker } from '@/components/app/PersonPicker';
import { PageHeader, Card, Label, Button, inputClass, Notice, BookRef, friendlyError } from '@/components/app/ui';
import { BONUSES, CHAPTERS_V3, byEdition } from '@/lib/edition';

type Plan = {
  safety: string | null;
  fairerGoal: string | null;
  theirSide: { wants: string[]; need: string; meetItBy: string };
  openingLine: string;
  threeMoves: { move: string; how: string }[];
  pushback: { kind: string; theySay: string; youSay: string }[];
  bottomLine: string;
  wontDo: string;
  ifItGoesBadly: string;
  close: { goodEnding: string; lockIn: string; firstStep: string };
  breathe: string;
};

type Inputs = { personId: string; counterpart: string; situation: string; goal: string; fear: string };

type Saved = {
  id: string;
  person_id: string | null;
  counterpart: string | null;
  situation: string;
  goal: string;
  fear: string | null;
  plan: Plan;
  created_at: string;
};

/** Which chapter covers each kind of pushback (v2: Part Three; v3: Part II). See lib/edition.ts. */
const PUSHBACK_CHAPTER: Record<string, { chapter: number; title: string }> = byEdition({
  v2: {
    guilt: { chapter: 11, title: 'Guilt and Obligation' },
    'rewriting the past': { chapter: 12, title: 'Rewriting the Past' },
    silence: { chapter: 13, title: 'Withdrawal' },
    charm: { chapter: 14, title: 'Charm and Pressure' },
    urgency: { chapter: 14, title: 'Charm and Pressure' },
    anger: { chapter: 16, title: 'Intimidation' },
  },
  v3: {
    guilt: { chapter: 7, title: CHAPTERS_V3[7] },
    'rewriting the past': { chapter: 8, title: CHAPTERS_V3[8] },
    silence: { chapter: 9, title: CHAPTERS_V3[9] },
    charm: { chapter: 10, title: CHAPTERS_V3[10] },
    urgency: { chapter: 10, title: CHAPTERS_V3[10] },
    anger: { chapter: 11, title: CHAPTERS_V3[11] },
  },
});

/** The book pointers on each part of the plan. */
const PLAN_REFS = byEdition({
  v2: {
    theirSide: { chapter: 19, title: 'What People Really Want' },
    opening: { chapter: 21, title: 'Being Heard Without a Fight' },
    hold: { chapter: 10, title: 'Week 3, Hold' },
    close: { chapter: 25, title: 'Making It Stick' },
    planner: 'The Hard Conversation Planner (free bonus)',
  },
  v3: {
    theirSide: { chapter: 12, title: CHAPTERS_V3[12] },
    opening: { chapter: 17, title: CHAPTERS_V3[17] },
    hold: { chapter: 34, title: CHAPTERS_V3[34] },
    close: { chapter: 22, title: CHAPTERS_V3[22] },
    planner: `${BONUSES.planner} (comes with the book)`,
  },
});

const EMPTY: Inputs = { personId: '', counterpart: '', situation: '', goal: '', fear: '' };

export default function PlanConversationPage() {
  return (
    <Suspense fallback={null}>
      <PlanConversation />
    </Suspense>
  );
}

function PlanConversation() {
  const people = usePeople();
  const params = useSearchParams();
  // Goals and My People link here with ?who=&situation=&goal=&person= to prefill the form.
  const [form, setForm] = useState<Inputs>(() => ({
    ...EMPTY,
    personId: params.get('person') || '',
    counterpart: params.get('who') || '',
    situation: params.get('situation') || '',
    goal: params.get('goal') || '',
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [planInputs, setPlanInputs] = useState<Inputs | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<Saved[]>([]);

  const set = (k: keyof Inputs) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const loadSaved = useCallback(async () => {
    try {
      const res = await apiFetch('/api/warroom/plans');
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      if (Array.isArray(data.plans)) setSaved(data.plans);
    } catch {
      // the saved list is optional
    }
  }, []);

  useEffect(() => {
    // Load the saved list once on open. It only fills in extra information.
    loadSaved();
  }, [loadSaved]);

  const generate = async () => {
    if (!form.situation.trim() || !form.goal.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/warroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        setError(await friendlyError(res, "I couldn't put your plan together just now. Please try again."));
        return;
      }
      const data = await res.json();
      const inputs = { ...form, counterpart: form.counterpart || data.result?.counterpart || '' };
      setPlan(data.result);
      setPlanInputs(inputs);
      setSavedId(null);
      window.scrollTo({ top: 0 });
    } catch {
      setError('Could not reach the app. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!plan || !planInputs || saving || savedId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch('/api/warroom/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...planInputs, plan }),
      });
      if (!res.ok) {
        setError(await friendlyError(res, "Couldn't save your plan. Please try again."));
        return;
      }
      const data = await res.json();
      setSavedId(data.plan?.id ?? 'saved');
      loadSaved();
    } catch {
      setError('Could not reach the app. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Remove this saved plan?')) return;
    const res = await apiFetch(`/api/warroom/plans?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => null);
    if (res?.ok) setSaved((s) => s.filter((p) => p.id !== id));
    else setError("Couldn't remove that plan. Please try again.");
  };

  const openSaved = (s: Saved) => {
    setPlan(s.plan);
    setPlanInputs({
      personId: s.person_id || '',
      counterpart: s.counterpart || '',
      situation: s.situation,
      goal: s.goal,
      fear: s.fear || '',
    });
    setSavedId(s.id);
    setError(null);
    window.scrollTo({ top: 0 });
  };

  const rehearseHref = (i: Inputs) => {
    const q = new URLSearchParams();
    if (i.counterpart) q.set('who', i.counterpart);
    if (i.situation) q.set('situation', i.situation);
    if (i.goal) q.set('goal', i.goal);
    if (i.personId) q.set('person', i.personId);
    return `/app/spar?${q.toString()}`;
  };

  // ---------- THE PLAN ----------
  if (plan && planInputs) {
    const who = planInputs.counterpart || 'them';
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <button
          onClick={() => setPlan(null)}
          className="mb-4 inline-flex min-h-[44px] items-center gap-1 text-[15px] text-[color:var(--app-muted)] hover:text-[color:var(--app-ink)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <PageHeader
          kicker="Your plan"
          title={planInputs.counterpart ? `Talking with ${planInputs.counterpart}` : 'Your conversation plan'}
          subtitle={planInputs.situation}
        />

        <div className="space-y-4">
          {plan.safety && <Notice tone="warn">{plan.safety}</Notice>}
          {plan.fairerGoal && <Notice>{plan.fairerGoal}</Notice>}
          {error && <Notice tone="error">{error}</Notice>}

          <Card tone="night">
            <p className="app-type mb-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--app-gold)]">Read this just before you start</p>
            <p className="app-serif text-[22px] leading-snug">&ldquo;{plan.openingLine}&rdquo;</p>
            <p className="mt-4 text-[15px] leading-relaxed opacity-90">
              <span className="font-semibold">Your bottom line:</span> {plan.bottomLine}
            </p>
            <p className="mt-1 text-[15px] leading-relaxed opacity-90">
              <span className="font-semibold">You won&apos;t:</span> {plan.wontDo}
            </p>
            <p className="mt-4 flex items-start gap-2 text-[15px] leading-relaxed opacity-90">
              <Wind className="mt-0.5 h-4 w-4 shrink-0" /> {plan.breathe}
            </p>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button href={rehearseHref(planInputs)} variant="gold">
              <Mic className="h-4 w-4" /> Rehearse this
            </Button>
            <Button variant="ghost" onClick={save} loading={saving} disabled={Boolean(savedId)}>
              {savedId ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              {savedId ? 'Saved' : 'Save this plan'}
            </Button>
          </div>

          <Card>
            <Label>What&apos;s going on for them</Label>
            <ul className="space-y-1.5 text-[16px] leading-relaxed">
              {plan.theirSide?.wants?.map((w, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[color:var(--app-muted)]">&bull;</span>
                  {w}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[16px] leading-relaxed">
              <span className="font-semibold">Underneath:</span> {plan.theirSide?.need}
            </p>
            <p className="mt-2 text-[16px] leading-relaxed text-[color:var(--app-muted)]">
              <span className="font-semibold text-[color:var(--app-ink)]">Meet it without giving in:</span> {plan.theirSide?.meetItBy}
            </p>
            <div className="mt-4">
              <BookRef chapter={PLAN_REFS.theirSide.chapter} title={PLAN_REFS.theirSide.title} />
            </div>
          </Card>

          <Card>
            <Label>Your opening line</Label>
            <p className="app-serif text-[20px] leading-snug">&ldquo;{plan.openingLine}&rdquo;</p>
            <p className="mt-2 text-[15px] text-[color:var(--app-muted)]">Say it, then stop. No &ldquo;sorry to bring this up.&rdquo;</p>
          </Card>

          <Card>
            <Label>Three moves</Label>
            <ol className="space-y-3">
              {plan.threeMoves?.map((m, i) => (
                <li key={i} className="text-[16px] leading-relaxed">
                  <span className="font-semibold">
                    {i + 1}. {m.move}.
                  </span>{' '}
                  {m.how}
                </li>
              ))}
            </ol>
            <div className="mt-4">
              <BookRef chapter={PLAN_REFS.opening.chapter} title={PLAN_REFS.opening.title} />
            </div>
          </Card>

          <Card>
            <Label>If they push back</Label>
            <p className="mb-4 text-[15px] text-[color:var(--app-muted)]">Acknowledge, then hold. If they keep pushing, say the same calm line again.</p>
            <div className="space-y-4">
              {plan.pushback?.map((p, i) => {
                const ref = PUSHBACK_CHAPTER[p.kind?.toLowerCase()];
                return (
                  <div key={i} className="border-t border-[color:var(--app-line)] pt-4 first:border-t-0 first:pt-0">
                    <p className="app-type text-[11px] uppercase tracking-[0.16em] text-[color:var(--app-accent)]">
                      {p.kind}
                      {ref ? <span className="text-[color:var(--app-muted)]"> &middot; Chapter {ref.chapter}</span> : null}
                    </p>
                    <p className="mt-1 text-[15px] italic text-[color:var(--app-muted)]">
                      {who.charAt(0).toUpperCase() + who.slice(1)}: &ldquo;{p.theySay}&rdquo;
                    </p>
                    <p className="mt-1 text-[16px] leading-relaxed">
                      <span className="font-semibold">You:</span> &ldquo;{p.youSay}&rdquo;
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4">
              <BookRef chapter={PLAN_REFS.hold.chapter} title={PLAN_REFS.hold.title} />
            </div>
          </Card>

          <Card>
            <Label>Your line you won&apos;t cross</Label>
            <p className="text-[16px] leading-relaxed">
              <span className="font-semibold">Bottom line:</span> {plan.bottomLine}
            </p>
            <p className="mt-2 text-[16px] leading-relaxed">
              <span className="font-semibold">The one thing you won&apos;t do:</span> {plan.wontDo}
            </p>
            <p className="mt-2 text-[16px] leading-relaxed">
              <span className="font-semibold">If it goes badly, say:</span> &ldquo;{plan.ifItGoesBadly}&rdquo;
            </p>
            <p className="mt-2 text-[15px] text-[color:var(--app-muted)]">Leaving a conversation isn&apos;t losing it.</p>
          </Card>

          <Card>
            <Label>How to close and make it stick</Label>
            <p className="text-[16px] leading-relaxed">
              <span className="font-semibold">If it goes well:</span> &ldquo;{plan.close?.goodEnding}&rdquo;
            </p>
            <p className="mt-2 text-[16px] leading-relaxed">
              <span className="font-semibold">Before you leave:</span> {plan.close?.firstStep}
            </p>
            <p className="mt-3 text-[15px] font-semibold">Send this the same day:</p>
            <p className="mt-1 rounded-lg bg-[color:var(--app-paper-2)] px-4 py-3 text-[15px] leading-relaxed">{plan.close?.lockIn}</p>
            <div className="mt-4">
              <BookRef chapter={PLAN_REFS.close.chapter} title={PLAN_REFS.close.title} />
            </div>
          </Card>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button href={rehearseHref(planInputs)} variant="gold">
              <Mic className="h-4 w-4" /> Rehearse this
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setPlan(null);
                setForm(EMPTY);
              }}
            >
              Plan another conversation
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- THE FORM ----------
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PageHeader
        kicker="Get ready"
        title="Plan a Conversation"
        subtitle="A hard talk coming up? Answer four quick questions. You'll get an opening line, calm answers for the pushback you're dreading, and a way to make it stick."
      />

      <div className="space-y-4">
        {error && <Notice tone="error">{error}</Notice>}

        <Card>
          <div className="space-y-5">
            <PersonPicker people={people} value={form.personId} onChange={set('personId')} />
            {!form.personId && (
              <Field label="Who is it with?" placeholder="e.g. My sister, my manager, my landlord" value={form.counterpart} onChange={set('counterpart')} />
            )}
            <Field
              label="What is it about?"
              placeholder="e.g. She expects me to host Thanksgiving again. I've done it five years running."
              value={form.situation}
              onChange={set('situation')}
              textarea
            />
            <Field
              label="What do you want to walk away with?"
              placeholder="e.g. She hosts this year, or we split it"
              value={form.goal}
              onChange={set('goal')}
            />
            <Field
              label="What are you afraid they'll say? (optional)"
              placeholder="e.g. &quot;Mom would be so disappointed.&quot;"
              value={form.fear}
              onChange={set('fear')}
            />
          </div>
          <div className="mt-6">
            <Button onClick={generate} loading={loading} disabled={!form.situation.trim() || !form.goal.trim()}>
              {loading ? 'Building your plan...' : 'Build my plan'}
            </Button>
            {loading && <p className="mt-2 text-[14px] text-[color:var(--app-muted)]">This takes about 20 seconds.</p>}
          </div>
        </Card>

        <p className="text-[14px] text-[color:var(--app-muted)]">
          If you feel unsafe with this person, a plan isn&apos;t the right tool. Reach out to people you trust, or call the National Domestic
          Violence Hotline at 1-800-799-7233 (text START to 88788).
        </p>

        {saved.length > 0 && (
          <div className="pt-4">
            <Label>Your saved plans</Label>
            <div className="space-y-2">
              {saved.map((s) => (
                <div key={s.id} className="flex items-stretch gap-2">
                  <button
                    onClick={() => openSaved(s)}
                    className="min-h-[44px] flex-1 rounded-lg border border-[color:var(--app-line)] bg-[color:var(--app-card)] px-4 py-3 text-left hover:bg-[color:var(--app-paper-2)]"
                  >
                    <p className="text-[15px] font-semibold">{s.counterpart || 'Conversation'}</p>
                    <p className="line-clamp-1 text-[14px] text-[color:var(--app-muted)]">{s.situation}</p>
                  </button>
                  <button
                    onClick={() => remove(s.id)}
                    aria-label="Remove saved plan"
                    className="flex min-w-[44px] items-center justify-center rounded-lg border border-[color:var(--app-line)] text-[color:var(--app-muted)] hover:text-[color:var(--app-oxblood)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2">
          <BookRef title={PLAN_REFS.planner} />
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
