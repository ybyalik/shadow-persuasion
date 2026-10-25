"""Loads the book's practice content into the app database:
  - book_tactics: the 50 tactics from bonuses/tactic-spotter.md, each tied to
    the Part Three chapter (11 to 18) that covers its family. Name, warning sign
    and calm reply are read straight from the guide; what it's for, the chapter
    link and extra example lines are below.
  - tactic_examples: the example lines, as 'seed' messages for Train mode.
  - scenarios: the book's practice scenes (is_book = true).
Safe to re-run: rows are upserted by slug/id.
Needs migration 025. Usage: python3 seed_practice.py"""
import json, pathlib, re, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
ENV = {}
for line in (ROOT / ".env.local").read_text().splitlines():
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1)
        ENV[k.strip()] = v.strip().strip('"').removesuffix("\\n")
SB, SK = ENV["NEXT_PUBLIC_SUPABASE_URL"], ENV["SUPABASE_SERVICE_ROLE_KEY"]


def sb(method, path, body=None, prefer=None):
    h = {"apikey": SK, "Authorization": f"Bearer {SK}", "Content-Type": "application/json", "User-Agent": "ShadowPersuasion/1.0"}
    if prefer:
        h["Prefer"] = prefer
    req = urllib.request.Request(f"{SB}/rest/v1/{path}", data=json.dumps(body).encode() if body is not None else None, headers=h, method=method)
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


CHAPTERS = {
    11: "Guilt and Obligation",
    12: "Rewriting the Past",
    13: "Withdrawal",
    14: "Charm and Pressure",
    15: "The Slow Squeeze",
    16: "Intimidation",
    17: "Manipulation at Scale",
    18: "How Groups Pull You In",
}

# number: (chapter, what it's for, extra example lines, harm, works on, safety)
EXTRA = {
    1: (11, "It turns a relationship into an account. Past kindness becomes a debt, and the request in front of you becomes the repayment. Saying no makes you feel not just unhelpful but ungrateful.",
        ["I was there for you when you needed me. Now I need you.", "I gave up so much to raise you, and you can't give me one Sunday?"], "Medium", "Guilt, need to be seen as good", False),
    2: (11, "The martyr doesn't ask you directly, so you can't decline directly. They make their suffering visible and wait for you to rescue them. If you don't step in, you're the one who let them struggle alone.",
        ["It's fine. I'm used to handling everything.", "No, you go and enjoy yourself. I'll stay here and finish up."], "Medium", "Guilt", False),
    3: (11, "It moves the spotlight from what they did to how hard their life is. Your concern starts to feel cruel, so you drop it and comfort them instead.",
        ["Nobody ever asks how I'm doing. And now this.", "Of course it's my fault. It's always my fault."], "Medium", "Guilt, fear of conflict", False),
    4: (11, "Real pain from the past is used as a wall. Raising anything about their behavior now feels heartless, so the behavior never gets talked about.",
        ["After the year I've had, you want to talk about this?", "You know how hard things were for me growing up."], None, None, False),
    5: (11, "It ties your choices to their safety, so saying no feels like putting a life at risk. Take it seriously every time, and bring in real help. You don't have to carry it alone.",
        ["If you go, I can't promise I'll be okay.", "Maybe everyone would be better off without me."], "High", "Fear of loss, guilt", True),
    6: (13, "It makes the cost of displeasing them so uncomfortable that you'll do almost anything to end it. Often the silence only breaks when you apologize, even if you did nothing wrong.",
        ["Fine.", "(No reply for two days after you said you couldn't come.)"], "High", "Fear of loss, guilt", False),
    7: (14, "It creates a strong bond before you've had time to see the person clearly. Later, when the attention cools or turns into control, you're already attached and work hard to get back to how it felt at the start.",
        ["You're the best thing that's ever happened to me, and we only met last week.", "Why wait? I already know you're the one."], "High", "Loneliness", False),
    8: (14, "Promises about tomorrow get you to accept unfair treatment today. The promise is renewed every time the deadline passes.",
        ["Once this project's done, I'll make sure you get the promotion.", "Just get me through this month, and I'll pay you back with interest."], "Medium", "Hope, need for approval", False),
    9: (15, "It keeps you working while the reward stays out of reach. Each time you meet the standard, a new one appears, and you never get to enough.",
        ["This is great, but could you also take on the Henderson account?", "If you can keep these numbers up another quarter, then we'll talk."], "Medium", "Need for approval", False),
    10: (12, "The moment you raise a concern, they become the hurt one. Now you're defending yourself, and your concern quietly disappears.",
        ["Wow. After the week I've had, you come at me with this?", "I'm honestly hurt you'd even think that of me."], None, None, False),
    11: (12, "Your real point gets swapped for an extreme version that's easy to argue with. You spend your energy correcting the record instead of being heard.",
        ["So I'm just a terrible mother now? Is that what you're saying?", "Oh, so you want me to quit my job and stay home?"], None, None, False),
    12: (12, "An old, unrelated complaint pulls the talk away from your concern. Soon the conversation is about you, and your point never gets an answer.",
        ["Funny you bring that up, after what you did at Christmas.", "And what about all the times you were late?"], None, None, False),
    13: (12, "Questions come faster than you can answer. You never finish a thought, get flustered, and end up defending yourself on several fronts at once.",
        ["Why didn't you tell me? When did you decide? Who else knows? Were you ever going to say anything?", "What time? With who? Why them? Why now?"], None, None, False),
    14: (12, "Plain words become slippery when the plain meaning doesn't suit them. You end up arguing about definitions instead of what was agreed.",
        ["I said I'd try to come. Trying isn't promising.", "I never said 'pay you back.' I said 'sort it out.'"], None, None, False),
    15: (12, "A made-up worse situation makes the real problem look small. Your concern starts to feel petty by comparison.",
        ["It's not like I cheated on you. It was just a few texts.", "Imagine if I'd actually forgotten your birthday. Then you could complain."], None, None, False),
    16: (14, "Praise wraps the criticism so it's hard to answer without seeming ungrateful. You swallow the hard part to keep the nice parts.",
        ["You're such a great dad, which is why it's so sad you missed the recital. But you know I adore you.", "You're the smartest one on the team, so I was surprised how sloppy this was. Anyway, love your energy."], None, None, False),
    17: (12, "They don't deny it happened. They deny it matters. Your hurt becomes the problem instead of their comment.",
        ["Relax, it was just a joke. You're too sensitive.", "Everyone else thought it was funny."], "Medium", "Need for approval", False),
    18: (16, "Talking over you means you never finish a thought, so your point never fully lands. Over time you stop trying to make it.",
        ["(Cuts in halfway through your sentence) Okay, but here's the thing...", "Let me stop you there."], None, None, False),
    19: (12, "Fake disbelief makes you feel unreasonable for raising anything at all. You start to wonder if it's worth bringing up.",
        ["Seriously? You're doing this now? Really?", "Are you actually upset about that?"], None, None, False),
    20: (12, "A label on you replaces an answer to what you said. Now you're arguing about your character, and the issue is gone.",
        ["You're being dramatic again.", "Why do you always have to be so difficult?"], None, None, False),
    21: (12, "It surrounds you with an invisible jury. Your view stops being one of two and becomes the odd one out, and you usually can't check what anyone really said.",
        ["Your sister agrees with me, by the way.", "I asked around, and nobody else has a problem with it."], "Medium", "Need for approval, fear of loss", False),
    22: (16, "An expert or authority is quoted in a way you can't check or answer. Disagreeing starts to feel like arguing with the expert, not with them.",
        ["My therapist says you're the real problem here.", "Legal would never sign off on what you're asking for."], None, None, False),
    23: (16, "An audience raises the stakes. Saying no in front of others feels like a public fight, so many people agree to things they'd refuse in private.",
        ["(In front of the whole team) So are you going to fix your mistake or not?", "(At dinner with family) Tell everyone how you forgot to pay the bill again."], "Medium", "Need for approval, fear of conflict", False),
    24: (11, "It turns a request into a verdict on who you are. Saying no stops being a scheduling choice and becomes proof that you're selfish or disloyal.",
        ["A real friend would do this.", "If you really cared about the team, you'd stay."], "Medium", "Need to be seen as good", False),
    25: (11, "You're measured against someone who isn't there to speak for themselves. The pull is to prove you're just as good by saying yes.",
        ["Your sister never complains about helping.", "My last assistant never had a problem staying late."], None, None, False),
    26: (18, "Quiet comments about what others 'really' think set people against each other. The person in the middle stays in control of the group.",
        ["I shouldn't say this, but your brother thinks you're taking advantage of Mom.", "Between us, the team isn't happy with how you ran that meeting."], None, None, False),
    27: (18, "Slowly, you see less of the people who knew you before. Without them, there's no one to tell you something is off.",
        ["Your friends don't really get you like I do.", "Every time you see your family, you come back different."], "High", "Belonging, loneliness", True),
    28: (16, "The whole relationship is held over one issue, so raising anything feels like risking everything.",
        ["I don't know if this is going to work if you keep bringing this up.", "Maybe we're just not right for each other, if this is how it's going to be."], "High", "Fear of loss", False),
    29: (12, "A claim about what 'everyone' does makes their behavior seem normal and your concern seem strange.",
        ["Anyone in my position would have done exactly the same.", "Everybody reads their partner's texts. That's normal."], None, None, False),
    30: (14, "The compliment is built so that saying no would mean you're not as smart or as kind as they just said. You accept the praise and the request together.",
        ["You're too smart to fall for all that worry, aren't you?", "Someone as generous as you wouldn't make a fuss over this."], "Low", "Need for approval", False),
    31: (12, "If the event didn't happen, there's nothing to answer for. The talk about their behavior turns into a talk about your memory, again and again.",
        ["That never happened. You're imagining things.", "I never said that. You're making things up."], "High", "Self-doubt", False),
    32: (12, "The past isn't denied. It's edited. Your hesitant 'I guess so' becomes eager agreement, and you become the one at fault.",
        ["You agreed to this. Don't you remember?", "You said it was fine at the time."], "Medium", "Self-doubt", False),
    33: (12, "Responsibility for their behavior moves onto you. If you accept it, you spend your energy behaving better to prevent their reactions.",
        ["You made me do it.", "This is what happens when you push me."], "High", "Guilt", False),
    34: (17, "Details you needed arrive after the moment they would have changed your decision. By then you've already agreed.",
        ["Oh, I didn't think you needed to know about the cancellation fee.", "I didn't mention my brother was moving in too? It's only for a bit."], None, None, False),
    35: (14, "Urgency shuts down careful thinking. When you feel rushed you fall back on habit, and for kind people, habit is yes.",
        ["I need an answer by end of day.", "If you don't decide now, someone else will take it."], "Medium", "Urgency", False),
    36: (15, "You're asked to commit before you know what you're committing to. Once you've said yes in principle, the details are much harder to refuse.",
        ["Just say yes for now. We'll figure out the details later.", "Can I put you down as a yes? It's nothing big."], None, None, False),
    37: (14, "Big asks arrive when you're tired, rushed, or upset, the moments when you're least able to think it through and most likely to say yes to make it stop.",
        ["(At 11pm) Hey, quick thing, can you co-sign the lease tomorrow?", "(Right after an argument) So can I count on you for Saturday or not?"], None, None, False),
    38: (17, "A flood of numbers and side points leaves you confused, and confused people tend to agree just to get out of the conversation.",
        ["So with the rider, the bundled rate, the loyalty credit and the upgrade fee, it works out cheaper. Sign here.", "There are a lot of moving parts. You don't need to understand all of it. Just trust the plan."], None, None, False),
    39: (12, "The records that would settle a question tend to disappear, so it's always your word against theirs.",
        ["I deleted those messages ages ago.", "I don't have that email anymore. You must be thinking of something else."], None, None, False),
    40: (16, "A complicated situation is squeezed into two choices, and both of them suit the other person.",
        ["Either you trust me or you don't.", "You either come every Sunday or you obviously don't care."], "High", "Fear of loss", False),
    41: (13, "The pause is meant to make you uncomfortable enough to fill it, usually with a concession or an apology.",
        ["(They make the request, then just look at you and wait.)", "...(A long pause on the phone after you name your price.)"], None, None, False),
    42: (17, "Talk of easy alternatives makes you lower your price or drop your terms before anyone has said no.",
        ["I've got three other people who'd do it for less.", "Honestly, I don't really need this. I'm just being nice."], None, None, False),
    43: (16, "Anger creates an instant sense of danger. Most people back down just to make it stop, so shouting skips the work of persuading you.",
        ["(Shouting) Why can't you just do what I asked?", "Don't you dare walk away from me while I'm talking!"], "Medium", "Fear of conflict", True),
    44: (15, "Taking the task over once teaches both of you that it's now your job. They get out of work they could easily learn, and you quietly pick up one more thing for good.",
        ["You're so much better with the forms. I'd only mess it up.", "I tried, but it's too confusing. Could you just call them for me?"], "Medium", "Guilt, need for approval", False),
    45: (15, "Small crossings test whether you'll let a limit slide. If the small one works, a bigger one follows.",
        ["I know you said no calls after nine, but this will only take a sec.", "I know we said Friday, but can you just do it tonight?"], None, None, False),
    46: (15, "Each step is only slightly bigger than the last, and nobody ever asks. One day you're doing far more than you agreed to.",
        ["Can you keep covering Mondays? It's only until we hire someone.", "Since you're already picking up my kids, could you do Thursdays too?"], "Medium", "Guilt", False),
    47: (14, "Saying yes to a small request makes the next one harder to refuse. You've started, you want to be consistent, and stopping feels rude.",
        ["Could you just look at this for five minutes?", "While you're at it, could you fix the formatting too?"], "Low", "Need to be seen as good", False),
    48: (17, "The first offer is so low that even a 'compromise' leaves you well short of fair.",
        ["I was thinking $300 for the whole job.", "I can do half your asking price, cash, today."], None, None, False),
    49: (12, "You're accused of the very thing they're doing. Now you're busy defending yourself, and their behavior goes unexamined.",
        ["You're the controlling one here.", "You never listen. That's the problem."], None, None, False),
    50: (15, "Your contributions become available for others to claim because you're unlikely to object. Others build reputations on your work while you stay invisible.",
        ["(In the meeting) So I had this idea to move the launch to spring...", "Great work, team. I'm glad my plan came together."], "Medium", "Fear of conflict", False),
}


def slugify(name):
    s = re.sub(r"[\"'?]", "", name.lower())
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def parse_spotter():
    md = (ROOT / "funnel-v2/bonuses/tactic-spotter.md").read_text()
    tactics, family = [], None
    blocks = re.split(r"(?m)^(## .*|### \d+\. .*)$", md)
    for i in range(1, len(blocks), 2):
        head, body = blocks[i].strip(), blocks[i + 1]
        if head.startswith("## "):
            m = re.match(r"## Part \d+: (.*)", head)
            family = m.group(1).strip() if m else None
            continue
        m = re.match(r"### (\d+)\. (.*)", head)
        num, name = int(m.group(1)), m.group(2).strip()
        hear = re.search(r"\*\*You'll hear:\*\* (.*)", body).group(1).strip()
        warn = re.search(r"\*\*Warning sign:\*\* (.*)", body).group(1).strip()
        after = body.split("**Calm reply:**", 1)[1]
        lines = after.strip().splitlines()
        quote, rest, in_quote = [], [], True
        for ln in lines:
            if in_quote and (ln.startswith(">") or not ln.strip()) and not rest:
                if ln.startswith(">"):
                    quote.append(ln.lstrip("> ").strip())
                continue
            in_quote = False
            rest.append(ln)
        reply = " ".join(quote).strip().strip('"').strip("“”")
        note = " ".join(l.strip() for l in rest if l.strip())
        note = re.sub(r"\s*See Chapter \d+( and Chapter \d+)?\.", "", note)
        note = re.sub(r",? and if this is part of a controlling relationship, see the warning signs in Chapter 16\.", ".", note)
        note = note.replace("See Chapter 18.", "").strip() or None
        chapter, purpose, extra, harm, works_on, safety = EXTRA[num]
        examples = []
        if hear.startswith('"'):
            # keep each quoted line from "You'll hear" as an example
            examples += [q.strip() for q in re.findall(r'"([^"]+)"', hear)]
        examples += [e for e in extra if e not in examples]
        tactics.append({
            "slug": slugify(name), "number": num, "name": name, "family": family,
            "chapter": chapter, "chapter_title": CHAPTERS[chapter],
            "looks_like": hear, "purpose": purpose, "warning_sign": warn,
            "calm_reply": reply, "note": note, "examples": examples[:4],
            "harm": harm, "works_on": works_on, "safety": safety,
        })
    assert len(tactics) == 50, len(tactics)
    return tactics


# The book's practice scenes. difficulty: 1 Easy, 2 Medium, 3 Hard.
SCENES = [
    ("holiday-hosting-again", "Hosting the holidays, again", "Family", 1, 11, "the-martyr",
     "Your mother-in-law, Carol",
     "It's late October. Carol calls to 'check in' about Thanksgiving. You hosted the last four years and told your partner this year you'd like someone else to take a turn.",
     "Say kindly that you're not hosting this year, without taking it back when she sighs.",
     "Well, I suppose I'll just do the whole thing myself this year. Like I always used to. Don't worry about me."),
    ("boss-weekend-dump", "The Friday 4:55 email", "Work", 2, 15, "the-slow-creep",
     "Your manager, Greg",
     "It's Friday afternoon. Greg stops by your desk with a report that 'just needs a few hours' over the weekend. This is the third weekend this month.",
     "Decline the weekend work and suggest a fair plan for Monday.",
     "Hey, glad I caught you. I need the quarterly deck reworked by Monday morning. Shouldn't take more than a few hours this weekend. You're the only one I trust with it."),
    ("friend-borrowing-again", "Your friend needs money again", "Friends", 2, 1, "guilt-tripping",
     "Your friend Dana",
     "Dana still owes you $400 from the spring. Now she's texting to ask for another $300 for car repairs.",
     "Say no to the new loan and bring up the old one calmly.",
     "I hate asking, I really do. But after everything I did for you when you moved, I figured you'd understand. I just need $300 till the end of the month."),
    ("partner-silent-treatment", "The silent treatment after a no", "Partner", 2, 6, "the-silent-treatment",
     "Your partner, Sam",
     "Yesterday you said you didn't want to spend your bonus on a new TV. Since then Sam has barely spoken to you. This morning you said good morning and got a shrug.",
     "Stay warm and open without apologizing for a decision you still stand by.",
     "(Long pause, eyes on the phone) ...Fine. Whatever."),
    ("aging-parent-guilt", "Every Sunday, or you don't care", "Family", 3, 40, "either-or",
     "Your father, Frank",
     "Your dad is 78 and lives alone an hour away. You visit twice a month and call often. He wants you there every Sunday, and lets you know when you miss one.",
     "Keep your visiting plan, show you care, and don't accept the either-or.",
     "I guess Sunday isn't important to you anymore. Either you make time for your father or you don't. Your brother would come if he lived closer."),
    ("coworker-takes-credit", "Your idea, their name", "Work", 2, 50, "stolen-credit",
     "Your coworker, Priya",
     "In this morning's meeting Priya presented the scheduling fix you shared with her last week, as her own. Now she's at the coffee machine with you.",
     "Name what happened calmly and agree how credit works from here.",
     "Great meeting, right? Everyone loved my scheduling idea. I think it'll really get me noticed."),
    ("pushy-car-salesperson", "Today only at the dealership", "Out in the world", 1, 35, "false-urgency",
     "A salesperson named Rick",
     "You came in to look at a used SUV. You told yourself you would not buy anything today. Rick has been with you for an hour.",
     "Leave without signing, politely, no matter what price he offers.",
     "Look, I went to bat for you with my manager. This price is only good today. If you walk out that door, I can't promise it'll be here tomorrow."),
    ("group-chat-pressure", "The group chat wants a yes", "Friends", 2, 21, "everyone-agrees-with-me",
     "Your friend Jess, in the group chat",
     "Your college friends are planning a pricey weekend away. You said it isn't in your budget this year. The chat keeps pinging.",
     "Hold your no in the group without over-explaining or apologizing.",
     "Come onnn, literally everyone else is in. We all agreed it won't be the same without you. Don't be the one who ruins it!"),
    ("sister-babysitting-creep", "Just Thursdays too", "Family", 1, 46, "the-slow-creep",
     "Your sister, Megan",
     "You agreed to pick up Megan's kids from school on Mondays 'for a few weeks' in September. It's now November and she's asking for more.",
     "Put an end date on the arrangement and say no to the extra day.",
     "You're a lifesaver. Since you're already doing Mondays, could you take Thursdays too? It's basically the same thing."),
    ("partner-rewrites-agreement", "We decided this together", "Partner", 3, 32, "rewriting-the-past",
     "Your partner, Chris",
     "Last month you both agreed to split chores: you cook, Chris does laundry. The laundry has piled up for two weeks. You bring it up.",
     "Stay with what you remember and agree on the plan going forward, in writing if needed.",
     "I never agreed to do all the laundry. You said you'd handle it if I cooked on weekends. Don't you remember?"),
    ("boss-raised-voice", "The raised voice in the office", "Work", 3, 43, "the-raised-voice",
     "Your manager, Diane",
     "You told Diane the deadline she set isn't possible without dropping another project. She closes the door and her voice gets louder.",
     "Stay steady, refuse to talk under shouting, and offer to continue later.",
     "Are you kidding me? I don't want excuses! I want it done by Wednesday, and I don't care how!"),
    ("in-law-public-comment", "A comment at the dinner table", "Family", 2, 23, "public-shaming",
     "Your brother-in-law, Kevin",
     "At a family birthday dinner, Kevin brings up your recent job change in front of everyone, with a smirk.",
     "Decline to discuss it in front of the group, without getting defensive.",
     "So, tell everyone how the new job's going. Or are we not supposed to mention that you got let go from the last one?"),
    ("new-friend-love-bomb", "Too close, too fast", "Friends", 1, 7, "love-bombing",
     "Your new friend Tara",
     "You met Tara at a book club three weeks ago. She texts daily, bought you a gift, and now wants to plan a trip together.",
     "Say warmly that you'd like to take the friendship slower.",
     "I feel like I've known you forever! I already booked us a cabin for next month. You HAVE to come. Best friends do this stuff."),
    ("adult-son-helpless", "Can you just handle it?", "Family", 1, 44, "strategic-helplessness",
     "Your adult son, Jake (26)",
     "Jake needs to renew his car registration. He's asked you to do it for him, like last year and the year before.",
     "Offer to show him once, and leave the task with him.",
     "Mom, you know I'm hopeless with this stuff. You're so much better at the forms. Can you just do it? Please?"),
    ("client-lowball", "The lowball offer", "Money", 2, 48, "the-lowball",
     "A potential client, Mark",
     "You do bookkeeping on the side. Mark wants you to clean up two years of his books. You'd quote $1,800.",
     "Name your fair price and talk about scope, not a counteroffer from his number.",
     "I was thinking $400 for the whole thing. It's mostly data entry, right? I've got other people who'd do it for less."),
    ("partner-turns-tables", "When your concern becomes their hurt", "Partner", 3, 10, "turning-the-tables",
     "Your partner, Alex",
     "Alex has been coming home two hours late without texting. You calmly said it worries you and asked for a quick message.",
     "Keep the conversation on your request while staying kind about their feelings.",
     "Wow. I work all day for us, and this is what I come home to? Honestly, I'm hurt you'd even bring this up."),
    ("neighbor-foot-in-door", "Just a quick look", "Out in the world", 1, 47, "the-foot-in-the-door",
     "Your neighbor, Linda",
     "Linda asked you to 'take a quick look' at her laptop. You did. Now she wants more.",
     "Stop at the quick look you agreed to, kindly.",
     "Oh, you're a genius! While you're in there, could you set up my printer and move all my photos over? It'll only take a minute for someone like you."),
    ("mother-gaslighting", "That never happened", "Family", 3, 31, "gaslighting",
     "Your mother, Joan",
     "You reminded your mom that she promised to stop commenting on your weight in front of the kids. She did it again at lunch.",
     "Don't fight about the past. State what you need going forward.",
     "I never said anything about your weight. You're imagining things again. You've always been so sensitive."),
    ("coworker-character-test", "A real team player would stay", "Work", 2, 24, "the-character-test",
     "Your coworker, Tom",
     "It's 5:30. You have your daughter's recital at 6:30. Tom wants you to stay and help finish a client proposal that he left until the last minute.",
     "Leave on time without defending your character.",
     "Seriously? I thought you were someone I could count on. A real team player wouldn't bail right now."),
    ("phone-scam-grandkid", "A call from a 'grandson'", "Out in the world", 2, 35, "false-urgency",
     "A caller who says he's your grandson",
     "Your phone rings from an unknown number. A young man says he's your grandson, he's in trouble, and he needs money wired right now.",
     "Don't send anything. End the call and check directly with your family.",
     "Grandma? It's me. I'm in trouble, I got arrested. Please don't tell Mom. I need $2,000 for bail right now, they said you can pay with gift cards."),
    ("friend-isolation", "Your friends don't get you", "Partner", 3, 27, "isolation",
     "Your partner, Ryan",
     "You've planned a girls' night with old friends for Saturday. Ryan is unhappy about it, again. You haven't seen these friends in months.",
     "Keep your plans and your friendships, calmly, without a long defense.",
     "Why do you even want to see them? They don't really get you like I do. Every time you hang out with them you come back different."),
    ("hoa-group-pull", "The committee wants more", "Out in the world", 2, 46, "the-slow-creep",
     "Barbara, the community board chair",
     "You agreed to help with the neighborhood newsletter 'just once.' It's been a year, and now Barbara wants you to run the whole events committee.",
     "Say no to the committee and set a clear end to the newsletter help.",
     "We all just assumed you'd step up. You've been such a part of the team. Honestly, there's no one else who could do it."),
]


def scene_rows(tactics):
    by_slug = {t["slug"]: t for t in tactics}
    rows = []
    for i, (sid, title, cat, diff, _num, tslug, other, desc, goal, opening) in enumerate(SCENES):
        t = by_slug[tslug]
        rows.append({
            "id": f"book-{sid}", "title": title, "category": cat, "difficulty": diff,
            "description": desc, "objective": goal, "techniques": [t["name"]],
            "is_generated": False, "source_books": ["Shadow Persuasion"],
            "is_book": True, "user_id": None, "chapter": t["chapter"],
            "chapter_title": t["chapter_title"], "tactic_slug": tslug,
            "other_person": other, "opening_line": opening, "sort_order": i + 1,
        })
    return rows


def main():
    tactics = parse_spotter()
    sb("POST", "book_tactics?on_conflict=slug", tactics, "resolution=merge-duplicates,return=minimal")
    print(f"tactics: {len(tactics)}")
    examples = [{"tactic_slug": t["slug"], "message": e, "context": None, "source": "seed"} for t in tactics for e in t["examples"]]
    # unique index is on (slug, md5(message)); clear old seed rows first, keep AI-cached ones
    sb("DELETE", "tactic_examples?source=eq.seed", prefer="return=minimal")
    sb("POST", "tactic_examples", examples, "return=minimal")
    print(f"seed examples: {len(examples)}")
    scenes = scene_rows(tactics)
    sb("POST", "scenarios?on_conflict=id", scenes, "resolution=merge-duplicates,return=minimal")
    print(f"scenes: {len(scenes)}")


if __name__ == "__main__":
    main()
