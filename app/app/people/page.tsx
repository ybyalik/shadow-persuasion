'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Plus, Users } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Button, Card, Label, Notice, PageHeader, friendlyError, inputClass } from '@/components/app/ui';

const RELATIONSHIPS = ['Partner', 'Parent', 'Boss', 'Coworker', 'Friend', 'Ex', 'Sibling', 'In-law', 'Other'] as const;

type PersonRow = {
  id: string;
  name: string;
  relationshipType: string;
  tactics: { name: string; count: number }[];
  interactionCount: number;
  lastSeen: string | null;
  summary: { approach: string } | null;
};

function ago(iso: string | null) {
  if (!iso) return 'Nothing logged yet';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `Last: ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

export default function PeoplePage() {
  const { user } = useAuth();
  const [people, setPeople] = useState<PersonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<string>('Partner');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/profiler/people');
      if (!res.ok) {
        setError(await friendlyError(res, 'We could not load your people.'));
        return;
      }
      const d = await res.json();
      setPeople(d.profiles || []);
    } catch {
      setError('We could not load your people. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const add = async () => {
    if (!name.trim()) {
      setError('Please add a name (a first name or nickname is fine).');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch('/api/profiler/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), relationshipType: relationship, notes }),
      });
      if (!res.ok) {
        setError(await friendlyError(res));
        return;
      }
      const d = await res.json();
      window.location.href = `/app/people/${d.profile.id}`;
    } catch {
      setError('We could not save this person. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <PageHeader
        kicker="My people"
        title="The people in your life."
        subtitle="Keep track of the people who test you most. Log what happens, see the tactics they tend to use, remember what worked, and get a short, plain guide for handling each one."
        right={
          !adding ? (
            <Button onClick={() => setAdding(true)}>
              <Plus className="h-4 w-4" /> Add someone
            </Button>
          ) : undefined
        }
      />

      {adding && (
        <Card className="mb-6">
          <Label>Add someone</Label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="p-name" className="mb-1.5 block text-[14px] font-medium">
                Name
              </label>
              <input id="p-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Mom, Dave from accounting..." maxLength={80} />
            </div>
            <div>
              <label htmlFor="p-rel" className="mb-1.5 block text-[14px] font-medium">
                Who they are to you
              </label>
              <select id="p-rel" value={relationship} onChange={(e) => setRelationship(e.target.value)} className={inputClass}>
                {RELATIONSHIPS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="p-notes" className="mb-1.5 block text-[14px] font-medium">
                Anything to remember? <span className="font-normal text-[color:var(--app-muted)]">(optional)</span>
              </label>
              <textarea id="p-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} placeholder="Lives nearby. Always calls on Sundays." />
            </div>
          </div>
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button onClick={add} loading={saving}>
              Save
            </Button>
          </div>
        </Card>
      )}

      {error && (
        <div className="mb-6">
          <Notice tone="error">{error}</Notice>
        </div>
      )}

      {loading ? (
        <p className="text-[15px] text-[color:var(--app-muted)]">Loading your people...</p>
      ) : people.length === 0 ? (
        !adding && (
          <Card className="text-center">
            <Users className="mx-auto mb-3 h-8 w-8 text-[color:var(--app-muted)]" aria-hidden />
            <p className="app-serif text-[24px] font-semibold">No one here yet.</p>
            <p className="mx-auto mt-2 max-w-md text-[15px] text-[color:var(--app-muted)]">
              Start with the person whose voice you hear in the 3 a.m. replay. You can also save someone when you decode a message from them.
            </p>
            <div className="mt-5">
              <Button onClick={() => setAdding(true)}>
                <Plus className="h-4 w-4" /> Add someone
              </Button>
            </div>
          </Card>
        )
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {people.map((p) => (
            <Link
              key={p.id}
              href={`/app/people/${p.id}`}
              className="group flex items-start gap-3 rounded-xl border border-[color:var(--app-line)] bg-[color:var(--app-card)] p-4 hover:bg-[color:var(--app-paper-2)]"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--app-paper-2)] app-serif text-[20px] font-semibold">
                {p.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-semibold">{p.name}</p>
                <p className="text-[13px] text-[color:var(--app-muted)]">
                  {p.relationshipType} · {ago(p.lastSeen)}
                  {p.interactionCount > 0 ? ` · ${p.interactionCount} logged` : ''}
                </p>
                {p.tactics.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.tactics.slice(0, 3).map((t) => (
                      <span key={t.name} className="rounded-md bg-[color:var(--app-paper-2)] px-2 py-0.5 text-[12px]">
                        {t.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <ChevronRight className="mt-3 h-5 w-5 flex-shrink-0 text-[color:var(--app-muted)]" aria-hidden />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
