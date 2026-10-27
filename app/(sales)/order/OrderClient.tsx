'use client';

import { useState } from 'react';

/** "Email me my download links again" on the private order page. */
export function ResendDownloads({ token }: { token: string }) {
  const [state, setState] = useState<{ busy: boolean; msg: string | null; ok: boolean }>({ busy: false, msg: null, ok: true });
  async function go() {
    setState({ busy: true, msg: null, ok: true });
    const res = await fetch('/api/v2/order/resend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) }).catch(() => null);
    const d = res ? await res.json().catch(() => ({})) : {};
    setState({ busy: false, ok: Boolean(res?.ok), msg: d.message || d.error || 'Something went wrong. Please try again.' });
  }
  return (
    <div>
      <button onClick={go} disabled={state.busy} className="sp2-btn !py-3 !px-6">
        {state.busy ? 'Sending…' : 'Email me my download links again'}
      </button>
      {state.msg && <p className={`sp2-ui text-[16px] mt-3 ${state.ok ? 'text-[color:var(--sp2-sage)]' : 'text-[color:var(--sp2-oxblood)]'}`}>{state.msg}</p>}
    </div>
  );
}

/** "Find my order": emails the private order link to the address on the order. */
export function LookupForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<{ busy: boolean; msg: string | null; ok: boolean }>({ busy: false, msg: null, ok: true });
  async function go(e: React.FormEvent) {
    e.preventDefault();
    setState({ busy: true, msg: null, ok: true });
    const res = await fetch('/api/v2/order/lookup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }).catch(() => null);
    const d = res ? await res.json().catch(() => ({})) : {};
    setState({ busy: false, ok: Boolean(res?.ok), msg: d.message || d.error || 'Something went wrong. Please try again.' });
  }
  return (
    <form onSubmit={go} className="mt-8 max-w-md">
      <label className="sp2-ui block text-[16px] font-semibold mb-2" htmlFor="email">
        The email you used to order
      </label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="sp2-ui w-full rounded-[6px] border border-[color:var(--sp2-line)] bg-white px-4 py-3 text-[17px]"
        placeholder="you@example.com"
      />
      <button type="submit" disabled={state.busy} className="sp2-btn w-full mt-4 !py-3">
        {state.busy ? 'Sending…' : 'Email me my order link'}
      </button>
      {state.msg && <p className={`sp2-ui text-[16px] mt-3 ${state.ok ? 'text-[color:var(--sp2-sage)]' : 'text-[color:var(--sp2-oxblood)]'}`}>{state.msg}</p>}
    </form>
  );
}
