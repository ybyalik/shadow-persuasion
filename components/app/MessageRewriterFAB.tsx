'use client';

/* A small floating "Calm my reply" button with a quick panel.
   Not mounted anywhere right now; uses the same /api/rewrite as the Calm My Reply page. */

import { useState } from 'react';
import { MessageSquareText, X } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { CopyButton } from '@/components/app/EnhancedAnalysisResult';
import { Button, Notice, friendlyError, inputClass } from '@/components/app/ui';
import type { RewriteResult } from '@/lib/prompts/in-the-moment';

export function MessageRewriterFAB() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RewriteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const go = async () => {
    if (!draft.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiFetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft: draft.trim() }),
      });
      if (!res.ok) setError(await friendlyError(res));
      else setResult(await res.json());
    } catch {
      setError('Could not reach the app. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Calm my reply"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--app-ink)] text-[color:var(--app-paper)] shadow-lg"
      >
        <MessageSquareText className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 max-h-[80vh] overflow-y-auto rounded-xl border border-[color:var(--app-line)] bg-[color:var(--app-card)] p-4 shadow-xl sm:left-auto sm:right-5 sm:w-[400px]">
      <div className="mb-3 flex items-center justify-between">
        <p className="app-serif text-[20px] font-semibold">Calm my reply</p>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="flex h-11 w-11 items-center justify-center">
          <X className="h-5 w-5" />
        </button>
      </div>
      <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} placeholder="Type the reply you want to send." className={inputClass} />
      <Button onClick={go} loading={loading} disabled={!draft.trim() || loading} className="mt-3 w-full">
        Calm it down
      </Button>
      {error && (
        <div className="mt-3">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      {result && (
        <div className="mt-4 space-y-3">
          {result.versions.map((v, i) => (
            <div key={i} className="rounded-lg border border-[color:var(--app-line)] p-3">
              <p className="app-type text-[11px] uppercase tracking-[0.16em] text-[color:var(--app-accent)]">{v.style}</p>
              <p className="mt-1 text-[16px] leading-relaxed">{v.text}</p>
              <div className="mt-2">
                <CopyButton text={v.text} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
