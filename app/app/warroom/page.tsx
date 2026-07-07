'use client';

import { useState } from 'react';
import { Swords, Loader2, ArrowLeft, Target } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { usePeople, PersonPicker } from '@/components/app/PersonPicker';

type Prep = {
  readTheRoom: string;
  theirLikelyMoves: { move: string; counter: string }[];
  yourThreeTactics: { name: string; how: string }[];
  openingLine: string;
  walkInCard: { opener: string; tactics: string[]; oneLine: string };
};

export default function WarRoomPage() {
  const people = usePeople();
  const [personId, setPersonId] = useState('');
  const [counterpart, setCounterpart] = useState('');
  const [situation, setSituation] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prep, setPrep] = useState<Prep | null>(null);
  const [primer, setPrimer] = useState<{ reframe: string; grounding: string; powerAnchor: string; mantra: string } | null>(null);
  const [primerLoading, setPrimerLoading] = useState(false);

  const getPrimer = async () => {
    if (primerLoading) return;
    setPrimerLoading(true);
    try {
      const res = await apiFetch('/api/primer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation, goal, counterpart }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.result) setPrimer(data.result);
    } catch {
      // non-critical
    } finally {
      setPrimerLoading(false);
    }
  };

  const generate = async () => {
    if (!situation.trim() || !goal.trim() || loading) return;
    setLoading(true);
    setError(null);
    setPrep(null);
    setPrimer(null);
    try {
      const res = await apiFetch('/api/warroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ counterpart, situation, goal, personId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data?.error || 'Something went wrong. Please try again.'); return; }
      setPrep(data.result);
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (prep) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => setPrep(null)} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#D4A017] mb-4">
          <ArrowLeft className="h-4 w-4" /> New prep
        </button>

        {/* Walk-in card */}
        <div className="rounded-2xl border-2 border-[#D4A017] bg-[#D4A017]/5 p-5 mb-6">
          <div className="flex items-center gap-2 text-[#D4A017] mb-3">
            <Target className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Walk-in card — glance before you go in</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-[#F4ECD8] mb-3">&ldquo;{prep.walkInCard.opener}&rdquo;</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {prep.walkInCard.tactics.map((t, i) => (
              <span key={i} className="rounded-full bg-[#D4A017] px-3 py-1 text-xs font-semibold text-[#0A0A0A]">{t}</span>
            ))}
          </div>
          <p className="text-sm italic text-gray-700 dark:text-gray-300">{prep.walkInCard.oneLine}</p>
        </div>

        {/* Nerves primer */}
        {!primer ? (
          <button
            onClick={getPrimer}
            disabled={primerLoading}
            className="mb-6 inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-[#333] px-4 py-2 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            {primerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {primerLoading ? 'One sec…' : 'Nervous? Steady your nerves before you go in'}
          </button>
        ) : (
          <div className="mb-6 rounded-xl border border-blue-400/40 bg-blue-500/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 mb-2">Steady your nerves</p>
            <p className="text-gray-800 dark:text-[#E8E8E0] mb-2">{primer.reframe}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300"><span className="font-medium">Right now:</span> {primer.grounding}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1"><span className="font-medium">Your footing:</span> {primer.powerAnchor}</p>
            <p className="mt-3 font-semibold text-gray-900 dark:text-[#F4ECD8]">&ldquo;{primer.mantra}&rdquo;</p>
          </div>
        )}

        <Block title="Read the room"><p className="text-gray-800 dark:text-[#E8E8E0]">{prep.readTheRoom}</p></Block>

        <Block title="Your opening line">
          <p className="text-gray-900 dark:text-[#F4ECD8] font-medium">&ldquo;{prep.openingLine}&rdquo;</p>
        </Block>

        <Block title="Your 3 tactics">
          <div className="space-y-3">
            {prep.yourThreeTactics.map((t, i) => (
              <div key={i}>
                <p className="font-semibold text-gray-900 dark:text-[#F4ECD8]">{i + 1}. {t.name}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{t.how}</p>
              </div>
            ))}
          </div>
        </Block>

        <Block title="When they push back">
          <div className="space-y-3">
            {prep.theirLikelyMoves.map((m, i) => (
              <div key={i} className="text-sm">
                <p className="text-gray-500 dark:text-gray-400">They: {m.move}</p>
                <p className="text-gray-900 dark:text-[#F4ECD8]">You: {m.counter}</p>
              </div>
            ))}
          </div>
        </Block>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Swords className="h-7 w-7 text-[#D4A017]" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F4ECD8]">War Room</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Got a big conversation coming up? Tell me about it and I&apos;ll build your game plan plus a walk-in card you
        can glance at 60 seconds before you go in.
      </p>

      {error && (
        <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">{error}</div>
      )}

      <div className="space-y-4">
        <PersonPicker people={people} value={personId} onChange={setPersonId} />
        {!personId && (
          <F label="Who are you talking to?" placeholder="e.g. My landlord" value={counterpart} onChange={setCounterpart} />
        )}
        <F label="What's the conversation?" placeholder="e.g. Pushing back on a 12% rent increase" value={situation} onChange={setSituation} textarea />
        <F label="What do you want to walk away with?" placeholder="e.g. No more than 4%, or a longer lease" value={goal} onChange={setGoal} />
      </div>

      <button
        onClick={generate}
        disabled={loading || !situation.trim() || !goal.trim()}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#D4A017] px-6 py-3 font-semibold text-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
        {loading ? 'Building your prep…' : 'Build my game plan'}
      </button>
    </div>
  );
}

function F({ label, placeholder, value, onChange, textarea }: {
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

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] p-4 mb-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">{title}</h2>
      {children}
    </div>
  );
}
