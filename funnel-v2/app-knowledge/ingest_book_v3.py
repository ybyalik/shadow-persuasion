"""Loads the NEW book edition (v3, "Shadow Persuasion: The Hidden Rules of Power")
and its included bonuses into knowledge_chunks, so the app's book search can
answer from it once NEXT_PUBLIC_BOOK_EDITION=v3 (see lib/edition.ts and the
BOOK_SOURCES list in lib/rag.ts).

What it reads (from --book-dir, default ~/Desktop/shadow-persuasion/book-v3):
  drafts/front-matter.md, drafts/part*-opener.md, drafts/ch01..ch34*.md,
  drafts/back-matter.md (Situation Finder, tool index, pattern quick reference),
  and, when they exist, the four bonuses that come with the book in
  bonuses/drafts/: the 21-Day Power Reset Journal, The Tactic Spotter,
  The Conversation Planner, The Power Map and Decision Cards.
  The paid products (100 Ready-to-Use Replies, the Playbook Library) are never
  loaded, even if their files sit in the same folder.

How it chunks: every "# " heading starts a document (a chapter, the introduction,
the Situation Finder...), every "## " heading starts a section, and "### "
headings split a section further (labelled "Section > Subsection"). Long sections
are cut at paragraph breaks into pieces of about 550 words.

What it changes in the database: ONLY the v3 titles below. It deletes them and
loads them fresh, so it is safe to re-run. The v2 rows ("Shadow Persuasion",
"The Tactic Spotter", "Stop Shrinking", "The Hard Conversation Planner") are
left alone, so live v2 users are not affected and rolling back is just
switching the edition flag back.

Usage:
  python3 funnel-v2/app-knowledge/ingest_book_v3.py --dry-run        # print chunks and counts, no database, no API calls
  python3 funnel-v2/app-knowledge/ingest_book_v3.py --dry-run --show  # also print the first lines of every chunk
  python3 funnel-v2/app-knowledge/ingest_book_v3.py                   # embed and load (launch only)
  add --book-dir /path/to/book-v3 to read the book from somewhere else."""
import json, pathlib, re, sys, urllib.parse, urllib.request
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parents[2]
AUTHOR = "Nate Harlan"

# Database titles. They must match BOOK_SOURCES (v3) in lib/rag.ts.
# "The Tactic Spotter" already exists as a v2 title, so the v3 one gets its own key;
# lib/rag.ts shows it to readers as plain "The Tactic Spotter".
BOOK_TITLE = "Shadow Persuasion: The Hidden Rules of Power"
BONUSES = [  # (file in bonuses/drafts/, database title)
    ("journal-21-day-power-reset.md", "The 21-Day Power Reset Journal"),
    ("tactic-spotter.md", "The Tactic Spotter (Hidden Rules of Power)"),
    ("conversation-planner.md", "The Conversation Planner"),
    ("power-map-and-decision-cards.md", "The Power Map and Decision Cards"),
]
NEVER_LOAD = ("100-ready-to-use-replies", "replies", "playbook", "upsell", "order-bump", "add-on", "addon")
V3_TITLES = [BOOK_TITLE] + [t for _, t in BONUSES]
CATEGORY = "book-v3"


def arg(name, default=None):
    if name in sys.argv:
        i = sys.argv.index(name)
        return sys.argv[i + 1] if i + 1 < len(sys.argv) else default
    return default


BOOK_DIR = pathlib.Path(arg("--book-dir", str(pathlib.Path.home() / "Desktop/shadow-persuasion/book-v3"))).expanduser()
DRY = "--dry-run" in sys.argv
SHOW = "--show" in sys.argv


def clean(md):
    md = re.sub(r"(?s)<!--.*?-->", "", md)
    md = re.sub(r"\[\[DIAGRAM:[^\]]*\]\]", "", md)
    md = re.sub(r"\[LINES:\d+\]", "", md)
    md = re.sub(r"\[[A-Z][A-Z ]+:[^\]]*\]", "", md)          # placeholders like [JOURNAL LINK: ...]
    md = re.sub(r"(?m)^\s*(?:[-*]\s*)?(?:\[ \]\s*)?_{3,}[_\s]*$", "", md)  # write-in lines
    md = re.sub(r"(?m)^\s*(?:\|\s*)+$", "", md)               # empty table rows used as boxes
    md = re.sub(r" ?_{3,} ?", " ", md)                         # inline write-in blanks
    md = re.sub(r"(?m)^\s*-{3,}\s*$", "", md)                 # horizontal rules
    md = re.sub(r"\n{3,}", "\n\n", md)
    return md.strip()


def documents(md):
    """Split on '# ' headings: [(title, body)]. Text before the first heading is dropped."""
    out, title, buf = [], None, []
    for line in md.splitlines():
        if line.startswith("# "):
            if title and buf:
                out.append((title, "\n".join(buf).strip()))
            title, buf = line[2:].strip(), []
        elif title:
            buf.append(line)
    if title and buf:
        out.append((title, "\n".join(buf).strip()))
    return out


def sections(body):
    """[(section label, text)] split on ## and ### headings. Text before the first ## is 'Opening'."""
    out, h2, h3, buf = [], None, None, []

    def flush():
        text = "\n".join(buf).strip()
        if len(text.split()) > 25:
            label = h2 or "Opening"
            if h3:
                label = f"{label} > {h3}"
            out.append((label, text))

    for line in body.splitlines():
        if line.startswith("## "):
            flush()
            h2, h3, buf = line[3:].strip(), None, [line]
        elif line.startswith("### "):
            flush()
            h3 = line[4:].strip()
            buf = ([f"## {h2}"] if h2 else []) + [line]
        else:
            buf.append(line)
    flush()
    return out


def chunk(text, target=550):
    paras, cur, out = [p for p in re.split(r"\n\s*\n", text) if p.strip()], [], []
    for p in paras:
        if cur and len(" ".join(cur).split()) + len(p.split()) > target:
            out.append("\n\n".join(cur))
            cur = []
        cur.append(p)
    if cur:
        out.append("\n\n".join(cur))
    return out


def book_files():
    d = BOOK_DIR / "drafts"
    files = [d / "front-matter.md"]
    order = ["partI", "partII", "partIII", "partIV", "partV", "partVI", "partVII"]
    chapters = sorted(d.glob("ch[0-9][0-9]-*.md"))
    part_starts = {"partI": 1, "partII": 6, "partIII": 12, "partIV": 18, "partV": 23, "partVI": 28, "partVII": 31}
    for ch in chapters:
        n = int(ch.name[2:4])
        for p in order:
            if part_starts[p] == n and (d / f"{p}-opener.md").exists():
                files.append(d / f"{p}-opener.md")
        files.append(ch)
    files.append(d / "back-matter.md")
    return [f for f in files if f.exists()], len(chapters)


def rows():
    out, notes = [], []
    files, n_chapters = book_files()
    if n_chapters != 34:
        notes.append(f"WARNING: expected 34 chapter files, found {n_chapters}.")
    sources = [(f, BOOK_TITLE) for f in files]
    bonus_dir = BOOK_DIR / "bonuses" / "drafts"
    for name, title in BONUSES:
        f = bonus_dir / name
        if f.exists():
            sources.append((f, title))
        else:
            notes.append(f"Bonus not written yet, skipped: {name}")
    if bonus_dir.exists():
        known = {n for n, _ in BONUSES}
        for f in sorted(bonus_dir.glob("*.md")):
            if f.name not in known:
                why = "paid product, never loaded" if any(k in f.stem for k in NEVER_LOAD) else "not on the included-bonus list"
                notes.append(f"Ignored {f.name} ({why})")

    for f, title in sources:
        for doc, body in documents(clean(f.read_text())):
            # A bonus file is one document named after the bonus.
            chapter = doc if title == BOOK_TITLE else title
            for section, text in sections(body) or [("Opening", body)]:
                for piece in chunk(text):
                    out.append({
                        "book_title": title, "author": AUTHOR, "chapter": chapter, "section": section,
                        "technique_name": section, "chunk_type": "book", "category": CATEGORY,
                        "content": f"{chapter}\n\n{piece}", "token_count": len(piece.split()),
                        "_file": f.name,
                    })
    return out, notes


def report(data, notes):
    by_title = Counter(r["book_title"] for r in data)
    words = Counter()
    for r in data:
        words[r["book_title"]] += r["token_count"]
    chapters = sorted({r["chapter"] for r in data if r["book_title"] == BOOK_TITLE and r["chapter"].startswith("Chapter ")},
                      key=lambda c: int(re.match(r"Chapter (\d+)", c).group(1)))
    print(f"Book folder: {BOOK_DIR}")
    for n in notes:
        print("  " + n)
    print()
    last = None
    for r in data:
        if SHOW or r["chapter"] != last:
            if not SHOW:
                per = [x for x in data if x["chapter"] == r["chapter"] and x["book_title"] == r["book_title"]]
                print(f"  [{r['book_title'][:38]:<38}] {r['chapter'][:60]:<60} {len(per):>3} chunks")
            last = r["chapter"]
        if SHOW:
            first = r["content"].split("\n\n", 1)[1].splitlines()[0][:90]
            print(f"      {r['token_count']:>4}w  {r['section'][:70]:<70} | {first}")
    print()
    for t in V3_TITLES:
        print(f"  {by_title.get(t, 0):>4} chunks  {words.get(t, 0):>6} words  {t}")
    sizes = sorted(r["token_count"] for r in data)
    print(f"  {len(data):>4} chunks in total; chapters found: {len(chapters)} of 34; "
          f"chunk size min {sizes[0]}, median {sizes[len(sizes) // 2]}, max {sizes[-1]} words")
    big = [r for r in data if r["token_count"] > 900]
    if big:
        print(f"  NOTE: {len(big)} chunk(s) over 900 words (one long paragraph or table).")


def load_env():
    env = {}
    for line in (ROOT / ".env.local").read_text().splitlines():
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').removesuffix("\\n")
    return env["NEXT_PUBLIC_SUPABASE_URL"], env["SUPABASE_SERVICE_ROLE_KEY"], env["OPENROUTER_API_KEY"]


def main():
    data, notes = rows()
    report(data, notes)
    if DRY:
        print("\nDRY RUN: nothing was sent to the database or the embedding API.")
        return

    sb_url, sk, or_key = load_env()

    def sb(method, path, body=None, prefer=None):
        h = {"apikey": sk, "Authorization": f"Bearer {sk}", "Content-Type": "application/json", "User-Agent": "ShadowPersuasion/1.0"}
        if prefer:
            h["Prefer"] = prefer
        req = urllib.request.Request(f"{sb_url}/rest/v1/{path}", data=json.dumps(body).encode() if body is not None else None,
                                     headers=h, method=method)
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.read()

    def embed(texts):
        req = urllib.request.Request("https://openrouter.ai/api/v1/embeddings",
            data=json.dumps({"model": "openai/text-embedding-3-small", "input": texts}).encode(),
            headers={"Authorization": f"Bearer {or_key}", "Content-Type": "application/json", "User-Agent": "ShadowPersuasion/1.0"})
        d = json.loads(urllib.request.urlopen(req, timeout=180).read())
        return [x["embedding"] for x in sorted(d["data"], key=lambda x: x["index"])]

    # Embed everything first, so a failed embedding call leaves the database as it was.
    for r in data:
        r.pop("_file", None)
    for i in range(0, len(data), 40):
        batch = data[i:i + 40]
        for r, e in zip(batch, embed([r["content"] for r in batch])):
            r["embedding"] = e
        print(f"embedded {i + len(batch)}/{len(data)}", flush=True)

    for t in V3_TITLES:  # v3 titles only; v2 rows are never touched
        sb("DELETE", "knowledge_chunks?book_title=eq." + urllib.parse.quote(t))
    for i in range(0, len(data), 40):
        sb("POST", "knowledge_chunks", data[i:i + 40], prefer="return=minimal")
        print(f"stored {min(i + 40, len(data))}/{len(data)}", flush=True)
    print("Loaded titles:", sorted({r["book_title"] for r in data}))


if __name__ == "__main__":
    main()
