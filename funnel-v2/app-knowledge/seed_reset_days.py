"""Loads the 24 steps of the 21-Day Reset (Part Two of the book) into the
reset_days table that powers the app's "The 21-Day Reset" page.

Steps 1-3: the 3-Day Quick Start (Chapter 6).
Steps 4-24: Days 1-21, Week 1 Notice (Ch 8), Week 2 Pause (Ch 9), Week 3 Hold (Ch 10).
Journal questions match the 21-Day Reset Journal (funnel-v2/journal/build_journal.py),
with the weekly check-ins from the chapters added on review days.

Safe to re-run: rows are upserted by day_number (people's progress is untouched).
Usage: python3 funnel-v2/app-knowledge/seed_reset_days.py
Needs migration 026_reset_days.sql applied first."""
import json, pathlib, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
ENV = {}
for line in (ROOT / ".env.local").read_text().splitlines():
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1)
        ENV[k.strip()] = v.strip().strip('"').removesuffix("\\n")
SB, SK = ENV["NEXT_PUBLIC_SUPABASE_URL"], ENV["SUPABASE_SERVICE_ROLE_KEY"]

MORNING = "Where do you expect to use this today?"
CH = {6: "The 3-Day Quick Start", 8: "Week 1, Notice", 9: "Week 2, Pause", 10: "Week 3, Hold"}

# (phase, chapter, title, drill, morning prompt, journal questions)
STEPS = [
    # ── 3-Day Quick Start (Chapter 6) ──
    ("quick_start", 6, "The pause",
     "Don't agree to anything on the spot today. When someone asks you for something, buy time: "
     "\"Let me check and get back to you\" or \"Give me an hour and I'll let you know.\" "
     "You can still say yes later. The only thing you change today is the speed.",
     "Name one person you expect to ask you for something today.",
     ["How many requests did you get today?",
      "How many times did you pause? How many times did the instant yes slip out?",
      "Once you had time to think, did any requests look different?",
      "How did people react to \"let me check\"? Write what actually happened."]),
    ("quick_start", 6, "No apologies, and one small ask",
     "Catch every \"sorry\" that isn't a real apology and swap it: \"Sorry to bother you\" becomes "
     "\"Do you have a minute?\" and \"Sorry for the late reply\" becomes \"Thanks for waiting.\" "
     "Then ask for one small thing you expect to be refused, like a discount or a table by the window. "
     "If they say no, say \"No problem, thanks for checking,\" and move on.",
     "Write down your small ask.",
     ["How many reflex apologies did you catch? How many did you stop?",
      "Which swap felt strangest? Which felt natural?",
      "What did you ask for, and what happened?",
      "What did the voice in your head predict, and how did that compare?"]),
    ("quick_start", 6, "One clean no, and one held silence",
     "Decline one low-stakes request, briefly and kindly, without explaining why: "
     "\"Thanks for thinking of me, but I can't make it.\" Then stop talking. "
     "In one conversation, when the other person stops talking, count slowly to ten in your head "
     "while you breathe out, then answer.",
     "If you already know what you'll decline, write it down.",
     ["What did you say no to, and exactly what words did you use?",
      "Did you add reasons or apologies? Be honest.",
      "How did the other person respond? What did you fear, and what happened?",
      "Where did you hold a silence? What happened during and after it?",
      "Looking back at all three days: what did you find out that the voice in your head didn't want you to know?"]),

    # ── Week 1: Notice (Chapter 8) ──
    ("notice", 8, "The yes count",
     "Keep a tally of every yes today: agreeing to a request, accepting an invitation, nodding along, "
     "saying \"that's fine\" when it isn't. Mark each one M if you meant it and D if you didn't. "
     "Don't try to say no yet. Just count.",
     MORNING,
     ["How many yeses did you count? How many were D?",
      "Who got the most D answers from you?",
      "Pick one D yes. What were you afraid would happen if you'd said no?"]),
    ("notice", 8, "Catch your clause",
     "Bring to mind your strongest clause from Chapter 2, for example \"other people's feelings are my job\" "
     "or \"conflict means something has gone wrong.\" Every time you notice it shaping what you do today, "
     "write a one-line note, like \"Offered to call the client back myself because my colleague sounded stressed.\"",
     MORNING,
     ["How many times did you catch your clause today?",
      "Where did it show up most: work, partner, family, or friends?",
      "Write the adult revision of your clause in your own words."]),
    ("notice", 8, "The tell tally, and no apologies",
     "Keep a tally for your two strongest tells from Chapter 3, such as the instant yes, the long explanation "
     "or filling the silence. At the same time, catch every reflex \"sorry\" and swap it for something accurate: "
     "\"Thanks for waiting\" instead of \"sorry for the delay.\"",
     MORNING,
     ["What were your tallies for each tell?",
      "How many reflex apologies did you catch and swap?",
      "Did anyone react differently when you didn't apologize?"]),
    ("notice", 8, "Spot the opening",
     "Whenever you feel pulled to do something you didn't plan to do, ask yourself silently which need is being "
     "pressed: guilt, approval, fear of conflict, being seen as good, fear of loss, or urgency. "
     "There's often a cue behind it, like a sigh (guilt) or \"I need to know by end of day\" (urgency).",
     MORNING,
     ["List each moment of pressure and which opening it pressed on.",
      "Which opening came up most? Is it the same one as in your replay log?",
      "Who presses on that opening most often?"]),
    ("notice", 8, "Hear the voice, and slow replies",
     "Every time the voice in your head talks you out of something, write down its exact words: "
     "\"It's not worth it.\" \"Who are you to ask?\" Also, don't answer any message instantly today. "
     "Unless it's truly urgent, wait at least an hour, and notice what happens.",
     MORNING,
     ["Write the voice's three most frequent lines today.",
      "Write the fair version of each one, the one a friend on your side would say.",
      "What happened when you didn't reply instantly?"]),
    ("notice", 8, "Whose feeling is it?",
     "When a strong feeling shows up, ask: is this mine, or did I pick it up from someone? "
     "If it's theirs, say silently, \"This is theirs.\" You don't have to push it away, just label it. "
     "At least once, when someone tells you about a problem, ask \"What would help most right now?\" before offering a fix.",
     MORNING,
     ["Describe a moment when a feeling you carried started with someone else.",
      "Did you ask \"What would help most?\" What did they say?",
      "Who do you absorb emotions from most often?"]),
    ("notice", 8, "Review, and rejection practice",
     "Ask for one small thing you expect to be refused, keep it light, and answer a no with "
     "\"No problem, thanks for checking.\" This evening, take twenty minutes to read back over the week.",
     MORNING,
     ["What did you ask for, and what happened?",
      "The three most important things you noticed about your pattern this week:",
      "Which day was hardest? Which was easiest?",
      "Check-in: rate the five statements from Chapter 7 again, 0 to 10. How do they compare with your first scores?"]),

    # ── Week 2: Pause (Chapter 9) ──
    ("pause", 9, "The buffer",
     "Answer every request today with a buffer instead of an answer: \"Let me check and get back to you\" "
     "or \"Let me think about it.\" Your answer can still be yes. Before any conversation you expect to be tense, "
     "use the calm-down breath: breathe in normally, then breathe out slowly and fully, two or three times.",
     MORNING,
     ["How many times did you use a buffer? How many instant answers slipped out?",
      "Did your final answers differ from what you'd have said on the spot?",
      "Did anyone push back on the buffer? How did you respond?"]),
    ("pause", 9, "The want check",
     "Each time you're asked for something, use your buffer, then ask yourself: "
     "\"If nobody would be disappointed either way, what would I choose?\" "
     "You don't have to act on the answer yet. Just find it and write it down.",
     MORNING,
     ["List today's requests and your honest answer to the want check.",
      "How often did your real preference differ from your usual answer?",
      "Which requests were hardest to check honestly? Why?"]),
    ("pause", 9, "Help with edges",
     "When you say yes today, say exactly what you're agreeing to: \"I can help you move, Saturday from nine until noon\" "
     "or \"I can talk for twenty minutes, then I need to start dinner.\" Then keep to the edge when the time comes.",
     MORNING,
     ["Write every edge you set today, in the exact words you used.",
      "Did you keep to the edge? If it slipped, what happened right before?",
      "How did the other person react to the limit?"]),
    ("pause", 9, "The ten-second silence, and a small boundary",
     "Once today, when someone makes a request or a criticism and stops talking, count slowly to ten while breathing out "
     "before you answer. Then set one small boundary with someone you know, like ending a call when you planned to "
     "or leaving work on time. Say it simply: \"I'm going to head off now.\"",
     MORNING,
     ["Where did you hold the silence? What happened during it?",
      "What boundary did you set, with whom, and in what words?",
      "What did the voice predict? What actually happened?"]),
    ("pause", 9, "One clean no",
     "Decline one request from someone you know (a coworker, friend or relative), and keep the stakes modest. "
     "Use the buffer first if you need it, then say \"That doesn't work for me\" without excuses. "
     "If they push, repeat the same sentence in the same calm tone.",
     MORNING,
     ["Who did you say no to, and what did you decline?",
      "Exactly what did you say? Any reasons, apologies, or \"maybe next time\"?",
      "How did they respond? How did you feel an hour later? The next morning?"]),
    ("pause", 9, "Send it back",
     "Return something or ask for something to be fixed: a wrong order, a cold meal, a double charge. "
     "Be polite and direct: \"This isn't what I ordered. Could you bring the one I asked for?\" "
     "No apology, no joke to soften it, no \"it's not a big deal, but.\"",
     MORNING,
     ["What did you send back or dispute? What did you say?",
      "Did you feel the urge to apologize or minimize? Did you manage not to?",
      "How was the request received?"]),
    ("pause", 9, "Eat alone, and review",
     "Go to a café or restaurant by yourself and stay at least twenty minutes without your phone. "
     "Notice any urge to look busy, to apologize for taking up a table, or to leave early. "
     "This evening, read back over the week.",
     MORNING,
     ["How did it feel? What did you notice about yourself?",
      "Which drill this week made the biggest difference? Which was hardest?",
      "Did anyone push back on your changes? How did you handle it?",
      "Check-in: rate the five statements from Chapter 7 again, 0 to 10. Compare them with your first two."]),

    # ── Week 3: Hold (Chapter 10) ──
    ("hold", 10, "The broken record",
     "Decline something today. If the other person pushes, don't argue, add reasons, or offer a compromise you don't want. "
     "Say the same thing again in the same calm tone: \"I understand. I can't take it on right now.\" "
     "Most people stop pushing after the second or third time.",
     MORNING,
     ["Write the exchange as closely as you remember it.",
      "How many times did you repeat yourself?",
      "What did you do with the urge to add reasons or soften the no?"]),
    ("hold", 10, "Let them be disappointed",
     "When someone is disappointed by your decision, acknowledge it once, briefly: \"I know you were hoping I'd say yes.\" "
     "Then stop. No consolation prize, no \"but maybe I could,\" no checking whether they're okay. "
     "Their reaction belongs to them.",
     MORNING,
     ["Who was disappointed with you today, and about what?",
      "What did you say? Did you acknowledge once and then stop?",
      "How long did their disappointment last? How long did your discomfort last?"]),
    ("hold", 10, "Answer a guilt trip",
     "When someone uses a guilt line, acknowledge what they said, then restate your position. "
     "\"After everything I've done for you...\" gets \"I know you've done a lot for me, and I'm grateful. "
     "I'm still not going to be able to make it.\" Don't argue about the facts or defend your record.",
     MORNING,
     ["Did anyone use guilt on you today? Write their exact words.",
      "How did you respond? Did you acknowledge and hold?",
      "Which kind of guilt line hits you hardest?"]),
    ("hold", 10, "Follow up on something",
     "Raise one thing you'd normally let slide: money you're owed, a promised draft, a chore that's still undone. "
     "Keep it neutral and specific: \"You mentioned you'd send the draft by Tuesday. Can I expect it today?\" "
     "Then wait for the answer without adding \"no rush.\"",
     MORNING,
     ["What did you follow up on, and with whom?",
      "Exactly what did you say? Did you soften it more than you meant to?",
      "How did they respond?"]),
    ("hold", 10, "Ask for something you want",
     "Make one direct request for something that matters to you, with moderate stakes: a talk about your pay, "
     "help with a task you carry alone, a friend visiting you this time. "
     "No pre-apology, no \"this is probably silly, but.\" Say what you want, then stop.",
     MORNING,
     ["What did you ask for, and from whom?",
      "What did the voice say beforehand? Write its exact lines.",
      "What happened? How do you feel about having asked?"]),
    ("hold", 10, "Stay in a disagreement",
     "When you disagree with someone today, say so and stay with it: \"I actually see it differently.\" "
     "You can change your mind if they make a good point, but not just because it feels uncomfortable. "
     "Also run another slow-reply day: no instant answers unless something is urgent.",
     MORNING,
     ["Where did you disagree today? What did you say?",
      "Did you feel the urge to back down? Did you?",
      "How did it end? Was the relationship damaged, or was it fine?"]),
    ("hold", 10, "The new answer",
     "Reread the replay you wrote in Chapter 1: the conversation, what you said, what you wished you'd said. "
     "Write a new answer you could actually say out loud, short and calm, using what you've practiced: "
     "a buffer, a clean no, an acknowledgment and a hold. Then do your final check-in.",
     MORNING,
     ["Write your new answer to the Chapter 1 replay.",
      "Compare it with the 3 a.m. version. What's different?",
      "Check-in: rate the five statements one more time. Which one moved the most?",
      "The single most important thing you learned in the last 21 days:"]),
]

WEEK = {"notice": "Week 1", "pause": "Week 2", "hold": "Week 3"}


def rows():
    out = []
    for i, (phase, ch, title, drill, morning, prompts) in enumerate(STEPS, start=1):
        assert "—" not in drill + title + " ".join(prompts), f"em-dash in step {i}"
        label = f"Quick start, day {i}" if phase == "quick_start" else f"{WEEK[phase]}, day {i - 3}"
        out.append({
            "day_number": i, "phase": phase, "label": label, "title": title, "drill": drill,
            "morning_prompt": morning, "journal_prompts": prompts, "chapter": ch, "chapter_title": CH[ch],
        })
    assert len(out) == 24
    return out


def main():
    data = rows()
    req = urllib.request.Request(
        f"{SB}/rest/v1/reset_days?on_conflict=day_number",
        data=json.dumps(data).encode(),
        headers={"apikey": SK, "Authorization": f"Bearer {SK}", "Content-Type": "application/json",
                 "Prefer": "resolution=merge-duplicates,return=minimal", "User-Agent": "ShadowPersuasion/1.0"},
        method="POST")
    urllib.request.urlopen(req, timeout=60).read()
    for r in data:
        print(f"{r['day_number']:>2}  {r['label']:<20} {r['title']}")
    print(f"Seeded {len(data)} reset days.")


if __name__ == "__main__":
    main()
