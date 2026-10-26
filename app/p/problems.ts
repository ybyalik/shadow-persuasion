/**
 * One page per specific problem, at /b/[slug] (ads go straight here; /p/[slug] redirects). Copy lives in app/p/data/.
 * Every section is about this one problem: first screen (problem, promise, YES button), the free tool complete,
 * why it keeps happening, what the book adds for this exact problem (page-numbered bullets), real pages from the book,
 * who it's for, the shared offer and guarantee, this problem's FAQ, and a P.S.
 * Every hook and headline must pass research/problems/directness-test.md (in the shadow-persuasion research folder).
 * Every tool, reply and quote must come from the book (book-v3/drafts). Plain English, no em-dashes.
 */
import type { Excerpt } from '../b/SamplePage';
import narcParent from './data/narcissistic-parent';
import gaslighting from './data/gaslighting';
import narcEx from './data/narcissistic-ex';
import peoplePleasing from './data/people-pleasing';
import manipulation from './data/manipulation-tactics';
import silentTreatment from './data/silent-treatment';
import loveBombing from './data/love-bombing';
import ideaCredit from './data/idea-credit';
import twoJobs from './data/two-jobs';

/** A piece of the free tool or the bridge section. `**word**` in text renders bold; `==word==` renders highlighted. */
export type Block =
  /** A short paragraph. */
  | { kind: 'p'; text: string }
  /** A subheading inside the tool section. */
  | { kind: 'h'; text: string }
  /** A paper card: a template, message or worksheet to copy. Lines render as paragraphs. */
  | { kind: 'card'; title?: string; lines: string[] }
  /** Exact words to say: one or more lines, each optionally labeled (Warm, Direct, Final). */
  | { kind: 'say'; lines: { label?: string; text: string }[] }
  /** A numbered list of steps or options. */
  | { kind: 'steps'; items: { title: string; text: string }[] }
  /** A two-column list of short items. */
  | { kind: 'grid'; items: { title: string; text: string }[] }
  /** A bulleted list; `ref` adds a page reference to an item (chapter + exact ## or ### heading). */
  | { kind: 'list'; items: { text: string; ref?: { ch: number; section: string } }[] }
  /** A handwritten-style margin note. */
  | { kind: 'note'; text: string };

export type Problem = {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  /** Small all-caps line above the headline, like "FREE: 4 replies that work on a critical, guilt-tripping parent". */
  topBar: string;
  /** White headline lines. */
  h1: string[];
  /** Gold italic promise line under the headline. */
  h1Gold: string;
  /** One or two sentences under the headline. */
  lead: string;
  /** The small link at the top right that jumps to the free tool; names the deliverable, like "Read the 4 replies". */
  topLink: string;
  /** Button text in the first screen, like "YES! Show Me the 4 Replies". It jumps to the tool. */
  cta: string;
  /** Reassurance under the button, like "Free. No sign-up. Use them on the next call." */
  ctaNote: string;
  tool: { kicker: string; title: string; intro: string; blocks: Block[] };
  why: { kicker: string; title: string; intro: string; items: { title: string; text: string }[] };
  /** One line naming the chapter to read first, shown on the first offer, like "Start with Chapter 9 for the silent treatment." */
  startHere: string;
  bridge: { title: string; blocks: Block[] };
  pull: string;
  /** Honest limits and safety lines shown small near the end (one per entry). */
  limits: string[];
  /** What the book adds for THIS problem: page-numbered bullets (chapter + exact ## heading). */
  inside: { kicker: string; title: string; intro: string; items: { ch: number; section: string; text: string }[] };
  /** 2 to 3 word-for-word passages from the book. The first one is shown right after the bridge as proof; each must
   * stop before the scene the bridge, inside list or P.S. sells as book-only. */
  excerpts: Excerpt[];
  /** Headline over the offer, in this problem's terms, like "Get the book that answers her". */
  offerTitle: string;
  /** 5 to 8 questions this reader actually has about this problem. */
  faq: { q: string; a: string }[];
  /** Big closing line before the last buy button. */
  closeLine: string;
  /** P.S. text; `{ref}` is replaced with the page reference for psRef. */
  ps: string;
  psRef: { ch: number; section: string };
};

export const PROBLEMS: Problem[] = [narcParent, gaslighting, narcEx, peoplePleasing, manipulation, silentTreatment, loveBombing, ideaCredit, twoJobs];

export function getProblem(slug: string): Problem | undefined {
  return PROBLEMS.find((p) => p.slug === slug);
}
