"""Loads the 21 days of the 21-Day Power Reset from the NEW book (v3,
"Shadow Persuasion: The Hidden Rules of Power", Part VII) into the
reset_days_v3 table. The app reads that table only when
NEXT_PUBLIC_BOOK_EDITION=v3 (see lib/edition.ts, RESET).

Days 1-3:   Quick Start (Chapter 31, Your Three-Day Quick Start)
Days 4-7:   Week One: Notice (Chapter 32)
Days 8-14:  Week Two: Pause and Choose (Chapter 33)
Days 15-21: Week Three: Hold and Follow Through (Chapter 34)

Each day has:
  practice        the book's "Today's practice" line, word for word (checked
                  against book-v3/drafts/ch31 to ch34 when those files are on this computer)
  drill           the short version from the 21-Day Power Reset Journal
                  (book-v3/bonuses/drafts/journal-21-day-power-reset.md)
  morning_prompt  the morning line (the book's where it has one, else the journal's)
  journal_prompts the journal's evening questions

The four check-ins, the tool pages (Day 4 replay, Day 6 Power Map, Day 7 Choice
Check, Day 12 Clean Ask planner, Day 18 trade, Day 19 confirmation, Day 20 repair,
Day 21 rewrite) and the after-the-reset pages are built into the app page itself
(app/app/field-ops/reset-pages.ts), not stored here.

Safe to re-run: rows are upserted by day_number (people's progress is untouched).
It never touches the v2 tables (reset_days / reset_progress).

Usage:
  python3 funnel-v2/app-knowledge/seed_reset_days_v3.py --dry-run   # print and check only, no database
  python3 funnel-v2/app-knowledge/seed_reset_days_v3.py             # write (launch only)
Needs migrations 031_reset_days_v3.sql and 032_reset_v3_pages.sql applied first
(032 adds the practice column)."""
import json, pathlib, re, sys, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
BOOK_DRAFTS = pathlib.Path.home() / "Desktop/shadow-persuasion/book-v3/drafts"

CH = {
    31: "Your Three-Day Quick Start",
    32: "Week One: Notice",
    33: "Week Two: Pause and Choose",
    34: "Week Three: Hold and Follow Through",
}
PHASE_CH = {"quick_start": 31, "notice": 32, "pause": 33, "hold": 34}
PHASE_LABEL = {"quick_start": "Quick Start", "notice": "Week One", "pause": "Week Two", "hold": "Week Three"}

# (phase, title, practice [verbatim from the book], drill, morning note, evening questions)
DAYS = [
    # ── Quick Start: Days 1 to 3 (Chapter 31) ──
    ("quick_start", "The pause",
     "pause before answering requests you'd usually accept without thinking.",
     "You can still say yes later. Today you only change the speed. "
     "Try saying: \"Let me check and get back to you.\" / \"I need to look at my week first.\" / "
     "\"Give me an hour and I'll let you know.\"",
     "Write \"Today I pause before an automatic yes,\" and the name of one person likely to ask you for something.",
     ["How many requests did you get? How many times did you pause, and how many times did a quick yes slip out?",
      "When you had time to think, did any answer change?",
      "How did people react to \"let me check\"? Write what happened, not what you feared."]),
    ("quick_start", "No unneeded apologies, and one small ask",
     "drop the reflex \"sorry\", and ask for one small thing you expect to be refused.",
     "If they say no, say \"No problem, thanks for checking,\" and move on. "
     "Swap \"Sorry to bother you\" for \"Do you have a minute?\" Keep real apologies for real mistakes. "
     "Keep a tally of every reflex \"sorry\" you catch, in time or not.",
     "Write down your small ask.",
     ["How many reflex apologies did you catch? Which swap felt strangest?",
      "What did you ask for, and what happened?",
      "What did the voice in your head predict before you asked? How close was it?",
      "Did anyone treat you differently when you didn't apologize?"]),
    ("quick_start", "One clean no, and one held silence",
     "decline one request without an excuse, and let one pause sit without filling it.",
     "Try saying: \"Thanks for thinking of me, but I can't make it.\" / \"I'm going to pass on this one.\" / "
     "\"That doesn't work for me.\" Give a brief reason if it helps them understand or plan. You don't need to keep adding reasons. "
     "The pause is for thinking. Don't stretch it to make the other person uncomfortable or to wait them into offering more. "
     "If no request comes today, answer one you've been putting off, the same way.",
     "Write \"One clean no. One held silence,\" and what you might decline.",
     ["What did you decline, and what exact words did you use? Did reasons or apologies sneak in?",
      "How did the other person respond?",
      "Where did you hold a silence, and what happened during it?",
      "Read your three evening entries together. What did you find out that your fears didn't want you to know?"]),

    # ── Week One: Notice, Days 4 to 7 (Chapter 32) ──
    ("notice", "The yes count, and the conversation you keep replaying",
     "count every time you agree to something.",
     "Mark each one M if you meant it or D if you didn't. You don't need to change any answers for this exercise. "
     "Every yes counts: accepting a request, nodding along to an opinion you don't share, saying \"that's fine\" when it isn't. "
     "Keep using your pause when you want to. Just count. Today you also write the replay page: an ordinary exchange from "
     "the past year that still stings. Skip anything that feels overwhelming to revisit. You'll come back to it on Day 21.",
     "Write the name of one person you expect to ask you for something.",
     ["How many yeses did you count, and how many were D?",
      "Who got the most D answers from you?",
      "Pick one D. What did you fear would happen if you'd said no?"]),
    ("notice", "Catch your clause and your habits",
     "notice the old rules and the small habits that show up when you're under pressure.",
     "Each time your clause shows up, write a one-line note. Each time a habit appears, make a mark. "
     "The Good Person Contract, from Chapter 3, The Rules You Never Chose, means the unspoken rules that turn kindness and duty "
     "into automatic self-sacrifice. Its five clauses: other people's feelings are your job; your needs are a burden; "
     "conflict means something went wrong; if you're good enough, you'll be treated fairly; if you stop being nice, "
     "you'll become one of them. The six habits: the instant yes, the long explanation, the reflex apology, filling the silence, "
     "the flinch when someone looks disappointed, the hunt for approval.",
     "Write down your clause and your two habits.",
     ["How many times did your clause show up, and where: work, home, family or friends?",
      "What were your tallies for each habit?",
      "Write your clause again in a version you'd choose as an adult. (\"Other people's feelings matter to me, and they are still theirs\" is one example.)"]),
    ("notice", "Draw one Power Map",
     "map one decision where you keep giving in.",
     "Keep it small: one decision, one page, ten minutes. The Power Map, from Chapter 2, Read the Power Map, shows who decides, "
     "what each person needs, and where authority, resources and alternatives sit. Choose a situation from your yes count or "
     "your replay, and use the map page below.",
     "Choose the situation you'll map, from your yes count or your replay.",
     ["What did you draw, and what surprised you?",
      "What do you supply that you had stopped counting?",
      "What is one fact you don't know yet and could find out?"]),
    ("notice", "The Choice Check, and your weekly review",
     "slow down one moment of pressure with four questions.",
     "Do it in your head in the moment, or on paper afterward. The Choice Check, from Chapter 5, Stay Steady Without Going Cold, "
     "is four questions: What happened? What am I assuming? What do I actually owe? What options do I have? "
     "This evening, set aside twenty minutes for your weekly review and Check-in 2.",
     "Write where you're most likely to feel pulled to agree, fix or explain today.",
     ["Where did you use the Choice Check? Which question changed your answer, if any?",
      "Read back through Days 4 to 7. Write the three most important things you noticed about your own patterns.",
      "Which day was hardest? Which was easiest?",
      "The one person whose requests were hardest to turn down this week, and one easier person you could practice with next week."]),

    # ── Week Two: Pause and Choose, Days 8 to 14 (Chapter 33) ──
    ("pause", "Make the pause your normal answer",
     "use a buffer for requests you'd usually accept before checking your time or wishes.",
     "Your final answer can still be yes. Try saying: \"Let me check and get back to you.\" / "
     "\"I'll look at my week and let you know this afternoon.\" / \"Let me think about that.\" "
     "Before a conversation you expect to be tense, breathe in normally, then let the breath out slowly and fully, "
     "a little longer than the breath in. Two or three times, if it feels comfortable.",
     "Write the buffer line you'll use today, in your own words.",
     ["How many times did you use a buffer? How many quick answers slipped out?",
      "Did any final answer differ from what you'd have said on the spot?",
      "Did anyone push back on the pause? What did you say?"]),
    ("pause", "The want check",
     "after the buffer, find out what you actually want.",
     "Ask yourself one question before you reply: \"If nobody would be disappointed either way, what would I choose?\" "
     "You don't have to act on the answer today. Just find it and write it down. The answer might be yes. It might be no. "
     "Often it's \"yes, but not like that.\"",
     "Write one request you expect today, and your guess at your honest answer.",
     ["List today's requests and your honest answer to the want check.",
      "How often did your real preference differ from your usual answer?",
      "Which requests were hardest to check honestly?"]),
    ("pause", "Put limits on your yes",
     "when you agree, say exactly what you're agreeing to.",
     "Then keep to the limit. Try saying: \"I can help you move on Saturday, from nine until noon.\" / "
     "\"I can read the report, but I won't have time to rewrite it.\" / \"I'll cover the shift if you can take my Thursday.\" "
     "When the time is up, go. \"I need to go now. I hope tomorrow goes well.\" "
     "If someone pushes past every limit you set, that tells you something too.",
     "Write a yes you expect to give today, and the limit you'll put on it.",
     ["Write each limit you set today, in the words you used.",
      "Did you keep it? If it slipped, what happened just before?",
      "How did the other person respond?"]),
    ("pause", "One small limit with someone you know",
     "set one small limit in a low-stakes moment with someone in your life.",
     "This time you start it yourself, and you say it simply, with no long explanation. "
     "Ideas: end a call at the time you planned; leave work on time; ask a relative not to raise one topic at dinner.",
     "Write your small limit, who it's with, and the words you'll use.",
     ["What limit did you set, with whom, and in what words?",
      "What did you expect to happen? What actually happened?"]),
    ("pause", "Make a Clean Ask",
     "ask for one thing you want, clearly and fairly.",
     "Choose something real enough to matter and small enough that a refusal won't flatten you. "
     "The Clean Ask, from Chapter 17, Ask for More and Negotiate Well, means saying what you want, giving the relevant reason, "
     "and leaving room for a real answer. If you'd punish a no, you're making a demand. Plan it on the Clean Ask planner below.",
     "Write who you'll ask, and roughly when.",
     ["What did you ask for, and from whom? Write your exact words.",
      "Did you pre-apologize, or did you just ask?",
      "What happened? Whatever they said, how do you feel about having asked?"]),
    ("pause", "One clean no with someone you know",
     "decline one modest request from someone in your life.",
     "A coworker, a friend or a relative is fine. Skip the excuses, and use the buffer first if you need it. "
     "Try saying: \"I'll pass this time, but thanks for asking.\" / \"I'm not going to be able to do that.\" / "
     "\"That doesn't work for me.\" If they ask why, \"It just doesn't work for me this time\" is enough. "
     "If they push, say the same sentence again in the same tone.",
     "Write a request you might decline today, and from whom.",
     ["Who did you say no to, and about what?",
      "Did reasons, apologies or \"maybe next time\" sneak in? Write what you said.",
      "How did you feel an hour later? The next morning? (Come back and add the second part tomorrow.)"]),
    ("pause", "Send something back, and your weekly review",
     "ask for what you paid for.",
     "That might be a wrong order, a cold meal, a faulty item or a double charge. Skip the apology, the joke to soften it "
     "and the \"it's not a big deal, but.\" Try saying: \"This isn't what I ordered. Could you bring the one I asked for?\" / "
     "\"I was charged twice. Could you fix that, please?\" If nothing goes wrong today, deal with one you've been putting off. "
     "If there isn't one, rehearse a line and move on. This evening, set aside twenty minutes for your weekly review and Check-in 3.",
     "Write anything you've been putting up with that you could send back or ask to have fixed.",
     ["What did you send back, and what did you say?",
      "Did you feel the urge to soften it or say it was no big deal? What did you do with that urge?",
      "Read back over Days 8 to 14. Which practice made the biggest difference? Which was hardest?",
      "Did anyone push back on your changes? How did you handle it?"]),

    # ── Week Three: Hold and Follow Through, Days 15 to 21 (Chapter 34) ──
    ("hold", "Say it again",
     "when someone pushes back on a no, repeat it calmly instead of adding reasons.",
     "Don't argue, and don't offer a compromise you don't want. Try saying: \"I can't take that on right now.\" "
     "Then, if they push: \"I understand. I can't take it on right now.\" This is for ordinary pushback. "
     "If someone gets louder, closer or threatening, stop the exercise and leave if you can do so safely. "
     "Chapter 11, When Pressure Becomes Danger, explains how to get help.",
     "Write the sentence you'll repeat if you need it.",
     ["Write the exchange as closely as you remember it.",
      "How many times did you repeat yourself?",
      "What did you do with the urge to add a reason?"]),
    ("hold", "Let them be disappointed, and answer a guilt line",
     "let someone be unhappy with your decision without fixing it, and hold steady if they reach for guilt.",
     "Acknowledge their feelings once, then stop. If they reach for guilt, acknowledge what they said and restate your answer. "
     "Try saying: \"I know you were hoping I'd say yes.\" / \"You've done a lot for me, and I'm grateful. I still can't make it.\" / "
     "\"I understand you're upset. My answer is still no.\" No consolation prize. Chapter 7, Guilt, Favors, and Hidden Debts, "
     "covers how to tell a real duty from a manufactured one.",
     "Write a decision someone may be disappointed by today.",
     ["Who was disappointed with you today, and about what?",
      "Did you acknowledge once and stop?",
      "If someone used a guilt line, write their exact words, and what you said back.",
      "How long did their disappointment last? How long did your guilt last?"]),
    ("hold", "Stay in a disagreement",
     "say what you think and don't drop it just because the moment feels uncomfortable.",
     "Choose something small: a restaurant, a film, how to tackle a work problem. "
     "Try saying: \"I actually see it differently. I think the second option makes more sense.\" "
     "You don't have to win. Listen, and change your mind if they make a good point. That's a real choice. "
     "What you're practicing is not retreating only to end the discomfort.",
     "Write a small topic where you might disagree today.",
     ["Where did you disagree, and what did you say?",
      "Did you feel the urge to back down? Did you?",
      "How did it end? Was the relationship damaged, or was it fine?"]),
    ("hold", "Propose a trade",
     "offer something fair in exchange for something you want.",
     "The shape is \"I can do this if you can do that.\" Make both parts clear, and make sure the other person can say no "
     "without being punished. Spend two minutes on the trade page below. Chapter 17, Ask for More and Negotiate Well, "
     "covers trades in more depth.",
     "Write the trade you're thinking about, and who it's with.",
     ["What trade did you propose, and what were your exact words?",
      "Did the other person change it? Was the change fair?",
      "How do you feel about the result?"]),
    ("hold", "Follow up, and confirm the Smallest Agreed Step",
     "raise one thing you'd normally let slide, and confirm one agreement in writing.",
     "Pick something someone agreed to and hasn't done, and wait for the answer without saying \"no rush.\" "
     "The confirmation can be a short message. Try saying: \"Checking on the two hundred dollars from last month. "
     "When can you get that back to me?\" / \"You mentioned the draft by Tuesday. Can I expect it today?\" "
     "The Smallest Agreed Step, from Chapter 22, Turn Agreement Into Action, is a useful next action, with clear agreement "
     "on exactly what it covers. Draft your message on the page below.",
     "Write what you'll follow up on, and the agreement you'll confirm.",
     ["What did you follow up on, and how did they respond?",
      "Did you soften it more than you meant to?",
      "Write the confirmation you sent. Did it name exactly what you each agreed to, and nothing more?",
      "Did they correct anything?"]),
    ("hold", "Repair a mistake",
     "own one thing you got wrong while practicing.",
     "It might be a no that came out sharp, a limit set coldly, or a disagreement where you stopped listening. "
     "Repair the delivery without taking back a decision you were entitled to make. Plan the repair on the page below. "
     "Chapter 30, Power Without Becoming What You Resent, covers repair in more depth.",
     "Write the moment you want to repair, and with whom.",
     ["What did you repair, and what words did you use?",
      "Did you keep the decision while owning the delivery?",
      "How did the other person respond?"]),
    ("hold", "The new answer",
     "go back to where you started and write the answer you could give now.",
     "Start from the replay you wrote on Day 4. Then fill in your final check-in. Skip the perfect cutting line you'd come up "
     "with at 3 a.m. Write something short and calm you could say out loud tomorrow, using what you've practiced: a pause, "
     "a want check, a clean no, a Clean Ask, a trade, a confirmation. Use the rewrite page below.",
     "Write one thing you're proud of from the last three weeks.",
     ["Compare your new answer with your first replay. What's different?",
      "Lay the four check-ins side by side. Which statement moved most?",
      "What is the most important thing you learned in the last 21 days?"]),
]


def book_practice_lines():
    """The book's "Today's practice" lines, Day 1 to 21 in order, or None if the drafts aren't on this computer."""
    files = sorted(BOOK_DRAFTS.glob("ch3[1-4]-*.md")) if BOOK_DRAFTS.exists() else []
    if len(files) != 4:
        return None
    lines = []
    for f in files:
        lines += re.findall(r"^\*\*Today's practice:\*\* (.+)$", f.read_text(), flags=re.M)
    return [l.strip() for l in lines]


def rows():
    out = []
    for i, (phase, title, practice, drill, morning, prompts) in enumerate(DAYS, start=1):
        text = practice + drill + title + morning + " ".join(prompts)
        assert "—" not in text and "–" not in text, f"dash in day {i}"
        ch = PHASE_CH[phase]
        out.append({
            "day_number": i, "phase": phase, "label": f"{PHASE_LABEL[phase]}, Day {i}", "title": title,
            "practice": practice, "drill": drill,
            "morning_prompt": morning, "journal_prompts": prompts, "chapter": ch, "chapter_title": CH[ch],
        })
    assert len(out) == 21
    assert [r["phase"] for r in out].count("quick_start") == 3
    assert [r["phase"] for r in out].count("notice") == 4
    assert [r["phase"] for r in out].count("pause") == 7
    assert [r["phase"] for r in out].count("hold") == 7
    return out


def check_against_book(data):
    book = book_practice_lines()
    if book is None:
        print("Book drafts not found on this computer: practice lines not compared with the book.")
        return
    assert len(book) == 21, f"expected 21 practice lines in the book, found {len(book)}"
    bad = [r["day_number"] for r, b in zip(data, book) if r["practice"] != b]
    assert not bad, f"practice text differs from the book on day(s) {bad}"
    print("Practice lines match the book word for word (21 of 21).")


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
    check_against_book(data)
    if dry:
        print(f"DRY RUN: {len(data)} days checked. Nothing was written to the database.")
        return
    write(data)
    print(f"Seeded {len(data)} days into reset_days_v3.")


if __name__ == "__main__":
    main()
