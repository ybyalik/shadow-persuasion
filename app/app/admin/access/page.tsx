'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

type Row = { email: string; source: string; access_until: string; is_test: boolean; user_id: string | null; cost30d: number; costAll: number; calls30d: number };

const money = (n: number) => `$${n.toFixed(2)}`;

export default function AppAccessPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [totals, setTotals] = useState<{ cost30d: number; byFeature30d: Record<string, number> } | null>(null);
  const [includeTest, setIncludeTest] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newDays, setNewDays] = useState('60');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/admin/app-access${includeTest ? '?includeTest=1' : ''}`);
      const d = await res.json();
      setRows(d.rows ?? []);
      setTotals(d.totals ?? null);
    } finally {
      setLoading(false);
    }
  }, [includeTest]);

  useEffect(() => {
    load();
  }, [load]);

  async function extend(email: string) {
    setMsg(null);
    const res = await apiFetch('/api/admin/app-access', { method: 'POST', body: JSON.stringify({ email, days: 30 }), headers: { 'Content-Type': 'application/json' } });
    setMsg(res.ok ? `Added 30 days for ${email}.` : 'Could not extend access.');
    load();
  }

  const now = Date.now();
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">App access</h1>
          <p className="text-sm text-gray-500 mt-1">Book buyers get 60 days of the app. AI cost is what OpenRouter reported for each person&apos;s use.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={includeTest} onChange={(e) => setIncludeTest(e.target.checked)} /> Show test rows
          </label>
          <button onClick={load} className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      <form
        className="flex flex-wrap items-end gap-2 mb-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const email = newEmail.trim().toLowerCase();
          if (!email) return;
          setMsg(null);
          const res = await apiFetch('/api/admin/app-access', { method: 'POST', body: JSON.stringify({ email, days: Number(newDays) }), headers: { 'Content-Type': 'application/json' } });
          setMsg(res.ok ? `Gave ${email} ${newDays} days of the app. They sign in with that email.` : 'Could not give access.');
          if (res.ok) setNewEmail('');
          load();
        }}
      >
        <label className="text-sm">
          Give app access to any email
          <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="name@example.com" className="block mt-1 w-72 border rounded px-2 py-1.5 bg-transparent" />
        </label>
        <label className="text-sm">
          Days
          <select value={newDays} onChange={(e) => setNewDays(e.target.value)} className="block mt-1 border rounded px-2 py-1.5 bg-transparent">
            {['30', '60', '90', '365'].map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <button type="submit" className="text-sm border rounded-lg px-3 py-2">Give access</button>
      </form>

      {totals && (
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border p-4">
            <p className="text-xs uppercase text-gray-500">People with access now</p>
            <p className="text-2xl font-bold">{rows.filter((r) => new Date(r.access_until).getTime() > now).length}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs uppercase text-gray-500">AI cost, last 30 days (everyone)</p>
            <p className="text-2xl font-bold">{money(totals.cost30d)}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs uppercase text-gray-500">Biggest features, 30 days</p>
            <p className="text-sm mt-1">
              {Object.entries(totals.byFeature30d).slice(0, 4).map(([f, c]) => `${f} ${money(c)}`).join(' · ') || 'No usage yet'}
            </p>
          </div>
        </div>
      )}

      {msg && <p className="mb-4 text-sm">{msg}</p>}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Access until</th>
              <th className="p-3">Source</th>
              <th className="p-3">Signed up</th>
              <th className="p-3">AI 30 days</th>
              <th className="p-3">AI all time</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const live = new Date(r.access_until).getTime() > now;
              return (
                <tr key={r.email} className="border-t">
                  <td className="p-3">
                    {r.email} {r.is_test && <span className="ml-1 text-xs text-gray-400">(test)</span>}
                  </td>
                  <td className={`p-3 ${live ? '' : 'text-gray-400'}`}>{new Date(r.access_until).toLocaleDateString()}{live ? '' : ' (ended)'}</td>
                  <td className="p-3">{r.source}</td>
                  <td className="p-3">{r.user_id ? 'Yes' : 'Not yet'}</td>
                  <td className="p-3">
                    {money(r.cost30d)} <span className="text-gray-400">({r.calls30d} calls)</span>
                  </td>
                  <td className="p-3">{money(r.costAll)}</td>
                  <td className="p-3">
                    <button onClick={() => extend(r.email)} className="text-xs border rounded px-2 py-1">
                      +30 days
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td className="p-6 text-gray-500" colSpan={7}>
                  No book buyers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
