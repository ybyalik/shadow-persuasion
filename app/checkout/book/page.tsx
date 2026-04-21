'use client';

/* ════════════════════════════════════════════════════════════
   /checkout/book — $7 book checkout with $17 order bump

   Flow:
   1. Collect email + name
   2. Order bump checkbox: The Pre-Conversation Briefing ($17)
   3. POST /api/checkout/book → PaymentIntent client_secret
   4. Stripe Elements confirms payment
   5. On success → /lp/upsell-playbooks?pi=<id>
   ════════════════════════════════════════════════════════════ */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe, Stripe as StripeJS } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Special_Elite } from 'next/font/google';
import { Lock, Shield, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { captureUtms, getUtms } from '@/lib/utm';
import { ProductCover } from '@/components/ProductCover';

const specialElite = Special_Elite({ subsets: ['latin'], weight: '400' });

const STRIPE_PK =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_STRIPE_PK ||
  '';

const stripePromise: Promise<StripeJS | null> | null = STRIPE_PK ? loadStripe(STRIPE_PK) : null;

function PayForm({
  paymentIntentId,
  email,
  includeBump,
  total,
}: {
  paymentIntentId: string;
  email: string;
  includeBump: boolean;
  total: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: submitErr } = await elements.submit();
    if (submitErr) {
      setError(submitErr.message || 'Payment failed');
      setProcessing(false);
      return;
    }

    const { error: confirmErr, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/lp/upsell-playbooks?pi=${paymentIntentId}`,
        receipt_email: email,
      },
    });

    if (confirmErr) {
      setError(confirmErr.message || 'Payment failed');
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      router.push(`/lp/upsell-playbooks?pi=${paymentIntent.id}`);
    } else {
      setError('Payment not completed. Please try again.');
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement options={{ layout: 'tabs' }} />

      {error && (
        <div className="bg-[#8B0000]/10 border border-[#8B0000] text-[#8B0000] p-3 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-black hover:bg-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed text-[#F4ECD8] font-mono uppercase font-bold text-lg md:text-xl px-6 py-5 md:py-6 tracking-wider transition-all shadow-[6px_6px_0_0_#D4A017] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_#D4A017]"
      >
        {processing ? 'Processing…' : `Pay $${(total / 100).toFixed(2)} Now`}
        {!processing && <ArrowRight className="inline-block ml-3 h-5 w-5" />}
      </button>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-[#5C3A1E]">
        <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Secure · SSL Encrypted</span>
        <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> 30-Day Guarantee</span>
        <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Instant Delivery</span>
      </div>
    </form>
  );
}

export default function BookCheckoutPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [includeBump, setIncludeBump] = useState(true); // default-checked bump
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initErr, setInitErr] = useState<string | null>(null);

  const bookCents = 700;
  const bumpCents = 1700;
  const total = bookCents + (includeBump ? bumpCents : 0);

  // Capture ?utm_* params on first mount. Runs once; sessionStorage
  // persists across the rest of the visit.
  useEffect(() => {
    captureUtms();
  }, []);

  // ── Lead capture (cart abandonment recovery) ──
  // Debounced POST to /api/checkout/lead whenever the email becomes a valid
  // address. Also re-fires when bump toggles so the lead row reflects the
  // intended order. Idempotent on email+funnel.
  //
  // Attaches any UTMs captured from the URL so when the user eventually
  // converts, the webhook can read the lead's utm_content to deterministically
  // attribute the sale back to the specific recovery email that closed it
  // (utm_content = "step_1" | "step_2" | "step_3"). Without UTMs we fall
  // back to the 72h time-based heuristic.
  useEffect(() => {
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    const t = setTimeout(() => {
      const utms = getUtms();
      fetch('/api/checkout/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          firstName: name.trim() || undefined,
          includeBump,
          funnel: 'book_checkout',
          ...utms,
        }),
      }).catch(() => {
        // Silent. Don't block checkout if capture fails.
      });
    }, 800); // 800ms debounce — lets the user finish typing
    return () => clearTimeout(t);
  }, [email, name, includeBump]);

  async function initCheckout(e: React.FormEvent) {
    e.preventDefault();
    setInitErr(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setInitErr('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/checkout/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim(), includeBump }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout');
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
    } catch (err) {
      setInitErr(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  // When the bump toggles after checkout has been initialized, restart the PI
  // (Stripe doesn't let us mutate PaymentIntent amount server-safely in all cases.)
  useEffect(() => {
    if (clientSecret) {
      setClientSecret(null);
      setPaymentIntentId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeBump]);

  const stripeElementsOptions = useMemo(
    () =>
      clientSecret
        ? {
            clientSecret,
            appearance: {
              theme: 'stripe' as const,
              variables: {
                colorPrimary: '#D4A017',
                colorBackground: '#ffffff',
                colorText: '#1A1A1A',
                fontFamily: 'Georgia, serif',
                borderRadius: '0px',
              },
            },
          }
        : undefined,
    [clientSecret]
  );

  return (
    <main className={`${specialElite.className} bg-[#F4ECD8] text-[#1A1A1A] min-h-screen`}>
      {/* ═════════ MINIMAL HEADER: logo + secure badge ═════════ */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="w-28 md:w-36" /> {/* spacer for centering */}
          <img src="/logo.png" alt="Shadow Persuasion" className="h-10 md:h-12" />
          <div className="flex items-center gap-1 text-xs text-[#6B5B3E] w-28 md:w-36 justify-end">
            <Lock className="h-3 w-3" /> Secure Checkout
          </div>
        </div>
      </div>

      {/* ═════════ STEPS INDICATOR ═════════ */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 mb-8 md:mb-10">
        <div className="flex items-center justify-center gap-3 text-xs font-mono flex-wrap">
          <span className="flex items-center gap-1.5 text-[#D4A017]">
            <span className="w-5 h-5 rounded-full bg-[#D4A017] text-[#0A0A0A] flex items-center justify-center font-bold">1</span>
            Review Order
          </span>
          <span className="w-8 h-px bg-[#D4A017]" />
          <span className="flex items-center gap-1.5 text-[#D4A017] font-bold">
            <span className="w-5 h-5 rounded-full bg-[#D4A017] text-[#0A0A0A] flex items-center justify-center font-bold">2</span>
            Payment
          </span>
          <span className="w-8 h-px bg-gray-400" />
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="w-5 h-5 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold">3</span>
            Start Reading
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-12 grid md:grid-cols-2 gap-8 md:gap-12">
        {/* LEFT — order summary */}
        <section>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#5C3A1E] mb-3">
            // YOUR ORDER //
          </p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-8">
            One Step Left.
          </h1>

          {/* Book line */}
          <div className="bg-white border-2 border-black p-5 mb-4 shadow-[6px_6px_0_0_#D4A017]">
            <div className="flex items-start gap-4">
              <div className="w-16 h-20 shrink-0 bg-gradient-to-br from-[#1A1A1A] via-[#2A1F0E] to-[#0A0A0A] border-2 border-[#D4A017] flex items-center justify-center">
                <span className="text-[#D4A017] text-[9px] font-mono uppercase tracking-widest text-center leading-tight px-1">
                  Shadow<br/>Persuasion
                </span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#1A1A1A]">
                  Shadow Persuasion <span className="text-xs text-[#5C3A1E]">(eBook)</span>
                </p>
                <p className="text-xs text-[#5C3A1E] mt-1">
                  47 tactics. The full system. Plus 4 bonuses I normally sell separately.
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm line-through text-[#5C3A1E]/60">$47</span>
                <span className="block font-black text-xl">$7</span>
              </div>
            </div>
          </div>

          {/* ORDER BUMP — the yellow checkbox */}
          <label
            className={`block cursor-pointer border-4 p-5 transition-all ${
              includeBump
                ? 'border-[#D4A017] bg-[#FFF7DC] shadow-[6px_6px_0_0_#1A1A1A]'
                : 'border-[#D4A017]/60 bg-[#FFFBEE] shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={includeBump}
                onChange={(e) => setIncludeBump(e.target.checked)}
                className="mt-1 h-5 w-5 accent-[#D4A017] cursor-pointer"
              />
              {/* Product cover thumbnail — PNG upload replaces this
                  once set at /app/admin/files. No bg/border on the
                  box itself; fallback handles its own placeholder
                  styling. */}
              <div className="shrink-0 w-20 md:w-24 h-24 md:h-32 hidden sm:block">
                <ProductCover
                  slug="briefing"
                  alt="Pre-Conversation Briefing cover"
                  fit="contain"
                  fallback={
                    <div className="w-full h-full flex items-center justify-center bg-[#F4ECD8] border border-[#5C3A1E]/30">
                      <span className="font-mono text-[8px] uppercase tracking-wider text-[#5C3A1E]/60 text-center px-1">
                        Pre-Convo<br/>Briefing
                      </span>
                    </div>
                  }
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#D4A017] text-black px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider font-bold">
                    ⚡ ADD BEFORE YOU PAY
                  </span>
                  <span className="text-xs text-[#5C3A1E] font-bold">
                    I&apos;ve got one coming up.
                  </span>
                </div>
                <p className="font-bold text-base text-[#1A1A1A] mb-1">
                  Add: The Pre-Conversation Briefing
                </p>
                <p className="text-xs md:text-sm text-[#3B2E1A] leading-relaxed mb-2">
                  The 10-minute worksheet I fill out before every high-stakes conversation. You answer seven questions the night before. Morning of, you&apos;ve got an opening line, two backup tactics, and zero shakes.
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[#5C3A1E] line-through">retail $27</span>
                  <span className="bg-[#D4A017] text-black px-2 py-0.5 font-bold tracking-wider">
                    $17 WITH THE BOOK
                  </span>
                </div>
              </div>
            </div>
          </label>

          {/* Total */}
          <div className="mt-6 bg-white border-2 border-black p-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-[#5C3A1E]">Shadow Persuasion (eBook)</span>
              <span className="font-mono font-bold">$7.00</span>
            </div>
            {includeBump && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#5C3A1E]">Pre-Conversation Briefing</span>
                <span className="font-mono font-bold">$17.00</span>
              </div>
            )}
            <div className="border-t-2 border-black mt-3 pt-3 flex justify-between items-baseline">
              <span className="font-bold uppercase tracking-wider text-[#1A1A1A]">Total</span>
              <span className="font-black text-3xl text-[#1A1A1A]">
                ${(total / 100).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-2 text-xs text-[#5C3A1E]">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-[#D4A017] shrink-0 mt-0.5" />
              <span>Instant download delivered to your inbox</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-[#D4A017] shrink-0 mt-0.5" />
              <span>30-day money-back guarantee. Keep the files either way.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-[#D4A017] shrink-0 mt-0.5" />
              <span>One-time payment. No subscription. No auto-bill.</span>
            </div>
          </div>
        </section>

        {/* RIGHT — payment form */}
        <section>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#5C3A1E] mb-3">
            // PAYMENT //
          </p>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mb-6">
            Secure Checkout
          </h2>

          <div className="bg-white border-2 border-[#5C3A1E]/40 p-5 md:p-6 shadow-[6px_6px_0_0_rgba(0,0,0,0.08)]">
            {!clientSecret ? (
              <form onSubmit={initCheckout} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3A1E] mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border-2 border-[#5C3A1E]/30 px-3 py-3 font-mono text-sm focus:outline-none focus:border-[#D4A017]"
                  />
                  <p className="text-xs text-[#5C3A1E] mt-1">
                    I&apos;ll send your files here. Use the one you actually check.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C3A1E] mb-1.5">
                    First Name (optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your first name"
                    className="w-full border-2 border-[#5C3A1E]/30 px-3 py-3 font-mono text-sm focus:outline-none focus:border-[#D4A017]"
                  />
                </div>

                {initErr && (
                  <div className="bg-[#8B0000]/10 border border-[#8B0000] text-[#8B0000] p-3 text-sm">
                    {initErr}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black hover:bg-[#1A1A1A] disabled:opacity-50 text-[#F4ECD8] font-mono uppercase font-bold text-base md:text-lg px-6 py-4 tracking-wider transition-all shadow-[4px_4px_0_0_#D4A017] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#D4A017]"
                >
                  {loading ? 'Loading…' : 'Continue To Payment →'}
                </button>
              </form>
            ) : stripePromise && stripeElementsOptions ? (
              <>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#5C3A1E]/20">
                  <span className="text-sm text-[#5C3A1E]">{email}</span>
                  <button
                    type="button"
                    onClick={() => setClientSecret(null)}
                    className="text-xs text-[#D4A017] hover:underline"
                  >
                    change
                  </button>
                </div>
                <Elements stripe={stripePromise} options={stripeElementsOptions}>
                  <PayForm
                    paymentIntentId={paymentIntentId!}
                    email={email}
                    includeBump={includeBump}
                    total={total}
                  />
                </Elements>
              </>
            ) : (
              <p className="text-sm text-[#8B0000]">
                Stripe is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
              </p>
            )}
          </div>

          <p className="mt-5 text-xs text-[#5C3A1E] text-center leading-relaxed">
            By completing your order you agree to our{' '}
            <a href="/terms" className="underline hover:text-[#D4A017]">Terms</a>
            {' '}and{' '}
            <a href="/privacy" className="underline hover:text-[#D4A017]">Privacy Policy</a>.
            <br/>
            30-day money-back guarantee. No subscription. No hidden fees.
          </p>
        </section>
      </div>
    </main>
  );
}
