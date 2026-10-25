'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { CHAPTERS, RELATIONSHIPS, matchTactic } from '@/lib/prompts/your-life';
import { AddConversationModal, type NewMoment } from '@/components/app/AddConversationModal';
import { ConversationCard, type TimelineEntry } from '@/components/app/ConversationCard';
import { CoachChat } from '@/components/app/StrategicChat';
import { BookRef, Button, Card, Label, Notice, friendlyError, inputClass } from '@/components/app/ui';

type Summary = {
  approach: string;
  dos: string[];
  donts: string[];
  sayThis: string[];
  pressureNote: string | null;
  chapters: { chapter: number; title: string }[];
  generatedAt: string;
};

type Person = {
  id: string;
  name: string;
  relationshipType: string;
  notes: string;
  tactics: { name: string; chapter: number | null; count: number; lastSeen: string | null }[];
  whatWorked: { id: string; date: string; text: string; note?: string | null }[];
  summary: Summary | null;
  nextStep: string | null;
  interactions: Extract<TimelineEntry, { kind: 'moment' }>[];
  decodes: Extract<TimelineEntry, { kind: 'decode' }>[];
  unsafe: boolean;
};

const HOTLINE = 'US National Domestic Violence Hotline: 1-800-799-7233, or text START to 88788. If you are in immediate danger, call 911.';

export default function PersonPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [writing, setWriting] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: '', relationshipType: 'Other', notes: '' });
  const [showChat, setShowChat] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/profiler/people?id=${encodeURIComponent(id)}`);
      if (!res.ok) {
        setError(await friendlyError(res, 'We could not load this person.'));
        return;
      }
      const d = await res.json();
      setPerson(d.profile);
    } catch {
      setError('We could not load this person. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const writeSummary = useCallback(async () => {
    setWriting(true);
    setSummaryError(null);
    try {
      const res = await apiFetch('/api/profiler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-summary', personId: id }),
      });
      if (!res.ok) {
        setSummaryError(await friendlyError(res, 'We could not write the guide just now.'));
        return;
      }
      const d = await res.json();
      setPerson((p) => (p ? { ...p, summary: d.summary, nextStep: d.nextStep } : p));
    } catch {
      setSummaryError('We could not write the guide. Please check your connection.');
    } finally {
      setWriting(false);
    }
  }, [id]);

  const addMoment = async (m: NewMoment): Promise<string | null> => {
    try {
      const res = await apiFetch('/api/profiler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add-interaction', personId: id, interaction: m }),
      });
      if (!res.ok) return friendlyError(res, 'We could not save this moment.');
      const d = await res.json();
      setFlash(d.interaction?.tactics?.length ? `Saved. It looks like: ${d.interaction.tactics.join(', ')}.` : 'Saved.');
      await load();
      writeSummary();
      return null;
    } catch {
      return 'We could not save this moment. Please check your connection.';
    }
  };

  const deleteMoment = async (entry: TimelineEntry) => {
    if (!window.confirm('Remove this entry?')) return;
    const res = await apiFetch('/api/profiler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete-interaction', personId: id, interactionId: entry.id }),
    });
    if (res.ok) load();
    else setError(await friendlyError(res));
  };

  const saveEdit = async () => {
    const res = await apiFetch('/api/profiler/people', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...draft }),
    });
    if (!res.ok) {
      setError(await friendlyError(res));
      return;
    }
    const d = await res.json();
    setPerson(d.profile);
    setEditing(false);
  };

  const removePerson = async () => {
    if (!person || !window.confirm(`Remove ${person.name} and everything logged about them? This cannot be undone.`)) return;
    const res = await apiFetch(`/api/profiler/people?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok) router.push('/app/people');
    else setError(await friendlyError(res));
  };

  const timeline = useMemo<TimelineEntry[]>(() => {
    if (!person) return [];
    return [
      ...person.interactions.map((i) => ({ ...i, kind: 'moment' as const })),
      ...person.decodes.map((d) => ({ ...d, kind: 'decode' as const })),
    ].sort((a, b) => b.date.localeCompare(a.date));
  }, [person]);

  if (loading) return <p className="text-[15px] text-[color:var(--app-muted)]">Loading...</p>;
  if (!person)
    return (
      <div className="max-w-xl space-y-4">
        <Notice tone="error">{error || 'We could not find that person.'}</Notice>
        <Button variant="ghost" href="/app/people">
          Back to My People
        </Button>
      </div>
    );

  const q = (extra: Record<string, string>) => new URLSearchParams({ who: person.name, person: person.id, ...extra }).toString();
  const s = person.summary;

  return (
    <div className="max-w-4xl">
      <Link href="/app/people" className="mb-4 inline-flex min-h-[44px] items-center gap-1.5 text-[14px] text-[color:var(--app-muted)] hover:text-[color:var(--app-ink)]">
        <ArrowLeft className="h-4 w-4" /> My People
      </Link>

      {editing ? (
        <Card className="mb-6">
          <Label>Edit</Label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="e-name" className="mb-1.5 block text-[14px] font-medium">
                Name
              </label>
              <input id="e-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputClass} maxLength={80} />
            </div>
            <div>
              <label htmlFor="e-rel" className="mb-1.5 block text-[14px] font-medium">
                Who they are to you
              </label>
              <select id="e-rel" value={draft.relationshipType} onChange={(e) => setDraft({ ...draft, relationshipType: e.target.value })} className={inputClass}>
                {RELATIONSHIPS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="e-notes" className="mb-1.5 block text-[14px] font-medium">
                Notes
              </label>
              <textarea id="e-notes" rows={3} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <Button variant="ghost" onClick={removePerson} className="sm:mr-auto text-[color:var(--app-oxblood)]">
              <Trash2 className="h-4 w-4" /> Remove {person.name}
            </Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save</Button>
          </div>
        </Card>
      ) : (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="app-type mb-2 text-[12px] uppercase tracking-[0.2em] text-[color:var(--app-accent)]">{person.relationshipType}</p>
            <h1 className="app-serif break-words text-[34px] font-semibold leading-[1.08] sm:text-[40px]">{person.name}</h1>
            {person.notes && <p className="mt-2 max-w-2xl text-[15px] text-[color:var(--app-muted)]">{person.notes}</p>}
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setDraft({ name: person.name, relationshipType: person.relationshipType, notes: person.notes });
              setEditing(true);
            }}
          >
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        </div>
      )}

      {person.unsafe && (
        <div className="mb-6">
          <Notice tone="warn">
            Some of what you logged sounds frightening. Your safety comes first, and you do not have to handle this alone. {HOTLINE}
          </Notice>
        </div>
      )}
      {error && (
        <div className="mb-6">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      {flash && (
        <div className="mb-6">
          <Notice>{flash}</Notice>
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Button onClick={() => setLogOpen(true)}>
          <Plus className="h-4 w-4" /> Log a moment
        </Button>
        <Button variant="ghost" href={`/app/warroom?${q({})}`}>
          Plan a conversation
        </Button>
        <Button variant="ghost" href={`/app/spar?${q({})}`}>
          Rehearse it
        </Button>
        <Button variant="ghost" onClick={() => setShowChat((v) => !v)}>
          <MessageCircle className="h-4 w-4" /> Talk about {person.name}
        </Button>
      </div>

      {showChat && (
        <Card className="mb-8">
          <Label>Talk about {person.name}</Label>
          <p className="mb-4 text-[15px] text-[color:var(--app-muted)]">The coach knows what you have logged about {person.name} and answers from the book.</p>
          <CoachChat personId={person.id} personName={person.name} compact />
        </Card>
      )}

      <Card tone="gold" className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Label>How to handle {person.name}</Label>
          {s && (
            <button
              onClick={writeSummary}
              disabled={writing}
              className="-mt-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-2 text-[13px] text-[color:var(--app-muted)] hover:bg-[color:var(--app-paper-2)] disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${writing ? 'animate-spin' : ''}`} /> {writing ? 'Updating...' : 'Update'}
            </button>
          )}
        </div>
        {s ? (
          <div className="space-y-5">
            {s.pressureNote && <p className="rounded-lg bg-[color:var(--app-paper-2)] px-3 py-2 text-[15px]">{s.pressureNote}</p>}
            <p className="app-serif text-[20px] leading-snug">{s.approach}</p>
            <div className="grid gap-5 sm:grid-cols-2">
              {s.dos.length > 0 && (
                <div>
                  <p className="mb-2 text-[14px] font-semibold">Do</p>
                  <ul className="space-y-1.5 text-[15px]">
                    {s.dos.map((d) => (
                      <li key={d} className="flex gap-2">
                        <span className="text-[color:var(--app-sage)]">&#10003;</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {s.donts.length > 0 && (
                <div>
                  <p className="mb-2 text-[14px] font-semibold">Avoid</p>
                  <ul className="space-y-1.5 text-[15px]">
                    {s.donts.map((d) => (
                      <li key={d} className="flex gap-2">
                        <span className="text-[color:var(--app-oxblood)]">&#215;</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {s.sayThis.length > 0 && (
              <div>
                <p className="mb-2 text-[14px] font-semibold">Things you could say</p>
                {s.sayThis.map((line) => (
                  <blockquote key={line} className="mb-2 border-l-2 border-[color:var(--app-gold)] pl-3 text-[15px] italic">
                    {line}
                  </blockquote>
                ))}
              </div>
            )}
            {person.nextStep && (
              <div className="rounded-lg border border-[color:var(--app-line)] px-4 py-3">
                <p className="app-type mb-1 text-[11px] uppercase tracking-[0.16em] text-[color:var(--app-accent)]">Your next step</p>
                <p className="text-[15px]">{person.nextStep}</p>
              </div>
            )}
            {s.chapters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {s.chapters.map((c) => (
                  <BookRef key={c.chapter} chapter={c.chapter} title={c.title} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-[15px] text-[color:var(--app-muted)]">
              A short, plain guide for {person.name}, based on the book&apos;s playbook for this kind of relationship and on what you log. It gets better as you add moments.
            </p>
            <div className="mt-4">
              <Button variant="gold" onClick={writeSummary} loading={writing}>
                {writing ? 'Writing your guide...' : 'Write my guide'}
              </Button>
            </div>
          </div>
        )}
        {summaryError && (
          <div className="mt-4">
            <Notice tone="error">{summaryError}</Notice>
          </div>
        )}
      </Card>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <Card>
          <Label>Tactics {person.name} tends to use</Label>
          {person.tactics.length === 0 ? (
            <p className="text-[15px] text-[color:var(--app-muted)]">None spotted yet. They show up here as you log moments or decode messages from {person.name}.</p>
          ) : (
            <ul className="space-y-3">
              {person.tactics.slice(0, 6).map((t) => {
                const book = matchTactic(t.name);
                return (
                  <li key={t.name}>
                    <p className="text-[15px] font-semibold">
                      {t.name} <span className="font-normal text-[color:var(--app-muted)]">· {t.count === 1 ? 'once' : `${t.count} times`}</span>
                    </p>
                    {book && <p className="mt-0.5 text-[14px] text-[color:var(--app-muted)]">Calm reply: {book.reply}</p>}
                    {(book?.chapter ?? t.chapter) && (
                      <div className="mt-1.5">
                        <BookRef chapter={book?.chapter ?? t.chapter ?? undefined} title={chapterTitle(book?.chapter ?? t.chapter)} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Card>
          <Label>What has worked</Label>
          {person.whatWorked.length === 0 ? (
            <p className="text-[15px] text-[color:var(--app-muted)]">When a calm reply lands, log it as &ldquo;It went well&rdquo; and it is saved here so you can use it again.</p>
          ) : (
            <ul className="space-y-3">
              {person.whatWorked.slice(0, 6).map((w) => (
                <li key={w.id}>
                  <blockquote className="border-l-2 border-[color:var(--app-sage)] pl-3 text-[15px] italic">&ldquo;{w.text}&rdquo;</blockquote>
                  {w.note && <p className="mt-1 pl-3 text-[13px] text-[color:var(--app-muted)]">{w.note}</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="app-serif text-[26px] font-semibold">Timeline</h2>
        <Button variant="ghost" onClick={() => setLogOpen(true)}>
          <Plus className="h-4 w-4" /> Log a moment
        </Button>
      </div>
      {timeline.length === 0 ? (
        <Notice>Nothing logged yet. Start with the last time {person.name} left you replaying a conversation.</Notice>
      ) : (
        <div className="space-y-3">
          {timeline.map((e) => (
            <ConversationCard key={`${e.kind}-${e.id}`} entry={e} onDelete={deleteMoment} />
          ))}
        </div>
      )}

      <AddConversationModal isOpen={logOpen} onClose={() => setLogOpen(false)} personName={person.name} onAdd={addMoment} />
    </div>
  );
}

function chapterTitle(n: number | null | undefined) {
  return (n && CHAPTERS[n]) || 'The Tactic Quick Reference';
}
