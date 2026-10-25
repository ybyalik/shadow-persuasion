'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Copy } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { BookRef, Button, Card, Label, Notice, PageHeader, friendlyError, inputClass } from '@/components/app/ui';
import { STATUS_LABEL, type SRStatus } from '@/lib/spaced-repetition';

type Tactic = {
  slug: string;
  name: string;
  family: string | null;
  chapter: number;
  chapter_title: string;
  looks_like: string;
  purpose: string;
  warning_sign: string;
  calm_reply: string;
  note: string | null;
  examples: string[];
  harm: string | null;
  works_on: string | null;
  safety: boolean;
  /** v3 rows come from the new Tactic Spotter and carry the fields below. */
  edition?: 'v2' | 'v3';
  other_explanations?: string | null;
  not_confront?: string | null;
  help?: string | null;
};

type Fit = { read: string; reply: string; tip: string; safety: boolean; hotline: string | null };

export default function TechniqueDetailClient({ techniqueId }: { techniqueId: string }) {
  const [tactic, setTactic] = useState<Tactic | null>(null);
  const [status, setStatus] = useState<SRStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [extra, setExtra] = useState<{ message: string; context: string | null }[]>([]);
  const [exLoading, setExLoading] = useState(false);
  const [exError, setExError] = useState<string | null>(null);

  const [situation, setSituation] = useState('');
  const [fit, setFit] = useState<Fit | null>(null);
  const [fitLoading, setFitLoading] = useState(false);
  const [fitError, setFitError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(`/api/techniques?id=${encodeURIComponent(techniqueId)}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) {
          setError(await friendlyError(res, "We couldn't load this tactic. Please try again."));
          return;
        }
        setTactic((await res.json()).tactic);
      } catch {
        setError("We couldn't reach the server. Please check your connection.");
      } finally {
        setLoading(false);
      }
    })();
    apiFetch('/api/spaced-repetition')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const card = d?.cards?.find((c: { tactic_slug: string }) => c.tactic_slug === techniqueId);
        if (card) setStatus(card.status);
      })
      .catch(() => {});
  }, [techniqueId]);

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard not available */
    }
  };

  const anotherExample = async () => {
    if (!tactic || exLoading) return;
    setExLoading(true);
    setExError(null);
    try {
      const res = await apiFetch('/api/technique-practice/roleplay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: tactic.slug }),
      });
      if (!res.ok) {
        setExError(await friendlyError(res, "We couldn't write an example just now. Please try again."));
        return;
      }
      const d = await res.json();
      setExtra((x) => [...x, { message: d.example.message, context: d.example.context }]);
    } catch {
      setExError("We couldn't reach the server. Please check your connection.");
    } finally {
      setExLoading(false);
    }
  };

  const fitIt = async () => {
    if (!tactic || fitLoading || situation.trim().length < 10) return;
    setFitLoading(true);
    setFitError(null);
    setFit(null);
    try {
      const res = await apiFetch('/api/techniques/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: tactic.slug, situation: situation.trim() }),
      });
      if (!res.ok) {
        setFitError(await friendlyError(res, "We couldn't put that together. Please try again."));
        return;
      }
      setFit(await res.json());
    } catch {
      setFitError("We couldn't reach the server. Please check your connection.");
    } finally {
      setFitLoading(false);
    }
  };

  const back = (
    <Link href="/app/techniques" className="mb-6 inline-flex min-h-[44px] items-center gap-2 text-[15px] text-[color:var(--app-muted)] hover:text-[color:var(--app-ink)]">
      <ArrowLeft className="h-4 w-4" /> All tactics
    </Link>
  );

  if (loading) return <div className="mx-auto max-w-3xl">{back}<p className="text-[color:var(--app-muted)]">Loading...</p></div>;

  if (notFound || !tactic) {
    return (
      <div className="mx-auto max-w-3xl">
        {back}
        <Notice tone={error ? 'error' : 'info'}>
          {error || "We couldn't find that tactic. The library holds the tactics from the book's Tactic Spotter. Pick one from the list."}
        </Notice>
      </div>
    );
  }

  const copyBtn = (text: string, k: string) => (
    <button
      type="button"
      onClick={() => copy(text, k)}
      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 text-[14px] text-[color:var(--app-muted)] hover:bg-[color:var(--app-paper-2)]"
      aria-label="Copy reply"
    >
      {copied === k ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied === k ? 'Copied' : 'Copy'}
    </button>
  );

  const v3 = tactic.edition === 'v3';
  // Danger signs (new guide) have no reply on purpose: they point to Chapter 11 and real help.
  const danger = tactic.safety && !tactic.calm_reply;

  const examplesCard = (
    <Card>
      <Label>You might hear</Label>
      <ul className="space-y-2">
        {tactic.examples.map((e) => (
          <li key={e} className="app-serif text-[19px] leading-snug">
            &ldquo;{e}&rdquo;
          </li>
        ))}
        {extra.map((e, i) => (
          <li key={`x${i}`} className="app-serif text-[19px] leading-snug">
            &ldquo;{e.message}&rdquo;
            {e.context && <span className="ml-2 font-sans text-[13px] text-[color:var(--app-muted)]">({e.context})</span>}
          </li>
        ))}
      </ul>
      {exError && <div className="mt-3"><Notice tone="error">{exError}</Notice></div>}
      <div className="mt-4">
        <Button variant="ghost" onClick={anotherExample} loading={exLoading}>
          Show me another example
        </Button>
      </div>
    </Card>
  );

  const replyCard = (
    <Card tone="gold">
      <div className="flex items-start justify-between gap-2">
        <Label>A calm reply</Label>
        {copyBtn(tactic.calm_reply, "book")}
      </div>
      <p className="app-serif text-[24px] leading-snug">&ldquo;{tactic.calm_reply}&rdquo;</p>
      {tactic.note && <p className="mt-3 text-[16px] leading-relaxed text-[color:var(--app-muted)]">{tactic.note}</p>}
      <div className="mt-4">
        <BookRef chapter={tactic.chapter} title={tactic.chapter_title} />
      </div>
    </Card>
  );

  const safetyNotice = (
    <Notice tone="warn">
      If anyone&apos;s safety is at risk, get help first. For thoughts of self-harm, call or text 988 (Suicide and Crisis Lifeline). If you feel
      unsafe with someone, the US National Domestic Violence Hotline is 1-800-799-7233, or text START to 88788. In immediate danger, call 911.
    </Notice>
  );

  const fitCard = (
    <Card>
      <Label>Fit it to my situation</Label>
      <p className="mb-3 text-[15px] text-[color:var(--app-muted)]">Tell us what happened in a sentence or two. We&apos;ll shape the calm reply to fit.</p>
      <textarea
        value={situation}
        onChange={(e) => setSituation(e.target.value)}
        rows={3}
        maxLength={1500}
        placeholder="e.g. My friend said a real friend would drive her to the airport at 4am."
        className={inputClass}
      />
      <div className="mt-3">
        <Button onClick={fitIt} loading={fitLoading} disabled={situation.trim().length < 10}>
          Shape my reply
        </Button>
      </div>
      {fitError && <div className="mt-3"><Notice tone="error">{fitError}</Notice></div>}
      {fit && (
        <div className="mt-5 space-y-3 border-t border-[color:var(--app-line)] pt-4">
          <p className="text-[16px] leading-relaxed">{fit.read}</p>
          {fit.safety && fit.hotline && <Notice tone="warn">{fit.hotline}</Notice>}
          {fit.reply && (
            <div className="rounded-lg bg-[color:var(--app-paper-2)] p-4">
              <div className="flex items-start justify-between gap-2">
                <Label>You could say</Label>
                {copyBtn(fit.reply, "fit")}
              </div>
              <p className="app-serif text-[21px] leading-snug">&ldquo;{fit.reply}&rdquo;</p>
            </div>
          )}
          {fit.tip && <p className="text-[15px] leading-relaxed text-[color:var(--app-muted)]">{fit.tip}</p>}
        </div>
      )}
    </Card>
  );

  const actions = (
    <div className="flex flex-wrap gap-3 pt-2">
      <Button href={`/app/techniques?mode=train&slug=${tactic.slug}`}>Train on this one</Button>
      <Button href="/app/training" variant="ghost">
        Practice a scene
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl">
      {back}
      <PageHeader
        kicker={`Chapter ${tactic.chapter} · ${tactic.chapter_title}`}
        title={tactic.name}
        subtitle={tactic.looks_like}
        right={status && status !== 'new' ? <span className="app-type rounded-md bg-[color:var(--app-paper-2)] px-2 py-1 text-[11px] uppercase tracking-wide">{STATUS_LABEL[status]}</span> : undefined}
      />

      {v3 && danger ? (
        // New guide, danger sign: no script, no "shape my reply". Point to Chapter 11 and real help.
        <div className="space-y-4">
          <Notice tone="warn">
            <strong>One serious threat is enough.</strong> You don&apos;t need a pattern or proof. In immediate danger, call 911. Abuse, threats or
            control by a partner, ex or family member: the US National Domestic Violence Hotline, any hour, 1-800-799-7233, or text START to 88788.
            Someone at risk of suicide or self-harm: call or text 988. If someone may be checking your phone, reach out from a device they can&apos;t
            access.
          </Notice>
          <Card>
            <Label>Why there&apos;s no script</Label>
            <p className="text-[17px] leading-relaxed">{tactic.warning_sign}</p>
          </Card>
          <Card tone="gold">
            <Label>What helps</Label>
            <p className="text-[17px] leading-relaxed">{tactic.help}</p>
            <div className="mt-4">
              <BookRef chapter={tactic.chapter} title={tactic.chapter_title} />
            </div>
          </Card>
          {tactic.examples.length > 0 && (
            <Card>
              <Label>What it can sound like</Label>
              <ul className="space-y-2">
                {tactic.examples.map((e) => (
                  <li key={e} className="app-serif text-[19px] leading-snug">
                    &ldquo;{e}&rdquo;
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      ) : v3 ? (
        // New guide, ordinary entry: other explanations first, then what makes it a pattern, then one calm reply.
        <div className="space-y-4">
          {tactic.other_explanations && (
            <Card>
              <Label>Other explanations (read these first)</Label>
              <p className="text-[17px] leading-relaxed">{tactic.other_explanations}</p>
            </Card>
          )}
          <Card>
            <Label>Concerning if</Label>
            <p className="text-[17px] leading-relaxed">{tactic.warning_sign}</p>
            <p className="mt-3 text-[14px] text-[color:var(--app-muted)]">One moment tells you very little. A match is a reason to pay attention, not proof.</p>
          </Card>
          {examplesCard}
          {replyCard}
          {tactic.not_confront && (
            <Card>
              <Label>When not to confront</Label>
              <p className="text-[17px] leading-relaxed">{tactic.not_confront}</p>
            </Card>
          )}
          {tactic.safety && safetyNotice}
          {fitCard}
          {actions}
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <Label>What it&apos;s for</Label>
            <p className="text-[17px] leading-relaxed">{tactic.purpose}</p>
          </Card>

          <Card>
            <Label>Warning sign</Label>
            <p className="text-[17px] leading-relaxed">{tactic.warning_sign}</p>
            {(tactic.harm || tactic.works_on) && (
              <p className="mt-3 text-[14px] text-[color:var(--app-muted)]">
                {tactic.harm && <>How much harm when used often: {tactic.harm}. </>}
                {tactic.works_on && <>Works most on: {tactic.works_on.toLowerCase()}.</>}
              </p>
            )}
          </Card>

          {examplesCard}
          {replyCard}
          {tactic.safety && safetyNotice}
          {fitCard}
          {actions}
        </div>
      )}
    </div>
  );
}
