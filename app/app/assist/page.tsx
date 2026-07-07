'use client';

import { useState } from 'react';
import { Zap, Loader2, Copy, Check } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { usePeople, PersonPicker } from '@/components/app/PersonPicker';

type Result = { read: string; moves: string[]; watchOut: string };

export default function AssistPage() {
  const people = usePeople();
  const [personId, setPersonId] = useState('');
  const [theySaid, setTheySaid] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  const go = async () => {
    if (!theySaid.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theySaid: theySaid.trim(), goal, personId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data?.error || 'Something went wrong.'); return; }
      setResult(data.result);
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  const copyMove = async (text: string, i: number) => {
    try { await navigator.clipboard.writeText(text); setCopied(i); setTimeout(() => setCopied(null), 1500); } catch {}
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Zap className="h-7 w-7 text-[#D4A017]" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F4ECD8]">Live Assist</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-5">
        In a conversation right now? Drop in what they just said and get a fast read plus a move you can use immediately.
      </p>

      <div className="space-y-3">
        <PersonPicker people={people} value={personId} onChange={setPersonId} />
        <textarea
          value={theySaid}
          onChange={(e) => setTheySaid(e.target.value)}
          onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') go(); }}
          placeholder="What did they just say?"
          rows={3}
          autoFocus
          className="w-full rounded-lg border border-gray-300 dark:border-[#333] bg-white dark:bg-[#1A1A1A] p-3 text-gray-900 dark:text-[#F4ECD8] focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
        />
        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="What you want (optional)"
          className="w-full rounded-lg border border-gray-300 dark:border-[#333] bg-white dark:bg-[#1A1A1A] p-2.5 text-sm text-gray-900 dark:text-[#F4ECD8] focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
        />
        <button
          onClick={go}
          disabled={loading || !theySaid.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#D4A017] px-6 py-3 font-semibold text-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          {loading ? 'Reading…' : 'Give me a move'}
        </button>
        <p className="text-xs text-gray-400">Tip: press Cmd/Ctrl + Enter to fire it fast.</p>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">{error}</div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">The read</p>
            <p className="text-gray-900 dark:text-[#F4ECD8]">{result.read}</p>
          </div>
          <div className="space-y-2">
            {result.moves?.map((m, i) => (
              <button key={i} onClick={() => copyMove(m, i)}
                className="w-full text-left rounded-xl border border-[#D4A017]/40 bg-[#D4A017]/5 p-3 flex items-start justify-between gap-3 hover:bg-[#D4A017]/10">
                <span className="text-gray-900 dark:text-[#F4ECD8]">{m}</span>
                {copied === i ? <Check className="h-4 w-4 shrink-0 text-green-500 mt-0.5" /> : <Copy className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />}
              </button>
            ))}
          </div>
          {result.watchOut && (
            <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-3">
              <span className="text-sm text-orange-700 dark:text-orange-400"><span className="font-semibold">Watch out:</span> {result.watchOut}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
