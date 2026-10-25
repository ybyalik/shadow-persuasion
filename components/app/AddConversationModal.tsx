'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button, Notice, inputClass } from '@/components/app/ui';

export type NewMoment = {
  date: string;
  whatHappened: string;
  whatTheySaid: string;
  whatISaid: string;
  howItWent: 'landed' | 'mixed' | 'didnt' | 'unsure';
};

const OPTIONS: { value: NewMoment['howItWent']; label: string }[] = [
  { value: 'landed', label: 'It went well' },
  { value: 'mixed', label: 'So-so' },
  { value: 'didnt', label: "Didn't go well" },
  { value: 'unsure', label: 'Not sure yet' },
];

/** "Log a moment" with someone: what happened, what was said, how it went. */
export function AddConversationModal({
  isOpen,
  onClose,
  personName,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  personName: string;
  onAdd: (moment: NewMoment) => Promise<string | null>;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<NewMoment>({ date: today, whatHappened: '', whatTheySaid: '', whatISaid: '', howItWent: 'unsure' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;
  const set = <K extends keyof NewMoment>(k: K, v: NewMoment[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.whatHappened.trim()) {
      setError('Tell us briefly what happened.');
      return;
    }
    setSaving(true);
    setError(null);
    const err = await onAdd({ ...form, date: new Date(`${form.date}T12:00:00`).toISOString() });
    setSaving(false);
    if (err) setError(err);
    else {
      setForm({ date: today, whatHappened: '', whatTheySaid: '', whatISaid: '', howItWent: 'unsure' });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={`Log a moment with ${personName}`}>
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-[color:var(--app-paper)] p-5 text-[color:var(--app-ink)] sm:rounded-2xl sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="app-serif text-[26px] font-semibold leading-tight">Log a moment with {personName}</h2>
            <p className="mt-1 text-[14px] text-[color:var(--app-muted)]">A few lines is plenty. Their actual words help the most.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg hover:bg-[color:var(--app-paper-2)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="m-what" className="mb-1.5 block text-[14px] font-medium">
              What happened?
            </label>
            <textarea id="m-what" rows={3} value={form.whatHappened} onChange={(e) => set('whatHappened', e.target.value)} className={inputClass} placeholder="She called asking me to host Thanksgiving again..." />
          </div>
          <div>
            <label htmlFor="m-they" className="mb-1.5 block text-[14px] font-medium">
              What did they say? <span className="font-normal text-[color:var(--app-muted)]">(optional)</span>
            </label>
            <textarea id="m-they" rows={2} value={form.whatTheySaid} onChange={(e) => set('whatTheySaid', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="m-me" className="mb-1.5 block text-[14px] font-medium">
              What did you say? <span className="font-normal text-[color:var(--app-muted)]">(optional)</span>
            </label>
            <textarea id="m-me" rows={2} value={form.whatISaid} onChange={(e) => set('whatISaid', e.target.value)} className={inputClass} />
          </div>
          <div>
            <p className="mb-1.5 text-[14px] font-medium">How did it go?</p>
            <div className="grid grid-cols-2 gap-2">
              {OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => set('howItWent', o.value)}
                  aria-pressed={form.howItWent === o.value}
                  className={`min-h-[44px] rounded-lg border px-3 text-[14px] ${
                    form.howItWent === o.value
                      ? 'border-[color:var(--app-ink)] bg-[color:var(--app-ink)] text-[color:var(--app-paper)]'
                      : 'border-[color:var(--app-line)] bg-[color:var(--app-card)]'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="m-date" className="mb-1.5 block text-[14px] font-medium">
              When
            </label>
            <input id="m-date" type="date" value={form.date} max={today} onChange={(e) => set('date', e.target.value || today)} className={inputClass} />
          </div>
          {error && <Notice tone="error">{error}</Notice>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={save} loading={saving}>
              Save this moment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
