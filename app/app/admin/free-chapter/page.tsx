'use client';

/** Free-chapter signups and where each one is in the 20-email sequence (data: /api/admin/subscribers). */

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

type Sub = {
  id: string;
  email: string;
  first_name: string | null;
  status: string;
  sequence_step: number | null;
  next_send_at: string | null;
  converted_at: string | null;
  is_test: boolean | null;
  created_at: string;
};

const STATUS: Record<string, { label: string; cls: string }> = {
  active: { label: 'Getting emails', cls: 'bg-blue-600 text-white' },
  converted: { label: 'Bought', cls: 'bg-emerald-600 text-white' },
  completed: { label: 'Finished all emails', cls: 'bg-gray-500 text-white' },
  unsubscribed: { label: 'Unsubscribed', cls: 'bg-red-600 text-white' },
};

const date = (s: string | null) => (s ? new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');

export default function FreeChapterPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [len, setLen] = useState(20);
  const [loading, setLoading] = useState(true);
  const [includeTest, setIncludeTest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/admin/subscribers${includeTest ? '?test=1' : ''}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Could not load signups.');
      setSubs(d.subscribers);
      setStats(d.stats);
      setLen(d.sequenceLength);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load signups.');
    } finally {
      setLoading(false);
    }
  }, [includeTest]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F4ECD8]">Free chapter signups</h1>
          <p className="text-sm text-gray-500 dark:text-[#F4ECD8]/60 mt-1">
            Everyone who asked for the free chapter, and how far they are in the {len}-email series. Buying stops the emails automatically.
          </p>
        </div>
        <button onClick={load} className="px-3 py-2 text-xs font-mono uppercase tracking-wider border border-gray-300 dark:border-[#D4A017]/30 text-gray-700 dark:text-[#F4ECD8]/80 hover:border-[#D4A017]">
          <RefreshCw className="h-3.5 w-3.5 inline mr-1.5" /> Reload
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            ['Signups', stats.total],
            ['Getting emails', stats.active],
            ['Bought', stats.bought],
            ['Finished', stats.finished],
            ['Unsubscribed', stats.unsubscribed],
          ].map(([l, v]) => (
            <div key={l} className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-4">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">{l}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-[#F4ECD8] mt-1">{v}</p>
            </div>
          ))}
        </div>
      )}

      <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-[#F4ECD8]/70 mb-3">
        <input type="checkbox" checked={includeTest} onChange={(e) => setIncludeTest(e.target.checked)} className="accent-[#D4A017]" />
        Include test signups
      </label>
      {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#D4A017]/20 text-left">
            <tr>
              {['Signed up', 'Email', 'Status', 'Emails received', 'Next email'].map((h) => (
                <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500 font-mono">Loading…</td></tr>
            ) : subs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500 font-mono">No signups yet.</td></tr>
            ) : (
              subs.map((s) => (
                <tr key={s.id} className={`border-b border-gray-100 dark:border-[#D4A017]/10 ${s.is_test ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3 text-xs font-mono text-gray-600 dark:text-[#F4ECD8]/70 whitespace-nowrap">{date(s.created_at)}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-[#F4ECD8]">
                    {s.email}
                    {s.first_name && <span className="text-xs text-gray-500"> · {s.first_name}</span>}
                    {s.is_test && <span className="ml-2 px-1.5 py-0.5 text-[9px] font-mono uppercase bg-purple-600 text-white font-bold">Test</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold ${STATUS[s.status]?.cls ?? 'bg-gray-300'}`}>{STATUS[s.status]?.label ?? s.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700 dark:text-[#F4ECD8]/80">{s.sequence_step ?? 0} of {len}</td>
                  <td className="px-4 py-3 text-xs text-gray-700 dark:text-[#F4ECD8]/80">{s.status === 'active' ? date(s.next_send_at) : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
