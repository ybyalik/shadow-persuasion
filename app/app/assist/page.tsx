'use client';

/* Right Now: for when they're in front of you or on the phone.
   One box, one tap, three short lines you can say out loud. */

import { useRef, useState } from 'react';
import { Check, Copy, LifeBuoy } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { Button, Notice, friendlyError, inputClass } from '@/components/app/ui';
import type { AssistResult } from '@/lib/prompts/in-the-moment';

function SayLine({ label, text, tone }: { label: string; text: string; tone: 'gold' | 'plain' | 'night' }) {
  const [copied, setCopied] = useState(false);
  const toneCls =
    tone === 'gold'
      ? 'border-2 border-[color:var(--app-gold)] bg-[color:var(--app-card)]'
      : tone === 'night'
        ? 'border border-transparent bg-[color:var(--app-night)] text-[#efe9df]'
        : 'border border-[color:var(--app-line)] bg-[color:var(--app-card)]';
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard blocked */
        }
      }}
      className={`block w-full rounded-xl p-5 text-left ${toneCls}`}
    >
      <span className="flex items-center justify-between gap-3">
        <span className={`app-type text-[12px] uppercase tracking-[0.16em] ${tone === 'night' ? 'text-[color:var(--app-gold)]' : 'text-[color:var(--app-accent)]'}`}>
          {label}
        </span>
        <span className="flex items-center gap-1 text-[13px] opacity-70">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Tap to copy'}
        </span>
      </span>
      <span className="app-serif mt-2 block text-[26px] leading-snug sm:text-[30px]">&ldquo;{text}&rdquo;</span>
    </button>
  );
}

export default function RightNowPage() {
  const [theySaid, setTheySaid] = useState('');
  const [goal, setGoal] = useState('');
  const [showGoal, setShowGoal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssistResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const go = async () => {
    if (!theySaid.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiFetch('/api/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theySaid: theySaid.trim(), goal: goal.trim() }),
      });
      if (!res.ok) {
        setError(await friendlyError(res));
        return;
      }
      const d = await res.json();
      setResult(d.result);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch {
      setError('Could not reach the app. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <p className="app-type mb-2 text-[12px] uppercase tracking-[0.2em] text-[color:var(--app-accent)]">In the moment</p>
      <h1 className="app-serif text-[34px] font-semibold leading-[1.08] sm:text-[40px]">Right Now</h1>
      <p className="mt-2 text-[16px] leading-relaxed text-[color:var(--app-muted)]">They&apos;re in front of you or on the phone. Take a breath. Type what they said.</p>

      <div className="mt-5">
        <label htmlFor="theySaid" className="sr-only">
          What did they just say?
        </label>
        <textarea
          id="theySaid"
          value={theySaid}
          onChange={(e) => setTheySaid(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              go();
            }
          }}
          placeholder="What did they just say?"
          rows={3}
          autoFocus
          className={`${inputClass} !text-[22px] leading-snug`}
        />
        {showGoal ? (
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="What do you want? (optional)"
            className={`${inputClass} mt-3`}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowGoal(true)}
            className="mt-2 min-h-[44px] text-[15px] font-medium text-[color:var(--app-accent)] underline underline-offset-4"
          >
            + What do you want? (optional)
          </button>
        )}
        <Button onClick={go} loading={loading} disabled={!theySaid.trim() || loading} variant="gold" className="mt-3 w-full !py-4 !text-[18px]">
          {loading ? 'One moment...' : 'What do I say?'}
        </Button>
      </div>

      {error && (
        <div className="mt-5">
          <Notice tone="error">{error}</Notice>
        </div>
      )}

      <div ref={resultRef} className="scroll-mt-4">
        {result && (
          <div className="mt-6 space-y-3">
            {result.safety && (
              <Notice tone="warn">
                <span className="flex gap-2">
                  <LifeBuoy className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--app-oxblood)]" />
                  <span>{result.safety}</span>
                </span>
              </Notice>
            )}
            <SayLine label="Say this now" text={result.sayNow} tone="gold" />
            <SayLine label="To buy time" text={result.buyTime} tone="plain" />
            {result.boundary && <SayLine label="If they keep pushing" text={result.boundary} tone="night" />}
            <p className="pt-2 text-[14px] leading-relaxed text-[color:var(--app-muted)]">Say it once, then stop. If they push, say it again in the same calm tone.</p>
          </div>
        )}
      </div>
    </div>
  );
}
