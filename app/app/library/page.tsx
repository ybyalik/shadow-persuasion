'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Copy, Download, Search } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { Button, Card, Label, Notice, PageHeader, friendlyError, inputClass } from '@/components/app/ui';

/* Shapes of lib/library/*.generated.json (built by funnel-v2/app-knowledge/build_library_v3.py). */
type Block = { heading: string; html: string };
type ReplyOption = { label: string; text: string };
type Reply = {
  number: number;
  title: string;
  short: string;
  group: string;
  tasks: string[];
  options: ReplyOption[];
  whenItFits: string;
  whenItFitsText: string;
};
type RepliesData = {
  title: string;
  subtitle: string;
  intro: Block[];
  groups: { name: string; note: string | null }[];
  tasks: { key: string; label: string; description: string }[];
  common: { label: string; text: string }[];
  replies: Reply[];
  outro: Block | null;
};
type Playbook = { number: number; title: string; lead: string | null; parts: Block[] };
type PlaybooksData = {
  title: string;
  subtitle: string | null;
  intro: Block[];
  sections: { number: number; title: string; intro: string | null; playbooks: Playbook[] }[];
  outro: Block | null;
};
type Link = { name: string; url: string };
type Offer = { name: string; description: string };
type LibraryResponse =
  | { available: false }
  | {
      available: true;
      owned: { replies: boolean; playbooks: boolean };
      preview: boolean;
      offers: { replies: Offer; playbooks: Offer };
      replies: RepliesData | null;
      playbooks: PlaybooksData | null;
      downloads: { replies: Link[]; playbooks: Link[] };
    };

type Tab = 'replies' | 'playbooks';

/** Styling for the HTML the build script made from the markdown (headings, lists, quotes, tables). */
const proseCls =
  'text-[16px] leading-relaxed [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 ' +
  '[&_strong]:font-semibold [&_blockquote]:my-4 [&_blockquote]:rounded-lg [&_blockquote]:border-l-4 [&_blockquote]:border-[color:var(--app-gold)] ' +
  '[&_blockquote]:bg-[color:var(--app-paper-2)] [&_blockquote]:px-4 [&_blockquote]:py-1 [&_h3]:mt-5 [&_h3]:text-[20px] [&_h3]:font-semibold ' +
  '[&_h4]:mt-4 [&_h4]:font-semibold [&_table]:my-4 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:text-[14px] ' +
  '[&_th]:border [&_th]:border-[color:var(--app-line)] [&_th]:bg-[color:var(--app-paper-2)] [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left ' +
  '[&_td]:border [&_td]:border-[color:var(--app-line)] [&_td]:px-2 [&_td]:py-1.5 [&_td]:align-top';

const tabCls = (on: boolean) =>
  `min-h-[44px] rounded-lg px-4 text-[15px] font-semibold transition-colors ${
    on ? 'bg-[color:var(--app-ink)] text-[color:var(--app-paper)]' : 'text-[color:var(--app-muted)] hover:bg-[color:var(--app-paper-2)]'
  }`;

const chipCls = (on: boolean) =>
  `min-h-[40px] rounded-full border px-4 text-[14px] transition-colors ${
    on
      ? 'border-[color:var(--app-ink)] bg-[color:var(--app-ink)] text-[color:var(--app-paper)]'
      : 'border-[color:var(--app-line)] bg-[color:var(--app-card)] text-[color:var(--app-muted)] hover:border-[color:var(--app-accent)]'
  }`;

/** Our own content, converted at build time from the add-on manuscripts. */
function Html({ html, className = '' }: { html: string; className?: string }) {
  return <div className={`${proseCls} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

function Downloads({ links }: { links: Link[] }) {
  if (!links.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <a
          key={l.url}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[color:var(--app-line)] px-4 text-[15px] font-semibold hover:bg-[color:var(--app-paper-2)]"
        >
          <Download className="h-4 w-4" /> Download the PDF{links.length > 1 ? `: ${l.name}` : ''}
        </a>
      ))}
    </div>
  );
}

function Intro({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-2">
      {blocks.map((b) => (
        <details key={b.heading} className="rounded-xl border border-[color:var(--app-line)] bg-[color:var(--app-card)] px-5 py-3">
          <summary className="min-h-[32px] cursor-pointer text-[16px] font-semibold">{b.heading}</summary>
          <Html html={b.html} />
        </details>
      ))}
    </div>
  );
}

function NotOwned({ offer }: { offer: Offer }) {
  return (
    <Card>
      <Label>Not in your library</Label>
      <h2 className="app-serif text-[24px] font-semibold">{offer.name}</h2>
      <p className="mt-2 text-[16px] leading-relaxed">{offer.description}</p>
      <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--app-muted)]">
        This is a paid add-on to the book. It isn&apos;t part of the app itself, so it shows here only for people who bought it.
      </p>
    </Card>
  );
}

export default function LibraryPage() {
  const [data, setData] = useState<LibraryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('replies');

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/library');
        if (!res.ok) {
          setError(await friendlyError(res, "We couldn't open your library. Please try again."));
          return;
        }
        const d: LibraryResponse = await res.json();
        setData(d);
        if (d.available && !d.replies && d.playbooks) setTab('playbooks');
      } catch {
        setError("We couldn't reach the server. Please check your connection.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const header = (
    <PageHeader
      kicker="Your library"
      title="Your library"
      subtitle="The add-ons you bought with the book, ready to read here. Search for the moment you're in, or download the PDF."
    />
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        {header}
        <p className="text-[color:var(--app-muted)]">Opening your library...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-4xl">
        {header}
        <Notice tone="error">{error || "We couldn't open your library. Please try again."}</Notice>
      </div>
    );
  }

  if (!data.available) {
    return (
      <div className="mx-auto max-w-4xl">
        {header}
        <Notice>There&apos;s nothing in your library yet. Your book and bonuses are in the download email you got after your purchase.</Notice>
      </div>
    );
  }

  const hasReplies = !!data.replies;
  const hasPlaybooks = !!data.playbooks;
  const nothing = !hasReplies && !hasPlaybooks;

  return (
    <div className="mx-auto max-w-4xl">
      {header}

      {data.preview && (
        <div className="mb-6">
          <Notice>Admin preview: you can see both add-ons here. Buyers see only the ones in their paid orders.</Notice>
        </div>
      )}

      {nothing ? (
        <div className="space-y-4">
          <p className="text-[16px] leading-relaxed text-[color:var(--app-muted)]">
            Your library holds the paid add-ons for the book. You don&apos;t have either one yet. Your book, the journal and the bonuses are in the
            download email you got after your purchase.
          </p>
          <NotOwned offer={data.offers.replies} />
          <NotOwned offer={data.offers.playbooks} />
        </div>
      ) : (
        <>
          <div className="mb-6 flex gap-2 rounded-xl border border-[color:var(--app-line)] bg-[color:var(--app-card)] p-1.5">
            <button type="button" className={`flex-1 ${tabCls(tab === 'replies')}`} onClick={() => setTab('replies')}>
              100 Replies
            </button>
            <button type="button" className={`flex-1 ${tabCls(tab === 'playbooks')}`} onClick={() => setTab('playbooks')}>
              Playbooks
            </button>
          </div>
          {tab === 'replies' ? (
            data.replies ? (
              <RepliesView data={data.replies} links={data.downloads.replies} />
            ) : (
              <NotOwned offer={data.offers.replies} />
            )
          ) : data.playbooks ? (
            <PlaybooksView data={data.playbooks} links={data.downloads.playbooks} />
          ) : (
            <NotOwned offer={data.offers.playbooks} />
          )}
        </>
      )}
    </div>
  );
}

/* ───────────── 100 Ready-to-Use Replies ───────────── */

function RepliesView({ data, links }: { data: RepliesData; links: Link[] }) {
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('All');
  const [task, setTask] = useState('all');
  const [numbers, setNumbers] = useState<{ label: string; set: Set<number> } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.replies.filter(
      (r) =>
        (group === 'All' || r.group === group) &&
        (task === 'all' || r.tasks.includes(task)) &&
        (!numbers || numbers.set.has(r.number)) &&
        (!term || [r.title, r.short, r.whenItFitsText, ...r.options.map((o) => o.text)].some((s) => s.toLowerCase().includes(term)))
    );
  }, [data.replies, q, group, task, numbers]);

  const taskLabel = (key: string) => data.tasks.find((t) => t.key === key)?.label ?? key;

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard not available */
    }
  };

  /** "45 to 52, 64" -> {45..52, 64} */
  const parseNumbers = (text: string) => {
    const set = new Set<number>();
    for (const part of text.split(',')) {
      const m = part.trim().match(/^(\d+)(?:\s+to\s+(\d+))?$/);
      if (!m) continue;
      const from = Number(m[1]);
      const to = m[2] ? Number(m[2]) : from;
      for (let n = from; n <= to; n++) set.add(n);
    }
    return set;
  };

  const reset = () => {
    setQ('');
    setGroup('All');
    setTask('all');
    setNumbers(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="app-serif text-[28px] font-semibold">{data.title}</h2>
        <p className="mt-1 text-[16px] text-[color:var(--app-muted)]">{data.subtitle}</p>
        <div className="mt-4">
          <Downloads links={links} />
        </div>
      </div>

      <Intro blocks={data.intro} />

      <Notice tone="warn">
        There are no scripts here for threats, violence or fear, on purpose. If someone is threatening you, hurting you, tracking you or controlling
        your money, read Chapter 11, When Pressure Becomes Danger. In immediate danger, call 911. US National Domestic Violence Hotline:
        1-800-799-7233, or text START to 88788. For thoughts of suicide or self-harm, call or text 988.
      </Notice>

      <div>
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--app-muted)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search, e.g. raise, ex, loan, group chat"
            className={`${inputClass} pl-10`}
            aria-label="Search the replies"
          />
        </div>
        <Label>By situation</Label>
        <div className="mb-3 flex flex-wrap gap-2">
          {['All', ...data.groups.map((g) => g.name)].map((g) => (
            <button key={g} type="button" className={chipCls(group === g)} onClick={() => setGroup(g)}>
              {g === 'All' ? 'All situations' : g}
            </button>
          ))}
        </div>
        <Label>By task</Label>
        <div className="mb-3 flex flex-wrap gap-2">
          <button type="button" className={chipCls(task === 'all')} onClick={() => setTask('all')}>
            Any task
          </button>
          {data.tasks.map((t) => (
            <button key={t.key} type="button" className={chipCls(task === t.key)} onClick={() => setTask(t.key)} title={t.description}>
              {t.label}
            </button>
          ))}
        </div>
        {data.common.length > 0 && (
          <>
            <Label>Common situations</Label>
            <div className="mb-3 flex flex-wrap gap-2">
              {data.common.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  className={chipCls(numbers?.label === c.label)}
                  onClick={() => setNumbers(numbers?.label === c.label ? null : { label: c.label, set: parseNumbers(c.text) })}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </>
        )}
        <p className="text-[14px] text-[color:var(--app-muted)]">
          Showing {shown.length} of {data.replies.length} replies.{' '}
          {(q || group !== 'All' || task !== 'all' || numbers) && (
            <button type="button" onClick={reset} className="underline underline-offset-2">
              Show all
            </button>
          )}
        </p>
      </div>

      {shown.length === 0 && <Notice>No replies match. Try a simpler word, or show all.</Notice>}

      <div className="space-y-4">
        {shown.map((r) => (
          <Card key={r.number}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="app-serif text-[21px] font-semibold leading-snug">
                {r.number}. {r.title}
              </h3>
            </div>
            <p className="app-type mt-1 text-[12px] uppercase tracking-[0.14em] text-[color:var(--app-accent)]">
              {r.group} · {r.tasks.map(taskLabel).join(', ')}
            </p>
            <div className="mt-4 space-y-3">
              {r.options.map((o, i) => {
                const key = `${r.number}-${i}`;
                return (
                  <div key={key} className="rounded-lg bg-[color:var(--app-paper-2)] px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <Label className="mb-1">{o.label}</Label>
                      <button
                        type="button"
                        onClick={() => copy(o.text, key)}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2 text-[13px] text-[color:var(--app-muted)] hover:bg-[color:var(--app-card)]"
                        aria-label="Copy this wording"
                      >
                        {copied === key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied === key ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="app-serif text-[19px] leading-snug">&ldquo;{o.text}&rdquo;</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-3">
              <Label className="mb-0">When it fits</Label>
              <Html html={r.whenItFits} className="[&_p]:mt-1" />
            </div>
          </Card>
        ))}
      </div>

      {data.outro && (
        <Card>
          <Label>{data.outro.heading}</Label>
          <Html html={data.outro.html} />
        </Card>
      )}
    </div>
  );
}

/* ───────────── The Applied Power Playbook Library ───────────── */

function PlaybooksView({ data, links }: { data: PlaybooksData; links: Link[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const all = useMemo(() => data.sections.flatMap((s) => s.playbooks.map((p) => ({ ...p, section: s.title }))), [data.sections]);
  const current = open ? all.find((p) => p.number === open) ?? null : null;

  const show = (n: number | null) => {
    setOpen(n);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (current) {
    const idx = all.findIndex((p) => p.number === current.number);
    const next = all[idx + 1];
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => show(null)}
          className="inline-flex min-h-[44px] items-center gap-2 text-[15px] text-[color:var(--app-muted)] hover:text-[color:var(--app-ink)]"
        >
          <ArrowLeft className="h-4 w-4" /> All playbooks
        </button>
        <div>
          <p className="app-type text-[12px] uppercase tracking-[0.18em] text-[color:var(--app-accent)]">{current.section}</p>
          <h2 className="app-serif mt-1 text-[30px] font-semibold leading-tight">
            {current.number}. {current.title}
          </h2>
        </div>
        {current.lead && <Html html={current.lead} />}
        <nav aria-label="In this playbook" className="flex flex-wrap gap-2">
          {current.parts.map((part, i) => (
            <a key={part.heading} href={`#part-${i}`} className={chipCls(false) + ' inline-flex items-center'}>
              {part.heading}
            </a>
          ))}
        </nav>
        {current.parts.map((part, i) => (
          <Card key={part.heading}>
            <h3 id={`part-${i}`} className="app-serif scroll-mt-24 text-[22px] font-semibold">
              {part.heading}
            </h3>
            <Html html={part.html} />
          </Card>
        ))}
        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" onClick={() => show(null)}>
            All playbooks
          </Button>
          {next && <Button onClick={() => show(next.number)}>Next: {next.title}</Button>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="app-serif text-[28px] font-semibold">{data.title}</h2>
        {data.subtitle && <p className="mt-1 text-[16px] text-[color:var(--app-muted)]">{data.subtitle}</p>}
        <div className="mt-4">
          <Downloads links={links} />
        </div>
      </div>

      <Intro blocks={data.intro} />

      {data.sections.map((s) => (
        <section key={s.number}>
          <h3 className="app-serif mb-1 text-[24px] font-semibold">
            Section {s.number}: {s.title}
          </h3>
          {s.intro && <Html html={s.intro} className="text-[color:var(--app-muted)] [&_p]:mt-0" />}
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {s.playbooks.map((p) => (
              <button
                key={p.number}
                type="button"
                onClick={() => show(p.number)}
                className="min-h-[64px] rounded-xl border border-[color:var(--app-line)] bg-[color:var(--app-card)] p-4 text-left transition-colors hover:border-[color:var(--app-accent)]"
              >
                <span className="app-type text-[11px] uppercase tracking-[0.16em] text-[color:var(--app-muted)]">Playbook {p.number}</span>
                <span className="app-serif mt-1 block text-[20px] font-semibold leading-snug">{p.title}</span>
              </button>
            ))}
          </div>
        </section>
      ))}

      {data.outro && (
        <Card>
          <Label>{data.outro.heading}</Label>
          <Html html={data.outro.html} />
        </Card>
      )}
    </div>
  );
}
