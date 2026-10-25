'use client';

/**
 * Design options for review: 2 or 3 versions of each section the owner asked about.
 * Not linked from anywhere; the chosen versions get moved into /v2 afterwards.
 */

import { AppA1, AppA2, AppA3, FixesU1, FixesU2, FixesU3, ForF1, ForF2, ForF3, ForF4, ForF5, ForF6, ForF7, PartsP1, PartsP2, PartsP3, PartsP3Open, TacticGrid } from './round3';


/** Labels each option so the owner can say "A2" or "C1". */
function Option({ id, title, children, dark = false }: { id: string; title: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <section className={`relative ${dark ? 'bg-[color:var(--sp2-night)] text-[#efe7da]' : 'bg-[color:var(--sp2-paper)]'} sp2-grain border-t-4 border-[color:var(--sp2-ink)]`}>
      <div className="max-w-[1320px] mx-auto px-5 sm:px-10 pt-6">
        <span className="sp2-ui inline-flex items-center gap-2 bg-[color:var(--sp2-oxblood)] text-white text-[16px] font-bold px-3 py-1 rounded-[3px]">
          Option {id}
        </span>
        <span className={`sp2-ui ml-3 text-[16px] ${dark ? 'text-[#d8cfc1]' : 'text-[color:var(--sp2-muted)]'}`}>{title}</span>
      </div>
      <div className="max-w-[1320px] mx-auto px-5 sm:px-10 py-16 sm:py-20">{children}</div>
    </section>
  );
}

function Group({ letter, name }: { letter: string; name: string }) {
  return (
    <div className="bg-[color:var(--sp2-ink)] text-[#faf6ee] py-10">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-10">
        <p className="sp2-type text-[16px] tracking-[0.12em] text-[color:var(--sp2-gold)]">SECTION {letter}</p>
        <p className="sp2-display text-[40px] sm:text-[52px] leading-tight">{name}</p>
      </div>
    </div>
  );
}

/* ═══════════════ The page ═══════════════ */

export default function DesignOptions() {
  return (
    <main className="bg-[color:var(--sp2-paper)]">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-10 py-14">
        <p className="sp2-kicker">Design options</p>
        <h1 className="sp2-display text-[44px] sm:text-[64px] leading-tight">Pick one option per section</h1>
        <p className="sp2-lead mt-4 text-[color:var(--sp2-muted)] max-w-[36em]">
          Each section shows a few versions with a red label, like P1 or U2. Tell me the ones you like, or mix them.
        </p>
      </div>

      <Group letter="G" name="The eight tactics: same cards and flip, new card styles (no blurry shadow)" />
      <Option id="G1" title="Prints taped to the page: flat paper, thin ink border, a strip of tape">
        <TacticGrid style="tape" />
      </Option>
      <Option id="G2" title="Index cards: a red top rule, faint lines, and a stacked-card edge instead of a shadow">
        <TacticGrid style="index" />
      </Option>
      <Option id="G3" title="No cards: the prints sit right on the page, divided by thin lines; the reply replaces the quote">
        <TacticGrid style="open" />
      </Option>

      <Group letter="P" name="Four parts, in this order" />
      <Option id="P1" title="Four columns, an icon and one line each; the chapters open when you tap">
        <PartsP1 />
      </Option>
      <Option id="P2" title="Tabs with icons; one part at a time, shown like an open book">
        <PartsP2 />
      </Option>
      <Option id="P3" title="A staircase: each part is a step up, from protecting yourself to quiet power">
        <PartsP3 />
      </Option>
      <Option id="P4" title="NEW: the staircase with each description written out (no buttons)">
        <PartsP3Open />
      </Option>

      <Group letter="F" name="Is it for you?" />
      <Option id="F1" title="Two clean columns under a big ink check and cross; fewer, bigger lines">
        <ForF1 />
      </Option>
      <Option id="F2" title="Notes pinned to the page; the not-for-you list struck through">
        <ForF2 />
      </Option>
      <Option id="F3" title="One paragraph you read about yourself, key phrases highlighted">
        <ForF3 />
      </Option>
      <Option id="F4" title="In the U1 style: an icon per point, then the not-for-you list crossed out">
        <ForF4 />
      </Option>
      <Option id="F5" title="NEW: the F3 paragraph with a small icon starting each sentence, then the F4 bottom">
        <ForF5 />
      </Option>
      <Option id="F6" title="A row of five icons above the F3 paragraph, then the F4 bottom">
        <ForF6 />
      </Option>
      <Option id="F7" title="NEW: F5 with each sentence on its own line, icons in a column">
        <ForF7 />
      </Option>

      <Group letter="U" name="The usual fixes, and what actually changes it" />
      <Option id="U1" title="Five icons in a row, each fix crossed out, then what changes it">
        <FixesU1 />
      </Option>
      <Option id="U2" title="The fixes on a torn scrap, crossed out; the book beside it">
        <FixesU2 />
      </Option>
      <Option id="U3" title="One fix at a time; tap through to what actually works">
        <FixesU3 />
      </Option>

      <Group letter="A" name="Included: 60 days of the companion app (the phone)" />
      <Option id="A1" title="A real phone photo with hand-written notes pointing at the screen">
        <AppA1 />
      </Option>
      <Option id="A2" title="Three phones fanned out: Rehearse, Decode, Reset">
        <AppA2 />
      </Option>
      <Option id="A3" title="The live animated Decoder inside the real phone photo">
        <AppA3 />
      </Option>
    </main>
  );
}
