/**
 * The extra sections of a problem page (/b/[slug]), after the free tool and the first offer. Each page fills one
 * of these in app/p/sections/<slug>.ts. The components live in app/_sales; this only holds the words.
 *
 * Rules for every string: it is about THIS problem (no general 3 a.m. or "nice person" story), every reply,
 * tactic and quote comes from the book (book-v3/drafts), plain English, no em-dashes, and hooks pass
 * research/problems/directness-test.md. `[[words]]` marks the part to highlight or underline where noted.
 *
 * Icons (public/v2/icons): book briefcase calendar clock compass eye hand head hourglass house ice key lantern
 * learn moon pen push queen receipt rings rosette scissors shield smooth speech sprout weight.
 * Prints (public/v2/lino): calm contract crop-phone crop-replay desk door office part1 part4 path phone queen
 * replay strings table warm-garden warm-tea (all .jpg). Tactic art: t-charm t-group t-guilt t-intimidate
 * t-rewrite t-silence t-squeeze t-urgency.
 */

export type ProblemSections = {
  /** The moment it happens, as a timeline with a clock that follows the times. */
  replay: {
    kicker: string;
    title: string;
    /** 5 or 6 moments. `t` is shown ("Sun 4:02 p.m." or "9:14"); h and m drive the clock. `mark` = words to underline in red. */
    log: { t: string; h: number; m: number; line: string; mark?: string }[];
    outro: string;
    /** Small note under it, with {ref} replaced by the page reference. */
    note: string;
    noteRef: { ch: number; section: string };
  };
  /** The four-step loop diagram. */
  loop: {
    kicker: string;
    title: string;
    body: string[];
    /** Exactly 4 steps, clockwise. Icon from the list above. Keep each to 4 words or fewer. */
    steps: { icon: string; t: string }[];
    /** Text in the middle of the circle, 2 to 4 words. */
    center: string;
  };

  /** Tap-to-flip tactic cards: 4 to 8 moves from the book that the free tool does NOT already cover. */
  tactics: {
    kicker: string;
    title: string;
    lead: string;
    items: { name: string; ch: string; says: string; reply: string; art: string }[];
  };
  /** The big line beside the calm photo, near the end. */
  reset: { closeLine: string };
  /** PART V. Is it for you. 4 or 5 lines with icons; `[[words]]` highlighted. */
  forYou: { lines: [string, string][]; notFor: [string, string][] };
  /** What people usually try for this problem, and why it doesn't change it. 4 or 5. */
  alternatives: { kicker: string; title: string; items: [string, string][]; included: string[] };
  /** Free-chapter signup at the very end of the page, in this problem's terms. */
  freeChapter: { title: string; lead: string };
};
