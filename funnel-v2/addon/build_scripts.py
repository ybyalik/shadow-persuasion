"""Builds the designed Calm Reply Scripts PDF (US Letter) from calm-reply-scripts.md.

    python3 funnel-v2/addon/build_scripts.py
"""
import html
import pathlib
import re
import subprocess

HERE = pathlib.Path(__file__).resolve().parent
import sys as _sys
_sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / 'fonts'))
from fontface import CSS as FONT_CSS  # EB Garamond
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


def pandoc(md):
    return subprocess.run(["pandoc", "-f", "markdown", "-t", "html", "--wrap=none"], input=md, capture_output=True, text=True, check=True).stdout


def main():
    md = (HERE / "calm-reply-scripts.md").read_text()
    # Drop the markdown title block; the designed pages replace it.
    body_md = md.split("## How to use these scripts", 1)[1]
    body_md = "## How to use these scripts" + body_md
    body = pandoc(body_md)
    parts = re.findall(r"<h2[^>]*>(Part \d+: [^<]+)</h2>", body)
    # Each section starts on a fresh page; entries become cards.
    body = re.sub(r"<h2([^>]*)>(Part \d+): ([^<]+)</h2>",
                  r'<h2\1 class="sec"><span>\2</span>\3</h2>', body)
    body = re.sub(r"<p><strong>(\d+)\. (.*?)</strong>(.*?)</p>\s*<blockquote>\s*(.*?)\s*</blockquote>",
                  r'<div class="card"><div class="when"><b>\1</b>\2\3</div><div class="say">\4</div></div>', body, flags=re.S)
    body = body.replace("<hr />", "")
    toc = "".join(f"<li>{html.escape(p)}</li>" for p in parts)
    cover = (HERE.parent / "covers" / "cover-scripts-letter.png").as_uri()
    doc = f"""<!doctype html><html><head><meta charset="utf-8"><title>The Calm Reply Scripts</title><style>{FONT_CSS}
@page {{ size: Letter; margin: 0.8in 0.85in 0.85in; @bottom-center {{ content: counter(page); font: 9pt 'EB Garamond', Georgia, serif; color: #8a7d68; }} }}
@page bare {{ margin: 0; @bottom-center {{ content: none; }} }}
@page front {{ @bottom-center {{ content: none; }} }}
body {{ font-family: 'EB Garamond', Georgia, serif; color: #1c1b18; font-size: 12.4pt; line-height: 1.5; margin: 0; }}
.cover {{ page: bare; break-after: page; }} .cover img {{ width: 8.5in; height: 11in; object-fit: cover; display: block; }}
.front {{ page: front; break-after: page; }}
.tp {{ height: 8.6in; display: flex; flex-direction: column; justify-content: center; text-align: center; }}
.tp .k {{ font: 9pt 'Inter', Helvetica, Arial, sans-serif; letter-spacing: .3em; text-transform: uppercase; color: #8a5a2b; }}
.tp h1 {{ font-weight: normal; font-size: 34pt; margin: 14pt 0 10pt; }}
.tp p {{ font-style: italic; color: #555; }}
.legal {{ height: 8.6in; display: flex; flex-direction: column; justify-content: flex-end; font-size: 8.5pt; color: #444; }}
.toc h2 {{ font-weight: normal; font-size: 22pt; }} .toc ol {{ list-style: none; padding: 0; font-size: 12pt; line-height: 2; }}
h2 {{ font-weight: normal; font-size: 20pt; margin: 0 0 14pt; }}
h2.sec {{ break-before: page; padding-bottom: 8pt; border-bottom: 1.5pt solid #8a5a2b; }}
h2.sec span {{ display: block; font: 9pt 'Inter', Helvetica, Arial, sans-serif; letter-spacing: .3em; text-transform: uppercase; color: #8a5a2b; margin-bottom: 6pt; }}
.card {{ break-inside: avoid; margin: 0 0 10pt; padding: 10pt 12pt; border: 0.75pt solid #e2d9ca; border-radius: 4pt; }}
.card .when {{ font-size: 10.5pt; color: #4a443b; margin-bottom: 4pt; }}
.card .when b {{ display: inline-block; min-width: 22pt; color: #8a5a2b; font-family: 'Inter', Helvetica, Arial, sans-serif; }}
.card .say p {{ margin: 0; font-size: 12.5pt; font-weight: bold; color: #1c1b18; }}
blockquote {{ margin: 6pt 0; padding: 8pt 12pt; background: #f4efe6; border-radius: 3pt; }}
ol li {{ margin-bottom: 4pt; }}
</style></head><body>
<section class="cover"><img src="{cover}" alt=""></section>
<section class="front tp"><div class="k">Shadow Persuasion</div><h1>The Calm Reply Scripts</h1>
<p>100 word-for-word answers to guilt trips, gaslighting, pressure, and everything else</p>
<p style="font-style:normal;font:9pt 'Inter',Helvetica,Arial,sans-serif;letter-spacing:.3em;text-transform:uppercase;color:#8a5a2b;margin-top:30pt">Nate Harlan</p></section>
<section class="front legal"><p><b>The Calm Reply Scripts</b></p>
<p>Copyright &copy; 2026 by ShadowPersuasion.com. All rights reserved. No part of this guide may be reproduced or shared without written permission from the publisher, except for brief quotations in reviews.</p>
<p>This guide is for general information and self-help only. It is not therapy, medical advice, or legal advice, and it is not a substitute for professional help.</p>
<p>If you feel unsafe with someone, contact the National Domestic Violence Hotline (US): 1-800-799-7233, or text START to 88788. In an emergency, call 911.</p></section>
<section class="front toc"><h2>Contents</h2><ol>{toc}</ol></section>
{body}
</body></html>"""
    out_html = HERE / "calm-reply-scripts-designed.html"
    out_html.write_text(doc)
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                    f"--print-to-pdf={HERE / 'calm-reply-scripts.pdf'}", out_html.as_uri()], capture_output=True, check=True)
    print("built calm-reply-scripts.pdf")


if __name__ == "__main__":
    main()
