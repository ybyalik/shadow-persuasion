"""Draws the book's diagrams as SVG (vector, so they print sharp) plus PNG copies for the Word file.

    python3 funnel-v2/diagrams/make_diagrams.py

In the manuscript, a line like [[DIAGRAM:openings|Caption text]] places a diagram.
"""
import html
import pathlib
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "fonts"))
from fontface import CSS as FONT_CSS  # noqa: E402

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
INK, ACCENT, FILL, LINE, MUTED = "#1c1b18", "#8a5a2b", "#f4efe6", "#d9cdb8", "#6b6458"
FONT = "'EB Garamond', Georgia, serif"
SANS = "'Inter', Helvetica, Arial, sans-serif"


def t(x, y, lines, size=22, weight=400, color=INK, anchor="middle", italic=False, family=FONT, gap=1.25):
    """Multi-line text block."""
    style = "italic" if italic else "normal"
    spans = "".join(
        f'<tspan x="{x}" dy="{0 if i == 0 else size * gap:.1f}">{html.escape(s)}</tspan>' for i, s in enumerate(lines))
    return (f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" font-weight="{weight}" font-style="{style}" '
            f'fill="{color}" text-anchor="{anchor}">{spans}</text>')


def box(x, y, w, h, fill=FILL, stroke=LINE, r=10, sw=1.5):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'


def svg(w, h, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="100%" role="img">'
            f'<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
            f'<path d="M0,0 L10,5 L0,10 z" fill="{ACCENT}"/></marker></defs>{body}</svg>')


def openings():
    w, h, cx, cy = 900, 620, 450, 310
    items = [
        ("Guilt", ['"After all I\'ve done', 'for you..."'], (450, 78)),
        ("Need for approval", ["Praise right before", "a request"], (755, 200)),
        ("Fear of conflict", ["A raised voice,", "a cold silence"], (755, 420)),
        ("Urgency", ['"I need an answer', 'right now."'], (450, 542)),
        ("Fear of loss", ["Threats to pull away", "or leave"], (145, 420)),
        ("Need to be seen as good", ['"I thought I could', 'count on you."'], (145, 200)),
    ]
    body = []
    for _, _, (x, y) in items:
        body.append(f'<line x1="{cx}" y1="{cy}" x2="{x}" y2="{y}" stroke="{LINE}" stroke-width="2"/>')
    body.append(f'<circle cx="{cx}" cy="{cy}" r="78" fill="#ffffff" stroke="{INK}" stroke-width="3"/>')
    body.append(t(cx, cy - 6, ["What they", "press on"], size=24, weight=600, color=INK, gap=1.15))
    for name, ex, (x, y) in items:
        bw, bh = 272, 108
        body.append(box(x - bw / 2, y - bh / 2, bw, bh))
        body.append(t(x, y - 18, [name], size=25, weight=600, color=ACCENT))
        body.append(t(x, y + 12, ex, size=20, italic=True, color=MUTED, gap=1.2))
    return svg(w, h, "".join(body))


def reset_map():
    w, h = 900, 380
    cols = [
        ("Days 1 to 3", "Quick start", ["Pause before yes", "No reflex apologies", "One clean no"]),
        ("Week 1", "Notice", ["Count your yeses", "Spot the opening", "Hear the voice"]),
        ("Week 2", "Pause", ["Buffer every ask", "Check what you want", "Help with edges"]),
        ("Week 3", "Hold", ["Repeat, don't explain", "Let them be", "disappointed", "Ask for what you want"]),
    ]
    body, cw, gap, top = [], 196, 22, 30
    for i, (when, name, steps) in enumerate(cols):
        x = 10 + i * (cw + gap)
        dark = i == 3
        body.append(box(x, top, cw, 250, fill="#ffffff" if dark else FILL, stroke=INK if dark else LINE, sw=3 if dark else 1.5))
        body.append(t(x + cw / 2, top + 40, [when.upper()], size=19, weight=600, family=SANS, color=ACCENT))
        body.append(t(x + cw / 2, top + 84, [name], size=34, weight=600, color=INK))
        body.append(f'<line x1="{x + 40}" y1="{top + 108}" x2="{x + cw - 40}" y2="{top + 108}" stroke="{ACCENT}" stroke-width="2"/>')
        body.append(t(x + cw / 2, top + 150, steps, size=20, color=MUTED, gap=1.45))
        if i < 3:
            ax = x + cw + 2
            body.append(f'<line x1="{ax}" y1="{top + 165}" x2="{ax + gap - 4}" y2="{top + 165}" stroke="{ACCENT}" stroke-width="3" marker-end="url(#arr)"/>')
    body.append(box(10, 302, 880, 64, fill="#ffffff", stroke=ACCENT, sw=2))
    body.append(t(450, 342, ["Day 21: rewrite your 3 a.m. replay as words you could actually say"], size=23, italic=True))
    return svg(w, h, "".join(body))


def acknowledge_hold():
    w, h = 900, 640
    steps = [
        ("THEY PRESS", ['"After everything I\'ve done for you..."'], False),
        ("1. ACKNOWLEDGE THE FEELING, ONCE", ['"You\'ve done a lot for me, and I\'m grateful."'], False),
        ("2. HOLD THE DECISION", ['"I\'m still not able to do this."'], True),
        ("3. STOP. LET IT SIT.", ["No reasons, no apology, no \"maybe next time.\""], False),
    ]
    body, x, bw, bh, y = [], 120, 560, 104, 20
    centers = []
    for label, lines, dark in steps:
        body.append(box(x, y, bw, bh, fill="#ffffff" if dark else FILL, stroke=INK if dark else LINE, sw=3 if dark else 1.5))
        body.append(t(x + bw / 2, y + 40, [label], size=19, weight=600, family=SANS, color=ACCENT))
        body.append(t(x + bw / 2, y + 76, lines, size=24, italic=True, color=INK))
        centers.append(y)
        y += bh + 50
    for i in range(3):
        y1 = centers[i] + bh
        body.append(f'<line x1="{x + bw / 2}" y1="{y1 + 4}" x2="{x + bw / 2}" y2="{y1 + 44}" stroke="{ACCENT}" stroke-width="3" marker-end="url(#arr)"/>')
    # Loop: if they push, go back to "hold"
    yl, yh = centers[3] + bh / 2, centers[2] + bh / 2
    body.append(f'<path d="M {x + bw} {yl} H {x + bw + 70} V {yh} H {x + bw + 8}" fill="none" stroke="{ACCENT}" stroke-width="3" stroke-dasharray="7 6" marker-end="url(#arr)"/>')
    body.append(t(x + bw + 78, (yl + yh) / 2 - 14, ["If they push:", "repeat the", "same sentence"], size=19, italic=True, anchor="start", color=MUTED, gap=1.2))
    return svg(w, h, "".join(body))


def four_tests():
    w, h = 900, 560
    tests = [
        ("The disclosure test", ["Would I be comfortable if they", "knew exactly what I was doing?"]),
        ("The reversal test", ["Would I think it was fair if", "someone did this to me?"]),
        ("The free-choice test", ["Can they say no without", "being punished?"]),
        ("The outcome test", ["Is the result fair", "to both of us?"]),
    ]
    body, bw, bh = [], 430, 178
    for i, (name, q) in enumerate(tests):
        x = 10 + (i % 2) * (bw + 20)
        y = 10 + (i // 2) * (bh + 20)
        body.append(box(x, y, bw, bh))
        body.append(f'<circle cx="{x + 46}" cy="{y + 46}" r="22" fill="{ACCENT}"/>')
        body.append(t(x + 46, y + 54, [str(i + 1)], size=24, weight=600, color="#ffffff", family=SANS))
        body.append(t(x + 84, y + 54, [name], size=27, weight=600, anchor="start"))
        body.append(t(x + 34, y + 108, q, size=23, italic=True, anchor="start", color=MUTED))
    body.append(box(10, 418, 880, 128, fill="#ffffff", stroke=INK, sw=3))
    body.append(t(450, 468, ["Yes to all four: that's influence."], size=28, weight=600, color=INK))
    body.append(t(450, 510, ["No to any one: rethink it before you say it."], size=24, italic=True, color=MUTED))
    return svg(w, h, "".join(body))


DIAGRAMS = {"openings": openings, "reset-map": reset_map, "acknowledge-hold": acknowledge_hold, "four-tests": four_tests}


def main():
    for name, fn in DIAGRAMS.items():
        s = fn()
        (HERE / f"{name}.svg").write_text(s)
        page = HERE / f".{name}.html"
        page.write_text(f"<!doctype html><html><head><meta charset='utf-8'><style>{FONT_CSS}html,body{{margin:0;background:#fff}}</style></head>"
                        f"<body><div style='width:900px'>{s}</div></body></html>")
        vb_h = int(s.split('viewBox="0 0 900 ')[1].split('"')[0])
        subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--window-size=900,{vb_h}",
                        "--force-device-scale-factor=2", f"--screenshot={HERE / (name + '.png')}", page.as_uri()], capture_output=True)
        page.unlink()
        print("drew", name)


if __name__ == "__main__":
    main()
