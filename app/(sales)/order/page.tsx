import type { Metadata } from 'next';
import { Logo } from '../../_sales/ui';
import { LookupForm } from './OrderClient';

// "Find my order": the private order page link is emailed, never shown here (app/api/v2/order/lookup).
export const metadata: Metadata = { title: 'Find your order | Shadow Persuasion', robots: { index: false, follow: false } };

export default function FindOrderPage() {
  return (
    <main className="min-h-screen bg-[color:var(--sp2-paper)]">
      <header className="max-w-3xl mx-auto px-5 sm:px-8 pt-6">
        <Logo tone="light" />
      </header>
      <section className="max-w-3xl mx-auto px-5 sm:px-8 pt-12 pb-24">
        <p className="sp2-kicker mb-3">Your order</p>
        <h1 className="sp2-display text-[40px] sm:text-[52px] leading-[1.05]">Check on your order</h1>
        <p className="text-[19px] leading-relaxed text-[color:var(--sp2-muted)] mt-4 max-w-[34em]">
          Enter the email you ordered with and we&apos;ll send you a private link to your order page: where your book is, its tracking, and your download links.
        </p>
        <LookupForm />
      </section>
    </main>
  );
}
