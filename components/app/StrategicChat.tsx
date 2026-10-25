'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Plus, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { ChatInput } from '@/components/app/ChatInput';
import { ChatMessage, type ChatSource } from '@/components/app/ChatMessage';
import { BookRef, Button, Card, Label, Notice, PageHeader, friendlyError } from '@/components/app/ui';

type Msg = { id: string; role: 'user' | 'assistant'; content: string; sources?: ChatSource[] };

const MARK = '<!--SOURCES:';

/** Splits the streamed text into the reply and the chapters it drew on. */
function splitSources(raw: string): { text: string; sources?: ChatSource[] } {
  const at = raw.indexOf(MARK);
  if (at === -1) {
    // Hide a marker that has only partly arrived.
    const partial = raw.lastIndexOf('<!');
    return { text: partial > -1 && raw.length - partial < MARK.length ? raw.slice(0, partial).trimEnd() : raw };
  }
  const text = raw.slice(0, at).trimEnd();
  const end = raw.indexOf('-->', at);
  if (end === -1) return { text };
  try {
    return { text, sources: JSON.parse(raw.slice(at + MARK.length, end)) };
  } catch {
    return { text };
  }
}

export const THREE_AM_STARTER =
  "There's a conversation I keep replaying in my head. Can you walk me through it, one question at a time?";

/**
 * The calm coach. Used by Talk It Through (/app/chat) and, with personId, as
 * the "talk about [name]" chat on a person's page.
 */
export function CoachChat({
  sessionId: initialSessionId,
  personId,
  personName,
  starters,
  onSessionCreated,
  compact,
}: {
  sessionId?: string | null;
  personId?: string;
  personName?: string;
  starters?: { label: string; text: string }[];
  onSessionCreated?: (id: string) => void;
  compact?: boolean;
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [busy, setBusy] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(!!initialSessionId);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialSessionId || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch(`/api/conversations/messages?session_id=${encodeURIComponent(initialSessionId)}`);
        if (!res.ok) {
          if (!cancelled) setError(await friendlyError(res, 'We could not open this conversation.'));
          return;
        }
        const d = await res.json();
        if (!cancelled)
          setMessages(
            (d.messages || [])
              .filter((m: { role: string }) => m.role === 'user' || m.role === 'assistant')
              .map((m: { id: string; role: 'user' | 'assistant'; content: string; metadata?: { sources?: ChatSource[] } }) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                sources: m.metadata?.sources,
              }))
          );
      } catch {
        if (!cancelled) setError('We could not open this conversation. Please check your connection.');
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialSessionId, user]);

  useEffect(() => {
    if (messages.length) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      if (busy) return;
      setError(null);
      const userMsg: Msg = { id: `u${Date.now()}`, role: 'user', content: text };
      const replyId = `a${Date.now()}`;
      const history = [...messages, userMsg];
      setMessages([...history, { id: replyId, role: 'assistant', content: '' }]);
      setBusy(true);
      try {
        const res = await apiFetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history.map((m) => ({ role: m.role, content: m.content })),
            session_id: sessionId,
            personId,
          }),
        });
        if (!res.ok || !res.body) {
          setError(await friendlyError(res, 'The coach could not answer just now. Please try again.'));
          setMessages(history);
          return;
        }
        const newId = res.headers.get('X-Session-Id');
        if (newId && newId !== sessionId) {
          setSessionId(newId);
          onSessionCreated?.(newId);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let raw = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          raw += decoder.decode(value, { stream: true });
          const { text: shown, sources } = splitSources(raw);
          setMessages((prev) => prev.map((m) => (m.id === replyId ? { ...m, content: shown, sources } : m)));
        }
      } catch {
        setError('The connection dropped. Please try again.');
        setMessages((prev) => prev.filter((m) => m.id !== replyId || m.content));
      } finally {
        setBusy(false);
      }
    },
    [busy, messages, sessionId, personId, onSessionCreated]
  );

  const empty = messages.length === 0 && !loadingHistory;

  return (
    <div className="flex flex-col gap-4">
      {empty && starters && starters.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {starters.map((s) => (
            <button
              key={s.label}
              onClick={() => send(s.text)}
              className="min-h-[44px] rounded-xl border border-[color:var(--app-line)] bg-[color:var(--app-card)] px-4 py-3 text-left text-[15px] hover:bg-[color:var(--app-paper-2)]"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
      {loadingHistory && <p className="text-[15px] text-[color:var(--app-muted)]">Opening your conversation...</p>}
      {messages.length > 0 && (
        <div className={`flex flex-col gap-3 ${compact ? 'max-h-[60vh] overflow-y-auto pr-1' : ''}`}>
          {messages.map((m) => (
            <ChatMessage key={m.id} role={m.role} content={m.content} sources={m.sources} isLoading={busy && m.role === 'assistant' && !m.content} />
          ))}
          <div ref={endRef} />
        </div>
      )}
      {error && <Notice tone="error">{error}</Notice>}
      <ChatInput
        onSend={send}
        isLoading={busy}
        placeholder={personName ? `What's going on with ${personName}?` : messages.length ? 'Reply...' : 'Tell me what happened...'}
      />
    </div>
  );
}

/** Kept so older imports still work. */
export const StrategicChat = CoachChat;

type Session = { id: string; title: string | null; session_type: string; updated_at: string; lastMessage: string | null };

const STARTERS = [
  { label: 'The conversation I keep replaying at 3 a.m.', text: THREE_AM_STARTER },
  { label: 'Someone made me feel guilty and I gave in', text: 'Someone made me feel guilty and I gave in again. I want to understand what happened.' },
  { label: "I'm being asked to do more than my share", text: "I keep being asked to do more than my share, and I don't know how to say no without a fight." },
  { label: 'I want to ask for something I am owed', text: "There's something I'm owed (time, money, credit or respect) and I want to ask for it calmly." },
];

function when(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** The full Talk It Through screen: past conversations plus the coach. */
export function TalkItThroughView({ sessionId }: { sessionId?: string }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [active, setActive] = useState<string | null>(sessionId || null);
  const [chatKey, setChatKey] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/conversations');
      if (!res.ok) return;
      const d = await res.json();
      setSessions((d.sessions || []).filter((s: Session) => s.session_type === 'coach' || s.session_type === 'general' || s.session_type === 'person'));
    } catch {
      /* the list is optional */
    }
  }, []);

  useEffect(() => {
    if (user) void Promise.resolve().then(load);
  }, [user, load]);

  const startNew = () => {
    setActive(null);
    setChatKey((k) => k + 1);
    if (typeof window !== 'undefined') window.history.replaceState(null, '', '/app/chat');
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this conversation? This cannot be undone.')) return;
    const res = await apiFetch(`/api/conversations?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok) {
      setSessions((s) => s.filter((x) => x.id !== id));
      if (active === id) startNew();
    }
  };

  return (
    <div>
      <PageHeader
        kicker="Talk it through"
        title="The conversation you keep replaying."
        subtitle="Tell me what happened, in your own words. I'll ask one gentle question at a time, help you see what was going on, and find a calm thing you could say next time. Everything I suggest comes from the book."
        right={
          active ? (
            <Button variant="ghost" onClick={startNew}>
              <Plus className="h-4 w-4" /> New conversation
            </Button>
          ) : undefined
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <CoachChat
            key={chatKey}
            sessionId={active}
            starters={STARTERS}
            onSessionCreated={(id) => {
              setActive(id);
              if (typeof window !== 'undefined') window.history.replaceState(null, '', `/app/chat/${id}`);
              load();
            }}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <BookRef chapter={1} title="The 3 A.M. Replay" />
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-[color:var(--app-muted)]">
            This is a coach based on the book, not therapy. If you are ever in danger, call 911. US National Domestic Violence Hotline: 1-800-799-7233, or
            text START to 88788.
          </p>
        </div>
        <aside className="min-w-0">
          <Card className="!p-4">
            <Label>Your conversations</Label>
            {sessions.length === 0 ? (
              <p className="text-[14px] text-[color:var(--app-muted)]">Your past conversations will appear here.</p>
            ) : (
              <ul className="-mx-1 space-y-1">
                {sessions.slice(0, 30).map((s) => (
                  <li key={s.id} className="group flex items-center gap-1">
                    <Link
                      href={`/app/chat/${s.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActive(s.id);
                        setChatKey((k) => k + 1);
                        window.history.replaceState(null, '', `/app/chat/${s.id}`);
                      }}
                      className={`flex min-h-[44px] min-w-0 flex-1 items-start gap-2 rounded-lg px-2 py-2 hover:bg-[color:var(--app-paper-2)] ${
                        active === s.id ? 'bg-[color:var(--app-paper-2)]' : ''
                      }`}
                    >
                      <MessageCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[color:var(--app-muted)]" />
                      <span className="min-w-0">
                        <span className="block truncate text-[14px]">{s.title || 'Conversation'}</span>
                        <span className="block text-[12px] text-[color:var(--app-muted)]">{when(s.updated_at)}</span>
                      </span>
                    </Link>
                    <button
                      onClick={() => remove(s.id)}
                      aria-label="Delete conversation"
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-[color:var(--app-muted)] hover:bg-[color:var(--app-paper-2)]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
