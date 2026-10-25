import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/access';
import { apiError, passthroughAuthError } from '@/lib/api-error';
import { aiStream, MODELS } from '@/lib/ai';
import { passageLabel, searchBook, supabase } from '@/lib/rag';
import { TOOLS_V3_RULE, byEdition } from '@/lib/edition';
import { getPersonContext } from '@/lib/person-context';
import { HOTLINE, VOICE_RULES, mapInteraction, normalizeRelationship, playbookFor, soundsUnsafe } from '@/lib/prompts/your-life';

/**
 * Talk It Through: a calm coach that answers from the book.
 * Streams plain text; when it finishes, appends <!--SOURCES:[...]--> with the
 * chapters it drew on. Saves both sides to chat_sessions / chat_messages.
 * With personId, it becomes the "talk about [name]" chat on a person's page.
 */

export const maxDuration = 60;

type CoachSource = { chapter: string; book: string };

const COACH_SYSTEM = `${VOICE_RULES}

YOUR ROLE
You are "Talk It Through", the reader's calm coach. People come to you with the conversation they keep replaying at 3 a.m., or any situation where someone is pressuring, guilt-tripping, ignoring or using them.

HOW TO HELP
- Listen first. Reflect back in one sentence what you heard, so they feel understood.
- When it helps, ask ONE gentle question at a time (never a list of questions). If you ask a question, make it the last line of your reply and keep the rest brief, so they can answer it. Good questions come from ${byEdition({ v2: "Chapter 1's 3 a.m. exercise", v3: "the replay exercise (Chapter 4, and Day 4 of the Reset)" })}: Who was it, and where were you? What did they actually say? What did you say or do? What do you wish you had said? What were you afraid would happen if you had said it? What did they get (your time, your agreement, your silence, the last word)?
- Once you understand, name what was happening in plain words (the book's tactic name if one clearly fits), and offer one short, calm reply they could use next time. Short and calm beats sharp: the 3 a.m. line is almost never the one that works.
- Answer from the book. Use the passages given below; mention the chapter naturally when useful, like "${byEdition({ v2: 'Chapter 11 calls this the ledger.', v3: 'Chapter 7 calls this the ledger.' })}"
- Keep replies short: usually 60 to 160 words. Use short paragraphs, and a list only when giving a few options.
- Be kind about the reader's own part (saying yes on the spot, over-explaining) without blame.
- Never encourage revenge, tricks or manipulation. If they ask for that, gently offer the fair version (${byEdition({ v2: 'Chapter 26', v3: 'Chapter 30, Power Without Becoming What You Resent' })}).${byEdition({ v2: '', v3: '\n- ' + TOOLS_V3_RULE.replace(/\n/g, '\n  ') })}
- Do not use headings like "Situation analysis" or "Tactical response". Talk like a wise, warm friend who has read the book closely.`;

type Msg = { role: 'user' | 'assistant'; content: string };

export async function POST(req: NextRequest) {
  try {
    const { uid } = await requireAppUser(req);
    const body = await req.json().catch(() => ({}));
    const session_id: string | null = typeof body?.session_id === 'string' && body.session_id ? body.session_id : null;
    const personId: string | null = typeof body?.personId === 'string' && body.personId ? body.personId : null;
    const messages: Msg[] = (Array.isArray(body?.messages) ? body.messages : [])
      .filter((m: Msg) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .map((m: Msg) => ({ role: m.role, content: m.content.replace(/<!--SOURCES:[\s\S]*?-->/g, '').slice(0, 6000) }));

    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return NextResponse.json({ error: 'Type a message to start.' }, { status: 400 });

    // Only write into a conversation that belongs to this reader.
    let activeSessionId = session_id;
    if (activeSessionId) {
      const { data: owned } = await supabase.from('chat_sessions').select('id').eq('id', activeSessionId).eq('user_id', uid).maybeSingle();
      if (!owned) return NextResponse.json({ error: 'We could not find that conversation.' }, { status: 404 });
    }

    // Who this is about (optional).
    let personBlock = '';
    let personName: string | null = null;
    if (personId) {
      const person = await getPersonContext(uid, personId);
      if (person) {
        personName = person.name;
        const { data: row } = await supabase
          .from('user_profiles_people')
          .select('relationship_type, interactions')
          .eq('id', personId)
          .eq('user_id', uid)
          .maybeSingle();
        const recent = (Array.isArray(row?.interactions) ? row.interactions : [])
          .map(mapInteraction)
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 6)
          .map((i) => `- ${i.date.slice(0, 10)}: ${i.whatHappened.slice(0, 240)}${i.tactics.length ? ` (${i.tactics.join(', ')})` : ''}`)
          .join('\n');
        const playbook = playbookFor(normalizeRelationship(row?.relationship_type));
        personBlock = `\n\nTHIS CONVERSATION IS ABOUT ${person.name.toUpperCase()}\n${person.summary}${recent ? `\nRecent moments the reader logged:\n${recent}` : ''}${playbook ? `\n\n${playbook}` : ''}`;
      }
    }

    // Search the book with the last two things the reader said (short replies like "yes" need context).
    const userTurns = messages.filter((m) => m.role === 'user');
    const query = userTurns
      .slice(-2)
      .map((m) => m.content)
      .join('\n')
      .slice(0, 1500);
    const passages = await searchBook(query, { count: 5, threshold: 0.28 });
    const sources: CoachSource[] = [];
    for (const p of passages) {
      const chapter = passageLabel(p);
      if (!sources.some((s) => s.chapter === chapter)) sources.push({ chapter, book: p.book });
    }
    const context = passages
      .map((p) => `[${passageLabel(p)}]\n${p.content}`)
      .join('\n\n---\n\n');

    const unsafe = soundsUnsafe(...userTurns.slice(-3).map((m) => m.content));
    const system = `${COACH_SYSTEM}${personBlock}${
      unsafe ? `\n\nIMPORTANT: The reader's words suggest they may be unsafe. Start your reply by saying so kindly and give: ${HOTLINE}` : ''
    }\n\nPASSAGES FROM THE BOOK (answer from these; do not quote at length):\n${context || '(No close passage found. Answer from the book\'s general approach: notice, pause, answer calmly, hold your line.)'}`;

    // Start the AI first so a spend-limit response can be returned as JSON.
    const stream = await aiStream({
      userId: uid,
      feature: personId ? 'coach:person' : 'coach',
      model: MODELS.fast,
      temperature: 0.6,
      maxTokens: 700,
      messages: [{ role: 'system', content: system }, ...messages.slice(-12)],
    });

    if (!activeSessionId) {
      const firstUser = userTurns[0]?.content || 'New conversation';
      const { data: created, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: uid,
          title: personName ? `About ${personName}: ${firstUser.slice(0, 60)}` : firstUser.slice(0, 80),
          session_type: personId ? 'person' : 'coach',
          person_id: personId,
        })
        .select('id')
        .single();
      if (error) console.error('[coach] could not create session', error.message);
      activeSessionId = created?.id ?? null;
    }

    if (activeSessionId) {
      const { error } = await supabase.from('chat_messages').insert({ session_id: activeSessionId, role: 'user', content: lastUser.content, user_id: uid });
      if (error) console.error('[coach] save user message failed', error.message);
    }

    const encoder = new TextEncoder();
    const sessionForSave = activeSessionId;
    const out = new ReadableStream({
      async start(controller) {
        let full = '';
        try {
          for await (const piece of stream) {
            full += piece;
            controller.enqueue(encoder.encode(piece));
          }
        } catch (e) {
          console.error('[coach] stream error', e);
          if (!full) {
            full = 'Sorry, I lost my train of thought. Please send that again.';
            controller.enqueue(encoder.encode(full));
          }
        }
        if (sources.length) controller.enqueue(encoder.encode(`\n\n<!--SOURCES:${JSON.stringify(sources)}-->`));
        controller.close();
        if (sessionForSave && full) {
          const { error } = await supabase.from('chat_messages').insert({
            session_id: sessionForSave,
            role: 'assistant',
            content: full,
            metadata: sources.length ? { sources } : {},
            user_id: uid,
          });
          if (error) console.error('[coach] save reply failed', error.message);
          await supabase.from('chat_sessions').update({ updated_at: new Date().toISOString() }).eq('id', sessionForSave).eq('user_id', uid);
        }
      },
    });

    return new Response(out, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        ...(activeSessionId ? { 'X-Session-Id': activeSessionId } : {}),
      },
    });
  } catch (err) {
    const f = passthroughAuthError(err);
    if (f) return f;
    return apiError('The coach is not available right now. Please try again.', 500, '[coach]', err);
  }
}
