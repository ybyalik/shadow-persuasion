'use client';

/* The Decoder's answer: what's happening, how it's meant to make you feel,
   how much pressure, calm replies, what not to do, and the chapter to read. */

import { useState } from 'react';
import { Check, Copy, LifeBuoy } from 'lucide-react';
import { BookRef, Card, Label, Notice } from '@/components/app/ui';
import type { DecodeResult, Pressure } from '@/lib/prompts/in-the-moment';

const PRESSURE_TEXT: Record<Pressure, string> = {
  none: 'None',
  low: 'Low',
  some: 'Some',
  'a lot': 'A lot',
};

function PressureMeter({ level }: { level: Pressure }) {
  const filled = level === 'a lot' ? 3 : level === 'some' ? 2 : level === 'low' ? 1 : 0;
  const color = level === 'a lot' ? 'bg-[color:var(--app-oxblood)]' : level === 'some' ? 'bg-[color:var(--app-accent)]' : 'bg-[color:var(--app-sage)]';
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1.5" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span key={i} className={`h-2.5 w-8 rounded-full ${i <= filled ? color : 'bg-[color:var(--app-line)]'}`} />
        ))}
      </div>
      <span className="text-[16px] font-semibold">{PRESSURE_TEXT[level]}</span>
    </div>
  );
}

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard blocked: nothing to do */
        }
      }}
      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-[color:var(--app-line)] px-3 text-[14px] font-medium hover:bg-[color:var(--app-paper-2)]"
    >
      {done ? <Check className="h-4 w-4 text-[color:var(--app-sage)]" /> : <Copy className="h-4 w-4" />}
      {done ? 'Copied' : label}
    </button>
  );
}

export function DecodeResultView({ result }: { result: DecodeResult }) {
  return (
    <div className="space-y-4">
      {result.safety && (
        <Notice tone="warn">
          <span className="flex gap-2">
            <LifeBuoy className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--app-oxblood)]" />
            <span>{result.safety}</span>
          </span>
        </Notice>
      )}

      <Card tone="night">
        <p className="app-type mb-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--app-gold)]">What&apos;s happening</p>
        {result.tactic && <p className="app-serif text-[24px] font-semibold leading-tight">{result.tactic}</p>}
        <p className={`text-[16px] leading-relaxed ${result.tactic ? 'mt-2' : ''}`}>{result.whatsHappening}</p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        {result.meantToFeel && (
          <Card>
            <Label>{result.noPressure ? 'What they probably want' : "How it's meant to make you feel"}</Label>
            <p className="text-[16px] leading-relaxed">{result.meantToFeel}</p>
          </Card>
        )}
        <Card className="sm:min-w-[220px]">
          <Label>How much pressure</Label>
          <PressureMeter level={result.pressure} />
        </Card>
      </div>

      {result.replies.length > 0 && (
        <div>
          <Label className="mb-3">{result.noPressure ? 'Ways to reply' : 'Calm replies you can send'}</Label>
          <div className="space-y-3">
            {result.replies.map((r, i) => (
              <Card key={i} tone={i === 0 ? 'gold' : 'plain'}>
                <p className="app-type text-[11px] uppercase tracking-[0.16em] text-[color:var(--app-muted)]">{r.label}</p>
                <p className="app-serif mt-2 text-[20px] leading-snug">&ldquo;{r.text}&rdquo;</p>
                {r.why && <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--app-muted)]">{r.why}</p>}
                <div className="mt-3">
                  <CopyButton text={r.text} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {result.whatNotToDo && (
        <Card>
          <Label>What not to do</Label>
          <p className="text-[16px] leading-relaxed">{result.whatNotToDo}</p>
        </Card>
      )}

      {result.chapterTitle && (
        <div>
          <BookRef chapter={result.chapter ?? undefined} title={result.chapterTitle} />
        </div>
      )}
    </div>
  );
}

/** Kept for older imports. */
export const EnhancedAnalysisResult = DecodeResultView;
