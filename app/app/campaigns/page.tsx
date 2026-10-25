'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { CHAPTERS } from '@/lib/prompts/your-life';
import { PersonPicker, usePeople } from '@/components/app/PersonPicker';
import { BookRef, Button, Card, Label, Notice, PageHeader, friendlyError, inputClass } from '@/components/app/ui';

type Step = { label: string; detail: string; when: string; action: 'plan' | 'rehearse' | null; chapter: number | null; done: boolean; notes: string };
type Goal = {
  id: string;
  personId: string | null;
  personName: string | null;
  title: string;
  goal: string;
  situation: string | null;
  status: 'active' | 'done' | 'paused';
  steps: Step[];
  progress: number;
  createdAt: string;
};

const EXAMPLES = ["Get the raise I'm owed", 'Stop hosting every holiday', "Get my brother to share Dad's care", 'Stop lending money to my friend'];

function stepLink(goal: Goal, step: Step) {
  const params = new URLSearchParams({
    who: goal.personName || '',
    situation: `${goal.title}. ${goal.situation ? `${goal.situation} ` : ''}This step: ${step.detail}`.slice(0, 900),
    goal: step.label,
  });
  if (goal.personId) params.set('person', goal.personId);
  return step.action === 'rehearse' ? `/app/spar?${params}` : `/app/warroom?${params}`;
}

export default function GoalsPage() {
  const { user } = useAuth();
  const people = usePeople();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [situation, setSituation] = useState('');
  const [personId, setPersonId] = useState('');
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [hotline, setHotline] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/campaigns');
      if (!res.ok) {
        setError(await friendlyError(res, 'We could not load your goals.'));
        return;
      }
      const d = await res.json();
      setGoals(d.campaigns || []);
      setOpen((o) => o ?? d.campaigns?.find((g: Goal) => g.status === 'active')?.id ?? null);
    } catch {
      setError('We could not load your goals. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const create = async () => {
    if (!title.trim()) {
      setError('Give your goal a short name, like "Get the raise I\'m owed".');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), situation, personId }),
      });
      if (!res.ok) {
        setError(await friendlyError(res, 'We could not write a plan just now. Please try again.'));
        return;
      }
      const d = await res.json();
      setGoals((g) => [d.campaign, ...g]);
      setOpen(d.campaign.id);
      setHotline(d.hotline || null);
      setCreating(false);
      setTitle('');
      setSituation('');
      setPersonId('');
    } catch {
      setError('We could not save your goal. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const update = async (goal: Goal, changes: Partial<Pick<Goal, 'steps' | 'status'>>) => {
    const next = { ...goal, ...changes };
    if (changes.steps) next.progress = Math.round((changes.steps.filter((s) => s.done).length / Math.max(1, changes.steps.length)) * 100);
    setGoals((gs) => gs.map((g) => (g.id === goal.id ? next : g)));
    const res = await apiFetch('/api/campaigns', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: goal.id, ...changes }),
    });
    if (!res.ok) {
      setError(await friendlyError(res));
      setGoals((gs) => gs.map((g) => (g.id === goal.id ? goal : g)));
    }
  };

  const toggleStep = (goal: Goal, i: number) => {
    const steps = goal.steps.map((s, j) => (j === i ? { ...s, done: !s.done } : s));
    const allDone = steps.every((s) => s.done);
    update(goal, { steps, ...(allDone && goal.status === 'active' ? { status: 'done' as const } : !allDone && goal.status === 'done' ? { status: 'active' as const } : {}) });
  };

  const remove = async (goal: Goal) => {
    if (!window.confirm(`Delete "${goal.title}"? This cannot be undone.`)) return;
    const res = await apiFetch(`/api/campaigns?id=${encodeURIComponent(goal.id)}`, { method: 'DELETE' });
    if (res.ok) setGoals((gs) => gs.filter((g) => g.id !== goal.id));
    else setError(await friendlyError(res));
  };

  return (
    <div className="max-w-4xl">
      <PageHeader
        kicker="Goals"
        title="The bigger things that take a few weeks."
        subtitle="Some things don't change in one conversation. Name what you want, and get a short plan of small steps, from getting ready to making the result stick."
        right={
          !creating ? (
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> New goal
            </Button>
          ) : undefined
        }
      />

      {creating && (
        <Card className="mb-6">
          <Label>A new goal</Label>
          <div className="space-y-4">
            <div>
              <label htmlFor="g-title" className="mb-1.5 block text-[14px] font-medium">
                What do you want?
              </label>
              <input id="g-title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Get the raise I'm owed" maxLength={160} />
              <div className="mt-2 flex flex-wrap gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setTitle(ex)}
                    className="min-h-[36px] rounded-full border border-[color:var(--app-line)] px-3 text-[13px] hover:bg-[color:var(--app-paper-2)]"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="g-sit" className="mb-1.5 block text-[14px] font-medium">
                What&apos;s going on? <span className="font-normal text-[color:var(--app-muted)]">(optional, but it makes the plan fit you)</span>
              </label>
              <textarea
                id="g-sit"
                rows={3}
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                className={inputClass}
                placeholder="I've taken on two people's work since March. My review is in six weeks."
              />
            </div>
            <PersonPicker people={people} value={personId} onChange={setPersonId} />
          </div>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button onClick={create} loading={saving}>
              {saving ? 'Writing your plan...' : 'Make my plan'}
            </Button>
          </div>
        </Card>
      )}

      {error && (
        <div className="mb-6">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      {hotline && (
        <div className="mb-6">
          <Notice tone="warn">Your safety comes first. {hotline}</Notice>
        </div>
      )}

      {loading ? (
        <p className="text-[15px] text-[color:var(--app-muted)]">Loading your goals...</p>
      ) : goals.length === 0 ? (
        !creating && (
          <Card className="text-center">
            <p className="app-serif text-[24px] font-semibold">No goals yet.</p>
            <p className="mx-auto mt-2 max-w-md text-[15px] text-[color:var(--app-muted)]">
              Think of one thing you have been putting up with for too long. That is usually the right first goal.
            </p>
            <div className="mt-5">
              <Button onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4" /> New goal
              </Button>
            </div>
          </Card>
        )
      ) : (
        <div className="space-y-4">
          {goals.map((g) => {
            const isOpen = open === g.id;
            const doneCount = g.steps.filter((s) => s.done).length;
            return (
              <Card key={g.id} className={g.status === 'paused' ? 'opacity-70' : ''}>
                <button onClick={() => setOpen(isOpen ? null : g.id)} className="flex w-full items-start gap-3 text-left" aria-expanded={isOpen}>
                  <div className="min-w-0 flex-1">
                    <p className="app-type mb-1 text-[11px] uppercase tracking-[0.16em] text-[color:var(--app-accent)]">
                      {g.status === 'done' ? 'Done' : g.status === 'paused' ? 'Paused' : 'In progress'}
                      {g.personName ? ` · with ${g.personName}` : ''}
                    </p>
                    <p className="app-serif text-[22px] font-semibold leading-snug">{g.title}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[color:var(--app-paper-2)]" role="progressbar" aria-valuenow={g.progress} aria-valuemin={0} aria-valuemax={100}>
                        <div className="h-full rounded-full bg-[color:var(--app-sage)] transition-all" style={{ width: `${g.progress}%` }} />
                      </div>
                      <span className="text-[13px] text-[color:var(--app-muted)]">
                        {doneCount} of {g.steps.length} steps
                      </span>
                    </div>
                  </div>
                  {isOpen ? <ChevronUp className="mt-1 h-5 w-5 flex-shrink-0" /> : <ChevronDown className="mt-1 h-5 w-5 flex-shrink-0" />}
                </button>

                {isOpen && (
                  <div className="mt-5">
                    {g.situation && <p className="mb-4 text-[14px] text-[color:var(--app-muted)]">{g.situation}</p>}
                    <ol className="space-y-3">
                      {g.steps.map((s, i) => (
                        <li key={i} className="flex gap-3 rounded-lg border border-[color:var(--app-line)] p-3">
                          <button
                            onClick={() => toggleStep(g, i)}
                            aria-label={s.done ? `Mark "${s.label}" as not done` : `Mark "${s.label}" as done`}
                            aria-pressed={s.done}
                            className="-m-1 flex h-11 w-11 flex-shrink-0 items-center justify-center"
                          >
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                                s.done ? 'border-[color:var(--app-sage)] bg-[color:var(--app-sage)] text-white' : 'border-[color:var(--app-line)] bg-[color:var(--app-card)]'
                              }`}
                            >
                              {s.done && <Check className="h-4 w-4" />}
                            </span>
                          </button>
                          <div className="min-w-0 flex-1">
                            <p className={`text-[16px] font-semibold ${s.done ? 'text-[color:var(--app-muted)] line-through' : ''}`}>
                              {s.when && <span className="app-type mr-2 text-[11px] font-normal uppercase tracking-[0.14em] text-[color:var(--app-accent)]">{s.when}</span>}
                              {s.label}
                            </p>
                            {s.detail && <p className="mt-1 text-[15px] leading-relaxed text-[color:var(--app-muted)]">{s.detail}</p>}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {s.action && (
                                <Link
                                  href={stepLink(g, s)}
                                  className="inline-flex min-h-[40px] items-center rounded-lg border border-[color:var(--app-line)] px-3 text-[14px] font-medium hover:bg-[color:var(--app-paper-2)]"
                                >
                                  {s.action === 'rehearse' ? 'Rehearse it' : 'Plan this conversation'}
                                </Link>
                              )}
                              {s.chapter && CHAPTERS[s.chapter] && <BookRef chapter={s.chapter} title={CHAPTERS[s.chapter]} />}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {g.status !== 'done' && (
                        <Button variant="ghost" onClick={() => update(g, { status: g.status === 'paused' ? 'active' : 'paused' })}>
                          {g.status === 'paused' ? 'Pick it back up' : 'Pause this goal'}
                        </Button>
                      )}
                      {g.status === 'done' && (
                        <Button variant="ghost" onClick={() => update(g, { status: 'active' })}>
                          Reopen
                        </Button>
                      )}
                      <Button variant="ghost" onClick={() => remove(g)} className="text-[color:var(--app-oxblood)]">
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
