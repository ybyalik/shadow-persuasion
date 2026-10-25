"""Sets titles over the Nano Banana artwork and renders front covers (1600x2400 px, 6x9 ratio) with headless Chrome."""
import pathlib, subprocess
HERE = pathlib.Path(__file__).parent
import sys as _sys
_sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / 'fonts'))
from fontface import CSS as FONT_CSS  # EB Garamond
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
COVERS = {
    "cover-book": dict(art="art/book-b.png", kicker="", title="SHADOW<br>PERSUASION",
                       sub="How to Stop Being Used<br>and Take Your Power Back", author="NATE HARLAN", pos="center 70%"),
    "cover-journal": dict(art="art/journal-a.png", kicker="SHADOW PERSUASION", title="The 21-Day<br>Reset Journal",
                          sub="Three days to start. Twenty-one days<br>to change how you answer people.", author="NATE HARLAN", pos="center 75%"),
    "cover-scripts": dict(art="art/scripts-b.png", kicker="SHADOW PERSUASION", title="The Calm<br>Reply Scripts",
                          sub="100 word-for-word answers to guilt trips,<br>gaslighting, pressure, and everything else", author="NATE HARLAN", pos="center 70%"),
    "cover-spotter": dict(art="art/spotter-a.png", kicker="SHADOW PERSUASION &middot; BONUS", title="The Tactic<br>Spotter",
                          sub="50 pressure tactics, the warning signs,<br>and a calm reply for each", author="NATE HARLAN", pos="center 70%"),
    "cover-shrinking": dict(art="art/shrinking-a.png", kicker="SHADOW PERSUASION &middot; BONUS", title="Stop<br>Shrinking",
                            sub="24 phrases that make you sound small,<br>and what to say instead", author="NATE HARLAN", pos="center 70%"),
    "cover-planner": dict(art="art/planner-a.png", kicker="SHADOW PERSUASION &middot; BONUS", title="The Hard<br>Conversation Planner",
                          sub="Plan it. Stay steady. Learn from it.", author="NATE HARLAN", pos="center 75%"),
    "cover-playbooks": dict(art="art/playbooks-a.png", kicker="SHADOW PERSUASION", title="The Big Conversation<br>Playbooks",
                            sub="Step-by-step plans for the 15 conversations<br>that decide how you're treated", author="NATE HARLAN", pos="center 75%"),
    "cover-pay": dict(art="art/pay-a.png", kicker="SHADOW PERSUASION", title="The Raise and<br>Pay Scripts",
                      sub="Word-for-word scripts for getting<br>paid what you're worth", author="NATE HARLAN", pos="center 75%"),
}
CSS = """
@font-face{font-family:'Cormorant';src:local('Cormorant Garamond'),local('Georgia');}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1600px;height:2400px;background:#0b0a08;overflow:hidden}
.c{position:relative;width:1600px;height:2400px;background-size:cover;color:#f1e9dc;font-family:'EB Garamond',Georgia,serif}
.c:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,7,6,.82) 0%,rgba(8,7,6,.35) 38%,rgba(8,7,6,0) 55%,rgba(8,7,6,.55) 88%,rgba(8,7,6,.85) 100%)}
.t{position:absolute;z-index:2;left:0;right:0;top:190px;text-align:center;padding:0 120px}
.k{font-family:'Inter',Helvetica,Arial,sans-serif;font-size:34px;letter-spacing:12px;color:#c9a46b;margin-bottom:46px}
h1{font-weight:400;font-size:178px;line-height:1.02;letter-spacing:10px}
h1.mixed{letter-spacing:2px;font-size:150px}
h1.long{font-size:118px}
.rule{width:140px;height:3px;background:#c9a46b;margin:60px auto 52px}
.s{font-size:56px;line-height:1.3;font-style:italic;color:#e6dccb}
.a{position:absolute;z-index:2;bottom:120px;left:0;right:0;text-align:center;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:42px;letter-spacing:16px;color:#e9dfcf}
"""
LETTER = {f"{k}-letter": k for k in ("cover-journal", "cover-scripts", "cover-spotter", "cover-shrinking", "cover-planner", "cover-playbooks", "cover-pay")}  # 8.5x11 versions for the printable PDFs
for name, base in LETTER.items():
    COVERS[name] = dict(COVERS[base], w=1700, h=2200)
for name, c in COVERS.items():
    w, h = c.get("w", 1600), c.get("h", 2400)
    mixed = "" if c["title"].isupper() else "mixed"
    if len(c["title"]) > 28: mixed += " long"
    css = CSS.replace("1600px", f"{w}px").replace("2400px", f"{h}px")
    html = f"""<!doctype html><html><head><meta charset="utf-8"><style>{FONT_CSS}{css}</style></head><body>
<div class="c" style="background-image:url('{(HERE / c['art']).as_uri()}');background-position:{c['pos']}">
<div class="t">{f'<div class="k">{c["kicker"]}</div>' if c['kicker'] else ''}<h1 class="{mixed}">{c['title']}</h1><div class="rule"></div><div class="s">{c['sub']}</div></div>
<div class="a">{c['author']}</div></div></body></html>"""
    f = HERE / f"{name}.html"; f.write_text(html)
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--window-size={w},{h}",
                    f"--screenshot={HERE / (name + '.png')}", f.as_uri()], capture_output=True)
    print("rendered", name)
