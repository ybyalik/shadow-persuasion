'use client';

/* Calm My Reply: type the reply you want to send, get three calmer versions
   in your own voice, and see if the draft over-explains or apologizes. */

import Link from 'next/link';
import { useRef, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { CopyButton } from '@/components/app/EnhancedAnalysisResult';
import { BookRef, Button, Card, Label, Notice, PageHeader, friendlyError, inputClass } from '@/components/app/ui';
import { CHAPTERS_V3, IS_V3 } from '@/lib/edition';
import type { RewriteResult, RewriteFlag } from '@/lib/prompts/in-the-moment';

const FLAG_TITLE: Record<RewriteFlag['kind'], string> = {
  'over-explains': 'Over-explaining',
  apologizes: 'Apologizing for no reason',
  'door-open': 'Leaving the door open',
};

export default function CalmMyReplyPage() {
  const [draft, setDraft] = useState('');
  const [replyingTo, setReplyingTo] = useState('');
  const [showReplyingTo, setShowReplyingTo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RewriteResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const go = async () => {
    if (!draft.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiFetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft: draft.trim(), replyingTo: replyingTo.trim() }),
      });
      if (!res.ok) {
        setError(await friendlyError(res));
        return;
      }
      setResult(await res.json());
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch {
      setError('Could not reach the app. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        kicker="Before you send it"
        title="Calm My Reply"
        subtitle="Type the reply you want to send. You'll get three calmer versions that keep your meaning and sound like you, plus a heads-up if your draft is doing too much."
      />

      <Card>
        <label htmlFor="draft">
          <Label>Your reply</Label>
        </label>
        <textarea
          id="draft"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') go();
          }}
          rows={6}
          placeholder="Write it the way you would send it, even if it's messy."
          className={inputClass}
        />

        {showReplyingTo ? (
          <div className="mt-5">
            <label htmlFor="replyingTo">
              <Label>What you&apos;re answering (optional)</Label>
            </label>
            <textarea
              id="replyingTo"
              value={replyingTo}
              onChange={(e) => setReplyingTo(e.target.value)}
              rows={3}
              placeholder="Paste their message so the new versions fit it."
              className={inputClass}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowReplyingTo(true)}
            className="mt-3 min-h-[44px] text-[15px] font-medium text-[color:var(--app-accent)] underline underline-offset-4"
          >
            + Add the message you&apos;re answering
          </button>
        )}

        <div className="mt-6">
          <Button onClick={go} loading={loading} disabled={!draft.trim() || loading} className="w-full sm:w-auto">
            {loading ? 'Calming it down...' : 'Calm my reply'}
          </Button>
        </div>
      </Card>

      {error && (
        <div className="mt-5">
          <Notice tone="error">{error}</Notice>
        </div>
      )}

      <div ref={resultRef} className="scroll-mt-6">
        {result && (
          <div className="mt-8 space-y-4">
            {result.flags.length > 0 ? (
              <Card tone="gold">
                <Label>Heads-up about your draft</Label>
                <ul className="space-y-3">
                  {result.flags.map((f, i) => (
                    <li key={i}>
                      <p className="text-[16px] font-semibold">{FLAG_TITLE[f.kind]}</p>
                      <p className="text-[15px] leading-relaxed text-[color:var(--app-muted)]">{f.note}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  {IS_V3 ? <BookRef chapter={3} title={CHAPTERS_V3[3]} /> : <BookRef title="Stop Shrinking (bonus guide)" />}
                </div>
              </Card>
            ) : (
              <Notice>Your draft already reads clearly. The versions below are small polishes.</Notice>
            )}

            {result.versions.map((v, i) => (
              <Card key={i}>
                <p className="app-type text-[11px] uppercase tracking-[0.16em] text-[color:var(--app-accent)]">{v.style}</p>
                <p className="mt-2 whitespace-pre-wrap text-[18px] leading-relaxed">{v.text}</p>
                {v.changed && <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--app-muted)]">What changed: {v.changed}</p>}
                <div className="mt-3">
                  <CopyButton text={v.text} />
                </div>
              </Card>
            ))}

            <p className="text-[14px] leading-relaxed text-[color:var(--app-muted)]">
              Want these to sound even more like you? Add a few of your own messages under{' '}
              <Link href="/app/settings" className="underline underline-offset-4">
                Settings
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
