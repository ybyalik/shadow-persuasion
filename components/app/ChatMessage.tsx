'use client';

import { useState } from 'react';
import { BookOpen, Check, Copy } from 'lucide-react';

/** A chapter the coach drew on. Older saved messages used { book, technique }. */
export type ChatSource = { chapter?: string; book?: string; technique?: string };

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Small, safe formatter: paragraphs, **bold**, *italic*, quotes, and lists. */
function format(text: string) {
  const inline = (s: string) =>
    esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>');
  const blocks = text.replace(/\r/g, '').trim().split(/\n{2,}/);
  return blocks
    .map((block) => {
      const lines = block.split('\n');
      if (lines.every((l) => /^\s*>/.test(l))) {
        const q = lines.map((l) => inline(l.replace(/^\s*>\s?/, ''))).join('<br/>');
        return `<blockquote class="my-1 border-l-2 border-[color:var(--app-gold)] pl-3 italic">${q}</blockquote>`;
      }
      if (lines.every((l) => /^\s*([-*•]|\d+\.)\s+/.test(l))) {
        const items = lines.map((l) => `<li>${inline(l.replace(/^\s*([-*•]|\d+\.)\s+/, ''))}</li>`).join('');
        const ordered = /^\s*\d+\./.test(lines[0]);
        return ordered ? `<ol class="list-decimal pl-5 space-y-1">${items}</ol>` : `<ul class="list-disc pl-5 space-y-1">${items}</ul>`;
      }
      const heading = lines.length === 1 && /^#{1,4}\s+/.test(lines[0]);
      if (heading) return `<p class="font-semibold">${inline(lines[0].replace(/^#{1,4}\s+/, ''))}</p>`;
      return `<p>${lines.map(inline).join('<br/>')}</p>`;
    })
    .join('');
}

export function ChatMessage({
  role,
  content,
  isLoading,
  sources,
}: {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
  sources?: ChatSource[];
}) {
  const [copied, setCopied] = useState(false);
  const isUser = role === 'user';
  const chapters = [...new Set((sources || []).map((s) => s.chapter || s.book || '').filter(Boolean))];

  const copy = () => {
    navigator.clipboard?.writeText(content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-[color:var(--app-ink)] px-4 py-3 text-[15px] leading-relaxed text-[color:var(--app-paper)]">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-[color:var(--app-line)] bg-[color:var(--app-card)] px-4 py-3">
        {isLoading && !content ? (
          <div className="flex items-center gap-1.5 py-1" aria-label="Thinking">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--app-muted)]" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        ) : (
          <div className="space-y-3 text-[15px] leading-relaxed text-[color:var(--app-ink)]" dangerouslySetInnerHTML={{ __html: format(content) }} />
        )}
        {!isLoading && content && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[color:var(--app-line)] pt-2">
            {chapters.length > 0 && (
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 flex-shrink-0 text-[color:var(--app-muted)]" aria-hidden />
                <span className="app-type text-[10px] uppercase tracking-[0.14em] text-[color:var(--app-muted)]">From the book:</span>
                {chapters.map((c) => (
                  <span key={c} className="rounded-md bg-[color:var(--app-paper-2)] px-2 py-0.5 text-[12px] text-[color:var(--app-muted)]">
                    {c}
                  </span>
                ))}
              </div>
            )}
            <button
              onClick={copy}
              className="ml-auto inline-flex min-h-[36px] items-center gap-1 rounded-md px-2 text-[12px] text-[color:var(--app-muted)] hover:bg-[color:var(--app-paper-2)]"
              aria-label="Copy this reply"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
