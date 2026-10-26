'use client';

import Link from 'next/link';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  loadStripe,
  type Appearance,
  type StripeElementsOptions,
  type Stripe as StripeJS,
  type StripeAddressElementChangeEvent,
  type StripeExpressCheckoutElementClickEvent,
  type StripeExpressCheckoutElementConfirmEvent,
  type StripeExpressCheckoutElementShippingAddressChangeEvent,
  type StripeExpressCheckoutElementShippingRateChangeEvent,
  type ShippingRate,
} from '@stripe/stripe-js';
import {
  AddressElement,
  Elements,
  ExpressCheckoutElement,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { Check, ChevronDown, Lock } from 'lucide-react';
import { getAttribution } from '@/lib/variant';
import { trackPixel } from '@/lib/metaPixel';

const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise: Promise<StripeJS | null> | null = STRIPE_PK ? loadStripe(STRIPE_PK) : null;

const FORMATS = {
  paperback: { cents: 6700, label: 'Paperback', note: 'The one you carry', img: '/v2/img/paperback.jpg' },
  hardcover: { cents: 9700, label: 'Hardcover', note: 'Only $30 more. Built to last.', img: '/v2/img/hardcover.jpg' },
} as const;
type Format = keyof typeof FORMATS;
const BUMP_CENTS = 1700;
const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_ERROR = 'Something went wrong. Please try again, or use a different payment method.';

type ShipOption = { level: string; label: string; estimate: string; cents: number };
type Address = { name: string; street1: string; street2: string; city: string; state_code: string; postcode: string; phone_number: string };

// Shown before any address is known (standard mail is always free).
const DEFAULT_OPTIONS: ShipOption[] = [{ level: 'MAIL', label: 'Standard mail', estimate: '12 to 15 business days', cents: 0 }];
const SPEED_NAMES: Record<string, string> = { MAIL: 'Standard', PRIORITY_MAIL: 'Priority', EXPRESS: 'Express' };
const speedName = (o: ShipOption) => SPEED_NAMES[o.level] || o.label;

const STATE_CODES: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA', colorado: 'CO', connecticut: 'CT', delaware: 'DE',
  'district of columbia': 'DC', florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA',
  kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD', massachusetts: 'MA', michigan: 'MI', minnesota: 'MN',
  mississippi: 'MS', missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK', oregon: 'OR',
  pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT',
  vermont: 'VT', virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY', 'puerto rico': 'PR',
};
// Wallets sometimes send "New York" instead of "NY"; our address check wants the code.
const stateCode = (s: string) => {
  const t = (s || '').trim();
  return t.length === 2 ? t.toUpperCase() : STATE_CODES[t.toLowerCase()] || t.toUpperCase();
};

const toRates = (opts: ShipOption[]): ShippingRate[] =>
  opts.map((o) => ({ id: o.level, amount: o.cents, displayName: `${speedName(o)} shipping`, deliveryEstimate: o.estimate }));

const appearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#1c1b18',
    colorText: '#1c1b18',
    colorBackground: '#ffffff',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSizeBase: '17px',
    borderRadius: '6px',
    spacingUnit: '5px',
  },
  rules: { '.Label': { fontSize: '16px', fontWeight: '600' }, '.TermsText': { fontSize: '16px' } },
};

async function postJson(url: string, body: unknown): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok, data };
}

async function fetchQuote(address: Address, format: Format): Promise<{ options?: ShipOption[]; error?: string }> {
  try {
    const { ok, data } = await postJson('/api/v2/shipping-quote', { address, format });
    if (!ok || !Array.isArray(data.options)) {
      return { error: typeof data.error === 'string' ? data.error : "We couldn't calculate shipping. Please check your address." };
    }
    return { options: data.options as ShipOption[] };
  } catch {
    return { error: "We couldn't calculate shipping. Please check your connection and try again." };
  }
}

export default function V2CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutShell />
    </Suspense>
  );
}

function CheckoutShell() {
  const params = useSearchParams();
  const initialFormat: Format = params.get('format') === 'hardcover' ? 'hardcover' : 'paperback';
  // Meta pixel (dormant unless NEXT_PUBLIC_META_PIXEL_ID is set): once per visit to checkout.
  const checkoutTracked = useRef(false);
  useEffect(() => {
    if (checkoutTracked.current) return;
    checkoutTracked.current = true;
    trackPixel('InitiateCheckout', { value: FORMATS[initialFormat].cents / 100, currency: 'USD', content_name: `Shadow Persuasion ${FORMATS[initialFormat].label}` });
  }, [initialFormat]);
  // Elements is created once; later amount changes go through elements.update().
  const [options] = useState<StripeElementsOptions>(() => ({
    mode: 'payment',
    amount: FORMATS[initialFormat].cents,
    currency: 'usd',
    setupFutureUsage: 'off_session',
    captureMethod: 'automatic', // must match the PaymentIntent the server creates
    appearance,
    fonts: [{ cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap' }],
  }));

  return (
    <main className="sp2-ui min-h-screen bg-[color:var(--sp2-paper)] text-[17px]">
      <header className="sticky top-0 z-30 bg-[color:var(--sp2-black)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 min-h-[56px] flex items-center justify-between gap-3">
          <Link href="/" className="sp2-type text-[16px] tracking-[0.08em] sm:tracking-[0.2em] whitespace-nowrap text-[color:var(--sp2-gold)] py-3">
            SHADOW PERSUASION
          </Link>
          <span className="flex items-center gap-1.5 text-[16px] whitespace-nowrap text-white/80">
            <Lock className="h-4 w-4" aria-hidden /> Secure checkout
          </span>
        </div>
      </header>
      {stripePromise ? (
        <Elements stripe={stripePromise} options={options}>
          <Checkout initialFormat={initialFormat} />
        </Elements>
      ) : (
        <p className="max-w-xl mx-auto px-4 py-16 text-center">Checkout is temporarily unavailable. Please try again shortly.</p>
      )}
    </main>
  );
}

function Checkout({ initialFormat }: { initialFormat: Format }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [format, setFormat] = useState<Format>(initialFormat);
  const [includeBump, setIncludeBump] = useState(false);
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState<Address | null>(null); // set only when the address form is complete
  const [quote, setQuote] = useState<{ key: string; options: ShipOption[] } | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [level, setLevel] = useState('MAIL');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expressReady, setExpressReady] = useState<boolean | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const addressKey = address ? `${JSON.stringify(address)}|${format}` : '';
  const shipOptions = quote && quote.key === addressKey ? quote.options : null;
  const shippingCents = shipOptions?.find((o) => o.level === level)?.cents ?? 0;
  const bookCents = FORMATS[format].cents;
  const baseCents = bookCents + (includeBump ? BUMP_CENTS : 0);
  const total = baseCents + shippingCents;

  // Keep the wallet / card amount in step with the page.
  useEffect(() => {
    elements?.update({ amount: total });
  }, [elements, total]);

  // Quote shipping speeds once the address is complete (and again when it or the edition changes).
  useEffect(() => {
    if (!address) return;
    const key = `${JSON.stringify(address)}|${format}`;
    let cancelled = false;
    const t = setTimeout(async () => {
      setQuoting(true);
      setQuoteError(null);
      const r = await fetchQuote(address, format);
      if (cancelled) return;
      setQuoting(false);
      if (r.options) {
        setQuote({ key, options: r.options });
        setLevel((l) => (r.options!.some((o) => o.level === l) ? l : 'MAIL'));
      } else {
        setQuoteError(r.error || null);
      }
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [address, format]);

  const onAddressChange = useCallback((e: StripeAddressElementChangeEvent) => {
    if (!e.complete) {
      setAddress(null);
      return;
    }
    const v = e.value;
    const next: Address = {
      name: (v.name || '').trim(),
      street1: (v.address.line1 || '').trim(),
      street2: (v.address.line2 || '').trim(),
      city: (v.address.city || '').trim(),
      state_code: stateCode(v.address.state),
      postcode: (v.address.postal_code || '').trim(),
      phone_number: (v.phone || '').trim(),
    };
    setAddress((prev) => (prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, []);

  // Shared by the card button and the wallet sheet. Call only after elements.submit() succeeded.
  // The browser packs the payment details into a one-time token; our server re-checks the order,
  // creates the PaymentIntent with the checked shipping address and confirms it.
  const startAndConfirm = useCallback(
    async (body: { email: string; address: Address; shippingLevel: string; method: 'card' | 'express' }) => {
      if (!stripe || !elements) return { error: GENERIC_ERROR };
      const { error: tokenErr, confirmationToken } = await stripe.createConfirmationToken({ elements });
      if (tokenErr || !confirmationToken) {
        console.error('[v2/checkout] token failed:', tokenErr?.type, tokenErr?.code, tokenErr?.message);
        const friendly = tokenErr?.type === 'card_error' || tokenErr?.type === 'validation_error' ? tokenErr.message : null;
        return { error: friendly || GENERIC_ERROR };
      }
      // attribution: which sales page this visit started on, plus UTM tags (lib/variant.ts).
      const { ok, data } = await postJson('/api/v2/checkout', { ...body, format, includeBump, confirmationTokenId: confirmationToken.id, attribution: getAttribution() });
      if (!ok || typeof data.paymentIntentId !== 'string') {
        return { error: typeof data.error === 'string' ? data.error : 'Could not start checkout. Please try again.' };
      }
      let status = String(data.status || '');
      if (status === 'requires_action' && typeof data.clientSecret === 'string') {
        // 3D Secure check or a bank / wallet that needs one more step. Redirect-based ones come back to /upsell.
        const { error: actionErr, paymentIntent } = await stripe.handleNextAction({ clientSecret: data.clientSecret });
        if (actionErr) {
          console.error('[v2/checkout] next action failed:', actionErr.type, actionErr.code, actionErr.message);
          const friendly = actionErr.type === 'card_error' ? actionErr.message : null;
          return { error: friendly || 'Your bank did not approve the payment. Please try again, or use a different card.' };
        }
        status = paymentIntent?.status || '';
      }
      if (status === 'succeeded' || status === 'processing') {
        router.push(`/upsell?payment_intent=${data.paymentIntentId}`);
        return {};
      }
      return { error: 'Your payment was not completed. Please try again.' };
    },
    [stripe, elements, format, includeBump, router]
  );

  async function payByCard(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements || busy) return;
    setError(null);
    setBusy(true);
    try {
      // submit() must run first, before any other waiting, so the browser keeps the click.
      const { error: submitErr } = await elements.submit();
      if (submitErr) {
        setError(submitErr.message || 'Please check the highlighted fields.');
        return;
      }
      const addrEl = elements.getElement('address');
      const addrVal = addrEl ? await addrEl.getValue() : null;
      if (!addrVal?.complete) {
        setError('Please fill in your shipping address.');
        return;
      }
      const v = addrVal.value;
      const addr: Address = {
        name: v.name.trim(),
        street1: v.address.line1.trim(),
        street2: (v.address.line2 || '').trim(),
        city: v.address.city.trim(),
        state_code: stateCode(v.address.state),
        postcode: v.address.postal_code.trim(),
        phone_number: (v.phone || '').trim(),
      };
      if (!EMAIL_RE.test(email.trim())) {
        setError('Please enter a valid email address.');
        return;
      }
      const r = await startAndConfirm({ email: email.trim(), address: addr, shippingLevel: shipOptions ? level : 'MAIL', method: 'card' });
      if (r.error) setError(r.error);
    } catch (err) {
      console.error('[v2/checkout] card checkout failed:', err);
      setError(GENERIC_ERROR);
    } finally {
      setBusy(false);
    }
  }

  // ---- Express checkout (Apple Pay, Google Pay, Link) ----
  // The wallet sheet keeps its own shipping choice; this ref tracks it without touching the page.
  const walletBase = useRef(baseCents);
  const lineItems = () => [
    { name: `Shadow Persuasion: The Hidden Rules of Power (${FORMATS[format].label})`, amount: bookCents },
    ...(includeBump ? [{ name: '100 Ready-to-Use Replies', amount: BUMP_CENTS }] : []),
  ];

  const onExpressClick = (e: StripeExpressCheckoutElementClickEvent) => {
    walletBase.current = baseCents;
    // Put the speed chosen on the page first so the wallet opens on the same total.
    const opts = shipOptions ? [...shipOptions].sort((a, b) => (a.level === level ? -1 : b.level === level ? 1 : 0)) : DEFAULT_OPTIONS;
    elements?.update({ amount: baseCents + opts[0].cents });
    e.resolve({
      emailRequired: true,
      phoneNumberRequired: true,
      shippingAddressRequired: true,
      shippingRates: toRates(opts),
      lineItems: lineItems(),
    });
  };

  const onExpressAddress = async (e: StripeExpressCheckoutElementShippingAddressChangeEvent) => {
    // Before the buyer confirms, wallets share only city, state and ZIP; the street and name are placeholders for the quote.
    const r = await fetchQuote(
      {
        name: 'Customer',
        street1: '1 Main St',
        street2: '',
        city: e.address.city || 'City',
        state_code: stateCode(e.address.state),
        postcode: (e.address.postal_code || '').trim(),
        phone_number: '2125551234',
      },
      format
    );
    if (!r.options || (e.address.country && e.address.country.toUpperCase() !== 'US')) {
      e.reject();
      return;
    }
    elements?.update({ amount: walletBase.current + r.options[0].cents });
    e.resolve({ shippingRates: toRates(r.options), lineItems: lineItems() });
  };

  const onExpressRate = (e: StripeExpressCheckoutElementShippingRateChangeEvent) => {
    elements?.update({ amount: walletBase.current + e.shippingRate.amount });
    e.resolve({ lineItems: lineItems() });
  };

  const onExpressCancel = () => {
    elements?.update({ amount: total });
  };

  const onExpressConfirm = async (e: StripeExpressCheckoutElementConfirmEvent) => {
    if (!stripe || !elements) return;
    setError(null);
    try {
      const { error: submitErr } = await elements.submit();
      if (submitErr) {
        console.error('[v2/checkout] express submit failed:', submitErr.type, submitErr.code);
        e.paymentFailed({ reason: 'fail' });
        setError(GENERIC_ERROR);
        return;
      }
      const ship = e.shippingAddress;
      const buyerEmail = (e.billingDetails?.email || '').trim();
      const addr: Address = {
        name: (ship?.name || e.billingDetails?.name || '').trim(),
        street1: (ship?.address.line1 || '').trim(),
        street2: (ship?.address.line2 || '').trim(),
        city: (ship?.address.city || '').trim(),
        state_code: stateCode(ship?.address.state || ''),
        postcode: (ship?.address.postal_code || '').trim(),
        phone_number: (e.billingDetails?.phone || '').trim(),
      };
      const r = await startAndConfirm({ email: buyerEmail, address: addr, shippingLevel: e.shippingRate?.id || 'MAIL', method: 'express' });
      if (r.error) {
        const isAddress = /name|street|address|city|state|zip|phone/i.test(r.error);
        e.paymentFailed({ reason: isAddress ? 'invalid_shipping_address' : 'fail', message: r.error });
        setError(
          isAddress
            ? `We couldn't use the address from your wallet. ${r.error} You can also enter it below and pay by card.`
            : r.error
        );
      }
    } catch (err) {
      console.error('[v2/checkout] express checkout failed:', err);
      e.paymentFailed({ reason: 'fail' });
      setError(GENERIC_ERROR);
    }
  };

  const summary = (
    <OrderSummary format={format} includeBump={includeBump} bookCents={bookCents} shippingCents={shippingCents} total={total} />
  );

  return (
    <>
      {/* Phone: collapsible order bar at the very top */}
      <div className="lg:hidden border-b border-[color:var(--sp2-line)] bg-[color:var(--sp2-light)]">
        <button
          type="button"
          onClick={() => setSummaryOpen((o) => !o)}
          aria-expanded={summaryOpen}
          className="w-full max-w-6xl mx-auto px-4 min-h-[56px] flex items-center justify-between text-[17px] font-semibold"
        >
          <span>Your order · {money(total)}</span>
          <span className="flex items-center gap-1 text-[16px] font-normal text-[color:var(--sp2-muted)]">
            {summaryOpen ? 'Hide' : 'Show'}
            <ChevronDown className={`h-5 w-5 transition-transform ${summaryOpen ? 'rotate-180' : ''}`} aria-hidden />
          </span>
        </button>
        {summaryOpen && <div className="px-4 pb-5 max-w-xl mx-auto">{summary}</div>}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 grid lg:grid-cols-[minmax(0,1fr)_400px] gap-10 lg:gap-14 items-start">
        <form onSubmit={payByCard} className="max-w-[640px] w-full mx-auto lg:mx-0 space-y-9" noValidate>
          {/* 1. Heading */}
          <div>
            <h1 className="text-[40px] sm:text-[46px] leading-[1.08] text-[color:var(--sp2-ink)]">Get your copy</h1>
            <p className="mt-2 text-[17px] text-[color:var(--sp2-muted)]">Free US shipping · 30-day money-back guarantee</p>
          </div>

          {/* 2. Edition */}
          <fieldset>
            <legend className="sp2-label !mb-3 text-[18px]">Choose your edition</legend>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {(Object.keys(FORMATS) as Format[]).map((f) => {
                const on = format === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    aria-pressed={on}
                    className={`relative text-left rounded-[6px] overflow-hidden bg-white transition-colors ${
                      on ? 'border-[3px] border-[color:var(--sp2-ink)]' : 'border-2 border-[color:var(--sp2-line)] p-px'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={FORMATS[f].img} alt={`The ${FORMATS[f].label.toLowerCase()} edition`} className="w-full aspect-[3/2] object-cover" />
                    <span className="block p-3 sm:p-4">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-2">
                        <span className="font-semibold text-[18px]">{FORMATS[f].label}</span>
                        <span className="font-semibold text-[18px]">{money(FORMATS[f].cents)}</span>
                      </span>
                      <span className="block text-[16px] leading-snug text-[color:var(--sp2-muted)] mt-1">{FORMATS[f].note}</span>
                    </span>
                    {on && (
                      <span className="absolute top-2 right-2 h-8 w-8 rounded-full bg-[color:var(--sp2-ink)] text-white flex items-center justify-center">
                        <Check className="h-5 w-5" aria-hidden />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* 3. Express checkout */}
          <div>
            {expressReady !== false && <p className="sp2-label !mb-3 text-[18px]">Express checkout</p>}
            <ExpressCheckoutElement
              options={{
                emailRequired: true,
                phoneNumberRequired: true,
                shippingAddressRequired: true,
                allowedShippingCountries: ['US'],
                shippingRates: toRates(shipOptions || DEFAULT_OPTIONS),
                buttonHeight: 52,
                buttonType: { applePay: 'buy', googlePay: 'buy' },
              }}
              onReady={(e) => setExpressReady(Boolean(e.availablePaymentMethods))}
              onClick={onExpressClick}
              onShippingAddressChange={onExpressAddress}
              onShippingRateChange={onExpressRate}
              onCancel={onExpressCancel}
              onConfirm={onExpressConfirm}
            />
            {expressReady !== false && (
              <div className="flex items-center gap-4 mt-7 text-[16px] text-[color:var(--sp2-muted)]">
                <span className="h-px flex-1 bg-[color:var(--sp2-line)]" />
                or pay with card
                <span className="h-px flex-1 bg-[color:var(--sp2-line)]" />
              </div>
            )}
          </div>

          {/* 4. Contact and address */}
          <div className="space-y-5">
            <h2 className="text-[30px] leading-tight">Where should we send it?</h2>
            <div>
              <LinkAuthenticationElement onChange={(e) => setEmail(e.value.email)} />
              <p className="mt-2 text-[16px] text-[color:var(--sp2-muted)]">For your receipt and tracking.</p>
            </div>
            <div>
              <AddressElement
                options={{
                  mode: 'shipping',
                  allowedCountries: ['US'],
                  fields: { phone: 'always' },
                  validation: { phone: { required: 'always' } },
                  autocomplete: { mode: 'automatic' },
                }}
                onChange={onAddressChange}
              />
              <p className="mt-2 text-[16px] text-[color:var(--sp2-muted)]">Phone: only for delivery problems.</p>
            </div>
          </div>

          {/* 5. Shipping speed */}
          {(address || quoting) && (
            <fieldset>
              <legend className="sp2-label !mb-3 text-[18px]">Shipping speed</legend>
              {shipOptions ? (
                <div className="space-y-3">
                  {shipOptions.map((o) => {
                    const on = level === o.level;
                    return (
                      <label
                        key={o.level}
                        className={`flex items-center gap-4 rounded-[6px] bg-white px-4 py-3 min-h-[64px] cursor-pointer ${
                          on ? 'border-2 border-[color:var(--sp2-ink)]' : 'border border-[color:var(--sp2-line)] m-px'
                        }`}
                      >
                        <input
                          type="radio"
                          name="ship"
                          value={o.level}
                          checked={on}
                          onChange={() => setLevel(o.level)}
                          className="h-6 w-6 flex-shrink-0 accent-[#1c1b18]"
                        />
                        <span className="flex-1">
                          <span className="block font-semibold text-[17px]">
                            {speedName(o)}: {o.cents === 0 ? 'Free' : `+${money(o.cents)}`}
                          </span>
                          <span className="block text-[16px] text-[color:var(--sp2-muted)]">{o.estimate}, including printing</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : quoteError ? (
                <p className="text-[16px] text-[color:var(--sp2-oxblood)]">{quoteError}</p>
              ) : (
                <p className="text-[16px] text-[color:var(--sp2-muted)]">Checking shipping speeds for your address...</p>
              )}
            </fieldset>
          )}

          {/* 6. Order bump */}
          <label
            className={`flex gap-4 items-start rounded-[6px] border-2 border-dashed p-4 sm:p-5 cursor-pointer transition-colors ${
              includeBump ? 'border-[color:var(--sp2-sage)] bg-[#eef0e6]' : 'border-[color:var(--sp2-accent)] bg-[#fbf3e4]'
            }`}
          >
            <input
              type="checkbox"
              className="mt-1 h-7 w-7 flex-shrink-0 accent-[#4f5b3a]"
              checked={includeBump}
              onChange={(e) => setIncludeBump(e.target.checked)}
            />
            <span className="flex-1 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v2/img/bump-scripts.jpg" alt="" className="float-right ml-3 mb-2 w-[64px] sm:w-[80px] rounded-[4px]" />
              <span className="block font-semibold text-[18px] leading-snug">Yes, add 100 Ready-to-Use Replies for just {money(BUMP_CENTS)}</span>
              <span className="block mt-1.5 text-[16px] leading-relaxed text-[color:var(--sp2-muted)]">
                100 everyday situations, each with three ways to word your reply: saying no, asking, following up, confirming an agreement,
                repairing a rushed yes. Indexed by situation (work, partner, ex, family, friends, money) so you find the right one fast. Read it tonight, before your book arrives.
              </span>
            </span>
          </label>

          {/* 7. Payment */}
          <div className="rounded-[6px] bg-[color:var(--sp2-light)] border border-[color:var(--sp2-line)] p-4 sm:p-6">
            <p className="flex items-center gap-2 font-semibold text-[18px] mb-4">
              <Lock className="h-5 w-5" aria-hidden /> Secure payment
            </p>
            <PaymentElement options={{ layout: 'tabs', wallets: { applePay: 'never', googlePay: 'never' } }} />
          </div>

          {/* 8. Pay */}
          <div>
            {error && (
              <p role="alert" className="mb-4 rounded-[6px] border border-[color:var(--sp2-oxblood)] bg-[#f8ece9] p-4 text-[17px] text-[color:var(--sp2-oxblood)]">
                {error}
              </p>
            )}
            <button type="submit" className="sp2-btn w-full !min-h-[64px] !text-[20px]" disabled={!stripe || !elements || busy}>
              {busy ? 'Processing your order...' : `Complete my order: ${money(total)}`}
            </button>
            <p className="mt-3 text-center text-[16px] text-[color:var(--sp2-muted)]">Secure checkout by Stripe · 30-day money-back guarantee</p>
            <div className="mt-4 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v2/img/still-seal.jpg" alt="" className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
              <p className="text-[16px] leading-snug text-[color:var(--sp2-muted)]">
                If the book isn&apos;t for you, email us within 30 days of delivery and send the book back for a full refund.
              </p>
            </div>
          </div>
        </form>

        {/* Desktop: sticky order summary */}
        <aside className="hidden lg:block lg:sticky lg:top-[80px]">{summary}</aside>
      </div>
    </>
  );
}

function OrderSummary({
  format,
  includeBump,
  bookCents,
  shippingCents,
  total,
}: {
  format: Format;
  includeBump: boolean;
  bookCents: number;
  shippingCents: number;
  total: number;
}) {
  const label = FORMATS[format].label;
  return (
    <div className="rounded-[6px] border border-[color:var(--sp2-line)] bg-white overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/v2/img/bundle-hero.jpg" alt="The Shadow Persuasion book with the journal and bonuses" className="w-full aspect-[16/10] object-cover" />
      <div className="p-5 sm:p-6">
        <h2 className="text-[26px] leading-tight mb-4">Shadow Persuasion: The Hidden Rules of Power</h2>
        <p className="-mt-3 mb-4 text-[16px] text-[color:var(--sp2-muted)]">{label} edition</p>
        <ul className="space-y-2.5 text-[16px] leading-snug mb-5">
          {[
            `The ${label.toLowerCase()}, printed and shipped to your door`,
            'The digital edition, emailed instantly',
            'The 21-Day Power Reset Journal',
            'Three bonuses: The Tactic Spotter, The Conversation Planner, The Power Map and Decision Cards',
            '60 days of the companion app',
          ].map((t) => (
            <li key={t} className="flex gap-2.5">
              <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-[color:var(--sp2-sage)]" aria-hidden /> {t}
            </li>
          ))}
        </ul>
        <div className="border-t border-[color:var(--sp2-line)] pt-4 space-y-2 text-[17px]">
          <div className="flex justify-between gap-3">
            <span>{label} + digital edition</span>
            <span>{money(bookCents)}</span>
          </div>
          {includeBump && (
            <div className="flex justify-between gap-3">
              <span>100 Ready-to-Use Replies</span>
              <span>{money(BUMP_CENTS)}</span>
            </div>
          )}
          <div className="flex justify-between gap-3">
            <span>Shipping</span>
            <span>{shippingCents === 0 ? 'Free' : money(shippingCents)}</span>
          </div>
          <div className="flex justify-between gap-3 font-semibold text-[20px] pt-3 border-t border-[color:var(--sp2-line)]">
            <span>Total</span>
            <span>{money(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
