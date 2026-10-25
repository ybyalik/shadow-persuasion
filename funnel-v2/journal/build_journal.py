"""Builds the 21-Day Reset Journal as print-ready HTML (then PDF via headless Chrome) and Markdown (for Word)."""
import html
import pathlib

OUT = pathlib.Path(__file__).parent

CHECKIN = [
    "I can say no without over-explaining.",
    "I can let someone be disappointed in me without rushing to fix it.",
    "I can stay calm when someone gets annoyed or upset with me.",
    "I can ask for what I want directly.",
    "I notice pressure while it's happening, not just afterward.",
]

QUICK_START = [
    ("Quick Start, Day 1", "The pause",
     "Don't agree to anything on the spot. Use \"Let me check and get back to you.\"",
     "Name one person you expect to ask you for something today.",
     ["How many requests did you get today?",
      "How many times did you pause? How many times did the instant yes slip out?",
      "Once you had time to think, did any requests look different?",
      "How did people react to \"let me check\"? Write what actually happened."]),
    ("Quick Start, Day 2", "No apologies, and one small ask",
     "Swap every reflex \"sorry\" for something accurate. Ask for one small thing you expect to be refused.",
     "Write down your small ask.",
     ["How many reflex apologies did you catch? How many did you stop?",
      "Which swap felt strangest? Which felt natural?",
      "What did you ask for, and what happened?",
      "What did the voice in your head predict, and how did that compare?"]),
    ("Quick Start, Day 3", "One clean no, and one held silence",
     "Decline one low-stakes request without an excuse. Let one pause sit for a slow count of ten.",
     "If you already know what you'll decline, write it down.",
     ["What did you say no to, and exactly what words did you use?",
      "Did you add reasons or apologies? Be honest.",
      "How did the other person respond? What did you fear, and what happened?",
      "Where did you hold a silence? What happened during and after it?"]),
]

DAYS = [
    # Week 1: Notice
    ("Notice", "The yes count",
     "Tally every yes today. Mark M if you meant it, D if you didn't.",
     ["How many yeses did you count? How many were D?",
      "Who got the most D answers from you?",
      "Pick one D yes. What were you afraid would happen if you'd said no?"]),
    ("Notice", "Catch your clause",
     "Each time your main clause from Chapter 2 shapes what you do, write a one-line note.",
     ["How many times did you catch your clause today?",
      "Where did it show up most: work, partner, family, or friends?",
      "Write the adult revision of your clause in your own words."]),
    ("Notice", "The tell tally, and no apologies",
     "Tally your top two tells. Swap every reflex \"sorry\" for something accurate.",
     ["What were your tallies for each tell?",
      "How many reflex apologies did you catch and swap?",
      "Did anyone react differently when you didn't apologize?"]),
    ("Notice", "Spot the opening",
     "When you feel pulled, ask: guilt, approval, conflict, being good, fear of loss, or urgency?",
     ["List each moment of pressure and which opening it pressed on.",
      "Which opening came up most? Is it the same one as in your replay log?",
      "Who presses on that opening most often?"]),
    ("Notice", "Hear the voice, and slow replies",
     "Write down the voice's exact words. Don't answer messages instantly today.",
     ["Write the voice's three most frequent lines today.",
      "Write the fair version of each one.",
      "What happened when you didn't reply instantly?"]),
    ("Notice", "Whose feeling is it?",
     "When a strong feeling arrives, ask whether it started with you. Ask \"What would help most?\" before fixing.",
     ["Describe a moment when a feeling you carried started with someone else.",
      "Did you ask \"What would help most?\" What did they say?",
      "Who do you absorb emotions from most often?"]),
    ("Notice", "Review, and rejection practice",
     "Ask for one small thing you expect to be refused. Then do the weekly review.",
     ["What did you ask for, and what happened?",
      "The three most important things you noticed about your pattern this week:",
      "Which day was hardest? Which was easiest?"]),
    # Week 2: Pause
    ("Pause", "The buffer",
     "Answer every request with a buffer. Use the calm-down breath before tense conversations.",
     ["How many times did you use a buffer? How many instant answers slipped out?",
      "Did your final answers differ from what you'd have said on the spot?",
      "Did anyone push back on the buffer? How did you respond?"]),
    ("Pause", "The want check",
     "Before you answer, ask: if nobody would be disappointed either way, what would I choose?",
     ["List today's requests and your honest answer to the want check.",
      "How often did your real preference differ from your usual answer?",
      "Which requests were hardest to check honestly? Why?"]),
    ("Pause", "Help with edges",
     "When you say yes, define exactly what you're agreeing to. Then keep to the edge.",
     ["Write every edge you set today, in the exact words you used.",
      "Did you keep to the edge? If it slipped, what happened right before?",
      "How did the other person react to the limit?"]),
    ("Pause", "The ten-second silence, and a small boundary",
     "Hold one silence for a slow count of ten. Set one small boundary with someone you know.",
     ["Where did you hold the silence? What happened during it?",
      "What boundary did you set, with whom, and in what words?",
      "What did the voice predict? What actually happened?"]),
    ("Pause", "One clean no",
     "Decline one request from someone you know. No excuses. Repeat the same sentence if pushed.",
     ["Who did you say no to, and what did you decline?",
      "Exactly what did you say? Any reasons, apologies, or \"maybe next time\"?",
      "How did they respond? How did you feel an hour later? The next morning?"]),
    ("Pause", "Send it back",
     "Return something or dispute a charge, politely, without apology or minimizing.",
     ["What did you send back or dispute? What did you say?",
      "Did you feel the urge to apologize or minimize? Did you manage not to?",
      "How was the request received?"]),
    ("Pause", "Eat alone, and review",
     "Eat or have a drink alone in public for twenty minutes, without your phone. Then do the weekly review.",
     ["How did it feel? What did you notice about yourself?",
      "Which drill this week made the biggest difference? Which was hardest?",
      "Did anyone push back on your changes? How did you handle it?"]),
    # Week 3: Hold
    ("Hold", "The broken record",
     "When someone pushes back on a no, repeat the same sentence calmly instead of adding reasons.",
     ["Write the exchange as closely as you remember it.",
      "How many times did you repeat yourself?",
      "What did you do with the urge to add reasons or soften the no?"]),
    ("Hold", "Let them be disappointed",
     "Acknowledge someone's disappointment once, briefly. Then stop. Don't fix it.",
     ["Who was disappointed with you today, and about what?",
      "What did you say? Did you acknowledge once and then stop?",
      "How long did their disappointment last? How long did your discomfort last?"]),
    ("Hold", "Answer a guilt trip",
     "When someone uses guilt, acknowledge what they said, then restate your position.",
     ["Did anyone use guilt on you today? Write their exact words.",
      "How did you respond? Did you acknowledge and hold?",
      "Which kind of guilt line hits you hardest?"]),
    ("Hold", "Follow up on something",
     "Raise one thing you'd normally let slide. Neutral, specific, no \"no rush.\"",
     ["What did you follow up on, and with whom?",
      "Exactly what did you say? Did you soften it more than you meant to?",
      "How did they respond?"]),
    ("Hold", "Ask for something you want",
     "Make one direct request for something that matters to you. No pre-apology.",
     ["What did you ask for, and from whom?",
      "What did the voice say beforehand? Write its exact lines.",
      "What happened? How do you feel about having asked?"]),
    ("Hold", "Stay in a disagreement",
     "Say what you think when you disagree, and don't retreat just because it's uncomfortable. Slow replies again.",
     ["Where did you disagree today? What did you say?",
      "Did you feel the urge to back down? Did you?",
      "How did it end? Was the relationship damaged, or was it fine?"]),
    ("Hold", "The new answer",
     "Reread your Chapter 1 replay log and write the answer you could actually give.",
     ["Write your new answer to the Chapter 1 replay.",
      "Compare it with the 3 a.m. version. What's different?",
      "The single most important thing you learned in the last 21 days:"]),
]

WEEK_INTRO = {
    "Notice": ("Week 1: Notice", "This week you won't be asked to change much. You'll be asked to see the pattern while it's happening."),
    "Pause": ("Week 2: Pause", "This week you put space between someone's request and your answer, and start setting small limits."),
    "Hold": ("Week 3: Hold", "This week you practice staying put after you've said what you meant, when the other person doesn't like it."),
}


def lines(n):
    return "".join('<div class="line"></div>' for _ in range(n))


def esc(s):
    return html.escape(s, quote=False)


def checkin_html(title):
    rows = "".join(
        f'<div class="check"><span class="q">{i}. {esc(s)}</span><span class="scale">0 1 2 3 4 5 6 7 8 9 10</span></div>'
        for i, s in enumerate(CHECKIN, 1))
    return f'<section class="page"><h2>{esc(title)}</h2><p class="small">Circle how true each statement feels right now. Your gut answer is fine.</p>{rows}<h3>Notes</h3>{lines(6)}</section>'


def day_page(label, title, drill, morning, prompts):
    n = 5 if len(prompts) <= 3 else 4
    p = "".join(f'<h4>{esc(q)}</h4>{lines(n)}' for q in prompts)
    return (f'<section class="page"><div class="kicker">{esc(label)}</div><h2>{esc(title)}</h2>'
            f'<div class="drill"><b>Today\'s drill.</b> {esc(drill)} <span class="box"><span class="cb"></span> Done</span></div>'
            f'<h3>Morning</h3><h4>{esc(morning)}</h4>{lines(2)}<h3>Evening</h3>{p}</section>')


def build_html():
    parts = []
    cover_uri = (OUT.parent / "covers" / "cover-journal-letter.png").as_uri()
    parts.append(f'<section class="page bleed"><img src="{cover_uri}" alt=""></section>')
    parts.append('<section class="page titlepage"><div class="cover-in"><div class="kicker">Shadow Persuasion</div>'
                 '<h1>The 21-Day Reset Journal</h1><p class="sub">A companion to <i>Shadow Persuasion: How to Stop Being Used and Take Your Power Back</i></p>'
                 '<p class="author">Nate Harlan</p></div></section>')
    parts.append('<section class="page legal"><div><p><b>The 21-Day Reset Journal</b></p>'
                 '<p>Copyright &copy; 2026 by ShadowPersuasion.com. All rights reserved. You may print this journal for your own personal use. '
                 'No part of it may be reproduced or shared for any other purpose without written permission from the publisher.</p>'
                 '<p>This journal is for general information and self-help only. It is not therapy, medical advice, '
                 'or legal advice, and it is not a substitute for professional help.</p>'
                 '<p>If you feel unsafe with someone you live with or are close to, contact the National Domestic Violence Hotline (US): '
                 '1-800-799-7233, or text START to 88788. If you are in crisis, call or text 988. In an emergency, call 911.</p></div></section>')
    parts.append('<section class="page"><h2>How to use this journal</h2>'
                 '<p>This journal goes with Part Two of <i>Shadow Persuasion</i>. Each day takes about fifteen minutes: a short note in the morning, the drill when the moment comes, and a few questions in the evening.</p>'
                 '<p>Write by hand if you can. Writing is slower than thinking, and slower is the point.</p>'
                 '<p><b>The five rules.</b> Low stakes first. No big confrontations. Missed days are fine, just pick up where you left off. Write something every evening, even two lines. Expect pushback, and don\'t treat it as failure.</p>'
                 '<p><b>A word on safety.</b> If someone in your life is abusive or threatening, don\'t use these drills on that person. Practice with everyone else, and reach out for support. In the US, the National Domestic Violence Hotline is 1-800-799-7233, or text START to 88788.</p></section>')
    parts.append('<section class="page"><h2>My replay log</h2><p class="small">From Chapter 1. The most recent conversation you replayed.</p>'
                 + "".join(f'<h4>{esc(q)}</h4>{lines(3)}' for q in [
                     "Who was it, and where were you?", "What did they say or do?", "What did you say or do?",
                     "What do you wish you had said?", "What were you afraid would happen if you had said it?", "What did they get?"])
                 + '</section>')
    parts.append(checkin_html("Check-in 1: before you begin"))
    for d in QUICK_START:
        parts.append(day_page(*d))
    parts.append('<section class="page"><h2>After the quick start</h2><h4>What did I find out that the voice in my head didn\'t want me to know?</h4>' + lines(14) + '</section>')
    current = None
    for i, (week, title, drill, prompts) in enumerate(DAYS, 1):
        if week != current:
            current = week
            h, p = WEEK_INTRO[week]
            parts.append(f'<section class="page week"><div class="cover-in"><h1>{esc(h)}</h1><p class="sub">{esc(p)}</p></div></section>')
        parts.append(day_page(f"Day {i} · {week}", title, drill, "Where do you expect to use this today?", prompts))
        if i == 7:
            parts.append(checkin_html("Check-in 2: end of Week 1"))
        if i == 14:
            parts.append(checkin_html("Check-in 3: end of Week 2"))
    parts.append(checkin_html("Check-in 4: end of the reset"))
    parts.append('<section class="page"><h2>My new contract</h2><p class="small">From Chapter 26. Your own terms, written as an adult. Keep it short enough to remember.</p>'
                 + "".join(f'<div class="clause">{n}.</div>{lines(2)}' for n in range(1, 7)) + '</section>')
    # Page numbers count every page but, like a printed book, aren't shown on the
    # cover, title, copyright or the dark week-divider pages.
    skip = ('page bleed', 'page titlepage', 'page legal', 'page week')
    numbered = []
    for i, part in enumerate(parts, 1):
        if not any(f'class="{k}"' in part for k in skip):
            part = part[: part.rfind('</section>')] + f'<div class="folio">{i}</div></section>'
        numbered.append(part)
    parts = numbered
    css = (pathlib.Path(OUT / "journal.css").read_text())
    return f'<!doctype html><html><head><meta charset="utf-8"><title>The 21-Day Reset Journal</title><style>{css}</style></head><body>{"".join(parts)}</body></html>'


def build_md():
    out = ["# The 21-Day Reset Journal", "", "*Shadow Persuasion, by Nate Harlan*", ""]
    blank = "\n\n______________________________________________\n\n______________________________________________\n"
    out += ["## Check-in 1: before you begin", ""] + [f"{i}. {s}  (0 to 10): ____" for i, s in enumerate(CHECKIN, 1)] + [""]
    for label, title, drill, morning, prompts in QUICK_START:
        out += [f"## {label}: {title}", "", f"**Today's drill.** {drill}", "", f"**Morning.** {morning}{blank}", "**Evening.**", ""]
        out += [f"*{q}*{blank}" for q in prompts]
    for i, (week, title, drill, prompts) in enumerate(DAYS, 1):
        out += [f"## Day {i} ({week}): {title}", "", f"**Today's drill.** {drill}", "", f"**Morning.** Where do you expect to use this today?{blank}", "**Evening.**", ""]
        out += [f"*{q}*{blank}" for q in prompts]
    return "\n".join(out)


if __name__ == "__main__":
    html_path = OUT / "21-day-reset-journal.html"
    html_path.write_text(build_html())
    import subprocess
    chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    subprocess.run([chrome, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                    f"--print-to-pdf={OUT / '21-day-reset-journal.pdf'}", html_path.as_uri()], capture_output=True, check=True)
    (OUT / "21-day-reset-journal.md").write_text(build_md())
    print("built")
