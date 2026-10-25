'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { captureUtms, getUtms } from '@/lib/utm';

export function SubscribeForm({ buttonLabel = 'Send me the free chapter', compact = false }: { buttonLabel?: string; compact?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    captureUtms();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/v2/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), firstName: firstName.trim() || undefined, ...getUtms() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      router.push('/v2/chapter-1?welcome=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="sp2-ui w-full">
      <div className={compact ? 'flex flex-col gap-3' : 'flex flex-col sm:flex-row gap-3'}>
        {!compact && (
          <input
            className="sp2-input sm:max-w-[180px]"
            placeholder="First name"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        )}
        <input
          className="sp2-input"
          type="email"
          placeholder="Your email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="sp2-btn whitespace-nowrap" disabled={busy}>
          {busy ? 'Sending...' : buttonLabel}
        </button>
      </div>
      {error && <p className="mt-2 text-[16px] text-[color:var(--sp2-oxblood)]">{error}</p>}
      <p className="mt-3 text-[16px] text-[color:var(--sp2-muted)]">Free. You can unsubscribe anytime.</p>
    </form>
  );
}
