"""Loads the NEW edition's practice content (v3, "Shadow Persuasion: The Hidden Rules of
Power") into the app database. The app reads it only when NEXT_PUBLIC_BOOK_EDITION=v3
(lib/edition.ts); with the switch off, everyone keeps seeing the old content.

  - book_tactics: the new Tactic Spotter (book-v3/bonuses/drafts/tactic-spotter.md),
    read straight from the guide: 42 ordinary entries in 5 families plus 6 danger signs.
    Rows get edition 'v3' and a slug starting with "v3-", so they sit beside the old 50
    without touching them. Danger signs have no calm reply on purpose (safety = true);
    they point to Chapter 11 and real help.
  - tactic_examples: the quoted lines from each entry's "What it sounds like", as 'seed'
    messages for Train mode (only v3 seed rows are replaced; old ones and AI-written ones stay).
  - scenarios: the new built-in Practice Scenes from lib/practice-v3/scenes.json
    (ids start with "book3-"). The app also reads that file directly, so scenes work on v3
    even before this runs; the database copy keeps scene ids consistent for results.

Quick Reps lines (lib/practice-v3/quick-reps.json) are read by the app from the file and
are not stored in the database.

Safe to re-run: rows are upserted by slug / id.

ORDER MATTERS. Run the real load only after the app code that knows about v3 rows is
deployed: older app code lists every row in book_tactics and every is_book scene, so it
would show the new rows to people on the old edition.

Usage:
  python3 funnel-v2/app-knowledge/seed_practice_v3.py --dry-run   # parse and check only, no database
  python3 funnel-v2/app-knowledge/seed_practice_v3.py             # write (launch only)
Needs migration 033_book_tactics_v3.sql applied first."""
import json, pathlib, re, sys, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
SPOTTER = pathlib.Path.home() / "Desktop/shadow-persuasion/book-v3/bonuses/drafts/tactic-spotter.md"
SCENES = ROOT / "lib/practice-v3/scenes.json"
REPS = ROOT / "lib/practice-v3/quick-reps.json"

# Chapter titles from lib/edition.ts (CHAPTERS_V3) for the chapters used here.
CHAPTERS = {
    3: "The Rules You Never Chose",
    5: "Stay Steady Without Going Cold",
    6: "A Bad Moment or a Pattern?",
    7: "Guilt, Favors, and Hidden Debts",
    8: "When the Story Keeps Changing",
    9: "Silence, Distance, and Conditional Warmth",
    10: "Charm, Urgency, and the Slow Squeeze",
    11: "When Pressure Becomes Danger",
    13: "Listen Without Pretending to Read Minds",
    15: "Make Your Case Land",
    16: "Change the Frame, Not the Facts",
    17: "Ask for More and Negotiate Well",
    18: "Build Alternatives Before You Need Them",
    20: "Build Allies Without Creating Debts",
    22: "Turn Agreement Into Action",
    23: "Work, Pay, and Recognition",
    24: "Clients, Customers, and Money Decisions",
    25: "Dating, Intimacy, and Difficult Relationships",
    26: "Family, Friends, and the Roles That Stick",
    27: "Groups, Media, and Manufactured Pressure",
    28: "When They Still Say No",
}

# The guide's sections, in order, and the chapter that covers each.
FAMILIES = {
    "Guilt, favors, and hidden debts": 7,
    "When the story keeps changing": 8,
    "Silence, distance, and conditional warmth": 9,
    "Charm, urgency, and the slow squeeze": 10,
    "Groups, audiences, and outside pressure": 27,
    "Danger signs": 11,
}
EXPECTED = {7: 8, 8: 11, 9: 4, 10: 10, 27: 9, 11: 6}


def slugify(s):
    return "v3-" + re.sub(r"[^a-z0-9]+", "-", s.lower().replace("'", "")).strip("-")


def field(body, label):
    m = re.search(r"^\*\*" + re.escape(label) + r":\*\*[ \t]*(.*)$", body, flags=re.M)
    return m.group(1).strip() if m else None


def calm_reply(body):
    """The reply and any notes that follow it, up to "When not to confront"."""
    m = re.search(r"^\*\*Calm reply:\*\*(.*?)(?=^\*\*When not to confront:\*\*)", body, flags=re.M | re.S)
    if not m:
        return None, None
    chunk = m.group(1).strip()
    quote = re.search(r"^> \*\*Try saying:\*\* (.+)$", chunk, flags=re.M)
    if quote:
        reply = quote.group(1).strip().strip('"').strip("“”")
        rest = re.sub(r"^>.*$", "", chunk, flags=re.M)
    else:
        # A few entries ("Outrage and mass persuasion", "Store and app tricks") give advice, not a line to say.
        parts = [p.strip() for p in chunk.split("\n\n") if p.strip()]
        reply, rest = (parts[0] if parts else ""), "\n\n".join(parts[1:])
    note = " ".join(p.strip() for p in rest.split("\n") if p.strip()) or None
    return reply, note


def examples_from(sounds):
    """Quoted lines from "What it sounds like" that read as something a person says."""
    out = []
    for q in re.findall(r'"([^"]+)"', sounds or ""):
        q = q.strip().rstrip(",").strip()
        # skip fragments from the middle of a sentence ("just until payday,")
        if len(q) >= 12 and q[0].isupper() and q not in out:
            out.append(q)
    return out[:4]


def parse_spotter():
    md = SPOTTER.read_text()
    assert "—" not in md, "em-dash in the Tactic Spotter"
    tactics, family, chapter = [], None, None
    blocks = re.split(r"(?m)^(## .*|### .*)$", md)
    for i in range(1, len(blocks), 2):
        head, body = blocks[i].strip(), blocks[i + 1]
        if head.startswith("## "):
            title = head[3:].strip()
            family, chapter = (title, FAMILIES[title]) if title in FAMILIES else (None, None)
            continue
        if not family:
            continue  # "Before you look anything up" and other front sections
        name = head[4:].strip()
        sounds = field(body, "What it sounds like")
        assert sounds, f"no 'What it sounds like' for {name}"
        danger = chapter == 11
        if danger:
            reply, note = "", None
            warn = field(body, "Why there's no script")
            help_text = field(body, "What helps")
            # "What helps" can run over more than one paragraph (self-harm entry).
            m = re.search(r"^\*\*What helps:\*\*(.*?)(?=^\*\*Book:\*\*)", body, flags=re.M | re.S)
            if m:
                help_text = " ".join(p.strip() for p in m.group(1).strip().split("\n\n") if p.strip())
            other, not_confront = None, None
            assert warn and help_text, f"danger entry {name} is missing a field"
        else:
            reply, note = calm_reply(body)
            warn = field(body, "Concerning if")
            other = field(body, "Other explanations")
            not_confront = field(body, "When not to confront")
            help_text = None
            assert reply and warn and other and not_confront, f"entry {name} is missing a field"
        book = field(body, "Book")
        tactics.append({
            "slug": slugify(name),
            "number": len(tactics) + 1,
            "name": name,
            "family": family,
            "chapter": chapter,
            "chapter_title": CHAPTERS[chapter],
            "looks_like": sounds,
            "purpose": "",  # the new guide has no "what it's for"; other_explanations and warning_sign carry the meaning
            "warning_sign": warn,
            "calm_reply": reply,
            "note": note,
            "examples": examples_from(sounds),
            "harm": None,
            "works_on": None,
            "safety": danger,
            "edition": "v3",
            "other_explanations": other,
            "not_confront": not_confront,
            "help": help_text,
            "book_note": book,
        })
    counts = {}
    for t in tactics:
        counts[t["chapter"]] = counts.get(t["chapter"], 0) + 1
    assert counts == EXPECTED, f"entry counts by chapter {counts} != {EXPECTED}"
    assert len({t["slug"] for t in tactics}) == len(tactics), "duplicate slugs"
    return tactics


def load_scenes(tactics):
    by_slug = {t["slug"]: t for t in tactics}
    scenes = json.loads(SCENES.read_text())
    rows = []
    for i, s in enumerate(scenes):
        assert s["id"].startswith("book3-"), s["id"]
        assert s["chapter"] in CHAPTERS, f"{s['id']}: chapter {s['chapter']} not in the title list"
        assert s["chapter_title"] == CHAPTERS[s["chapter"]], f"{s['id']}: chapter title mismatch"
        if s.get("tactic_slug"):
            assert s["tactic_slug"] in by_slug, f"{s['id']}: unknown tactic {s['tactic_slug']}"
            assert not by_slug[s["tactic_slug"]]["safety"], f"{s['id']}: scenes never practice a danger sign"
        text = json.dumps(s)
        assert "—" not in text and "–" not in text, f"{s['id']}: dash"
        t = by_slug.get(s.get("tactic_slug") or "")
        rows.append({
            "id": s["id"], "title": s["title"], "category": s["category"], "difficulty": s["difficulty"],
            "description": s["description"], "objective": s["objective"], "techniques": [t["name"]] if t else [],
            "is_generated": False, "source_books": ["Shadow Persuasion: The Hidden Rules of Power"],
            "is_book": True, "user_id": None, "chapter": s["chapter"], "chapter_title": s["chapter_title"],
            "tactic_slug": s.get("tactic_slug"), "other_person": s["other_person"],
            "opening_line": s["opening_line"], "sort_order": 1000 + i,
        })
    return rows


def check_reps(tactics):
    by_slug = {t["slug"]: t for t in tactics}
    reps = json.loads(REPS.read_text())
    for r in reps:
        assert r["chapter"] in CHAPTERS, f"rep chapter {r['chapter']}"
        if r.get("tacticSlug"):
            assert r["tacticSlug"] in by_slug and not by_slug[r["tacticSlug"]]["safety"], f"rep tactic {r['tacticSlug']}"
        assert "—" not in r["line"] and "–" not in r["line"], r["line"]
    return reps


def sb_client():
    env = {}
    for line in (ROOT / ".env.local").read_text().splitlines():
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').removesuffix("\\n")
    url, key = env["NEXT_PUBLIC_SUPABASE_URL"], env["SUPABASE_SERVICE_ROLE_KEY"]

    def sb(method, path, body=None, prefer=None):
        h = {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json", "User-Agent": "ShadowPersuasion/1.0"}
        if prefer:
            h["Prefer"] = prefer
        req = urllib.request.Request(f"{url}/rest/v1/{path}", data=json.dumps(body).encode() if body is not None else None, headers=h, method=method)
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.read()

    return sb


def main():
    dry = "--dry-run" in sys.argv
    tactics = parse_spotter()
    scenes = load_scenes(tactics)
    reps = check_reps(tactics)
    examples = [{"tactic_slug": t["slug"], "message": e, "context": None, "source": "seed"} for t in tactics for e in t["examples"]]

    fam = None
    for t in tactics:
        if t["family"] != fam:
            fam = t["family"]
            print(f"\n{fam} (Chapter {t['chapter']}, {t['chapter_title']})")
        reply = "no script, points to help" if t["safety"] else f'"{t["calm_reply"][:70]}"'
        print(f"  {t['number']:>2}. {t['name']:<48} {len(t['examples'])} lines  {reply}")
    print(f"\ntactics: {len(tactics)} ({sum(1 for t in tactics if not t['safety'])} ordinary, {sum(1 for t in tactics if t['safety'])} danger signs)")
    print(f"seed example lines: {len(examples)}")
    print(f"scenes: {len(scenes)}  ({', '.join(sorted({s['category'] for s in scenes}))})")
    print(f"quick-rep lines (read from the file by the app, not stored): {len(reps)}")

    if dry:
        print("\nDry run: nothing was written.")
        return

    sb = sb_client()
    sb("POST", "book_tactics?on_conflict=slug", tactics, "resolution=merge-duplicates,return=minimal")
    print(f"stored tactics: {len(tactics)}")
    # Replace only the v3 seed lines; old seed lines and AI-written lines stay.
    sb("DELETE", "tactic_examples?source=eq.seed&tactic_slug=like.v3-*", prefer="return=minimal")
    sb("POST", "tactic_examples", examples, "return=minimal")
    print(f"stored seed examples: {len(examples)}")
    sb("POST", "scenarios?on_conflict=id", scenes, "resolution=merge-duplicates,return=minimal")
    print(f"stored scenes: {len(scenes)}")


if __name__ == "__main__":
    main()
