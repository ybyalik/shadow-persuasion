"""Builds the designed PDFs (US Letter) for the bonuses and upsell guides.

    python3 funnel-v2/build_guides.py            # all guides
    python3 funnel-v2/build_guides.py spotter    # one guide

Each guide gets: cover, title page, copyright page, contents, then the content. In the Markdown,
a line containing only [LINES:N] becomes N blank writing lines.
"""
import html
import pathlib
import re
import subprocess
import sys

V2 = pathlib.Path(__file__).resolve().parent
import sys as _sys
_sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent / 'fonts'))
from fontface import CSS as FONT_CSS  # EB Garamond
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT = V2 / "guides-pdf"

GUIDES = {
    "spotter": dict(md="bonuses/tactic-spotter.md", cover="cover-spotter-letter.png", pdf="the-tactic-spotter.pdf"),
    "shrinking": dict(md="bonuses/stop-shrinking.md", cover="cover-shrinking-letter.png", pdf="stop-shrinking.pdf"),
    "planner": dict(md="bonuses/hard-conversation-planner.md", cover="cover-planner-letter.png", pdf="the-hard-conversation-planner.pdf"),
    "playbooks": dict(md="upsell-v2/big-conversation-playbooks.md", cover="cover-playbooks-letter.png", pdf="the-big-conversation-playbooks.pdf"),
    "pay": dict(md="upsell-v2/raise-and-pay-scripts.md", cover="cover-pay-letter.png", pdf="the-raise-and-pay-scripts.pdf"),
}

CSS = """
@page { size: Letter; margin: 0.8in 0.85in 0.85in; @bottom-center { content: counter(page); font: 9pt 'EB Garamond', Georgia, serif; color: #8a7d68; } }
@page bare { margin: 0; @bottom-center { content: none; } }
@page front { @bottom-center { content: none; } }
body { font-family: 'EB Garamond', Georgia, serif; color: #1c1b18; font-size: 12.4pt; line-height: 1.5; margin: 0; }
.cover { page: bare; break-after: page; } .cover img { width: 8.5in; height: 11in; object-fit: cover; display: block; }
.front { page: front; break-after: page; }
.tp { height: 8.6in; display: flex; flex-direction: column; justify-content: center; text-align: center; }
.k { font: 9pt 'Inter', Helvetica, Arial, sans-serif; letter-spacing: .3em; text-transform: uppercase; color: #8a5a2b; }
.tp h1 { font-weight: normal; font-size: 32pt; margin: 14pt 0 10pt; line-height: 1.15; }
.tp .sub { font-style: italic; color: #555; max-width: 5in; margin: 0 auto; }
.tp .k.author { margin-top: 30pt; }
.legal { height: 8.6in; display: flex; flex-direction: column; justify-content: flex-end; font-size: 8.5pt; color: #444; }
.toc h2 { font-weight: normal; font-size: 22pt; margin: 0 0 14pt; } .toc ol { list-style: none; padding: 0; font-size: 12pt; line-height: 1.9; }
h2 { font-weight: normal; font-size: 20pt; margin: 0 0 14pt; padding-bottom: 8pt; border-bottom: 1.5pt solid #8a5a2b; break-before: page; break-after: avoid; }
h3 { font-size: 13pt; margin: 18pt 0 6pt; break-after: avoid; color: #1c1b18; }
h4 { font-size: 11.5pt; margin: 12pt 0 4pt; break-after: avoid; }
p { margin: 0 0 8pt; }
blockquote { margin: 6pt 0 10pt; padding: 8pt 12pt; background: #f4efe6; border-left: 3pt solid #8a5a2b; border-radius: 2pt; break-inside: avoid; }
blockquote p { margin: 0; font-weight: bold; }
ul, ol { margin: 0 0 10pt; padding-left: 20pt; } li { margin-bottom: 3pt; }
strong { color: #3a2a18; }
.lines { margin: 4pt 0 12pt; } .lines div { border-bottom: 0.75pt solid #c8c0b0; height: 22pt; }
table { width: 100%; border-collapse: collapse; font-size: 10pt; margin: 8pt 0 12pt; }
th, td { border-bottom: 0.5pt solid #e2d9ca; padding: 4pt 6pt; text-align: left; vertical-align: top; }
hr { border: 0; border-top: 0.75pt solid #e2d9ca; margin: 14pt 0; }
"""


def pandoc(md: str) -> str:
    return subprocess.run(["pandoc", "-f", "markdown", "-t", "html", "--wrap=none"], input=md, capture_output=True, text=True, check=True).stdout


def build(key: str):
    g = GUIDES[key]
    md = (V2 / g["md"]).read_text()
    m = re.match(r"\s*# (.+)\n+\*(.+?)\*\s*\n", md)
    title, subtitle = (m.group(1).strip(), m.group(2).strip()) if m else (key, "")
    body_md = md[m.end():] if m else md
    body_md = re.sub(r"^\[LINES:(\d+)\]\s*$", lambda x: "<div class=\"lines\">" + "<div></div>" * int(x.group(1)) + "</div>", body_md, flags=re.M)
    body = pandoc(body_md)
    sections = [html.unescape(re.sub(r"<[^>]+>", "", s)) for s in re.findall(r"<h2[^>]*>(.*?)</h2>", body)]
    # The first section shouldn't force an extra page right after the contents page.
    body = re.sub(r"<h2", '<h2 style="break-before:auto"', body, count=1)
    cover = (V2 / "covers" / g["cover"]).as_uri()
    toc = "".join(f"<li>{html.escape(s)}</li>" for s in sections)
    doc = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{html.escape(title)}</title><style>{FONT_CSS}{CSS}</style></head><body>
<section class="cover"><img src="{cover}" alt=""></section>
<section class="front tp"><div class="k">Shadow Persuasion</div><h1>{html.escape(title)}</h1><p class="sub">{html.escape(subtitle)}</p><div class="k author">Nate Harlan</div></section>
<section class="front legal"><p><b>{html.escape(title)}</b></p>
<p>Copyright &copy; 2026 by ShadowPersuasion.com. All rights reserved. You may print this guide for your own personal use. No part of it may be reproduced or shared for any other purpose without written permission from the publisher, except for brief quotations in reviews.</p>
<p>This guide is for general information and self-help only. It is not therapy, medical advice, financial advice, or legal advice, and it is not a substitute for professional help.</p>
<p>If you feel unsafe with someone, contact the National Domestic Violence Hotline (US): 1-800-799-7233, or text START to 88788. If you are in crisis, call or text 988. In an emergency, call 911.</p></section>
<section class="front toc"><h2 style="border:0;break-before:auto">Contents</h2><ol>{toc}</ol></section>
{body}
</body></html>"""
    OUT.mkdir(exist_ok=True)
    src = OUT / f"{key}.html"
    src.write_text(doc)
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", f"--print-to-pdf={OUT / g['pdf']}", src.as_uri()],
                   capture_output=True, check=True)
    pages = re.search(r"Pages:\s+(\d+)", subprocess.run(["pdfinfo", str(OUT / g["pdf"])], capture_output=True, text=True).stdout).group(1)
    print(f"built {g['pdf']} ({pages} pages)")


if __name__ == "__main__":
    for k in sys.argv[1:] or GUIDES:
        if (V2 / GUIDES[k]["md"]).exists():
            build(k)
        else:
            print(f"skipped {k}: {GUIDES[k]['md']} not written yet")
