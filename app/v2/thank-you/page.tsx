'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { isSp2Slug, sp2TotalCents } from '@/lib/sp2/config';
import { trackPixel } from '@/lib/metaPixel';

type Links = { name: string; url: string }[];

function ThankYou() {
  const params = useSearchParams();
  const pi = params.get('payment_intent') || '';
  const upsellPi = params.get('upsell_pi') || '';
  const [state, setState] = useState<'loading' | 'ready' | 'error'>(pi ? 'loading' : 'error');
  const [email, setEmail] = useState('');
  const [links, setLinks] = useState<Links>([]);

  useEffect(() => {
    if (!pi) return;
    let cancelled = false;
    const fulfill = async (id: string) => {
      // Payment confirmation can lag a few seconds behind the redirect, so retry briefly.
      for (let attempt = 0; attempt < 5 && !cancelled; attempt++) {
        const res = await fetch('/api/v2/fulfill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: id }),
        }).catch(() => null);
        if (res?.ok) return res.json();
        await new Promise((r) => setTimeout(r, 2000));
      }
      return null;
    };
    (async () => {
      const [main, extra] = await Promise.all([fulfill(pi), upsellPi ? fulfill(upsellPi) : Promise.resolve(null)]);
      if (cancelled) return;
      if (!main) {
        setState('error');
        return;
      }
      setEmail(main.email);
      setLinks([...(main.links || []), ...(extra?.links || [])]);
      setState('ready');
      // Meta pixel Purchase (dormant unless NEXT_PUBLIC_META_PIXEL_ID is set). Value is the products bought,
      // not shipping. Sent once per payment, even if this page is reloaded.
      try {
        const key = `sp_px_purchase_${pi}`;
        if (!sessionStorage.getItem(key)) {
          const items = [...(main.items || []), ...(extra?.items || [])].filter((x: unknown): x is Parameters<typeof sp2TotalCents>[0][number] => typeof x === 'string' && isSp2Slug(x));
          trackPixel('Purchase', { value: sp2TotalCents(items) / 100, currency: 'USD', content_ids: items, num_items: items.length }, pi);
          sessionStorage.setItem(key, '1');
        }
      } catch {
        // Tracking must never break the page.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pi, upsellPi]);

  return (
    <main className="pb-16">
      <section className="bg-[color:var(--sp2-paper)]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-6 pb-14 sm:pb-20">
          <span className="sp2-type text-[16px] tracking-[0.12em] text-[color:var(--sp2-accent)]">SHADOW PERSUASION</span>
          <div className="grid md:grid-cols-[1.1fr_1fr] gap-10 items-center mt-10">
            <div>
              <p className="sp2-kicker">Thank you. You just took the first step.</p>
              <h1 className="sp2-h1">Your book is on its way to the printer.</h1>
              <p className="sp2-lead mt-5 text-[color:var(--sp2-muted)]">
                We&apos;ll email you a tracking link as soon as it ships. You don&apos;t have to wait to start: your digital copy and bonuses are right below.
              </p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/v2/lino/calm.jpg" alt="" aria-hidden className="w-full" />
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-8 relative">
        <div className="rounded-xl bg-white border border-[color:var(--sp2-line)] p-6 sm:p-8 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.5)]">
          <p className="sp2-type text-[16px] tracking-[0.2em] text-[color:var(--sp2-accent)] mb-4">YOUR DOWNLOADS</p>
          {state === 'loading' && <p className="sp2-ui text-[color:var(--sp2-muted)]">Getting your downloads ready...</p>}
          {state === 'error' && (
            <p className="text-[18px] leading-relaxed text-[color:var(--sp2-muted)]">
              Your downloads are on their way to your inbox. If they haven&apos;t arrived in a few minutes, check your spam folder or
              reply to the receipt email and we&apos;ll sort it out.
            </p>
          )}
          {state === 'ready' && (
            <>
              <div className="space-y-2.5">
                {links.map((l) => (
                  <a
                    key={l.name}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sp2-ui flex items-center justify-between gap-3 rounded-lg border border-[color:var(--sp2-line)] bg-[color:var(--sp2-card)] px-5 py-4 font-semibold hover:border-[color:var(--sp2-ink)] transition-colors"
                  >
                    <span>{l.name}</span>
                    <span className="flex-shrink-0 text-[16px] font-bold text-[color:var(--sp2-accent)]">Download ↓</span>
                  </a>
                ))}
              </div>
              <p className="sp2-ui text-[17px] text-[color:var(--sp2-muted)] mt-4">
                We&apos;ve also emailed these links to <b className="text-[color:var(--sp2-ink)]">{email}</b>, so you can come back to
                them anytime.
              </p>
            </>
          )}
        </div>

        <div className="mt-10">
          <p className="sp2-kicker mb-3">Where to start</p>
          <h2 className="text-[32px] sm:text-[38px] leading-tight font-medium mb-6">Your first three steps</h2>
          <ol className="space-y-4">
            {[
              ['Tonight', 'Read the note at the start of the book and the Introduction. If something is happening right now, find it in the Situation Finder at the back.'],
              ['Tomorrow', 'Pick three ordinary days for the Quick Start in Chapter 31 and fill in your first check-in. Print The 21-Day Power Reset Journal, or keep it open on screen.'],
              ['This week', 'Look through the three bonuses. Keep The Tactic Spotter close, and fill in The Conversation Planner before your next hard conversation.'],
            ].map(([when, what], i) => (
              <li key={when} className="flex gap-5 rounded-lg border border-[color:var(--sp2-line)] bg-[color:var(--sp2-card)] p-5">
                <span className="w-11 h-11 rounded-full bg-[color:var(--sp2-night)] text-[color:var(--sp2-gold)] flex items-center justify-center text-[20px] font-semibold flex-shrink-0">
                  {i + 1}
                </span>
                <span>
                  <span className="sp2-type block text-[16px] tracking-[0.18em] text-[color:var(--sp2-accent)] uppercase">{when}</span>
                  <span className="block text-[19px] leading-snug mt-1">{what}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-6 rounded-lg bg-[color:var(--sp2-night)] text-[#e9e2d6] p-6 text-[18px] leading-relaxed">
            <p>
              <span className="text-[color:var(--sp2-gold)] font-semibold">Your 60 days of the app start today. </span>
              Decode messages, rehearse hard conversations and follow the reset on your phone.
            </p>
            <Link
              href={`/login?tab=signup${email ? `&email=${encodeURIComponent(email)}` : ''}`}
              className="sp2-ui mt-4 inline-flex items-center justify-center rounded-lg bg-[color:var(--sp2-gold)] px-5 py-3 text-[17px] font-bold text-[#0b0a08]"
            >
              Open the app and create your login
            </Link>
          </div>
          <p className="sp2-ui text-[17px] text-[color:var(--sp2-muted)] mt-8">
            Questions about your order? Reply to any of our emails. And remember, you&apos;re covered by the 30-day money-back
            guarantee.
          </p>
        </div>

        <p className="sp2-ui mt-10 text-[16px]">
          <Link href="/v2" className="underline">
            Back to the book page
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function V2ThankYouPage() {
  return (
    <Suspense fallback={null}>
      <ThankYou />
    </Suspense>
  );
}
