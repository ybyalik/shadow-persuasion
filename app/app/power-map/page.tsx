'use client';

/* Power Map builder: map one decision the way the book's Power Map worksheet does
   (The Power Map and Decision Cards, Card 1; Chapter 2, Read the Power Map).
   Saved maps use the power_maps table (supabase/migrations/034_power_maps.sql);
   until it exists the page still works and prints. New edition only (lib/edition.ts). */

import { useCallback, useEffect, useState } from 'react';
import { Bookmark, Check, Plus, Printer, RotateCcw, Trash2, X } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { CHAPTERS_V3, IS_V3, KEY_CHAPTERS, chapterRef } from '@/lib/edition';
import { BookRef, Button, Card, Label, Notice, PageHeader, friendlyError, inputClass } from '@/components/app/ui';
import { ComingSoon } from '@/components/app/ComingSoon';

type Basis = 'said' | 'seen' | 'guess';
type Person = { name: string; canDecide: string; need: string; needBasis: Basis; resources: string; knows: string; options: string };
type Me = { canDecide: string; need: string; contribute: string; options: string };
type MapData = { people: Person[]; me: Me; heard: string; factToCheck: string; nextStep: string };
type SavedMap = { id: string; decision: string; map: MapData; created_at: string; updated_at: string };

const NEW_PERSON: Person = { name: '', canDecide: '', need: '', needBasis: 'guess', resources: '', knows: '', options: '' };
const EMPTY_MAP: MapData = {
  people: [{ ...NEW_PERSON }, { ...NEW_PERSON }],
  me: { canDecide: '', need: '', contribute: '', options: '' },
  heard: '',
  factToCheck: '',
  nextStep: '',
};
const MAX_PEOPLE = 6;
const DRAFT = 'sp-power-map-draft';

const BASIS_LABEL: Record<Basis, string> = { said: 'They said it', seen: "I've seen it", guess: 'My guess (?)' };

const PERSON_FIELDS: { key: Exclude<keyof Person, 'name' | 'needBasis' | 'need'>; label: string; placeholder: string }[] = [
  { key: 'canDecide', label: 'Can decide', placeholder: 'e.g. Can move work around the team, but not approve pay' },
  { key: 'resources', label: 'Holds or needs these resources', placeholder: 'e.g. The budget; needs the bids out on time' },
  { key: 'knows', label: "Knows, or doesn't know", placeholder: "e.g. Doesn't know it takes ten hours a week (?)" },
  { key: 'options', label: "Their options if this doesn't happen", placeholder: 'e.g. Hire someone, hand it to someone else, or pay me' },
];

export default function PowerMapPage() {
  if (!IS_V3) {
    return <ComingSoon title="Power Map" body="Map one decision: who decides, what each person needs, and where authority, resources and alternatives sit." />;
  }
  return <PowerMapBuilder />;
}

function PowerMapBuilder() {
  const [decision, setDecision] = useState('');
  const [map, setMap] = useState<MapData>(EMPTY_MAP);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState<SavedMap[]>([]);
  const [available, setAvailable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadSaved = useCallback(async () => {
    try {
      const res = await apiFetch('/api/power-map');
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      if (Array.isArray(data.maps)) setSaved(data.maps);
      setAvailable(data.available !== false);
    } catch {
      // the saved list is optional
    }
  }, []);

  useEffect(() => {
    // Load the saved list and any unsaved draft from this tab once on open.
    loadSaved();
    try {
      const raw = sessionStorage.getItem(DRAFT);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && typeof d.decision === 'string' && d.map?.people) {
          setDecision(d.decision);
          setMap(d.map);
          setCurrentId(d.id || null);
        }
      }
    } catch {
      // no draft
    }
  }, [loadSaved]);

  // Keep an unsaved draft in this tab so a refresh doesn't lose it.
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT, JSON.stringify({ decision, map, id: currentId }));
    } catch {
      // storage blocked: fine
    }
  }, [decision, map, currentId]);

  const touch = () => {
    setDirty(true);
    setNotice(null);
  };
  const setPerson = (i: number, k: keyof Person, v: string) => {
    setMap((m) => ({ ...m, people: m.people.map((p, j) => (j === i ? { ...p, [k]: v } : p)) }));
    touch();
  };
  const setMe = (k: keyof Me, v: string) => {
    setMap((m) => ({ ...m, me: { ...m.me, [k]: v } }));
    touch();
  };
  const setTop = (k: 'heard' | 'factToCheck' | 'nextStep', v: string) => {
    setMap((m) => ({ ...m, [k]: v }));
    touch();
  };
  const addPerson = () => {
    setMap((m) => (m.people.length >= MAX_PEOPLE ? m : { ...m, people: [...m.people, { ...NEW_PERSON }] }));
    touch();
  };
  const removePerson = (i: number) => {
    setMap((m) => ({ ...m, people: m.people.filter((_, j) => j !== i) }));
    touch();
  };

  const save = async () => {
    if (!decision.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch('/api/power-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentId, decision, map }),
      });
      if (!res.ok) {
        if (res.status === 503) setAvailable(false);
        setError(await friendlyError(res, "Couldn't save your map. Please try again."));
        return;
      }
      const data = await res.json();
      setCurrentId(data.map?.id ?? currentId);
      setDirty(false);
      setNotice('Saved.');
      loadSaved();
    } catch {
      setError('Could not reach the app. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const startNew = () => {
    if (dirty && !window.confirm('Start a new map? Changes you have not saved will be lost.')) return;
    setDecision('');
    setMap(EMPTY_MAP);
    setCurrentId(null);
    setDirty(false);
    setError(null);
    setNotice(null);
    window.scrollTo({ top: 0 });
  };

  const open = (s: SavedMap) => {
    if (dirty && !window.confirm('Open this map? Changes you have not saved will be lost.')) return;
    setDecision(s.decision);
    setMap({ ...EMPTY_MAP, ...s.map, me: { ...EMPTY_MAP.me, ...s.map?.me }, people: s.map?.people?.length ? s.map.people : EMPTY_MAP.people });
    setCurrentId(s.id);
    setDirty(false);
    setError(null);
    setNotice(null);
    window.scrollTo({ top: 0 });
  };

  const remove = async (id: string) => {
    if (!window.confirm('Remove this saved map?')) return;
    const res = await apiFetch(`/api/power-map?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => null);
    if (res?.ok) {
      setSaved((list) => list.filter((m) => m.id !== id));
      if (currentId === id) setCurrentId(null);
    } else setError("Couldn't remove that map. Please try again.");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* ---------- The builder (screen) ---------- */}
      <div className="print:hidden">
        <PageHeader
          kicker="Map one decision"
          title="Power Map"
          subtitle="Who decides, what each person needs, and where authority, resources and alternatives sit. Write facts as facts. Mark anything you're guessing, especially guesses about motives."
        />

        <div className="space-y-4">
          <Notice>
            Keep this private. If someone checks your phone or accounts, map it in your head or on paper instead, and print rather than save. If there is fear, threats,
            physical harm, stalking, or control of your money or devices, a map is not the answer: see {chapterRef(KEY_CHAPTERS.danger)}.
          </Notice>

          {error && <Notice tone="error">{error}</Notice>}

          <Card>
            <label className="block">
              <span className="mb-1.5 block text-[15px] font-semibold">The decision</span>
              <span className="mb-2 block text-[14px] text-[color:var(--app-muted)]">Small enough to answer. One decision, not a whole relationship.</span>
              <input
                value={decision}
                onChange={(e) => {
                  setDecision(e.target.value);
                  touch();
                }}
                placeholder="e.g. Where we spend Thanksgiving this year"
                className={inputClass}
              />
            </label>
          </Card>

          {map.people.map((p, i) => (
            <Card key={i}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <Label className="!mb-0">Person {i + 1}</Label>
                {map.people.length > 1 && (
                  <button
                    onClick={() => removePerson(i)}
                    aria-label={`Remove person ${i + 1}`}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center text-[color:var(--app-muted)] hover:text-[color:var(--app-oxblood)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <TextField label="Who" value={p.name} onChange={(v) => setPerson(i, 'name', v)} placeholder="e.g. Lucille, my manager" />
                <div>
                  <TextField label="Needs" value={p.need} onChange={(v) => setPerson(i, 'need', v)} placeholder="e.g. Bids out on time" />
                  <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="How do you know?">
                    {(Object.keys(BASIS_LABEL) as Basis[]).map((b) => (
                      <button
                        key={b}
                        role="radio"
                        aria-checked={p.needBasis === b}
                        onClick={() => setPerson(i, 'needBasis', b)}
                        className={`min-h-[40px] rounded-full border px-3.5 text-[14px] transition-colors ${
                          p.needBasis === b
                            ? 'border-[color:var(--app-ink)] bg-[color:var(--app-ink)] text-[color:var(--app-paper)]'
                            : 'border-[color:var(--app-line)] hover:bg-[color:var(--app-paper-2)]'
                        }`}
                      >
                        {BASIS_LABEL[b]}
                      </button>
                    ))}
                  </div>
                </div>
                {PERSON_FIELDS.map((f) => (
                  <TextField key={f.key} label={f.label} value={p[f.key]} onChange={(v) => setPerson(i, f.key, v)} placeholder={f.placeholder} />
                ))}
              </div>
            </Card>
          ))}

          {map.people.length < MAX_PEOPLE && (
            <Button variant="ghost" onClick={addPerson}>
              <Plus className="h-4 w-4" /> Add a person
            </Button>
          )}

          <Card>
            <Label>Me</Label>
            <div className="space-y-4">
              <TextField label="What I can decide" value={map.me.canDecide} onChange={(v) => setMe('canDecide', v)} placeholder="e.g. What I keep doing, and what I stop" />
              <TextField label="What I need" value={map.me.need} onChange={(v) => setMe('need', v)} placeholder="e.g. My evenings back, or pay for the extra work" />
              <TextField
                label="What I contribute that this plan depends on"
                value={map.me.contribute}
                onChange={(v) => setMe('contribute', v)}
                placeholder="The ride, the room, the work, the money"
              />
              <TextField label="My real options, with their costs" value={map.me.options} onChange={(v) => setMe('options', v)} placeholder="e.g. Stop doing it (risky with HR); look elsewhere (takes months)" />
            </div>
          </Card>

          <Card>
            <div className="space-y-4">
              <TextField
                label="Who gets heard?"
                hint="Who talks to whom before decisions get made? Where does my information need to go?"
                value={map.heard}
                onChange={(v) => setTop('heard', v)}
                placeholder="e.g. Lucille checks pay questions with the operations director"
              />
              <TextField label="One fact I need to check" value={map.factToCheck} onChange={(v) => setTop('factToCheck', v)} placeholder="e.g. Is the estimator job being advertised?" />
              <TextField label="My next step" value={map.nextStep} onChange={(v) => setTop('nextStep', v)} placeholder="e.g. Ask HR who approves pay changes" />
            </div>
          </Card>

          <p className="text-[14px] leading-relaxed text-[color:var(--app-muted)]">
            A close relationship between two people may affect whose idea gets heard first. It doesn&apos;t prove a secret deal. A title shows formal authority, but needs,
            resources, relationships and information shape decisions too.
          </p>

          {!available && <Notice>Saving maps isn&apos;t switched on yet. You can still fill this in and print it.</Notice>}
          {notice && !dirty && <p className="text-[15px] text-[color:var(--app-muted)]">{notice}</p>}

          <div className="flex flex-wrap gap-3">
            {available && (
              <Button onClick={save} loading={saving} disabled={!decision.trim() || (Boolean(currentId) && !dirty)}>
                {currentId && !dirty ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                {currentId ? (dirty ? 'Save changes' : 'Saved') : 'Save this map'}
              </Button>
            )}
            <Button variant="ghost" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button variant="ghost" onClick={startNew}>
              <RotateCcw className="h-4 w-4" /> New map
            </Button>
          </div>

          {saved.length > 0 && (
            <div className="pt-4">
              <Label>Your saved maps</Label>
              <div className="space-y-2">
                {saved.map((s) => (
                  <div key={s.id} className="flex items-stretch gap-2">
                    <button
                      onClick={() => open(s)}
                      className="min-h-[44px] flex-1 rounded-lg border border-[color:var(--app-line)] bg-[color:var(--app-card)] px-4 py-3 text-left hover:bg-[color:var(--app-paper-2)]"
                    >
                      <p className="line-clamp-1 text-[15px] font-semibold">{s.decision}</p>
                      <p className="text-[13px] text-[color:var(--app-muted)]">
                        {new Date(s.updated_at || s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </button>
                    <button
                      onClick={() => remove(s.id)}
                      aria-label="Remove saved map"
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
            <BookRef chapter={2} title={CHAPTERS_V3[2]} />
          </div>
        </div>
      </div>

      {/* ---------- The printed worksheet ---------- */}
      <PrintSheet decision={decision} map={map} />
    </div>
  );
}

function TextField({ label, hint, value, onChange, placeholder }: { label: string; hint?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[15px] font-semibold">{label}</span>
      {hint && <span className="mb-2 block text-[14px] text-[color:var(--app-muted)]">{hint}</span>}
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} />
    </label>
  );
}

/** Black-on-white version for paper. Empty answers print as lines to write on. */
function PrintSheet({ decision, map }: { decision: string; map: MapData }) {
  const line = (v: string) => v.trim() || ' ';
  const row = (k: string, v: string) => (
    <div key={k} className="mb-2 break-inside-avoid">
      <p className="text-[11pt] font-semibold">{k}</p>
      <p className="min-h-[1.4em] border-b border-black pb-0.5 text-[11pt]">{line(v)}</p>
    </div>
  );
  return (
    <div className="hidden bg-white text-black print:block">
      <p className="text-[10pt] uppercase tracking-widest">The Power Map</p>
      <h1 className="mb-1 mt-1 text-[18pt] font-semibold">{decision.trim() || 'The decision: ____________________'}</h1>
      <p className="mb-4 text-[9pt]">Keep this private. Write facts as facts; put a ? beside guesses. {chapterRef(2)}.</p>
      {map.people.map((p, i) => (
        <div key={i} className="mb-4 break-inside-avoid">
          <p className="mb-1 text-[12pt] font-semibold">
            Person {i + 1}: {p.name.trim() || '____________________'}
          </p>
          {row("Can decide", p.canDecide)}
          {row(`Needs (${p.needBasis === 'guess' ? '?' : p.needBasis})`, p.need)}
          {row("Holds or needs these resources", p.resources)}
          {row("Knows, or doesn't know", p.knows)}
          {row("Their options if this doesn't happen", p.options)}
        </div>
      ))}
      <div className="mb-4 break-inside-avoid">
        <p className="mb-1 text-[12pt] font-semibold">Me</p>
        {row("What I can decide", map.me.canDecide)}
        {row("What I need", map.me.need)}
        {row("What I contribute that this plan depends on", map.me.contribute)}
        {row("My real options, with their costs", map.me.options)}
      </div>
      {row("Who gets heard?", map.heard)}
      {row("One fact I need to check", map.factToCheck)}
      {row("My next step", map.nextStep)}
    </div>
  );
}
