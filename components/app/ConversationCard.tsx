'use client';

import { MessageSquareText, ScanSearch, Trash2 } from 'lucide-react';

/** One entry on a person's timeline: a moment the reader logged, or a message they decoded. */
export type TimelineEntry =
  | {
      kind: 'moment';
      id: string;
      date: string;
      whatHappened: string;
      whatTheySaid?: string;
      whatISaid?: string;
      howItWent: 'landed' | 'mixed' | 'didnt' | 'unsure';
      tactics: string[];
      read?: string;
      worked?: string;
    }
  | { kind: 'decode'; id: string; date: string; text: string; tactics: string[]; whatsHappening: string | null; pressure: 'low' | 'some' | 'a lot' | null };

const WENT: Record<string, string> = { landed: 'It went well', mixed: 'So-so', didnt: "Didn't go well", unsure: 'Not sure yet' };
const PRESSURE: Record<string, string> = { low: 'Low pressure', some: 'Some pressure', 'a lot': 'A lot of pressure' };

function day(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ConversationCard({ entry, onDelete }: { entry: TimelineEntry; onDelete?: (entry: TimelineEntry) => void }) {
  const Icon = entry.kind === 'decode' ? ScanSearch : MessageSquareText;
  return (
    <div className="relative rounded-xl border border-[color:var(--app-line)] bg-[color:var(--app-card)] p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 flex-shrink-0 text-[color:var(--app-muted)]" aria-hidden />
        <span className="app-type text-[11px] uppercase tracking-[0.14em] text-[color:var(--app-muted)]">
          {entry.kind === 'decode' ? 'Decoded message' : 'Moment'} · {day(entry.date)}
        </span>
        {onDelete && entry.kind === 'moment' && (
          <button
            onClick={() => onDelete(entry)}
            aria-label="Remove this entry"
            className="ml-auto flex h-11 w-11 items-center justify-center rounded-lg text-[color:var(--app-muted)] hover:bg-[color:var(--app-paper-2)] -my-3 -mr-2"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {entry.kind === 'moment' ? (
        <div className="space-y-2 text-[15px] leading-relaxed">
          <p>{entry.whatHappened}</p>
          {entry.whatTheySaid && (
            <p className="text-[color:var(--app-muted)]">
              They said: <span className="italic">&ldquo;{entry.whatTheySaid}&rdquo;</span>
            </p>
          )}
          {entry.whatISaid && (
            <p className="text-[color:var(--app-muted)]">
              You said: <span className="italic">&ldquo;{entry.whatISaid}&rdquo;</span>
            </p>
          )}
          {entry.read && <p className="rounded-lg bg-[color:var(--app-paper-2)] px-3 py-2 text-[14px]">{entry.read}</p>}
          {entry.worked && <p className="text-[14px] text-[color:var(--app-sage)]">What worked: {entry.worked}</p>}
        </div>
      ) : (
        <div className="space-y-2 text-[15px] leading-relaxed">
          {entry.text && <p className="line-clamp-3 italic text-[color:var(--app-muted)]">&ldquo;{entry.text}&rdquo;</p>}
          {entry.whatsHappening && <p>{entry.whatsHappening}</p>}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {entry.tactics.map((t) => (
          <span key={t} className="rounded-md bg-[color:var(--app-paper-2)] px-2 py-0.5 text-[12px]">
            {t}
          </span>
        ))}
        {entry.kind === 'moment' && <span className="rounded-md border border-[color:var(--app-line)] px-2 py-0.5 text-[12px] text-[color:var(--app-muted)]">{WENT[entry.howItWent]}</span>}
        {entry.kind === 'decode' && entry.pressure && (
          <span className="rounded-md border border-[color:var(--app-line)] px-2 py-0.5 text-[12px] text-[color:var(--app-muted)]">{PRESSURE[entry.pressure]}</span>
        )}
      </div>
    </div>
  );
}
