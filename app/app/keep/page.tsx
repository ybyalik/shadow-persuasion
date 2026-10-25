'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { Check } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button, Card, Notice, PageHeader } from '@/components/app/ui';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) : null;

const KEEPS = [
  'The Decoder for messages and screenshots',
  'Rehearse hard conversations before you have them',
  'The 21-day reset, practice scenes and tactic training',
  'My People, Goals, and Talk It Through',
  'Everything you have saved so far',
];

function Keep() {
  const { user } = useAuth();
  const done = useSearchParams().get('done') === '1';
  const [access, setAccess] = useState<{ ok: boolean; kind: string; daysLeft: number | null } | null>(null);
  const [checkout, setCheckout] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    user
      ?.getIdToken()
      .then((t) => fetch('/api/app/access', { headers: { Authorization: `Bearer ${t}` } }))
      .then((r) => (r.ok ? r.json() : null))
      .then(setAccess)
      .catch(() => {});
  }, [user, done]);

  const fetchClientSecret = useCallback(async () => {
    const token = await user!.getIdToken();
    const res = await fetch('/api/app/keep-checkout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    const d = await res.json().catch(() => ({}));
    if (!res.ok || !d.clientSecret) {
      setError('Checkout could not start. Please try again in a moment.');
      setCheckout(false);
      throw new Error('no client secret');
    }
    return d.clientSecret as string;
  }, [user]);

  if (done) {
    return (
      <div className="max-w-2xl">
        <PageHeader kicker="All set" title="Thank you. The app is yours to keep." subtitle="Your subscription is active. You can cancel anytime from Settings." />
        <Button href="/app">Back to Today</Button>
      </div>
    );
  }

  const subscribed = access?.ok && access.kind !== 'book';
  const lapsed = access && !access.ok;

  return (
    <div className="max-w-3xl">
      <PageHeader
        kicker="Keep the app"
        title={lapsed ? 'Your included 60 days have ended.' : 'Keep the app after your 60 days.'}
        subtitle={
          lapsed
            ? 'Your history is saved. Pick up right where you left off for $9.99 a month, cancel anytime.'
            : access?.daysLeft != null
              ? `You have ${access.daysLeft} ${access.daysLeft === 1 ? 'day' : 'days'} of included access left. Nothing is charged automatically: if you want to keep the app afterwards, you can switch it on here.`
              : 'Keep everything for $9.99 a month, cancel anytime.'
        }
      />
      {subscribed ? (
        <Notice>You already have the app. Manage or cancel your subscription in Settings.</Notice>
      ) : (
        <div className="grid md:grid-cols-[1fr_1.1fr] gap-6 items-start">
          <Card>
            <p className="app-serif text-[44px] font-semibold leading-none">
              $9.99<span className="text-[16px] font-normal text-[color:var(--app-muted)]"> / month</span>
            </p>
            <p className="mt-2 text-[14px] text-[color:var(--app-muted)]">Cancel anytime from Settings. The book and your downloads are yours either way.</p>
            <ul className="mt-5 space-y-2.5">
              {KEEPS.map((k) => (
                <li key={k} className="flex gap-2.5 text-[15px]">
                  <Check className="h-5 w-5 flex-shrink-0 text-[color:var(--app-sage)]" /> {k}
                </li>
              ))}
            </ul>
            {!checkout && (
              <div className="mt-6">
                <Button variant="gold" onClick={() => setCheckout(true)} className="w-full">
                  Keep the app for $9.99 a month
                </Button>
              </div>
            )}
            {error && (
              <div className="mt-4">
                <Notice tone="error">{error}</Notice>
              </div>
            )}
          </Card>
          {checkout && stripePromise && (
            <div className="rounded-xl overflow-hidden border border-[color:var(--app-line)] bg-white">
              <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function KeepPage() {
  return (
    <Suspense fallback={null}>
      <Keep />
    </Suspense>
  );
}
