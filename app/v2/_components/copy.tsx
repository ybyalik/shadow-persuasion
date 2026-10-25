/**
 * Copy shared by the test versions. Every bullet points at a real section of the new book
 * (book-v3/book-full-draft.md). Page numbers are not final, so each bullet names a chapter and
 * the exact `##` section heading; pageRef.ts turns that into "Ch. N" now and "p. N" later.
 */

export type Fascination = { ch: number; section: string; text: React.ReactNode };

export const FASCINATIONS: Fascination[] = [
  { ch: 4, section: 'The replay is a signal', text: <>Why your mind replays the conversation you lost at 3 a.m., and why going blank in the moment is not a failure.</> },
  { ch: 3, section: 'The five clauses', text: <>The five unspoken rules that make kind people agree before they&apos;ve thought. Most readers find one or two that fit almost perfectly.</> },
  { ch: 3, section: 'What other people learn from you', text: <>Six small signals that teach people how much pressure it takes to change your mind. The most common one is also the easiest to change.</> },
  { ch: 31, section: 'Day 1: The pause', text: <>Day 1 of the Quick Start: the ordinary sentence that slows down an automatic yes. You don&apos;t have to say no at all.</> },
  { ch: 31, section: 'Day 3: One clean no, and one held silence', text: <>How to decline without an excuse, and why every reason past the first gives the other person something to argue with.</> },
  { ch: 7, section: 'When past help is treated as a debt', text: <>&ldquo;After everything I&apos;ve done for you&hellip;&rdquo; How to honor the past and still say no, and the one reply that turns it into a long argument about who owes whom.</> },
  { ch: 8, section: 'The common ways a story changes', text: <>&ldquo;That never happened.&rdquo; Seven ways a story gets rewritten, and how to answer without getting stuck in an argument about your memory.</> },
  { ch: 9, section: 'How to respond without chasing', text: <>Why silence after a disagreement is so hard to sit through, and how to respond without chasing or going silent back.</> },
  { ch: 10, section: 'Pleasant pressure', text: <>The compliment that arrives right before the request, and how to thank someone and still answer the request on its own.</> },
  { ch: 10, section: 'The slow squeeze', text: <>The slow squeeze: how &ldquo;just until I find a place&rdquo; becomes permanent, and why the time to put a date on &ldquo;temporary&rdquo; is at the start.</> },
  { ch: 24, section: 'When family or friends ask to borrow money', text: <>The relative who asks for a new loan while the last one is still open. The question to ask yourself before you answer, and the rule you&apos;re allowed to make.</> },
  { ch: 23, section: 'When someone repeats your idea in a meeting', text: <>When someone repeats your idea in a meeting: what to send before, what to say during, and the short note to send the same day.</> },
  { ch: 17, section: 'How to prepare an ask', text: <>How to prepare an ask: aim for the top of what you can honestly justify, know your best fallback, and set your limit before you walk in.</> },
  { ch: 26, section: 'The parent who still makes you feel small', text: <>The parent who still makes you feel small &ldquo;out of concern,&rdquo; and the exact words one woman used on her Sunday call.</> },
  { ch: 26, section: 'Caring for an aging parent without doing it all alone', text: <>Caring for an aging parent without doing it all alone: make the work visible, then hold a family call that ends with named commitments.</> },
  { ch: 25, section: 'After a separation: when your ex still controls everything', text: <>An ex who rewrites the pickup schedule by text: a brief, factual reply, and when to bring in a family lawyer.</> },
  { ch: 28, section: 'Name the kind of no you are facing', text: <>When they still say no: five kinds of no, from a plain refusal to silence as punishment, and why each one needs a different response.</> },
  { ch: 29, section: '"You\'ve changed"', text: <>What to say when someone tells you &ldquo;you&apos;ve changed.&rdquo; It is four words long.</> },
];

export const DOESNT_NEED: [string, string][] = [
  ['You don’t have to confront anyone.', 'Rule two of the Reset is “no big confrontations.” Small, steady changes are harder to argue with than one dramatic scene.'],
  ['You don’t have to become cold.', 'Chapter 5 is about staying steady without going cold. Most scripts come in a warm, a direct and a final version, so you choose the one that fits.'],
  ['You don’t have to feel confident first.', 'Chapter 4 calls it “always almost ready.” Feeling ready usually comes after you act, not before.'],
  ['You don’t have to cut anyone off.', 'Most of the book is about people you are keeping. Chapter 26 treats staying close, less contact and no contact as real choices that only you can weigh.'],
  ['You don’t need hours a day.', 'Most Reset practices take a few seconds in the moment and a few minutes of writing in the evening.'],
  ['You don’t need a diagnosis.', 'Chapter 6 shows how to judge a pattern (does it repeat, is there repair, what happens when you say no) without deciding whether someone is a narcissist.'],
];
