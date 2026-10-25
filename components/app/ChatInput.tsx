'use client';

import { useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/** Message box for Talk It Through. Enter sends, Shift+Enter adds a line. */
export function ChatInput({ onSend, isLoading, placeholder }: { onSend: (input: string) => void; isLoading: boolean; placeholder?: string }) {
  const [input, setInput] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  const send = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    onSend(text);
    setInput('');
    if (ref.current) ref.current.style.height = 'auto';
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      className="flex items-end gap-2 rounded-xl border border-[color:var(--app-line)] bg-[color:var(--app-card)] p-2 focus-within:ring-2 focus-within:ring-[color:var(--app-accent)]"
    >
      <label htmlFor="coach-input" className="sr-only">
        Your message
      </label>
      <textarea
        id="coach-input"
        ref={ref}
        value={input}
        rows={1}
        onChange={(e) => {
          setInput(e.target.value);
          e.target.style.height = 'auto';
          e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        placeholder={placeholder || 'Tell me what happened...'}
        className="max-h-[200px] min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2.5 text-[16px] text-[color:var(--app-ink)] placeholder:text-[color:var(--app-muted)]/70 focus:outline-none"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        aria-label="Send"
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[color:var(--app-ink)] text-[color:var(--app-paper)] disabled:opacity-40"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </form>
  );
}
