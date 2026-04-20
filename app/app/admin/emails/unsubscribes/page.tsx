'use client';

/* ════════════════════════════════════════════════════════════
   /admin/emails/unsubscribes — Manage opt-outs

   Lists everyone who has unsubscribed, lets the admin manually
   opt an email out (e.g. after a direct email complaint) or
   resubscribe (restore marketing). Non-transactional sends
   automatically skip any email on this list.
   ════════════════════════════════════════════════════════════ */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Search, UserX, UserCheck, Plus } from 'lucide-react';

type Unsub = {
  id: string;
  email: string;
  reason: string | null;
  source: string | null;
  template_key: string | null;
  unsubscribed_at: string;
  resubscribed_at: string | null;
};

export default function UnsubscribesPage() {
  const [list, setList] = useState<Unsub[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [newReason, setNewReason] = useState('');
  const [addBusy, setAddBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (showAll) params.set('showAll', '1');
      const res = await fetch(`/api/admin/emails/unsubscribes?${params.toString()}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to load');
      setList(d.unsubscribes ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, showAll]);

  async function handleAdd() {
    if (!newEmail) return;
    setAddBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/emails/unsubscribes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, reason: newReason || undefined }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Add failed');
      setFlash(d.alreadyUnsubscribed ? 'Already unsubscribed' : `Unsubscribed ${newEmail}`);
      setNewEmail('');
      setNewReason('');
      setTimeout(() => setFlash(null), 3000);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setAddBusy(false);
    }
  }

  async function handleResubscribe(u: Unsub) {
    if (!confirm(`Resubscribe ${u.email}? They'll start receiving marketing emails again.`))
      return;
    try {
      const res = await fetch(`/api/admin/emails/unsubscribes?email=${encodeURIComponent(u.email)}`, {
        method: 'DELETE',
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Resubscribe failed');
      setFlash(`Resubscribed ${u.email}`);
      setTimeout(() => setFlash(null), 3000);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }) : '—';

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <Link
        href="/app/admin/emails"
        className="inline-flex items-center gap-2 text-[#D4A017] mb-5 text-sm font-mono"
      >
        <ArrowLeft className="h-4 w-4" /> Back to emails
      </Link>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-[#D4A017]/70 mb-2">
            // UNSUBSCRIBES //
          </p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-[#F4ECD8]">
            Opt-outs
          </h1>
          <p className="text-sm text-gray-600 dark:text-[#F4ECD8]/60 mt-2">
            Non-transactional emails skip anyone on this list. Transactional emails (receipts, download
            links) still go through — required for delivering paid products.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/30 text-[#D4A017] hover:border-[#D4A017] disabled:opacity-50 font-mono text-xs uppercase tracking-wider"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 p-3 mb-5 font-mono text-sm">
          {error}
        </div>
      )}
      {flash && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-500 dark:border-green-600 text-green-700 dark:text-green-300 p-3 mb-5 font-mono text-sm">
          ✓ {flash}
        </div>
      )}

      {/* Manual add */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-4 mb-5">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[#D4A017] mb-2">
          Manually unsubscribe an email
        </p>
        <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="customer@example.com"
            className="px-3 py-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm font-mono focus:outline-none focus:border-[#D4A017]"
          />
          <input
            type="text"
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            placeholder="Reason (optional, e.g. 'replied asking to stop')"
            className="px-3 py-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm font-mono focus:outline-none focus:border-[#D4A017]"
          />
          <button
            onClick={handleAdd}
            disabled={addBusy || !newEmail}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4A017] text-[#0A0A0A] hover:bg-[#B8860B] font-mono text-xs uppercase tracking-wider font-bold disabled:opacity-50"
          >
            <Plus className="h-3 w-3" />
            {addBusy ? 'Adding…' : 'Unsubscribe'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-4 mb-5 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-[#F4ECD8]/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email…"
            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm font-mono focus:outline-none focus:border-[#D4A017]"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-[#F4ECD8]/70">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
            className="accent-[#D4A017]"
          />
          Include resubscribed (show audit history)
        </label>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#D4A017]/20 text-left">
            <tr>
              <th className="px-3 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Email</th>
              <th className="px-3 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Source</th>
              <th className="px-3 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Reason</th>
              <th className="px-3 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Unsubscribed</th>
              <th className="px-3 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Resubscribed</th>
              <th className="px-3 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && list.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-[#F4ECD8]/50 font-mono">
                  Loading…
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-[#F4ECD8]/50 font-mono">
                  No opt-outs.
                </td>
              </tr>
            ) : (
              list.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-100 dark:border-[#D4A017]/10 hover:bg-gray-50 dark:hover:bg-[#0A0A0A]"
                >
                  <td className="px-3 py-2.5 text-xs text-gray-900 dark:text-[#F4ECD8] break-all">
                    <div className="flex items-center gap-2">
                      {u.resubscribed_at ? (
                        <UserCheck className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <UserX className="h-3.5 w-3.5 text-red-600" />
                      )}
                      {u.email}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[10px] font-mono uppercase text-gray-600 dark:text-[#F4ECD8]/60">
                    {u.source || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-700 dark:text-[#F4ECD8]/70 max-w-[220px] truncate" title={u.reason ?? ''}>
                    {u.reason || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-[11px] font-mono text-gray-600 dark:text-[#F4ECD8]/60 whitespace-nowrap">
                    {fmtDate(u.unsubscribed_at)}
                  </td>
                  <td className="px-3 py-2.5 text-[11px] font-mono text-gray-600 dark:text-[#F4ECD8]/60 whitespace-nowrap">
                    {fmtDate(u.resubscribed_at)}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {!u.resubscribed_at && (
                      <button
                        onClick={() => handleResubscribe(u)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#D4A017]/40 text-gray-900 dark:text-[#F4ECD8] hover:border-[#D4A017] font-mono text-[10px] uppercase tracking-wider"
                      >
                        <UserCheck className="h-3 w-3" />
                        Resubscribe
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
