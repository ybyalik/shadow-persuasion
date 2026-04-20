'use client';

/**
 * /unsubscribe — landing page after a one-click unsubscribe.
 *
 * Three states:
 *   ?ok=1&email=X  — confirmed unsubscribed
 *   ?error=invalid — signature failed (stale link or tampered URL)
 *   ?error=<msg>   — DB write failed
 *
 * Transactional emails (order receipts, password resets) keep going
 * even after unsubscribe — this is spelled out on the page so the
 * user doesn't think they'll stop getting their download links.
 */

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export default function UnsubscribePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4ECD8] flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#D4A017] border-t-transparent rounded-full" />
        </div>
      }
    >
      <UnsubscribePage />
    </Suspense>
  );
}

function UnsubscribePage() {
  const searchParams = useSearchParams();
  const ok = searchParams.get('ok') === '1';
  const email = searchParams.get('email');
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-[#F4ECD8] flex items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full bg-white border-2 border-[#5C3A1E] p-10 text-[#1A1A1A]">
        <p className="font-mono text-[11px] tracking-[0.3em] text-[#5C3A1E] uppercase mb-6">
          // SHADOW PERSUASION //
        </p>

        {ok && (
          <>
            <div className="flex items-start gap-3 mb-5">
              <CheckCircle className="h-8 w-8 text-green-700 shrink-0 mt-1" />
              <div>
                <h1 className="text-2xl font-bold mb-2">You&rsquo;re off the list.</h1>
                <p className="text-sm text-[#3B2E1A] leading-relaxed">
                  We won&rsquo;t send any more marketing emails to{' '}
                  <span className="font-mono font-bold">{email || 'this address'}</span>.
                </p>
              </div>
            </div>
            <div className="pt-5 mt-5 border-t border-[#5C3A1E22]">
              <p className="text-xs text-[#5C3A1E] leading-relaxed">
                <strong>One exception:</strong> if you&rsquo;ve bought something from us,
                we&rsquo;ll still send the receipt and download links for that purchase.
                Those are not marketing — they&rsquo;re the product you paid for.
              </p>
              <p className="text-xs text-[#5C3A1E] leading-relaxed mt-3">
                Clicked by mistake? Reply to any email we&rsquo;ve sent you and we&rsquo;ll
                put you back on the list.
              </p>
            </div>
          </>
        )}

        {error === 'invalid' && (
          <>
            <div className="flex items-start gap-3 mb-5">
              <AlertTriangle className="h-8 w-8 text-red-700 shrink-0 mt-1" />
              <div>
                <h1 className="text-2xl font-bold mb-2">Link not valid.</h1>
                <p className="text-sm text-[#3B2E1A] leading-relaxed">
                  This unsubscribe link couldn&rsquo;t be verified. It may have been
                  tampered with or the signing key was rotated.
                </p>
              </div>
            </div>
            <p className="text-xs text-[#5C3A1E] leading-relaxed">
              Want off the list anyway? Reply to any email we&rsquo;ve sent you with the
              word &ldquo;unsubscribe&rdquo; and we&rsquo;ll take you off manually.
            </p>
          </>
        )}

        {error && error !== 'invalid' && (
          <>
            <div className="flex items-start gap-3 mb-5">
              <AlertTriangle className="h-8 w-8 text-red-700 shrink-0 mt-1" />
              <div>
                <h1 className="text-2xl font-bold mb-2">Something broke.</h1>
                <p className="text-sm text-[#3B2E1A] leading-relaxed">
                  We couldn&rsquo;t record your unsubscribe. Try again, or reply to any
                  email we&rsquo;ve sent and we&rsquo;ll handle it manually.
                </p>
              </div>
            </div>
            <p className="text-[10px] font-mono text-[#5C3A1E]">error: {error}</p>
          </>
        )}

        {!ok && !error && (
          <>
            <h1 className="text-2xl font-bold mb-4">Unsubscribe</h1>
            <p className="text-sm text-[#3B2E1A] leading-relaxed">
              Click an unsubscribe link in any email we&rsquo;ve sent you to opt out.
            </p>
          </>
        )}

        <div className="mt-8 pt-5 border-t border-[#5C3A1E22]">
          <Link
            href="/"
            className="text-sm text-[#D4A017] hover:underline font-mono uppercase tracking-wider"
          >
            &larr; Back to shadowpersuasion.com
          </Link>
        </div>
      </div>
    </div>
  );
}
