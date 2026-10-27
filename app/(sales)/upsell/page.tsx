'use client';

// The $27 one-click upsell: The Applied Power Playbook Library (lib/sp2/config.ts, sp2_upsell).

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const SECTIONS = [
  {
    title: 'Work and pay',
    items: ['Asking for a raise', 'Someone took credit for your work', "Telling your manager you're at capacity", 'Going for a promotion after being passed over', 'Leaving a job well'],
  },
  {
    title: 'Clients and money',
    items: ['Raising your rates', 'A dispute with a contractor or service provider', 'Saying no to lending money to family or a friend', "Asking for money you're owed", 'A family favor that later becomes a debt'],
  },
  {
    title: 'Relationships and family',
    items: ['A difficult parent: criticism, comparisons, guilt, and limits on calls or visits', 'Sharing care of an aging parent with siblings', 'In-laws', 'The recurring fight with a partner', 'An ex who keeps reopening practical agreements'],
  },
  {
    title: 'Endings and transitions',
    items: ['The apology and repair', 'Asking for space', 'Ending a relationship', 'Considering reconnection with an ex or estranged family', "Stepping back from a group or a role you've outgrown"],
  },
];

function UpsellOffer() {
  const router = useRouter();
  const pi = useSearchParams().get('payment_intent') || '';
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const thankYou = (upsellPi?: string) =>
    `/thank-you?payment_intent=${encodeURIComponent(pi)}${upsellPi ? `&upsell_pi=${encodeURIComponent(upsellPi)}` : ''}`;

  async function accept() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/v2/upsell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: pi }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error();
      router.push(thankYou(data.upsellPaymentIntentId));
    } catch {
      setError("We couldn't add this to your order, and you haven't been charged for it. You can continue to your book below.");
      setBusy(false);
    }
  }

  return (
    <main className="pb-16">
      <div className="bg-[color:var(--sp2-black)] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2">
          <span className="sp2-type text-[16px] tracking-[0.25em] text-[color:var(--sp2-gold)]">SHADOW PERSUASION</span>
          <span className="sp2-ui text-[16px] text-white/85">Step 3 of 3: one optional add-on</span>
        </div>
        {/* progress */}
        <div className="h-1.5 bg-white/10">
          <div className="h-full w-[85%] bg-[color:var(--sp2-gold)]" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        <p className="sp2-ui inline-flex items-center gap-2 rounded-full bg-[#eef0e6] text-[color:var(--sp2-sage)] px-4 py-1.5 text-[17px] font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-[color:var(--sp2-sage)]" /> Your order is confirmed. Your book is on its way to the printer.
        </p>
        <p className="sp2-kicker mb-3">Wait, one quick thing before you go</p>
        <h1 className="text-[34px] sm:text-[48px] leading-[1.06] font-medium mb-4">
          Want a step-by-step plan for the situations that matter most?
        </h1>
        <p className="text-[19px] leading-relaxed text-[color:var(--sp2-muted)] mb-8 max-w-[40em]">
          The book teaches the tools. The Applied Power Playbook Library walks 20 real situations from start to finish: preparing, the conversation itself, what
          to do if they agree, partly agree, refuse or backtrack later, the follow-up message, and what you do next if agreement never comes.
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/v2/img/upsell-digital.jpg" alt="The Applied Power Playbook Library, a 121-page PDF, shown on a tablet" className="w-full rounded-xl shadow-2xl mb-4" />
        <p className="sp2-ui text-[17px] text-[color:var(--sp2-muted)] mb-6 md:mb-10">Digital download: a 121-page PDF, emailed to you with your book. Read it on your phone, tablet or computer, or print the worksheets.</p>
        <div className="md:hidden mb-10 text-center">
          <button className="sp2-btn  w-full !py-4" disabled={busy || !pi} onClick={accept}>
            {busy ? 'Adding...' : 'Yes, add it for $27'}
          </button>
          <p className="sp2-ui text-[16px] text-[color:var(--sp2-muted)] mt-2">One click, on the card you just used. Details below.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {SECTIONS.map((sec, i) => (
            <div key={sec.title} className="rounded-lg border border-[color:var(--sp2-line)] bg-[color:var(--sp2-card)] p-6">
              <p className="sp2-type text-[16px] tracking-[0.18em] text-[color:var(--sp2-accent)] mb-2">SECTION {i + 1}</p>
              <h2 className="text-[26px] font-medium leading-tight mb-3">{sec.title}</h2>
              <ul className="space-y-1.5 text-[17px]">
                {sec.items.map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="text-[color:var(--sp2-accent)]">›</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-[18px] leading-relaxed text-[color:var(--sp2-muted)] mb-10">
          Each playbook includes a filled-in preparation sheet (your Clean Ask and No-Agreement Plan) and a worksheet you can reuse, such as a contribution log,
          an offer comparison, a care-task list or an agreement tracker. The pay playbooks cover market-pay research, who has approval authority, alternatives to
          base pay and getting the answer in writing. No custody tactics, and anything legal points you to a qualified professional.
        </p>

        <div className="rounded-xl border-2 border-[color:var(--sp2-ink)] bg-white p-6 sm:p-8 text-center shadow-[0_30px_60px_-40px_rgba(0,0,0,0.5)]">
          <p className="text-[22px] sm:text-[26px] font-semibold leading-snug">
            Add The Applied Power Playbook Library for <span className="text-[color:var(--sp2-accent)]">$27</span>
          </p>
          <p className="sp2-ui text-[17px] text-[color:var(--sp2-muted)] mt-2 mb-6">
            One click. It goes on the card you just used, so there is nothing to type. A 121-page PDF, emailed with your book.
          </p>
          {error && <p className="sp2-ui text-[16px] text-[color:var(--sp2-oxblood)] mb-4">{error}</p>}
          <button className="sp2-btn  w-full sm:w-auto sm:min-w-[360px] !py-5 !text-[18px]" disabled={busy || !pi} onClick={accept}>
            {busy ? 'Adding...' : 'Yes, add it to my order'}
          </button>
          <div className="mt-4">
            <button className="sp2-ui text-[17px] underline underline-offset-4 text-[color:var(--sp2-muted)] py-2" onClick={() => router.push(thankYou())}>
              No thanks, continue to my order
            </button>
          </div>
          <p className="sp2-ui text-[12.5px] text-[color:var(--sp2-muted)] mt-4">Covered by the same 30-day money-back guarantee.</p>
        </div>
      </div>
    </main>
  );
}

export default function V2UpsellPage() {
  return (
    <Suspense fallback={null}>
      <UpsellOffer />
    </Suspense>
  );
}
