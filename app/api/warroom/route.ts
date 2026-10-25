import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { aiChat, MODELS } from '@/lib/ai';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { searchKnowledge } from '@/lib/rag';
import { getPersonContext } from '@/lib/person-context';
import { HOTLINE, looksLikeDanger } from '@/lib/prompts/rehearse';
import { BOOK, byEdition } from '@/lib/edition';

/**
 * POST /api/warroom  ("Plan a Conversation")
 * The interactive version of the book's Hard Conversation Planner bonus
 * (v3 edition: The Conversation Planner; see lib/edition.ts).
 * Body: { counterpart, situation, goal, fear?, personId? } -> { result: Plan }
 */

export const maxDuration = 60;

export type Plan = {
  safety: string | null;
  fairerGoal: string | null;
  theirSide: { wants: string[]; need: string; meetItBy: string };
  openingLine: string;
  threeMoves: { move: string; how: string }[];
  pushback: { kind: string; theySay: string; youSay: string }[];
  bottomLine: string;
  wontDo: string;
  ifItGoesBadly: string;
  close: { goodEnding: string; lockIn: string; firstStep: string };
  breathe: string;
};

const IDEAS_V2 = `You help a kind, accommodating person plan a hard conversation, using the book ${BOOK.quotedWithAuthor}. This is the app version of the book's Hard Conversation Planner. The reader tends to over-explain, apologize, and give in when the other person sighs, pushes or goes quiet. Your plan gives them something calm to fall back on.

Use the book's ideas:
- Chapter 19: under every request is a core need: respect, safety, belonging, control, fairness, or being seen. Name the other person's likely need and a way to meet it without giving up the user's own.
- Chapter 21: open calmly, say what you want, then stop (the Strategic Pause). Name their feeling ("It sounds like..."). Ask "how" or "what" questions. Admit your own part first if it's genuine.
- Week 3, Hold: acknowledge, then hold. Repeat the same calm sentence instead of adding reasons. Let them be disappointed. Use a buffer ("Let me think about that and get back to you tomorrow").
- Part Three pressure: guilt, rewriting the past ("that's not what happened"), silence, anger, charm, fake urgency.
- Chapter 25: when you get a yes, keep it low-key, send a one-line written confirmation, agree one small first step, end on a warm last word.`;

const IDEAS_V3 = `You help a capable, kind person plan a hard conversation, using the book ${BOOK.quotedWithAuthor}. This is the app version of the book's Conversation Planner. The reader tends to over-explain, apologize, and give in when the other person sighs, pushes or goes quiet. Your plan gives them something calm to fall back on.

Use the book's ideas (and only these eight capitalised tool names: The Power Map; The Good Person Contract; The Choice Check; Notice, Pause, Hold; The Clean Ask; The Smallest Agreed Step; The No-Agreement Plan; The Four Fair Influence Tests):
- The Power Map (Chapter 2): who decides, what each person needs, and where authority, resources and alternatives sit. Check the user is talking to someone who can actually say yes.
- Chapter 12, Why People Push Back: people resist pressure, not just requests. They protect their choice, their control over the process, their standing, and their understanding. Name what this person is likely protecting and a way to respect it without giving up what the user wants.
- Chapter 13 and 14: check instead of guessing ("It sounds like... is that right?"), and ask questions that open the problem ("What would make this workable for you?").
- The Clean Ask (Chapter 17): say what you want, give the relevant reason, leave room for a real answer. One true reason is enough; the user's own needs count. If they would punish a no, it is a demand, not an ask.
- Week Three, Hold (Chapter 34): when pushed, say the same calm sentence again instead of adding reasons. Acknowledge disappointment once, then let it be. Use a buffer ("Let me think about that and get back to you tomorrow").
- Part II pressure: guilt and hidden debts (Ch 7), the story changing (Ch 8), silence and conditional warmth (Ch 9), charm and urgency (Ch 10).
- The No-Agreement Plan (Chapters 18 and 28): what the user will do if the answer is still no. It is their own next step, never a threat.
- The Smallest Agreed Step (Chapter 22): when you get a yes, agree one useful next action with clear agreement on exactly what it covers, and confirm it in a short message.
- Before the opening line, the Four Fair Influence Tests (Chapter 30): Is it honest? Do they know what they are agreeing to? Can they make a real choice without unfair pressure or punishment? Am I using my power responsibly?`;

const SYSTEM_PROMPT = `${byEdition({ v2: IDEAS_V2, v3: IDEAS_V3 })}

Respond with ONLY valid JSON in exactly this shape:
{
  "safety": <null, or if anything suggests real danger (violence, threats, stalking, fear for their safety), one kind sentence saying this planner isn't the right tool for a situation that may be unsafe and that their safety comes first>,
  "fairerGoal": <null, or if their goal involves tricking, controlling, punishing or exploiting the other person, one sentence offering a fair, honest version of the goal (and plan for that version)>,
  "theirSide": {
    "wants": ["<what they probably want, plain words>", "<a second thing>"],
    "need": "<the core need underneath, e.g. 'Fairness: they may feel they already do a lot'>",
    "meetItBy": "<one way to meet that need without giving up what the user wants>"
  },
  "openingLine": "<word for word, short and calm, no pre-apology, says what they want to talk about, then stops>",
  "threeMoves": [
    { "move": "<2 to 5 word name, e.g. 'Pause after you ask'>", "how": "<one sentence, specific to this conversation>" }
  ],
  "pushback": [
    { "kind": "<Guilt | Rewriting the past | Silence | Anger | Charm | Urgency | Their real objection>", "theySay": "<what they'll probably say, word for word>", "youSay": "<a calm, short reply: acknowledge, then hold>" }
  ],
  "bottomLine": "<the least the user will accept, or the line they won't move past, in their words>",
  "wontDo": "<the one trap they will not fall into, e.g. 'I won't say never mind if she goes quiet'>",
  "ifItGoesBadly": "<a calm exit line for when it's going badly, word for word, with a time to pick it up again>",
  "close": {
    "goodEnding": "<a warm last line if it goes well, word for word>",
    "lockIn": "<the one-line text or email to send afterward to confirm what was agreed, word for word>",
    "firstStep": "<one small concrete step to agree before they leave>"
  },
  "breathe": "<one short reminder to breathe out slowly and pause, tied to this conversation>"
}

Rules:
- Keep every field short: one or two sentences, lines people can say in one breath.
- threeMoves: exactly 3. pushback: 4 to 6 items, and always include Guilt, Rewriting the past, Silence and Anger, written the way THIS person would say them. If the user told you what they fear the other person will say, include that line first.
- Every line the user would say must sound like a calm, kind adult. Short sentences. No jargon, no war or spy words, no "tactics", no em-dashes.
- Fair influence only. Never suggest lying, guilt-tripping them back, threats, or exploiting their weak spots.
- If the user is vague, make sensible guesses from what they wrote. Don't invent facts like amounts or dates they didn't give; use placeholders like [date] instead.`;

export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);

    const body = await req.json().catch(() => ({}));
    const clip = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);
    let counterpart = clip(body?.counterpart, 200);
    const situation = clip(body?.situation, 1500);
    const goal = clip(body?.goal, 800);
    const fear = clip(body?.fear, 800);
    const personId = typeof body?.personId === 'string' ? body.personId : '';

    if (!situation || !goal) {
      return NextResponse.json(
        { error: "Tell me what the conversation is about and what you want from it, and I'll build your plan." },
        { status: 400 }
      );
    }

    let personBlock = '';
    if (personId) {
      const person = await getPersonContext(uid, personId);
      if (person) {
        if (!counterpart) counterpart = person.name;
        personBlock = `\n\nWhat the user already knows about ${person.name}:\n${person.summary}`;
      }
    }

    let bookContext = '';
    try {
      bookContext = await searchKnowledge(`${situation} ${goal} ${fear}`.slice(0, 800), { count: 4 });
    } catch {
      bookContext = '';
    }

    const userMsg = `${bookContext ? `Passages from the book that may help (use the ideas, don't quote at length):\n${bookContext}\n\n---\n` : ''}Who it's with: ${counterpart || 'the other person'}
What it's about: ${situation}
What I want to walk away with: ${goal}
What I'm afraid they'll say: ${fear || '(not given)'}${personBlock}`;

    const { data } = await aiChat<Plan>({
      userId: uid,
      feature: 'plan',
      model: MODELS.smart,
      temperature: 0.5,
      maxTokens: 2500,
      json: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMsg },
      ],
    });

    if (!data || !data.openingLine || !Array.isArray(data.pushback)) {
      return apiError("I couldn't put your plan together just now. Please try again.", 502, '[plan] bad AI output');
    }

    // Belt and braces: if the words clearly point to danger, always show the hotline.
    const danger = looksLikeDanger(`${situation} ${goal} ${fear}`);
    if (danger || data.safety) {
      data.safety = `${data.safety || 'Some of what you wrote sounds like it could be unsafe. Your safety comes first, and this planner is not the right tool for that.'} ${HOTLINE}`;
    }

    return NextResponse.json({ result: { ...data, counterpart: counterpart || null } });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError("I couldn't put your plan together just now. Please try again.", 500, '[plan]', err);
  }
}
