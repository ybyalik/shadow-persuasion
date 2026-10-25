'use client';

/* Choice Check: the book's four questions as a short guided form, with an optional
   calm reflection (/api/choice-check). Checks are kept in this browser tab only
   (sessionStorage) until there is a table for them. New edition only (lib/edition.ts). */

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { IS_V3, KEY_CHAPTERS, chapterRef } from '@/lib/edition';
import { BookRef, Button, Card, Label, Notice, PageHeader, friendlyError, inputClass } from '@/components/app/ui';
import { ComingSoon } from '@/components/app/ComingSoon';
import type { ChoiceReflection } from '@/app/api/choice-check/route';

type Answers = { happened: string; assuming: string; owe: string; options: string };
type Check = { id: string; date: string; answers: Answers; reflection: ChoiceReflection | null };

const EMPTY: Answers = { happened: '', assuming: '', owe: '', options: '' };
const STORE = 'sp-choice-checks';

const QUESTIONS: { key: keyof Answers; q: string; help: string; placeholder: string }[] = [
  {
    key: 'happened',
    q: 'What happened?',
    help: 'Only what a camera would have recorded. Leave out what you think it meant.',
    placeholder: 'e.g. She sent one text at 11 p.m.: "Guess I know where I stand."',
  },
  {
    key: 'assuming',
    q: 'What am I assuming?',
    help: 'Name your story about their feelings or motives. Then write one or two other explanations. A sigh is not proof.',
    placeholder: "e.g. I'm assuming she's furious and thinks I'm selfish. Or she's tired and had a bad day. Or she wants me to ask what's wrong.",
  },
  {
    key: 'owe',
    q: 'What do I actually owe?',
    help: 'A promise you made? A fair reply? An apology for something specific? Caring that someone is hurt is different from owing them whatever would stop the hurt.',
    placeholder: "e.g. A kind reply. I don't owe her a change of plans.",
  },
  {
    key: 'options',
    q: 'What options do I have?',
    help: 'List at least three, including waiting. Then choose.',
    placeholder: 'e.g. Reply tomorrow. Send a short kind line tonight. Call her at the weekend.',
  },
];

function load(): Check[] {
  try {
    const raw = sessionStorage.getItem(STORE);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function store(list: Check[]) {
  try {
    sessionStorage.setItem(STORE, JSON.stringify(list.slice(0, 10)));
  } catch {
    // private mode or storage full: the check still works, it just isn't kept
  }
}

export default function ChoiceCheckPage() {
  if (!IS_V3) {
    return <ComingSoon title="Choice Check" body="Four short questions for when your feelings are racing ahead of the facts." />;
  }
  return <ChoiceCheck />;
}

function ChoiceCheck() {
  const [step, setStep] = useState(0); // 0 to 3 = questions, 4 = summary
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [current, setCurrent] = useState<string | null>(null); // id of the check on screen
  const [reflection, setReflection] = useState<ChoiceReflection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Check[]>([]);

  useEffect(() => {
    // Read this tab's earlier checks once, after the page is in the browser.
    setHistory(load());
  }, []);

  const q = QUESTIONS[step];
  const set = (v: string) => setAnswers((a) => ({ ...a, [q.key]: v }));

  const keep = (a: Answers, r: ChoiceReflection | null, id: string | null) => {
    const theId = id || `${Date.now()}`;
    const next: Check[] = [{ id: theId, date: new Date().toISOString(), answers: a, reflection: r }, ...history.filter((h) => h.id !== theId)];
    setHistory(next);
    store(next);
    setCurrent(theId);
  };

  const finish = () => {
    setStep(4);
    keep(answers, null, current);
    window.scrollTo({ top: 0 });
  };

  const reflect = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/choice-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      if (!res.ok) {
        setError(await friendlyError(res, "I couldn't put a reflection together just now. Please try again."));
        return;
      }
      const data = await res.json();
      setReflection(data.result);
      keep(answers, data.result, current);
    } catch {
      setError('Could not reach the app. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const startOver = () => {
    setAnswers(EMPTY);
    setReflection(null);
    setCurrent(null);
    setError(null);
    setStep(0);
  };

  const open = (c: Check) => {
    setAnswers(c.answers);
    setReflection(c.reflection);
    setCurrent(c.id);
    setError(null);
    setStep(4);
    window.scrollTo({ top: 0 });
  };

  const remove = (id: string) => {
    const next = history.filter((h) => h.id !== id);
    setHistory(next);
    store(next);
    if (current === id) startOver();
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PageHeader
        kicker="Slow it down"
        title="Choice Check"
        subtitle="Four questions for when your feelings are racing ahead of the facts. A late-night text, a guilt trip, a sudden deadline, or the urge to send a long apology."
      />

      <div className="space-y-4">
        {error && <Notice tone="error">{error}</Notice>}

        {step < 4 ? (
          <Card>
            <div className="mb-4 flex items-center gap-2" aria-label={`Question ${step + 1} of 4`}>
              {QUESTIONS.map((_, i) => (
                <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-[color:var(--app-ink)]' : 'bg-[color:var(--app-line)]'}`} />
              ))}
            </div>
            <Label>Question {step + 1} of 4</Label>
            <label className="block">
              <span className="app-serif block text-[26px] font-semibold leading-tight">{q.q}</span>
              <span className="mt-2 block text-[15px] leading-relaxed text-[color:var(--app-muted)]">{q.help}</span>
              <textarea
                key={q.key}
                autoFocus
                value={answers[q.key]}
                onChange={(e) => set(e.target.value)}
                placeholder={q.placeholder}
                rows={4}
                className={`${inputClass} mt-4`}
              />
            </label>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {step > 0 && (
                <Button variant="ghost" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              )}
              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)} disabled={step === 0 && !answers.happened.trim()}>
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={finish}>
                  <Check className="h-4 w-4" /> See my answers
                </Button>
              )}
              {step > 0 && step < 3 && !answers[q.key].trim() && <span className="text-[14px] text-[color:var(--app-muted)]">You can skip this one.</span>}
            </div>
          </Card>
        ) : (
          <>
            <Card>
              <Label>Your Choice Check</Label>
              <dl className="space-y-4">
                {QUESTIONS.map((x) => (
                  <div key={x.key}>
                    <dt className="text-[15px] font-semibold">{x.q}</dt>
                    <dd className="mt-0.5 whitespace-pre-wrap text-[16px] leading-relaxed text-[color:var(--app-muted)]">{answers[x.key] || 'Skipped'}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-[15px] leading-relaxed">Now choose. You don&apos;t have to answer anyone tonight to make a good choice.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {!reflection && (
                  <Button variant="gold" onClick={reflect} loading={loading}>
                    {!loading && <Sparkles className="h-4 w-4" />}
                    {loading ? 'Thinking it through...' : 'Get a calm second look'}
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setStep(0)}>
                  Edit answers
                </Button>
                <Button variant="ghost" onClick={startOver}>
                  <RotateCcw className="h-4 w-4" /> New check
                </Button>
              </div>
              {!reflection && (
                <p className="mt-3 text-[14px] text-[color:var(--app-muted)]">Optional. The app reads your answers and points out facts, guesses and options. It won&apos;t decide for you.</p>
              )}
            </Card>

            {reflection && (
              <Card>
                <Label>A second look</Label>
                {reflection.safety && (
                  <div className="mb-4">
                    <Notice tone="warn">{reflection.safety}</Notice>
                  </div>
                )}
                <p className="text-[16px] leading-relaxed">{reflection.reflection}</p>
                {reflection.otherExplanations.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[15px] font-semibold">Other ways to read it</p>
                    <ul className="mt-1 space-y-1 text-[16px] leading-relaxed">
                      {reflection.otherExplanations.map((x, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-[color:var(--app-muted)]">&bull;</span>
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {reflection.owe && (
                  <p className="mt-4 text-[16px] leading-relaxed">
                    <span className="font-semibold">What you owe, and what you don&apos;t:</span> {reflection.owe}
                  </p>
                )}
                {reflection.moreOptions.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[15px] font-semibold">More options</p>
                    <ul className="mt-1 space-y-1 text-[16px] leading-relaxed">
                      {reflection.moreOptions.map((x, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-[color:var(--app-muted)]">&bull;</span>
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {reflection.nextStep && (
                  <p className="mt-4 rounded-lg bg-[color:var(--app-paper-2)] px-4 py-3 text-[16px] leading-relaxed">
                    <span className="font-semibold">One small next step:</span> {reflection.nextStep}
                  </p>
                )}
                <p className="mt-4 text-[14px] text-[color:var(--app-muted)]">This is a second look, not a verdict. You know the people involved; the choice is yours.</p>
              </Card>
            )}
          </>
        )}

        <p className="text-[14px] leading-relaxed text-[color:var(--app-muted)]">
          If there is fear, threats, physical harm, stalking, or control of your money or devices, a checklist is not the answer. See{' '}
          {chapterRef(KEY_CHAPTERS.danger)}, and get help: the National Domestic Violence Hotline is 1-800-799-7233 (text START to 88788). In immediate danger, call 911.
        </p>

        {history.length > 0 && (
          <div className="pt-2">
            <Label>Earlier checks</Label>
            <p className="mb-2 text-[14px] text-[color:var(--app-muted)]">Kept only in this browser tab. They disappear when you close it.</p>
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="flex items-stretch gap-2">
                  <button
                    onClick={() => open(h)}
                    className="min-h-[44px] flex-1 rounded-lg border border-[color:var(--app-line)] bg-[color:var(--app-card)] px-4 py-3 text-left hover:bg-[color:var(--app-paper-2)]"
                  >
                    <p className="line-clamp-1 text-[15px] font-semibold">{h.answers.happened || 'Choice Check'}</p>
                    <p className="text-[13px] text-[color:var(--app-muted)]">
                      {new Date(h.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                      {h.reflection ? ' · with a second look' : ''}
                    </p>
                  </button>
                  <button
                    onClick={() => remove(h.id)}
                    aria-label="Remove this check"
                    className="flex min-w-[44px] items-center justify-center rounded-lg border border-[color:var(--app-line)] text-[color:var(--app-muted)] hover:text-[color:var(--app-oxblood)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2">
          <BookRef chapter={5} title="Stay Steady Without Going Cold" />
        </div>
      </div>
    </div>
  );
}
