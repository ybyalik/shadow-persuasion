'use client';

import { useEffect, useState } from 'react';
import { Route, Plus, Loader2, Check, Trophy, X, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { usePeople, PersonPicker } from '@/components/app/PersonPicker';

type Step = { label: string; detail: string; done: boolean; notes: string };
type Campaign = {
  id: string;
  personName?: string | null;
  title: string;
  goal: string;
  situation?: string | null;
  status: string;
  steps: Step[];
};

export default function CampaignsPage() {
  const people = usePeople();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [personId, setPersonId] = useState('');
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [situation, setSituation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await apiFetch('/api/campaigns');
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.campaigns)) setCampaigns(data.campaigns);
    } catch {
      // non-critical
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!title.trim() || !goal.trim() || creating) return;
    setCreating(true);
    setError(null);
    try {
      const res = await apiFetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, goal, situation, personId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data?.error || 'Could not create the campaign.'); return; }
      setCampaigns((c) => [data.campaign, ...c]);
      setOpenId(data.campaign.id);
      setShowForm(false);
      setTitle(''); setGoal(''); setSituation(''); setPersonId('');
    } catch {
      setError('Could not reach the server.');
    } finally {
      setCreating(false);
    }
  };

  const persist = async (c: Campaign, patch: Partial<Campaign>) => {
    const updated = { ...c, ...patch };
    setCampaigns((list) => list.map((x) => (x.id === c.id ? updated : x)));
    try {
      await apiFetch('/api/campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, steps: updated.steps, status: updated.status }),
      });
    } catch {}
  };

  const toggleStep = (c: Campaign, i: number) => {
    const steps = c.steps.map((s, idx) => (idx === i ? { ...s, done: !s.done } : s));
    persist(c, { steps });
  };

  const remove = async (c: Campaign) => {
    setCampaigns((list) => list.filter((x) => x.id !== c.id));
    try { await apiFetch(`/api/campaigns?id=${c.id}`, { method: 'DELETE' }); } catch {}
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Route className="h-7 w-7 text-[#D4A017]" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F4ECD8]">Campaigns</h1>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#D4A017] px-4 py-2 text-sm font-semibold text-[#0A0A0A]">
          <Plus className="h-4 w-4" /> New
        </button>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Some goals take more than one conversation. Set the goal, and I&apos;ll map the sequence of moves so you can work it over time.
      </p>

      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] p-4 space-y-3">
          {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-sm text-red-700 dark:text-red-400">{error}</div>}
          <PersonPicker people={people} value={personId} onChange={setPersonId} />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Campaign title (e.g. Get promoted to Senior)"
            className="w-full rounded-lg border border-gray-300 dark:border-[#333] bg-white dark:bg-[#111] p-2.5 text-gray-900 dark:text-[#F4ECD8] focus:outline-none focus:ring-2 focus:ring-[#D4A017]" />
          <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="The goal (what does winning look like?)"
            className="w-full rounded-lg border border-gray-300 dark:border-[#333] bg-white dark:bg-[#111] p-2.5 text-gray-900 dark:text-[#F4ECD8] focus:outline-none focus:ring-2 focus:ring-[#D4A017]" />
          <textarea value={situation} onChange={(e) => setSituation(e.target.value)} placeholder="Any context (optional)" rows={2}
            className="w-full rounded-lg border border-gray-300 dark:border-[#333] bg-white dark:bg-[#111] p-2.5 text-gray-900 dark:text-[#F4ECD8] focus:outline-none focus:ring-2 focus:ring-[#D4A017]" />
          <button onClick={create} disabled={creating || !title.trim() || !goal.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-[#D4A017] px-5 py-2.5 font-semibold text-[#0A0A0A] disabled:opacity-50">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Route className="h-4 w-4" />}
            {creating ? 'Mapping your moves…' : 'Create campaign'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin text-[#D4A017] mx-auto" /></div>
      ) : campaigns.length === 0 ? (
        <p className="text-center text-gray-400 py-12">No campaigns yet. Start one for a goal that needs more than a single conversation.</p>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => {
            const done = c.steps.filter((s) => s.done).length;
            const open = openId === c.id;
            return (
              <div key={c.id} className={`rounded-xl border ${c.status === 'won' ? 'border-green-500/40' : 'border-gray-200 dark:border-[#333]'} bg-white dark:bg-[#1A1A1A]`}>
                <button onClick={() => setOpenId(open ? null : c.id)} className="w-full flex items-center justify-between gap-3 p-4 text-left">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-[#F4ECD8]">{c.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {c.personName ? `${c.personName} · ` : ''}{done}/{c.steps.length} moves done{c.status === 'won' ? ' · Won' : c.status === 'abandoned' ? ' · Dropped' : ''}
                    </p>
                  </div>
                  {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>

                {open && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-[#2a2a2a] pt-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-medium">Goal:</span> {c.goal}</p>
                    <div className="space-y-2">
                      {c.steps.map((s, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <button onClick={() => toggleStep(c, i)} className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${s.done ? 'bg-[#D4A017] border-[#D4A017]' : 'border-gray-300 dark:border-[#444]'}`}>
                            {s.done && <Check className="h-3.5 w-3.5 text-[#0A0A0A]" />}
                          </button>
                          <div>
                            <p className={`text-sm font-medium ${s.done ? 'line-through text-gray-400' : 'text-gray-900 dark:text-[#F4ECD8]'}`}>{i + 1}. {s.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{s.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {c.status !== 'won' && (
                        <button onClick={() => persist(c, { status: 'won' })} className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white">
                          <Trophy className="h-3.5 w-3.5" /> Mark won
                        </button>
                      )}
                      {c.status === 'active' && (
                        <button onClick={() => persist(c, { status: 'abandoned' })} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-[#444] px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300">
                          <X className="h-3.5 w-3.5" /> Drop
                        </button>
                      )}
                      <button onClick={() => remove(c)} className="inline-flex items-center gap-1 rounded-lg border border-red-300 dark:border-red-900/50 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 ml-auto">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
