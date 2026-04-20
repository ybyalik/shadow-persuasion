'use client';

/* ════════════════════════════════════════════════════════════
   /admin/emails/sends — Log viewer for every email we've sent

   Unified across all templates. Useful when a customer says
   "I didn't get it" — search their email, see status + Resend
   ID in one row. Logs include sent / failed / skipped (the last
   for unsubscribed recipients or disabled templates).
   ════════════════════════════════════════════════════════════ */

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { RefreshCw, Search, ArrowLeft } from 'lucide-react';

type Send = {
  id: string;
  template_key: string | null;
  to_email: string;
  subject: string | null;
  status: 'sent' | 'failed' | 'skipped';
  provider_id: string | null;
  error: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
};

type Stats = {
  sent24h: number;
  failed24h: number;
  sent7d: number;
  failed7d: number;
};

type TemplateOption = { key: string; name: string };

export default function SendsPage() {
  const [sends, setSends] = useState<Send[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (template !== 'all') params.set('template', template);
      if (status !== 'all') params.set('status', status);
      if (search) params.set('search', search);
      params.set('limit', '300');
      const res = await fetch(`/api/admin/emails/sends?${params.toString()}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to load');
      setSends(d.sends ?? []);
      setStats(d.stats ?? null);
      setTemplates(d.templates ?? []);
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
  }, [template, status, search]);

  const failureRate7d = useMemo(() => {
    if (!stats) return null;
    const total = stats.sent7d + stats.failed7d;
    if (total === 0) return null;
    return ((stats.failed7d / total) * 100).toFixed(1);
  }, [stats]);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

  return (
    <div className="p-6 md:p-10 max-w-7xl">
      <Link
        href="/app/admin/emails"
        className="inline-flex items-center gap-2 text-[#D4A017] mb-5 text-sm font-mono"
      >
        <ArrowLeft className="h-4 w-4" /> Back to emails
      </Link>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-[#D4A017]/70 mb-2">
            // SENDS LOG //
          </p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-[#F4ECD8]">
            Email Sends
          </h1>
          <p className="text-sm text-gray-600 dark:text-[#F4ECD8]/60 mt-2">
            Every email attempt — sent, failed, or skipped (disabled template or unsubscribed recipient).
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

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Sent · 24h" value={stats.sent24h} />
          <StatCard label="Failed · 24h" value={stats.failed24h} accent="danger" />
          <StatCard label="Sent · 7d" value={stats.sent7d} />
          <StatCard
            label="Failure rate · 7d"
            value={failureRate7d !== null ? `${failureRate7d}%` : '—'}
            accent={failureRate7d !== null && Number(failureRate7d) > 5 ? 'danger' : undefined}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-4 mb-6 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-[#F4ECD8]/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipient email…"
            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm font-mono focus:outline-none focus:border-[#D4A017]"
          />
        </div>
        <select
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="px-3 py-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm font-mono focus:outline-none focus:border-[#D4A017]"
        >
          <option value="all">All templates</option>
          {templates.map((t) => (
            <option key={t.key} value={t.key}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#D4A017]/30 text-gray-900 dark:text-[#F4ECD8] text-sm font-mono focus:outline-none focus:border-[#D4A017]"
        >
          <option value="all">All statuses</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="skipped">Skipped</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#D4A017]/20 text-left">
            <tr>
              <th className="px-3 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">When</th>
              <th className="px-3 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Template</th>
              <th className="px-3 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">To</th>
              <th className="px-3 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Subject</th>
              <th className="px-3 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Status</th>
              <th className="px-3 py-3 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#D4A017]/80 font-mono">Detail</th>
            </tr>
          </thead>
          <tbody>
            {loading && sends.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-[#F4ECD8]/50 font-mono">
                  Loading…
                </td>
              </tr>
            ) : sends.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-[#F4ECD8]/50 font-mono">
                  No sends match these filters.
                </td>
              </tr>
            ) : (
              sends.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-gray-100 dark:border-[#D4A017]/10 hover:bg-gray-50 dark:hover:bg-[#0A0A0A]"
                >
                  <td className="px-3 py-2.5 font-mono text-[11px] text-gray-600 dark:text-[#F4ECD8]/70 whitespace-nowrap">
                    {fmtDate(s.created_at)}
                  </td>
                  <td className="px-3 py-2.5">
                    {s.template_key ? (
                      <Link
                        href={`/app/admin/emails/${s.template_key}`}
                        className="text-xs font-mono text-[#D4A017] hover:underline"
                      >
                        {s.template_key}
                      </Link>
                    ) : (
                      <span className="text-xs font-mono text-gray-400 dark:text-[#F4ECD8]/40">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-900 dark:text-[#F4ECD8] break-all">
                    {s.to_email}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-700 dark:text-[#F4ECD8]/70 max-w-[300px] truncate">
                    {s.subject || <span className="text-gray-400 dark:text-[#F4ECD8]/40">—</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-block px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider ${
                        s.status === 'sent'
                          ? 'bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-400'
                          : s.status === 'skipped'
                          ? 'bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-[#F4ECD8]/70'
                          : 'bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[10px] font-mono text-gray-500 dark:text-[#F4ECD8]/60 max-w-[240px] truncate">
                    {s.error ? (
                      <span className="text-red-700 dark:text-red-400" title={s.error}>
                        {s.error}
                      </span>
                    ) : s.provider_id ? (
                      <span title={s.provider_id}>{s.provider_id.slice(0, 16)}…</span>
                    ) : (
                      <span className="text-gray-400 dark:text-[#F4ECD8]/40">—</span>
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

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: 'danger';
}) {
  return (
    <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#D4A017]/20 p-4">
      <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 dark:text-[#F4ECD8]/50">
        {label}
      </p>
      <p
        className={`text-2xl font-black mt-1 ${
          accent === 'danger'
            ? 'text-red-700 dark:text-red-400'
            : 'text-[#D4A017]'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
