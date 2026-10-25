"""Joins manuscript files with blank lines between them (plain `cat` glued headings onto the previous line)."""
import pathlib, sys
ch = pathlib.Path(__file__).parent / "chapters"
groups = {
    "full": ["00-front-matter.md"] + sorted(p.name for p in ch.glob("ch-*.md")) + ["back-01-playbooks.md", "back-02-situation-finder.md", "back-03-tactic-reference.md"],
}
out = pathlib.Path(sys.argv[1])
out.write_text("\n\n".join((ch / f).read_text().strip() for f in groups["full"]) + "\n")
print(f"joined {len(groups['full'])} files -> {out}")
