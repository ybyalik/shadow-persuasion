"""Loads Shadow Persuasion (chapters, back of book, the three free bonuses) into
knowledge_chunks so the app's AI answers from our own book.
Safe to re-run: it deletes these titles first, then reloads them.
Usage: python3 ingest_book.py"""
import json, pathlib, re, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
FV2 = ROOT / "funnel-v2"
ENV = {}
for line in (ROOT / ".env.local").read_text().splitlines():
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1)
        ENV[k.strip()] = v.strip().strip('"').removesuffix("\\n")
SB, SK, OR = ENV["NEXT_PUBLIC_SUPABASE_URL"], ENV["SUPABASE_SERVICE_ROLE_KEY"], ENV["OPENROUTER_API_KEY"]
AUTHOR = "Nate Harlan"

def sb(method, path, body=None, prefer=None):
    h = {"apikey": SK, "Authorization": f"Bearer {SK}", "Content-Type": "application/json", "User-Agent": "ShadowPersuasion/1.0"}
    if prefer: h["Prefer"] = prefer
    req = urllib.request.Request(f"{SB}/rest/v1/{path}", data=json.dumps(body).encode() if body is not None else None, headers=h, method=method)
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()

def embed(texts):
    req = urllib.request.Request("https://openrouter.ai/api/v1/embeddings",
        data=json.dumps({"model": "openai/text-embedding-3-small", "input": texts}).encode(),
        headers={"Authorization": f"Bearer {OR}", "Content-Type": "application/json", "User-Agent": "ShadowPersuasion/1.0"})
    d = json.loads(urllib.request.urlopen(req, timeout=180).read())
    return [x["embedding"] for x in sorted(d["data"], key=lambda x: x["index"])]

def clean(md):
    md = re.sub(r"\[\[DIAGRAM:[^\]]*\]\]", "", md)
    md = re.sub(r"\[LINES:\d+\]", "", md)
    md = re.sub(r"(?s)<!--.*?-->", "", md)
    return md.strip()

def sections(md):
    """(heading, text) pieces split on ## headings."""
    out, head, buf = [], None, []
    for line in md.splitlines():
        if line.startswith("## "):
            if buf: out.append((head, "\n".join(buf).strip()))
            head, buf = line[3:].strip(), [line]
        elif line.startswith("# "):
            continue
        else:
            buf.append(line)
    if buf: out.append((head, "\n".join(buf).strip()))
    return [(h, t) for h, t in out if len(t.split()) > 25]

def chunk(text, target=550):
    paras, cur, out = [p for p in re.split(r"\n\s*\n", text) if p.strip()], [], []
    for p in paras:
        if cur and len(" ".join(cur).split()) + len(p.split()) > target:
            out.append("\n\n".join(cur)); cur = []
        cur.append(p)
    if cur: out.append("\n\n".join(cur))
    return out

def docs():
    for f in sorted((FV2 / "chapters").glob("ch-*.md")) + sorted((FV2 / "chapters").glob("back-*.md")):
        md = clean(f.read_text())
        title = next((l[2:].strip() for l in md.splitlines() if l.startswith("# ") and not l.startswith("# Part")), f.stem)
        md = md.split("End of free chapter")[0]
        yield "Shadow Persuasion", title, md
    for name, title in [("tactic-spotter", "The Tactic Spotter"), ("stop-shrinking", "Stop Shrinking"), ("hard-conversation-planner", "The Hard Conversation Planner")]:
        yield title, title, clean((FV2 / "bonuses" / f"{name}.md").read_text())

rows = []
for book, chapter, md in docs():
    for head, text in sections(md) or [(None, md)]:
        for piece in chunk(text):
            rows.append({"book_title": book, "author": AUTHOR, "chapter": chapter, "section": head, "technique_name": head or chapter,
                         "chunk_type": "book", "category": "defense", "content": f"{chapter}\n\n{piece}", "token_count": len(piece.split())})
print(f"{len(rows)} chunks")

titles = sorted({r["book_title"] for r in rows})
for t in titles:
    sb("DELETE", f"knowledge_chunks?book_title=eq.{urllib.parse.quote(t)}") if False else None
import urllib.parse
for t in titles:
    sb("DELETE", "knowledge_chunks?book_title=eq." + urllib.parse.quote(t))

for i in range(0, len(rows), 40):
    batch = rows[i:i + 40]
    for r, e in zip(batch, embed([r["content"] for r in batch])):
        r["embedding"] = e
    sb("POST", "knowledge_chunks", batch, prefer="return=minimal")
    print(f"stored {i + len(batch)}/{len(rows)}", flush=True)
print("titles:", titles)
