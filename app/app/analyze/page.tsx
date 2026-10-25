'use client';

/* Decode a Message: the Decoder from the book. Paste a message or add
   screenshots, see the tactic named in plain words, get calm replies. */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, History, Send, Trash2, UserPlus } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { usePeople } from '@/components/app/PersonPicker';
import { ScreenshotUpload } from '@/components/app/ScreenshotUpload';
import { DecodeResultView } from '@/components/app/EnhancedAnalysisResult';
import { Button, Card, Label, Notice, PageHeader, friendlyError, inputClass } from '@/components/app/ui';
import type { DecodeResult } from '@/lib/prompts/in-the-moment';

const RELATIONS = ['partner', 'parent', 'boss', 'coworker', 'friend', 'ex', 'family', 'other'] as const;

type ChatMsg = { role: 'user' | 'assistant'; content: string };
type HistoryItem = {
  id: string;
  input_text: string;
  input_type: string;
  person_id: string | null;
  created_at: string;
  full_result: (Partial<DecodeResult> & { kind?: string; overallAssessment?: string }) | null;
  overall_assessment?: string;
};

const chip = (on: boolean) =>
  `min-h-[44px] rounded-full border px-4 text-[15px] capitalize transition-colors ${
    on
      ? 'border-[color:var(--app-ink)] bg-[color:var(--app-ink)] text-[color:var(--app-paper)]'
      : 'border-[color:var(--app-line)] hover:bg-[color:var(--app-paper-2)]'
  }`;

function isNewShape(r: unknown): r is DecodeResult {
  return !!r && typeof r === 'object' && typeof (r as DecodeResult).whatsHappening === 'string';
}

function shortDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function DecodePage() {
  const people = usePeople();

  // Input
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [relation, setRelation] = useState('');
  const [goal, setGoal] = useState('');
  const [personId, setPersonId] = useState('');

  // Result
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [oldNote, setOldNote] = useState<string | null>(null);
  const [decodedText, setDecodedText] = useState('');
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [savedTo, setSavedTo] = useState<string | null>(null);

  // Follow-up
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);

  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);

  const loadHistory = useCallback(async () => {
    try {
      const res = await apiFetch('/api/analyze/history?limit=20');
      if (!res.ok) return;
      const d = await res.json();
      setHistory(Array.isArray(d.analyses) ? d.analyses : []);
    } catch {
      /* history is optional */
    }
  }, []);

  const openSaved = useCallback(async (id: string) => {
    setError(null);
    try {
      const res = await apiFetch(`/api/analyze/history?id=${encodeURIComponent(id)}`);
      if (!res.ok) {
        setError(await friendlyError(res));
        return;
      }
      const { analysis } = await res.json();
      const fr = analysis.full_result;
      setDecodedText(analysis.input_text || '');
      setHistoryId(analysis.id);
      setSavedTo(analysis.person_id || null);
      setChat([]);
      if (isNewShape(fr)) {
        setResult(fr);
        setOldNote(null);
      } else {
        setResult(null);
        setOldNote(fr?.overallAssessment || 'This one was saved with an older version of the app, so only the message is shown. Decode it again for calm replies.');
      }
      setShowHistory(false);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch {
      setError('Could not open that one. Please try again.');
    }
  }, []);

  useEffect(() => {
    loadHistory();
    const id = new URLSearchParams(window.location.search).get('id');
    if (id) openSaved(id);
  }, [loadHistory, openSaved]);

  const decode = async () => {
    if (loading || (!text.trim() && files.length === 0)) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setOldNote(null);
    setChat([]);
    setSavedTo(null);
    try {
      let res: Response;
      if (files.length) {
        const form = new FormData();
        files.forEach((f, i) => form.append(`image_${i}`, f));
        if (text.trim()) form.append('text', text.trim());
        if (relation) form.append('relation', relation);
        if (goal.trim()) form.append('goal', goal.trim());
        if (personId) form.append('personId', personId);
        res = await apiFetch('/api/analyze', { method: 'POST', body: form });
      } else {
        res = await apiFetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text.trim(), relation, goal: goal.trim(), personId }),
        });
      }
      if (!res.ok) {
        setError(await friendlyError(res));
        return;
      }
      const d = await res.json();
      setResult(d.result);
      setDecodedText(d.transcript || text.trim());
      setHistoryId(d.id || null);
      setSavedTo(personId || null);
      loadHistory();
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch {
      setError('Could not reach the app. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const ask = async () => {
    const q = question.trim();
    if (!q || asking) return;
    const next: ChatMsg[] = [...chat, { role: 'user', content: q }];
    setChat([...next, { role: 'assistant', content: '' }]);
    setQuestion('');
    setAsking(true);
    try {
      const res = await apiFetch('/api/analyze/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalText: decodedText, result, messages: next }),
      });
      if (!res.ok || !res.body) {
        const msg = await friendlyError(res);
        setChat([...next, { role: 'assistant', content: msg }]);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setChat([...next, { role: 'assistant', content: answer }]);
      }
    } catch {
      setChat([...next, { role: 'assistant', content: 'Could not reach the app. Please try again.' }]);
    } finally {
      setAsking(false);
    }
  };

  const saveToPerson = async (pid: string) => {
    if (!pid) return;
    try {
      // Linking the saved decode is enough; if it wasn't saved, record just the tactic names on the person.
      const tactics = (result?.tactic || '')
        .split(/,|\bplus\b|\band\b/i)
        .map((t) => t.trim())
        .filter(Boolean);
      const res = historyId
        ? await apiFetch('/api/analyze/history', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: historyId, person_id: pid }),
          })
        : await apiFetch('/api/profiler/people', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: pid, addDecode: { tactics } }),
          });
      if (!res.ok) {
        setError(await friendlyError(res));
        return;
      }
      setSavedTo(pid);
      loadHistory();
    } catch {
      setError('Could not save that. Please try again.');
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Remove this from your saved decodes?')) return;
    try {
      const res = await apiFetch(`/api/analyze/history?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory((h) => h.filter((x) => x.id !== id));
        if (historyId === id) {
          setHistoryId(null);
          setResult(null);
          setOldNote(null);
        }
      }
    } catch {
      /* ignore */
    }
  };

  const reset = () => {
    setText('');
    setFiles([]);
    setResult(null);
    setOldNote(null);
    setChat([]);
    setHistoryId(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const savedName = savedTo ? people.find((p) => p.id === savedTo)?.name : null;
  const canDecode = !loading && (text.trim().length > 0 || files.length > 0);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        kicker="The Decoder"
        title="Decode a Message"
        subtitle="Paste a message, or add a screenshot of the conversation. See what's happening in plain words, and get a calm reply you can send."
        right={
          history.length > 0 ? (
            <Button variant="ghost" onClick={() => setShowHistory((s) => !s)}>
              <History className="h-4 w-4" /> Saved ({history.length})
            </Button>
          ) : undefined
        }
      />

      {showHistory && history.length > 0 && (
        <Card className="mb-6">
          <Label>Your saved decodes</Label>
          <ul className="divide-y divide-[color:var(--app-line)]">
            {history.map((h) => {
              const fr = h.full_result;
              const title = isNewShape(fr) ? fr.tactic || 'No pressure' : 'Older decode';
              const who = h.person_id ? people.find((p) => p.id === h.person_id)?.name : null;
              return (
                <li key={h.id} className="flex items-center gap-2">
                  <button type="button" onClick={() => openSaved(h.id)} className="min-h-[56px] min-w-0 flex-1 py-2 text-left">
                    <span className="block truncate text-[15px] font-semibold">{title}</span>
                    <span className="block truncate text-[14px] text-[color:var(--app-muted)]">
                      {shortDate(h.created_at)}
                      {who ? ` · ${who}` : ''} · {h.input_text || 'Screenshot'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(h.id)}
                    aria-label="Remove"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[color:var(--app-muted)] hover:bg-[color:var(--app-paper-2)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <Card>
        <label htmlFor="msg" className="block">
          <Label>Their message</Label>
        </label>
        <textarea
          id="msg"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') decode();
          }}
          rows={6}
          placeholder="Paste the message here. You can include a few messages back and forth."
          className={inputClass}
        />
        <div className="mt-3">
          <ScreenshotUpload files={files} onChange={setFiles} />
        </div>

        <div className="mt-6">
          <Label>Who is this from? (optional)</Label>
          <div className="flex flex-wrap gap-2">
            {RELATIONS.map((r) => (
              <button key={r} type="button" onClick={() => setRelation(relation === r ? '' : r)} className={chip(relation === r)}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {people.length > 0 && (
          <div className="mt-5">
            <label htmlFor="person">
              <Label>Someone in My People? (optional)</Label>
            </label>
            <select id="person" value={personId} onChange={(e) => setPersonId(e.target.value)} className={inputClass}>
              <option value="">No, or someone new</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.relationshipType ? ` (${p.relationshipType})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-5">
          <label htmlFor="goal">
            <Label>What do you want? (optional)</Label>
          </label>
          <input
            id="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="For example: say no without a fight, or keep the peace but stop lending money"
            className={inputClass}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={decode} loading={loading} disabled={!canDecode} className="w-full sm:w-auto">
            {loading ? (files.length ? 'Reading your screenshots...' : 'Reading it carefully...') : 'Decode it'}
          </Button>
          {(result || oldNote) && (
            <Button variant="ghost" onClick={reset} className="w-full sm:w-auto">
              Start a new one
            </Button>
          )}
        </div>
      </Card>

      {error && (
        <div className="mt-5">
          <Notice tone="error">{error}</Notice>
        </div>
      )}

      <div ref={resultRef} className="scroll-mt-6">
        {(result || oldNote) && decodedText && (
          <details className="mt-8 rounded-xl border border-[color:var(--app-line)] bg-[color:var(--app-card)] px-5 py-3">
            <summary className="flex min-h-[44px] cursor-pointer items-center justify-between gap-2 text-[15px] font-medium">
              The message we read <ChevronDown className="h-4 w-4" />
            </summary>
            <p className="mt-2 whitespace-pre-wrap pb-2 text-[15px] leading-relaxed text-[color:var(--app-muted)]">{decodedText}</p>
          </details>
        )}

        {oldNote && (
          <div className="mt-5">
            <Notice>{oldNote}</Notice>
          </div>
        )}

        {result && (
          <div className="mt-5 space-y-6">
            <DecodeResultView result={result} />

            {people.length > 0 && (
              <Card>
                <Label>Keep it with someone in My People</Label>
                {savedName ? (
                  <p className="text-[16px]">Saved to {savedName}.</p>
                ) : (
                  <div className="flex items-center gap-3">
                    <UserPlus className="h-5 w-5 shrink-0 text-[color:var(--app-muted)]" />
                    <select defaultValue="" onChange={(e) => saveToPerson(e.target.value)} className={inputClass} aria-label="Save to a person">
                      <option value="" disabled>
                        Choose a person
                      </option>
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </Card>
            )}

            <Card>
              <Label>Ask a follow-up question</Label>
              {chat.length > 0 && (
                <div className="mb-4 space-y-3">
                  {chat.map((m, i) => (
                    <div
                      key={i}
                      className={`whitespace-pre-wrap rounded-lg px-4 py-3 text-[16px] leading-relaxed ${
                        m.role === 'user' ? 'ml-6 bg-[color:var(--app-paper-2)]' : 'mr-6 border border-[color:var(--app-line)]'
                      }`}
                    >
                      {m.content || (asking && i === chat.length - 1 ? 'Thinking...' : '')}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') ask();
                  }}
                  placeholder="For example: what if they get angry when I say this?"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={ask}
                  disabled={!question.trim() || asking}
                  aria-label="Ask"
                  className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-lg bg-[color:var(--app-ink)] text-[color:var(--app-paper)] disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>

      <p className="mt-10 text-[13px] leading-relaxed text-[color:var(--app-muted)]">
        The Decoder helps you see pressure and answer calmly. It is not therapy or legal advice. If you ever feel unsafe, call 911 or the
        National Domestic Violence Hotline at 1-800-799-7233 (text START to 88788).
      </p>
    </div>
  );
}
