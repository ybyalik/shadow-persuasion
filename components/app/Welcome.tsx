'use client';

/* The first-run welcome on Today (/app). Two short questions: what the reader wants
   help with (saved to user_profiles.goals) and how they'd like replies to sound
   (saved into the voice profile that Settings edits). Then a few places to start.
   Settings > "Show the welcome again" opens it with /app?welcome=1.
   Based on the old onboarding (git ae5e568, app/app/page.tsx), in the calm voice. */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { IS_V3, RESET } from '@/lib/edition';
import { Button, Card, Label, inputClass } from '@/components/app/ui';

export const WELCOME_DONE_KEY = 'sp-welcome-done';

type Start = { href: string; label: string; body: string };

const HELP: { id: string; label: string; start: Start }[] = [
  {
    id: 'say-no',
    label: 'Saying no without feeling guilty',
    start: { href: '/app/rewrite', label: 'Calm My Reply', body: 'Turn a reply full of apologies into a short, kind one.' },
  },
  {
    id: 'hard-talk',
    label: 'A hard conversation coming up',
    start: { href: '/app/warroom', label: 'Plan a Conversation', body: 'An opening line, calm answers to pushback, and a way to make it stick.' },
  },
  {
    id: 'pressure',
    label: 'Someone who keeps pushing or guilt-tripping me',
    start: { href: '/app/analyze', label: 'Decode a Message', body: 'Paste a text and see what is going on, in plain words.' },
  },
  {
    id: 'work',
    label: 'Being heard at work (pay, credit, workload)',
    start: IS_V3
      ? { href: '/app/power-map', label: 'Power Map', body: 'Work out who really decides, and what each person needs.' }
      : { href: '/app/warroom', label: 'Plan a Conversation', body: 'Get ready for the talk with your manager.' },
  },
  {
    id: 'family',
    label: 'Family roles and old guilt',
    start: { href: '/app/chat', label: 'Talk It Through', body: 'Think it over with a calm companion that knows the book.' },
  },
  {
    id: 'partner',
    label: 'A partner or an ex',
    start: { href: '/app/people', label: 'My People', body: 'Keep notes on one person and what helps with them.' },
  },
  {
    id: 'asking',
    label: 'Asking for what I want',
    start: IS_V3
      ? { href: '/app/tools#clean-ask', label: 'The Clean Ask', body: 'Say what you want, give the relevant reason, leave room for a real answer.' }
      : { href: '/app/spar', label: 'Rehearse It', body: 'Practice the ask out loud before the real thing.' },
  },
  {
    id: 'steady',
    label: 'Staying calm when my feelings race',
    start: IS_V3
      ? { href: '/app/choice-check', label: 'Choice Check', body: 'Four questions that slow things down before you answer.' }
      : { href: '/app/assist', label: 'Right Now', body: 'In the middle of it? Get a calm line to say.' },
  },
];

const HELP_IDS = new Set(HELP.map((h) => h.id));

/** The same tone words Settings uses, so the two stay in step. */
const TONES = ['Professional', 'Casual', 'Friendly', 'Direct', 'Diplomatic', 'Assertive', 'Warm'];

type Voice = { personality?: string; writingStyle?: string; tone?: string; sampleTexts?: string[] };

const chip = (on: boolean) =>
  `min-h-[44px] rounded-full border px-4 text-left text-[15px] transition-colors ${
    on ? 'border-[color:var(--app-ink)] bg-[color:var(--app-ink)] text-[color:var(--app-paper)]' : 'border-[color:var(--app-line)] hover:bg-[color:var(--app-paper-2)]'
  }`;

export function Welcome({ firstName, onDone }: { firstName?: string; onDone: () => void }) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [help, setHelp] = useState<string[]>([]);
  const [tones, setTones] = useState<string[]>([]);
  const [style, setStyle] = useState('');
  const [voice, setVoice] = useState<Voice>({});
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  // Fill in earlier answers when someone reopens the welcome from Settings.
  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/user')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const goals: unknown = d?.profile?.goals;
        if (!cancelled && Array.isArray(goals)) setHelp(goals.filter((g): g is string => typeof g === 'string' && HELP_IDS.has(g)));
      })
      .catch(() => {});
    apiFetch('/api/user/voice-profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const v: Voice = d?.voiceProfile || {};
        if (cancelled) return;
        setVoice(v);
        if (v.tone) setTones(v.tone.split(',').map((t) => t.trim()).filter((t) => TONES.includes(t)));
        if (v.writingStyle) setStyle(v.writingStyle);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const finish = () => {
    try {
      localStorage.setItem(WELCOME_DONE_KEY, '1');
      localStorage.removeItem('shadow-force-onboarding');
    } catch {
      // storage blocked: the welcome may show again, which is harmless
    }
    onDone();
  };

  const saveAnswers = async () => {
    setSaving(true);
    setSaveFailed(false);
    try {
      const results = await Promise.all([
        apiFetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goals: help }),
        }),
        // The voice profile is saved whole, so keep what Settings already holds.
        apiFetch('/api/user/voice-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personality: voice.personality || '',
            writingStyle: style.trim(),
            tone: tones.join(', '),
            sampleTexts: voice.sampleTexts || [],
          }),
        }),
      ]);
      if (results.some((r) => !r.ok)) setSaveFailed(true);
    } catch {
      setSaveFailed(true);
    } finally {
      setSaving(false);
      setStep(2);
    }
  };

  const starts = HELP.filter((h) => help.includes(h.id)).map((h) => h.start);
  const uniqueStarts = starts.filter((s, i) => starts.findIndex((x) => x.href === s.href) === i).slice(0, 3);
  const fallback: Start[] = [
    { href: '/app/analyze', label: 'Decode a Message', body: 'See what is really going on in a text or email.' },
    { href: '/app/warroom', label: 'Plan a Conversation', body: 'Know what to say before a hard talk.' },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <p className="app-type mb-2 text-[12px] uppercase tracking-[0.2em] text-[color:var(--app-accent)]">Welcome</p>
      <h1 className="app-serif text-[34px] font-semibold leading-[1.08] sm:text-[40px]">{firstName ? `Hello, ${firstName}.` : 'Hello.'}</h1>
      <p className="mt-3 text-[17px] leading-relaxed text-[color:var(--app-muted)]">
        Two quick questions so the app fits you. You can change your answers any time in Settings.
      </p>

      <div className="mb-6 mt-6 flex items-center gap-2" aria-label={`Step ${step + 1} of 3`}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-[color:var(--app-ink)]' : 'bg-[color:var(--app-line)]'}`} />
        ))}
      </div>

      {step === 0 && (
        <Card>
          <Label>1 of 2</Label>
          <h2 className="app-serif text-[24px] font-semibold leading-tight">What would you like help with?</h2>
          <p className="mt-1 text-[15px] text-[color:var(--app-muted)]">Pick as many as you like.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {HELP.map((h) => (
              <button key={h.id} type="button" aria-pressed={help.includes(h.id)} onClick={() => toggle(help, setHelp, h.id)} className={chip(help.includes(h.id))}>
                {h.label}
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button onClick={() => setStep(1)}>
              Next <ArrowRight className="h-4 w-4" />
            </Button>
            <button type="button" onClick={finish} className="min-h-[44px] px-2 text-[15px] text-[color:var(--app-muted)] hover:text-[color:var(--app-ink)]">
              Skip for now
            </button>
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <Label>2 of 2</Label>
          <h2 className="app-serif text-[24px] font-semibold leading-tight">How would you like replies to sound?</h2>
          <p className="mt-1 text-[15px] text-[color:var(--app-muted)]">The lines the app writes for you will lean this way. Pick one or two.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button key={t} type="button" aria-pressed={tones.includes(t)} onClick={() => toggle(tones, setTones, t)} className={chip(tones.includes(t))}>
                {t}
              </button>
            ))}
          </div>
          <label className="mt-5 block">
            <span className="mb-1.5 block text-[15px] font-semibold">Anything about how you usually write? (optional)</span>
            <input
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="e.g. Short sentences, no fancy words, a little dry"
              className={inputClass}
            />
          </label>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button variant="ghost" onClick={() => setStep(0)}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={saveAnswers} loading={saving}>
              {!saving && <Check className="h-4 w-4" />} {saving ? 'Saving...' : 'Done'}
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <Label>You&apos;re set</Label>
          <h2 className="app-serif text-[24px] font-semibold leading-tight">A good place to start</h2>
          {saveFailed && (
            <p className="mt-2 text-[15px] text-[color:var(--app-muted)]">We couldn&apos;t save your answers just now. You can set them later in Settings.</p>
          )}
          <div className="mt-4 space-y-2">
            {(uniqueStarts.length ? uniqueStarts : fallback).map((s) => (
              <Link
                key={s.href}
                href={s.href}
                onClick={finish}
                className="flex min-h-[44px] items-start justify-between gap-3 rounded-lg border border-[color:var(--app-line)] px-4 py-3 hover:bg-[color:var(--app-paper-2)]"
              >
                <span>
                  <span className="block text-[16px] font-semibold">{s.label}</span>
                  <span className="block text-[15px] leading-snug text-[color:var(--app-muted)]">{s.body}</span>
                </span>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0" />
              </Link>
            ))}
            <Link
              href="/app/field-ops"
              onClick={finish}
              className="flex min-h-[44px] items-start justify-between gap-3 rounded-lg border border-[color:var(--app-line)] px-4 py-3 hover:bg-[color:var(--app-paper-2)]"
            >
              <span>
                <span className="block text-[16px] font-semibold">{RESET.title}</span>
                <span className="block text-[15px] leading-snug text-[color:var(--app-muted)]">One small step a day, from {RESET.partLabel}.</span>
              </span>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0" />
            </Link>
          </div>
          <div className="mt-6">
            <Button onClick={finish}>Go to Today</Button>
          </div>
        </Card>
      )}

      <p className="mt-6 text-[14px] leading-relaxed text-[color:var(--app-muted)]">
        If someone is hurting you, threatening you, or you feel unsafe, this app isn&apos;t the right first step. In the US, the National Domestic Violence Hotline is
        1-800-799-7233 (text START to 88788). In immediate danger, call 911.
      </p>
    </div>
  );
}
