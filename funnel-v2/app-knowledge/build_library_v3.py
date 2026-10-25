"""Turns the two paid add-ons into data files the app can show to buyers in "Your library"
(/app/library, new edition only).

  Source of truth (edit these, then re-run this script):
    ~/Desktop/shadow-persuasion/book-v3/bonuses/drafts/100-ready-to-use-replies.md   ($17 add-on, sp2_scripts)
    ~/Desktop/shadow-persuasion/book-v3/bonuses/drafts/playbooks-library.md          ($47 upsell, sp2_upsell)

  Writes (do not edit by hand):
    lib/library/replies.generated.json
    lib/library/playbooks.generated.json

The app only sends this content to people whose paid orders include the add-on
(app/api/library/route.ts). It is never put into book search, and never sent to the browser
for anyone else.

Usage, from the repo root:
    python3 funnel-v2/app-knowledge/build_library_v3.py
Needs pandoc (brew install pandoc). Reads and writes local files only; no database.
"""
import json
import pathlib
import re
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[2]
DRAFTS = pathlib.Path.home() / "Desktop/shadow-persuasion/book-v3/bonuses/drafts"
REPLIES_MD = DRAFTS / "100-ready-to-use-replies.md"
PLAYBOOKS_MD = DRAFTS / "playbooks-library.md"
OUT = ROOT / "lib" / "library"

TASKS = ["asking", "declining", "clarifying", "trading", "following up", "repairing"]


def md_to_html(md: str) -> str:
    if not md.strip():
        return ""
    html = subprocess.run(
        ["pandoc", "-f", "markdown-auto_identifiers", "-t", "html", "--wrap=none"],
        input=md, capture_output=True, text=True, check=True,
    ).stdout.strip()
    return html


def plain(md: str) -> str:
    """Markdown inline text to plain text (for search and short labels)."""
    t = re.sub(r"\*\*(.+?)\*\*", r"\1", md)
    t = re.sub(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)", r"\1", t)
    return re.sub(r"\s+", " ", t).strip()


def no_dashes(text: str, where: str):
    assert "—" not in text, f"em-dash in {where}"


def split_h2(md: str):
    """[(heading, body)] for every '## ' section."""
    parts = re.split(r"(?m)^## (.+)$", md)
    return [(parts[i].strip(), parts[i + 1]) for i in range(1, len(parts), 2)]


# ───────────── 100 Ready-to-Use Replies ─────────────

def build_replies():
    md = REPLIES_MD.read_text()
    no_dashes(md, REPLIES_MD.name)
    title = re.search(r"^# (.+)$", md, flags=re.M).group(1).strip()
    subtitle = plain(re.search(r"^\*(.+)\*$", md, flags=re.M).group(1))
    sections_md = split_h2(md)

    # The two indexes: short labels by number, and which tasks each reply serves.
    index = dict(sections_md)["Find your reply fast"]
    short = {int(n): plain(lbl) for n, lbl in re.findall(r"^- \*\*(\d+)\.\*\* (.+)$", index, flags=re.M)}
    by_task = {}
    for label, desc, nums in re.findall(r"^\*\*(\w[\w ]*)\*\* \(([^)]*)\): ([\d, ]+)$", index, flags=re.M):
        key = label.strip().lower()
        assert key in TASKS, f"unknown task {key}"
        by_task[key] = {"label": label.strip(), "description": desc.strip(), "numbers": [int(x) for x in nums.split(",")]}
    assert list(by_task) == TASKS, f"tasks found: {list(by_task)}"
    common = [
        {"label": plain(lbl), "text": plain(rest)}
        for lbl, rest in re.findall(r"^- \*\*(.+?):\*\* (.+)$", index.split("### Four common situations", 1)[1], flags=re.M)
    ]

    intro, outro, groups, replies = [], None, [], []
    for heading, body in sections_md:
        if heading == "Find your reply fast":
            continue
        if heading == "Where to go from here":
            outro = {"heading": heading, "html": md_to_html(body)}
            continue
        if not re.search(r"(?m)^### \d+\. ", body):
            intro.append({"heading": heading, "html": md_to_html(body)})
            continue
        # A situation group (Work, Partner, ...). Text before the first reply is the group's note.
        pre, *rest = re.split(r"(?m)^(### \d+\. .+)$", body)
        group = {"name": heading, "note": md_to_html(pre.strip()) or None}
        groups.append(group)
        for j in range(0, len(rest), 2):
            m = re.match(r"### (\d+)\. (.+)", rest[j])
            num, rtitle, rbody = int(m.group(1)), m.group(2).strip(), rest[j + 1]
            task_line = re.search(r"^\*Task: (.+)\*$", rbody, flags=re.M).group(1)
            tasks = [t.strip() for t in task_line.split(",")]
            options = [
                {"label": lbl.strip(), "text": plain(txt).strip().strip('"').strip("“”")}
                for lbl, txt in re.findall(r"^> \*\*(.+?):\*\* (.+)$", rbody, flags=re.M)
            ]
            fits = re.search(r"^\*\*When it fits:\*\* (.+?)(?=\n\n|\Z)", rbody, flags=re.M | re.S)
            assert len(options) >= 3, f"reply {num} has {len(options)} options"
            assert fits, f"reply {num} has no 'When it fits'"
            replies.append({
                "number": num,
                "title": rtitle,
                "short": short.get(num, rtitle),
                "group": heading,
                "tasks": tasks,
                "options": options,
                "whenItFits": md_to_html(fits.group(1).strip()),
                "whenItFitsText": plain(fits.group(1)),
            })
    assert [r["number"] for r in replies] == list(range(1, 101)), "replies must be numbered 1 to 100"
    # The task index can list a reply under more tasks than its own line; keep both.
    for key, t in by_task.items():
        for n in t["numbers"]:
            r = replies[n - 1]
            if key not in r["tasks"]:
                r["tasks"].append(key)
    return {
        "title": title,
        "subtitle": subtitle,
        "intro": intro,
        "groups": groups,
        "tasks": [{"key": k, "label": v["label"], "description": v["description"]} for k, v in by_task.items()],
        "common": common,
        "replies": replies,
        "outro": outro,
    }


# ───────────── The Applied Power Playbook Library ─────────────

def build_playbooks():
    md = PLAYBOOKS_MD.read_text()
    no_dashes(md, PLAYBOOKS_MD.name)
    title = re.search(r"^# (.+)$", md, flags=re.M).group(1).strip()
    sub = re.search(r"^\*(.+)\*$", md, flags=re.M)
    intro, sections, outro = [], [], None
    for heading, body in split_h2(md):
        m = re.match(r"Section (\d+): (.+)", heading)
        if not m:
            if heading == "Where to go from here":
                outro = {"heading": heading, "html": md_to_html(body)}
            else:
                intro.append({"heading": heading, "html": md_to_html(body)})
            continue
        pre, *rest = re.split(r"(?m)^(### \d+\. .+)$", body)
        section = {"number": int(m.group(1)), "title": m.group(2).strip(), "intro": md_to_html(pre.strip()) or None, "playbooks": []}
        for j in range(0, len(rest), 2):
            pm = re.match(r"### (\d+)\. (.+)", rest[j])
            pbody = rest[j + 1]
            parts = re.split(r"(?m)^#### (.+)$", pbody)
            lead = parts[0].strip()
            section["playbooks"].append({
                "number": int(pm.group(1)),
                "title": pm.group(2).strip(),
                "lead": md_to_html(lead) or None,
                "parts": [{"heading": parts[k].strip(), "html": md_to_html(parts[k + 1])} for k in range(1, len(parts), 2)],
            })
        sections.append(section)
    numbers = [p["number"] for s in sections for p in s["playbooks"]]
    assert numbers == list(range(1, 21)), f"playbooks must be numbered 1 to 20, found {numbers}"
    assert len(sections) == 4, f"expected 4 sections, found {len(sections)}"
    return {"title": title, "subtitle": plain(sub.group(1)) if sub else None, "intro": intro, "sections": sections, "outro": outro}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    replies = build_replies()
    (OUT / "replies.generated.json").write_text(json.dumps(replies, ensure_ascii=False, indent=1) + "\n")
    print(f"wrote lib/library/replies.generated.json ({len(replies['replies'])} replies in {len(replies['groups'])} groups)")
    playbooks = build_playbooks()
    (OUT / "playbooks.generated.json").write_text(json.dumps(playbooks, ensure_ascii=False, indent=1) + "\n")
    count = sum(len(s["playbooks"]) for s in playbooks["sections"])
    print(f"wrote lib/library/playbooks.generated.json ({count} playbooks in {len(playbooks['sections'])} sections)")


if __name__ == "__main__":
    main()
