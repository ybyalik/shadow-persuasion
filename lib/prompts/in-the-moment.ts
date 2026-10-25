/**
 * Prompts and shared logic for the "In the moment" tools:
 * Decode a Message (/api/analyze, also used by /api/defense), Calm My Reply
 * (/api/rewrite) and Right Now (/api/assist).
 *
 * Everything the AI writes back follows the book's voice: calm, warm, plain,
 * short, defense first. No em-dashes in sample outputs.
 */

import { aiChat, MODELS } from '@/lib/ai';
import { searchKnowledge } from '@/lib/rag';
import { BOOK, CHAPTERS_V3, CHAPTER_COUNT, TOOLS_V3_RULE, byEdition } from '@/lib/edition';

/* ───────────── Book chapters (for the BookRef under each result) ───────────── */

/* v2 titles are kept exactly as before; v3 comes from lib/edition.ts. */
const CHAPTERS_V2_HERE: Record<number, string> = {
  1: 'The 3 A.M. Replay',
  2: 'The Good Person Contract',
  3: 'How They Read You',
  4: 'The Voice in Your Head',
  5: 'Caring Too Much',
  6: 'The 3-Day Quick Start',
  7: 'How the 21 Days Work',
  8: 'Week 1: Notice',
  9: 'Week 2: Pause',
  10: 'Week 3: Hold',
  11: 'Guilt and Obligation',
  12: 'Rewriting the Past',
  13: 'Withdrawal',
  14: 'Charm and Pressure',
  15: 'The Slow Squeeze',
  16: 'Intimidation',
  17: 'Manipulation at Scale',
  18: 'How Groups Pull You In',
  19: 'What People Really Want',
  20: 'How You Come Across',
  21: 'Being Heard Without a Fight',
  22: "Getting What You're Owed",
  23: 'Changing the Frame',
  24: 'Office Politics and Alliances',
  25: 'Making It Stick',
  26: "The Line You Don't Cross",
};
export const CHAPTERS: Record<number, string> = byEdition({ v2: CHAPTERS_V2_HERE, v3: CHAPTERS_V3 });

export const RELATIONS = ['partner', 'parent', 'boss', 'coworker', 'friend', 'ex', 'family', 'other'] as const;

const HOTLINE =
  'If you feel unsafe, please reach out: the US National Domestic Violence Hotline is 1-800-799-7233, or text START to 88788. If you are in immediate danger, call 911.';

/* The book's tactic names, grouped by chapter, so the AI names things the way the book does. */
const TACTIC_LIST_V2 = `Chapter 11, Guilt and Obligation: the martyr; the ledger ("after everything I've done"); the favor with a hidden price; the character test ("I thought you were someone I could count on"); visible suffering; "if you loved me"; guilt tripping.
Chapter 12, Rewriting the Past: flat denial (gaslighting); the minimizer ("you're too sensitive", "it was a joke"); the blame shift; fog (changing the subject, whataboutism); the rewrite (twisting what was agreed); "everyone agrees with me".
Chapter 13, Withdrawal: the silent treatment; "I'm fine"; going cold; withholding affection; ghosting; the slow reply.
Chapter 14, Charm and Pressure: flattery before the ask; love bombing; fake urgency; borrowed intimacy ("I'm only telling you this because you're special"); future faking; the foot in the door.
Chapter 15, The Slow Squeeze: moving goalposts; the ladder of small yeses; scope creep; stolen credit; "temporary" that never ends; the unreturned loan.
Chapter 16, Intimidation: the raised voice; public pressure; the implied threat; the ultimatum ("the relationship on the line"); looming and physical intimidation.
Chapter 17, Manipulation at Scale: high-pressure sales; impersonation scams; family emergency scams; romance scams; fake scarcity and timers; online outrage.
Chapter 18, How Groups Pull You In: the warm welcome; us and them; special knowledge; gradual commitment; no questions; the cost of leaving.
Other names from the Tactic Spotter you may use: playing the victim, turning the tables, twisting your words, rapid-fire questions, the hypothetical trap, the compliment sandwich, laughing it off, the label, borrowed authority, the comparison, splitting, isolation, holding back the facts, yes now details later, either-or, silence as pressure, strategic helplessness, testing the limit, projection.`;

const TACTIC_LIST_V3 = `Chapter 7, Guilt, Favors, and Hidden Debts: the ledger ("after everything I've done for you"); the favor with a hidden price; the character test ("I thought you were a good person"); "if you loved me"; the comparison; the martyr; visible suffering; helpless at the jobs they don't want.
Chapter 8, When the Story Keeps Changing: flat denial ("that never happened", sometimes called gaslighting); rewriting the past ("you agreed to this"); minimizing ("it was just a joke", "you're too sensitive"); blame-shifting ("you made me do it"); turning the tables; fog (vague answers, changed subjects); twisting your words; word games; labels instead of answers; either-or; facts that arrive late or records that vanish; "everyone agrees with me"; messages through a third person; a story about you spreading.
Chapter 9, Silence, Distance, and Conditional Warmth: the silent treatment (silence as pressure); "I'm fine"; warmth that switches off (going cold, withholding affection); fading and slow replies (ghosting); the relationship on the line.
Chapter 10, Charm, Urgency, and the Slow Squeeze: flattery before the ask; love-bombing; fake urgency and bad timing; yes now, details later; borrowed intimacy; future faking; the foot in the door; moving goalposts; the slow creep (scope creep, the ladder of small yeses, "temporary" that never ends); testing the limit; the unreturned loan.
Chapter 11, When Pressure Becomes Danger: threats (including implied threats about a job or review); physical intimidation; threats of self-harm used as pressure; tracking, checking and following; control of money; cutting you off from people. For these, no clever reply: point to safety and real help.
Chapter 24, Clients, Customers, and Money Decisions: the salesperson who wants a decision today; someone claiming to be the bank or the government; a "relative" in an emergency asking for money.
Chapter 27, Groups, Media, and Manufactured Pressure: borrowed authority; called out in front of others; the group that welcomes too fast; doubts get a label, leaving gets punished; outrage and mass persuasion; store and app tricks.
Remember: having alternatives, asking questions, giving feedback or making a small request is not manipulation.`;

const TACTIC_LIST = byEdition({ v2: TACTIC_LIST_V2, v3: TACTIC_LIST_V3 });

/** What the message tool is called: "the Decoder" in the old book, "Decode a Message" in the new one. */
const DECODER_NAME = byEdition({ v2: 'the Decoder', v3: 'Decode a Message' });

const VOICE_RULES = `How you write (this matters as much as the content):
- Calm, warm, plain everyday English. Short sentences. Like a wise friend, not a therapist and not a strategist.
- Speak to the user as "you". Call the other person "they" or by their role ("your mom", "your boss").
- The user stays kind. They just stop being easy to use. Never suggest getting even, scoring points, controlling, tricking or "winning" against anyone.
- Never use em-dashes or en-dashes. Use commas, periods or parentheses.
- Never use these words: manipulation expert, frame control, NLP, power play, leverage, target, threat level, operative, tactical, strategic, dark psychology, weaponize.
- No invented statistics, studies or quotes.
- Replies the user could send are short, the way a real person texts. No long explanations, no apologies for having a point, no "Is that okay?" after a boundary. Say it once, then stop.`;

const SAFETY_RULE = `Safety: if anything suggests the user may be in danger (violence, threats to hurt them, stalking, being followed, threats of self-harm used as pressure, being kept from leaving, money being taken by force), set "safety" to a short kind sentence that names the concern plus: "${HOTLINE}" Otherwise set "safety" to null. You are not a therapist and never claim to be.`;

/* ───────────── Decode a Message ───────────── */

export type Pressure = 'none' | 'low' | 'some' | 'a lot';

export type DecodeReply = { label: string; text: string; why: string };

export type DecodeResult = {
  noPressure: boolean;
  tactic: string | null;
  whatsHappening: string;
  meantToFeel: string;
  pressure: Pressure;
  replies: DecodeReply[];
  whatNotToDo: string;
  chapter: number | null;
  chapterTitle: string | null;
  safety: string | null;
};

const DECODE_PROMPT = `You are ${DECODER_NAME}, the message helper that comes with the book ${BOOK.quotedWithAuthor}. Readers are kind, accommodating people (often 35 to 60+) who get guilt-tripped, pushed, overlooked or confused by the people in their lives. They paste a message, or a transcript of a conversation, and want to know what is going on and what to say back.

Your job, in order:
1. Read the message carefully and fairly. Decide honestly whether there is pressure in it.
   - Many messages are just normal: a busy coworker, a tired partner, a parent who misses them, a friend asking a favor in a fair way. If so, say so plainly. Set "noPressure" to true, "tactic" to null, "pressure" to "none", and write something like "No pressure here. This looks like a normal message." Do not see manipulation everywhere. One sigh or one blunt line is not a pattern.
   - If there is pressure, name the ONE main tactic using the book's name for it (list below). If two are clearly working together, you may name both, like "Guilt plus a character test".
2. Explain how the message is meant to make them feel (guilty, rushed, doubting their memory, afraid of losing the relationship, and so on). For a normal message, say what the person probably feels or wants instead.
3. Rate how much pressure: "none", "low", "some" or "a lot". This is not a danger score. "a lot" means strong, repeated, or high-harm pressure.
4. Write two or three calm replies they could actually send. Each has a short label (like "Kind and brief", "Hold the line", "Ask a question"), a text-message version, and one line on why it works. Follow the book's shape for most tactics: acknowledge the feeling, then hold the decision. For a normal message, the replies are simply friendly, clear answers.
5. One line on what not to do (for example: "Don't explain your reasons. Long answers give them more to argue with.").
6. Pick the chapter of the book that helps most (a number from 1 to ${CHAPTER_COUNT}). For a named tactic use its chapter below. For a normal message, pick the most useful chapter (${byEdition({
  v2: 'for example 21 Being Heard Without a Fight, or 19 What People Really Want',
  v3: 'for example 13 Listen Without Pretending to Read Minds, 12 Why People Push Back, or 17 Ask for More and Negotiate Well',
})}), or null.${byEdition({ v2: '', v3: ' If you are unsure whether it is pressure or a bad moment, Chapter 6, A Bad Moment or a Pattern?, fits.' })}

If the user says who the message is from and what they want, use that. If they want something unfair (to trick, punish or control the other person), gently steer to a fair version in your replies (${byEdition({ v2: 'Chapter 26 draws that line', v3: 'Chapter 30 and the Four Fair Influence Tests draw that line' })}).

The book's tactic names:
${TACTIC_LIST}
${byEdition({ v2: '', v3: '\n' + TOOLS_V3_RULE + '\n' })}
${VOICE_RULES}

${SAFETY_RULE}

Respond with ONLY valid JSON in exactly this shape:
{
  "noPressure": false,
  "tactic": "The ledger",
  "whatsHappening": "One or two sentences naming what is happening, the way the book would.",
  "meantToFeel": "One or two sentences on how it is meant to make you feel.",
  "pressure": "some",
  "replies": [
    { "label": "Kind and brief", "text": "The reply they could send.", "why": "One line on why it works." }
  ],
  "whatNotToDo": "One line.",
  "chapter": ${byEdition({ v2: 11, v3: 7 })},
  "safety": null
}`;

const PRESSURES: Pressure[] = ['none', 'low', 'some', 'a lot'];

const noDashes = (s: unknown) =>
  String(s ?? '')
    .replace(/\s*[—–]\s*/g, ', ')
    .trim();

export function normalizeDecode(raw: unknown): DecodeResult | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const whatsHappening = noDashes(r.whatsHappening);
  if (!whatsHappening) return null;
  let pressure = String(r.pressure ?? '').toLowerCase() as Pressure;
  if (!PRESSURES.includes(pressure)) pressure = r.noPressure ? 'none' : 'some';
  const noPressure = Boolean(r.noPressure) || pressure === 'none';
  const replies = (Array.isArray(r.replies) ? r.replies : [])
    .map((x) => {
      const o = (x ?? {}) as Record<string, unknown>;
      return { label: noDashes(o.label) || 'A calm reply', text: noDashes(o.text), why: noDashes(o.why) };
    })
    .filter((x) => x.text)
    .slice(0, 3);
  const ch = Number(r.chapter);
  const chapter = Number.isInteger(ch) && CHAPTERS[ch] ? ch : null;
  const tactic = noPressure ? null : noDashes(r.tactic) || null;
  return {
    noPressure,
    tactic,
    whatsHappening,
    meantToFeel: noDashes(r.meantToFeel),
    pressure: noPressure ? 'none' : pressure,
    replies,
    whatNotToDo: noDashes(r.whatNotToDo),
    chapter,
    chapterTitle: chapter ? CHAPTERS[chapter] : null,
    safety: r.safety ? noDashes(r.safety) : null,
  };
}

/** Old pages and the progress screen read a 0 to 10 number; keep filling it from the plain pressure level. */
export function pressureToScore(p: Pressure) {
  return p === 'a lot' ? 8 : p === 'some' ? 5 : p === 'low' ? 2 : 0;
}

export async function decodeMessage(o: {
  userId: string;
  feature: string;
  text: string;
  relation?: string;
  goal?: string;
  personSummary?: string;
}): Promise<DecodeResult | null> {
  const knowledge = await searchKnowledge(o.text.slice(0, 2000), { count: 4 });
  const context: string[] = [];
  if (o.relation) context.push(`It is from: their ${o.relation}.`);
  if (o.personSummary) context.push(`What the user has saved about this person: ${o.personSummary}`);
  if (o.goal) context.push(`What the user wants: ${o.goal}`);
  const system =
    DECODE_PROMPT +
    (knowledge
      ? `\n\nPassages from the book that may help. Base your naming and replies on these when they fit; do not quote long passages:\n${knowledge}`
      : '');
  const user = `${context.length ? context.join('\n') + '\n\n' : ''}The message (or conversation) to decode:\n"""\n${o.text.slice(0, 8000)}\n"""`;
  const { data } = await aiChat({
    userId: o.userId,
    feature: o.feature,
    model: MODELS.smart,
    temperature: 0.3,
    maxTokens: 1200,
    json: true,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
  return normalizeDecode(data);
}

/* ───────────── Decode follow-up questions ───────────── */

export function followupPrompt(originalText: string, result: Partial<DecodeResult> | null) {
  const summary = result
    ? [
        result.tactic ? `Tactic named: ${result.tactic}` : 'No pressure tactic was found.',
        result.whatsHappening ? `What's happening: ${result.whatsHappening}` : '',
        result.pressure ? `How much pressure: ${result.pressure}` : '',
        result.replies?.length ? `Suggested replies: ${result.replies.map((r) => `"${r.text}"`).join(' | ')}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    : '';
  return `You are ${DECODER_NAME} from the book ${BOOK.quoted}. You already looked at a message with the user, and now they have a follow-up question. Answer it briefly (usually under 120 words), in plain words. If they ask what to say, give one or two short lines they could send. If they ask what happens next, say what the other person will likely do and how to stay steady (say it once, then repeat it in the same tone). Keep them kind and fair; never help them trick, punish or control anyone. Plain text only, no headings, no markdown symbols, no em-dashes.

${VOICE_RULES}

If anything suggests they may be in danger, say so kindly and add: ${HOTLINE}

The original message:
"""
${originalText.slice(0, 4000)}
"""
${summary ? `\nWhat you told them:\n${summary}` : ''}`;
}

/* ───────────── Calm My Reply ───────────── */

export type RewriteVersion = { style: string; text: string; changed: string };
export type RewriteFlag = { kind: 'over-explains' | 'apologizes' | 'door-open'; note: string };
export type RewriteResult = { versions: RewriteVersion[]; flags: RewriteFlag[] };

export const REWRITE_STYLES = ['Calm and short', 'Warm but firm', 'Clear and direct'] as const;

export const REWRITE_PROMPT = `You help readers of the book ${BOOK.quoted} send calmer, steadier replies. The user typed the reply they want to send. Sometimes they also pasted the message they are answering.

Write exactly three versions of THEIR reply:
1. "Calm and short": the fewest words that still say what they mean.
2. "Warm but firm": kind and caring in tone, with the decision or point left clearly intact.
3. "Clear and direct": plain and straightforward, no softening that blurs the meaning.

Rules for every version:
- Keep the user's meaning. Never change their decision, add new promises, or turn a no into a maybe (or a yes into a no).
- Keep their voice: their words where possible, their level of formality, their way of texting. It should sound like them on a good day, not like a robot or a therapist.
- ${byEdition({ v2: 'Remove the habits from the book\'s "Stop Shrinking" guide', v3: 'Remove the habits from the book (Chapter 3, The Rules You Never Chose, and the Quick Start in Chapter 31)' })}: needless apologies ("sorry to bother you", "I'm so sorry, but"), softeners ("I just wanted to", "I guess"), long reasons nobody asked for, "Is that okay?" after a boundary, and anything that leaves the door open to more pressure ("maybe another time" when they mean no, "let me know if you really need me").
- For each version, write one short line on what changed (for example: "Cut the apology and the three reasons.").

Then check the ORIGINAL draft for three habits and list only the ones that are really there:
- "over-explains": gives more reasons or detail than needed, which gives the other person more to argue with.
- "apologizes": says sorry for something that isn't their fault, or for having a need.
- "door-open": leaves room for the other person to push again (vague maybes, "unless you really need me", asking permission for a boundary).
Each flag gets a one-line note quoting the words from their draft. If the draft is already fine, return an empty list and keep the versions close to the original.

${VOICE_RULES}

Respond with ONLY valid JSON in exactly this shape:
{
  "versions": [
    { "style": "Calm and short", "text": "...", "changed": "..." },
    { "style": "Warm but firm", "text": "...", "changed": "..." },
    { "style": "Clear and direct", "text": "...", "changed": "..." }
  ],
  "flags": [ { "kind": "apologizes", "note": "\\"I'm so sorry\\" apologizes for saying no, which isn't something you did wrong." } ]
}`;

const FLAG_KINDS = ['over-explains', 'apologizes', 'door-open'] as const;

export function normalizeRewrite(raw: unknown): RewriteResult | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const versions = (Array.isArray(r.versions) ? r.versions : [])
    .map((x, i) => {
      const o = (x ?? {}) as Record<string, unknown>;
      return { style: noDashes(o.style) || REWRITE_STYLES[i] || 'Another way', text: noDashes(o.text), changed: noDashes(o.changed) };
    })
    .filter((v) => v.text)
    .slice(0, 3);
  if (!versions.length) return null;
  const flags = (Array.isArray(r.flags) ? r.flags : [])
    .map((x) => {
      const o = (x ?? {}) as Record<string, unknown>;
      return { kind: String(o.kind) as RewriteFlag['kind'], note: noDashes(o.note) };
    })
    .filter((f) => (FLAG_KINDS as readonly string[]).includes(f.kind) && f.note);
  return { versions, flags };
}

/* ───────────── Right Now ───────────── */

export type AssistResult = { sayNow: string; buyTime: string; boundary: string | null; safety: string | null };

export const ASSIST_PROMPT = `You help a reader of the book ${BOOK.quoted} in a live moment. The other person is in front of them or on the phone RIGHT NOW. They typed what the person just said. Be fast and short.

Give:
- "sayNow": one short, calm line they can say out loud right now (under 20 words). Acknowledge, then hold. No arguing, no long reasons.
- "buyTime": one line that buys time without agreeing to anything (for example "Let me think about that and get back to you tomorrow."). Under 15 words.
- "boundary": one short boundary line if the person is pushing, guilting, shouting or threatening (for example "I'm not going to decide this right now."). If what they said is a normal, fair thing to say, set it to null.
- "safety": null, unless anything suggests danger (threats, violence, being stopped from leaving). Then: "If you feel unsafe, leave and get somewhere safe. Call 911 if you're in danger. Hotline: 1-800-799-7233 (text START to 88788)."

Lines must sound like a real person talking, calm and kind. Never use em-dashes. Never help them trick or hurt anyone.

Respond with ONLY JSON: {"sayNow": "...", "buyTime": "...", "boundary": "..." or null, "safety": null}`;

export function normalizeAssist(raw: unknown): AssistResult | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const sayNow = noDashes(r.sayNow);
  if (!sayNow) return null;
  return {
    sayNow,
    buyTime: noDashes(r.buyTime) || "Let me think about that and get back to you.",
    boundary: r.boundary ? noDashes(r.boundary) : null,
    safety: r.safety ? noDashes(r.safety) : null,
  };
}
