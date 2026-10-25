"""Loads the 21 days of the 21-Day Power Reset from the NEW book (v3,
"Shadow Persuasion: The Hidden Rules of Power", Part VII) into the
reset_days_v3 table. The app reads that table only when
NEXT_PUBLIC_BOOK_EDITION=v3 (see lib/edition.ts, RESET).

Days 1-3:   Quick Start (Chapter 31, Your Three-Day Quick Start)
Days 4-7:   Week One: Notice (Chapter 32)
Days 8-14:  Week Two: Pause and Choose (Chapter 33)
Days 15-21: Week Three: Hold and Follow Through (Chapter 34)

Day titles, practices, morning notes and evening questions follow the book
(book-v3/drafts/ch31 to ch34). Days with no morning note in the book get a
general one. The four check-ins use the five statements from Chapter 31.

Safe to re-run: rows are upserted by day_number (people's progress is untouched).
It never touches the v2 tables (reset_days / reset_progress).

Usage:
  python3 funnel-v2/app-knowledge/seed_reset_days_v3.py --dry-run   # print only, no database
  python3 funnel-v2/app-knowledge/seed_reset_days_v3.py             # write (launch only)
Needs migration 031_reset_days_v3.sql applied first."""
import json, pathlib, sys, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]

GENERAL_MORNING = "Where do you expect to use this today?"
CH = {
    31: "Your Three-Day Quick Start",
    32: "Week One: Notice",
    33: "Week Two: Pause and Choose",
    34: "Week Three: Hold and Follow Through",
}
PHASE_CH = {"quick_start": 31, "notice": 32, "pause": 33, "hold": 34}
PHASE_LABEL = {"quick_start": "Quick Start", "notice": "Week One", "pause": "Week Two", "hold": "Week Three"}

CHECK_IN = (
    "Check-in: rate each statement from 0 to 10, by gut feeling. "
    "(1) I can say no without over-explaining. "
    "(2) I can let someone be disappointed in me without rushing to fix it. "
    "(3) I can stay calm when someone gets annoyed or upset with me. "
    "(4) I can ask for what I want directly. "
    "(5) I notice pressure while it's happening, not just afterward."
)

# (phase, title, practice, morning note, evening questions)
DAYS = [
    # ── Quick Start: Days 1 to 3 (Chapter 31) ──
    ("quick_start", "The pause",
     "Pause before answering requests you'd usually accept without thinking. When someone asks for something today, "
     "buy a little time: \"Let me check and get back to you,\" \"I need to look at my week first,\" or "
     "\"Give me an hour and I'll let you know.\" You can still say yes to every request later. "
     "The only thing you are changing today is the speed.",
     "Write \"Today I pause before an automatic yes,\" and the name of one person likely to ask you for something.",
     [CHECK_IN + " Write your scores before you start today.",
      "How many requests did you get? How many times did you pause, and how many times did a quick yes slip out?",
      "When you had time to think, did any answer change?",
      "How did people react to \"let me check\"? Write what happened, not what you feared."]),
    ("quick_start", "No unneeded apologies, and one small ask",
     "Drop the reflex \"sorry\" and swap it: \"Sorry to bother you\" becomes \"Do you have a minute?\", "
     "\"Sorry for the late reply\" becomes \"Thanks for waiting,\" unless you actually missed a deadline. "
     "Keep a tally of the ones you catch. Then ask for one small thing you expect to be refused, like a lower price "
     "or a table by the window. If they say no, say \"No problem, thanks for checking,\" and move on.",
     "Write down your small ask.",
     ["How many reflex apologies did you catch? Which swap felt strangest?",
      "What did you ask for, and what happened?",
      "What did the voice in your head predict before you asked? How close was it?"]),
    ("quick_start", "One clean no, and one held silence",
     "Decline one low-stakes request without an excuse, briefly and kindly: \"Thanks for thinking of me, but I can't make it,\" "
     "\"I'm going to pass on this one,\" or \"That doesn't work for me.\" Then stop talking. If they ask why, "
     "\"It just doesn't work for me this time\" is enough. Then, in one conversation, give yourself a moment before answering "
     "(\"Let me think\"). The pause is for thinking, not for making the other person uncomfortable.",
     "Write \"One clean no. One held silence,\" and what you might decline.",
     ["What did you decline, and what exact words did you use? Did reasons or apologies sneak in?",
      "How did the other person respond?",
      "Where did you hold a silence, and what happened during it?",
      "Read your three evening entries together. What did you find out that your fears didn't want you to know?"]),

    # ── Week One: Notice, Days 4 to 7 (Chapter 32) ──
    ("notice", "The yes count, and the conversation you keep replaying",
     "Count every time you agree to something: accepting a request, nodding along to an opinion you don't share, "
     "saying \"that's fine\" when it isn't. Mark each one M if you meant it or D if you didn't. You don't need to change "
     "any answers today. Just count. This evening, also write down one ordinary conversation from the past year that still stings "
     "(skip anything that feels overwhelming): what they said, what you said, what you wish you'd said, and what you were afraid of. "
     "You'll come back to it on Day 21.",
     "Write the name of one person you expect to ask you for something.",
     ["How many yeses did you count, and how many were D?",
      "Who got the most D answers from you?",
      "Pick one D. What did you fear would happen if you'd said no?",
      "Write your replay, in half a page."]),
    ("notice", "Catch your clause and your habits",
     "The Good Person Contract (Chapter 3) is the unspoken rules that turn kindness and duty into automatic self-sacrifice. "
     "Its five clauses: other people's feelings are your job; your needs are a burden; conflict means something went wrong; "
     "if you're good enough you'll be treated fairly; if you stop being nice you'll become one of them. Choose the clause that "
     "sounds most like you and write a one-line note each time you catch it. Also pick your two strongest habits (the instant yes, "
     "the long explanation, the reflex apology, filling the silence, the flinch when someone looks disappointed, the hunt for approval) "
     "and make a mark each time one appears.",
     "Write down your clause and your two habits.",
     ["How many times did your clause show up, and where: work, home, family or friends?",
      "What were your tallies for each habit?",
      "Write your clause again in a version you'd choose as an adult. \"Other people's feelings matter to me, and they are still theirs\" is one example."]),
    ("notice", "Draw one Power Map",
     "The Power Map (Chapter 2) shows who decides, what each person needs, and where authority, resources and alternatives sit. "
     "Map one decision where you keep giving in: one page, ten minutes. Write who decides what; what each person needs "
     "(guesses under a question mark); the resources and who supplies them, including you; who knows what; and each person's real options. "
     "Keep the map private: a shared notebook, laptop or photo backup is not a good place for notes about people close to you.",
     "Choose the situation you'll map, from your yes count or your replay.",
     ["What did you draw, and what surprised you?",
      "What do you supply that you had stopped counting?",
      "What is one fact you don't know yet and could find out?"]),
    ("notice", "The Choice Check, and your weekly review",
     "The Choice Check (Chapter 5) is four questions: What happened? What am I assuming? What do I actually owe? "
     "What options do I have? Use it on one moment today when you feel pulled to agree, fix or explain, in your head in the moment "
     "or on paper afterward. This evening, set aside twenty minutes for the review.",
     GENERAL_MORNING,
     ["Where did you use the Choice Check? Which question changed your answer, if any?",
      "Read back through Days 4 to 7. Write the three most important things you noticed about your own patterns.",
      "Which day was hardest? Which was easiest?",
      CHECK_IN + " Compare with your first scores. Don't worry if they barely moved. This week was about seeing."]),

    # ── Week Two: Pause and Choose, Days 8 to 14 (Chapter 33) ──
    ("pause", "Make the pause your normal answer",
     "Use a buffer for requests you'd usually accept before checking your time or wishes: \"Let me check and get back to you,\" "
     "\"I'll look at my week and let you know this afternoon,\" or \"Let me think about that.\" Your final answer can still be yes. "
     "Before a conversation you expect to be tense, breathe in normally, then let the breath out slowly and fully, "
     "a little longer than the breath in. Two or three times.",
     GENERAL_MORNING,
     ["How many times did you use a buffer? How many quick answers slipped out?",
      "Did any final answer differ from what you'd have said on the spot?",
      "Did anyone push back on the pause? What did you say?"]),
    ("pause", "The want check",
     "After the buffer, before you reply, ask yourself one question: \"If nobody would be disappointed either way, what would I choose?\" "
     "Sometimes the answer is yes, sometimes no, often \"yes, but not like that.\" You don't have to act on the answer today. "
     "Just find it and write it down.",
     GENERAL_MORNING,
     ["List today's requests and your honest answer to the want check.",
      "How often did your real preference differ from your usual answer?",
      "Which requests were hardest to check honestly?"]),
    ("pause", "Put limits on your yes",
     "When you agree, say exactly what you're agreeing to: \"I can help you move on Saturday, from nine until noon,\" "
     "\"I can read the report, but I won't have time to rewrite it,\" \"I can talk for twenty minutes, then I need to start dinner.\" "
     "Then keep to the limit.",
     GENERAL_MORNING,
     ["Write each limit you set today, in the words you used.",
      "Did you keep it? If it slipped, what happened just before?",
      "How did the other person respond?"]),
    ("pause", "One small limit with someone you know",
     "Set one small limit in a low-stakes moment with someone in your life: end a call at the time you planned, leave work at your "
     "normal time, suggest meeting somewhere else, ask a relative not to raise a topic at dinner. Say it simply, with no long explanation: "
     "\"I'm going to head off now.\" \"I'd rather not get into that tonight.\"",
     GENERAL_MORNING,
     ["What limit did you set, with whom, and in what words?",
      "What did you expect to happen? What actually happened?"]),
    ("pause", "Make a Clean Ask",
     "The Clean Ask (Chapter 17) means saying what you want, giving the relevant reason, and leaving room for a real answer. "
     "If you'd punish a no, you're making a demand. Choose something with modest stakes. Prepare for a minute: what exactly do you want, "
     "one relevant reason (your own needs count), and what you'll do if they say no. If they refuse: \"Okay. Thanks for hearing me.\"",
     "Write your Clean Ask in one sentence: what you want, one relevant reason, and the question that leaves room for their answer.",
     ["What did you ask for, and from whom? Write your exact words.",
      "Did you pre-apologize, or did you just ask?",
      "What happened? Whatever they said, how do you feel about having asked?"]),
    ("pause", "One clean no with someone you know",
     "Decline one modest request from a coworker, friend or relative: the optional meeting, the third favor this month. "
     "Use the buffer first if you need it, then answer without excuses: \"I'll pass this time, but thanks for asking,\" "
     "\"I'm not going to be able to do that,\" or \"That doesn't work for me.\" If they push, say the same sentence again in the same tone.",
     GENERAL_MORNING,
     ["Who did you say no to, and about what?",
      "Did reasons, apologies or \"maybe next time\" sneak in? Write what you said.",
      "How did you feel an hour later? The next morning?"]),
    ("pause", "Send something back, and your weekly review",
     "Ask for what you paid for: return a wrong order, a cold meal or a faulty item, or fix a double charge. "
     "\"This isn't what I ordered. Could you bring the one I asked for?\" No apology, no joke to soften it. "
     "If nothing goes wrong today, deal with one you've been putting off, or rehearse a line. "
     "This evening, set aside twenty minutes for the review.",
     GENERAL_MORNING,
     ["What did you send back, and what did you say?",
      "Read back over Days 8 to 14. Which practice made the biggest difference? Which was hardest?",
      "Did anyone push back on your changes? How did you handle it?",
      CHECK_IN + " Compare with your first two check-ins."]),

    # ── Week Three: Hold and Follow Through, Days 15 to 21 (Chapter 34) ──
    ("hold", "Say it again",
     "When someone pushes back on a no, repeat it calmly instead of adding reasons: \"I can't take that on right now.\" "
     "\"I understand. I can't take it on right now.\" Don't argue, don't explain more, and don't offer a compromise you don't want. "
     "This is for ordinary pushback. If someone gets louder, closer or threatening, stop and leave if you can do so safely "
     "(Chapter 11, When Pressure Becomes Danger).",
     GENERAL_MORNING,
     ["Write the exchange as closely as you remember it.",
      "How many times did you repeat yourself?",
      "What did you do with the urge to add a reason?"]),
    ("hold", "Let them be disappointed, and answer a guilt line",
     "When someone is disappointed, acknowledge it once (\"I can see you're disappointed\"), then stop. No consolation prize. "
     "If they use a guilt line, acknowledge what they said and restate your answer: "
     "\"You've done a lot for me, and I'm grateful. I still can't make it.\" \"I understand you're upset. My answer is still no.\"",
     GENERAL_MORNING,
     ["Who was disappointed with you today, and about what?",
      "Did you acknowledge once and stop?",
      "How long did their disappointment last? How long did your guilt last?"]),
    ("hold", "Stay in a disagreement",
     "Say what you think about something small (a restaurant, a film, a work problem) and don't drop it just because the moment "
     "feels uncomfortable: \"I actually see it differently.\" Listen, and change your mind if they make a good point. "
     "What you're practicing is not retreating only to end the discomfort.",
     GENERAL_MORNING,
     ["Where did you disagree, and what did you say?",
      "Did you feel the urge to back down? Did you?",
      "How did it end? Was the relationship damaged, or was it fine?"]),
    ("hold", "Propose a trade",
     "Offer something fair in exchange for something you want: \"I can do this if you can do that.\" Make both parts clear, and make sure "
     "the other person can say no without being punished. Prepare for two minutes: what you want, what you can offer, and your answer "
     "if they say no. If they refuse, say plainly what you'll do with your own time.",
     "Write the trade you'll propose: what you want, and what you can offer.",
     ["What trade did you propose, and what were your exact words?",
      "Did the other person change it? Was the change fair?",
      "How do you feel about the result?"]),
    ("hold", "Follow up, and confirm the Smallest Agreed Step",
     "First, follow up on something someone agreed to and hasn't done: \"You mentioned the draft by Tuesday. Can I expect it today?\" "
     "Then wait for the answer, without \"no rush.\" Second, confirm one agreement in a short message. The Smallest Agreed Step "
     "(Chapter 22) is a useful next action, with clear agreement on exactly what it covers. A message records what you both agreed; "
     "silence afterward isn't a yes. Keep any record about a difficult person where only you can see it.",
     GENERAL_MORNING,
     ["What did you follow up on, and how did they respond?",
      "Write the confirmation you sent. Did it name exactly what you each agreed to, and nothing more?",
      "Did they correct anything?"]),
    ("hold", "Repair a mistake",
     "Own one thing you got wrong while practicing: a no that came out sharp, a limit set coldly, a disagreement where you stopped listening. "
     "A good repair names what you did, owns the effect, and says what you'll do differently. It doesn't take back the decision "
     "you were entitled to make (Chapter 30 covers repair in more depth).",
     GENERAL_MORNING,
     ["What did you repair, and what words did you use?",
      "Did you keep the decision while owning the delivery?",
      "How did the other person respond?"]),
    ("hold", "The new answer",
     "Find the replay you wrote on Day 4 and read it slowly. Write a new answer: something short and calm you could say out loud, "
     "in your own voice, if the moment came again tomorrow. Use what you've practiced: a pause, a want check, a clean no, a Clean Ask, "
     "a trade, a confirmation. Then write how it might go, including the part where they don't like it. Add one line for your "
     "No-Agreement Plan: what you will do if the answer is still no. Then fill in your final check-in.",
     GENERAL_MORNING,
     ["Write your new answer.",
      "Compare it with your first replay. What's different?",
      CHECK_IN + " Lay the four check-ins side by side. Which statement moved most?",
      "What is the most important thing you learned in the last 21 days?"]),
]


def rows():
    out = []
    for i, (phase, title, drill, morning, prompts) in enumerate(DAYS, start=1):
        text = drill + title + morning + " ".join(prompts)
        assert "—" not in text and "–" not in text, f"dash in day {i}"
        ch = PHASE_CH[phase]
        out.append({
            "day_number": i, "phase": phase, "label": f"{PHASE_LABEL[phase]}, Day {i}", "title": title, "drill": drill,
            "morning_prompt": morning, "journal_prompts": prompts, "chapter": ch, "chapter_title": CH[ch],
        })
    assert len(out) == 21
    assert [r["phase"] for r in out].count("quick_start") == 3
    assert [r["phase"] for r in out].count("notice") == 4
    assert [r["phase"] for r in out].count("pause") == 7
    assert [r["phase"] for r in out].count("hold") == 7
    return out


def write(data):
    env = {}
    for line in (ROOT / ".env.local").read_text().splitlines():
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').removesuffix("\\n")
    sb, sk = env["NEXT_PUBLIC_SUPABASE_URL"], env["SUPABASE_SERVICE_ROLE_KEY"]
    req = urllib.request.Request(
        f"{sb}/rest/v1/reset_days_v3?on_conflict=day_number",
        data=json.dumps(data).encode(),
        headers={"apikey": sk, "Authorization": f"Bearer {sk}", "Content-Type": "application/json",
                 "Prefer": "resolution=merge-duplicates,return=minimal", "User-Agent": "ShadowPersuasion/1.0"},
        method="POST")
    urllib.request.urlopen(req, timeout=60).read()


def main():
    dry = "--dry-run" in sys.argv
    data = rows()
    for r in data:
        print(f"{r['day_number']:>2}  {r['label']:<20} Ch {r['chapter']}  {r['title']}  "
              f"({len(r['drill'].split())} words, {len(r['journal_prompts'])} questions)")
    if dry:
        print(f"DRY RUN: {len(data)} days checked. Nothing was written to the database.")
        return
    write(data)
    print(f"Seeded {len(data)} days into reset_days_v3.")


if __name__ == "__main__":
    main()
