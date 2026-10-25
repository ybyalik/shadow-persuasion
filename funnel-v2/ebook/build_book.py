"""Builds the designed Shadow Persuasion book (6x9 print-style PDF) plus a matching Word file.

    python3 funnel-v2/ebook/build_book.py

Layout: cover, half title, title page, copyright page, dedication, contents (with page numbers,
found by a first render), how to use this book, the 26 chapters with styled part pages and chapter
openers, the back matter, and the new back pages in funnel-v2/matter/. Rendered with headless Chrome.
"""
import html
import pathlib
import re
import os
import subprocess

HERE = pathlib.Path(__file__).resolve().parent
import sys as _sys
_sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / 'fonts'))
from fontface import CSS as FONT_CSS  # EB Garamond
V2 = HERE.parent
CH = V2 / "chapters"
MATTER = V2 / "matter"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
# PRINT_INTERIOR=1 builds the Lulu interior: same pages without the cover (the cover is a separate file).
PRINT_INTERIOR = os.environ.get("PRINT_INTERIOR") == "1"
OUT_PDF = HERE / ("shadow-persuasion-v2-print-interior.pdf" if PRINT_INTERIOR else "shadow-persuasion-v2.pdf")
OUT_HTML = HERE / "shadow-persuasion-v2-designed.html"

TITLE = "Shadow Persuasion"
SUBTITLE = "How to Stop Being Used and Take Your Power Back"
AUTHOR = "Nate Harlan"
PUBLISHER = "ShadowPersuasion.com"
YEAR = "2026"


def pandoc(md: str) -> str:
    return subprocess.run(["pandoc", "-f", "markdown", "-t", "html", "--wrap=none"],
                          input=md, capture_output=True, text=True, check=True).stdout


def body_markdown() -> str:
    files = sorted(CH.glob("ch-*.md")) + [CH / f for f in ("back-01-playbooks.md", "back-02-situation-finder.md", "back-03-tactic-reference.md")]
    parts = []
    for f in files:
        t = f.read_text().strip()
        t = t.split("\n---\n\n*End of free chapter.*", 1)[0].strip()  # chapter 1's web-only footer
        parts.append(t)
    for name in ("where-to-get-help", "further-reading", "keep-going"):
        parts.append((MATTER / f"{name}.md").read_text().strip())
    return "\n\n".join(parts) + "\n"


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def style_headings(h: str):
    """Turn pandoc's <h1> into part pages and chapter openers. Returns (html, toc entries)."""
    toc = []

    def repl(m):
        text = html.unescape(re.sub(r"<[^>]+>", "", m.group(1))).strip()
        anchor = slug(text)
        pm = re.match(r"Part (\w+): (.+)", text)
        cm = re.match(r"Chapter (\d+): (.+)", text)
        if pm:
            toc.append(("part", f"Part {pm.group(1)}", pm.group(2), anchor))
            return (f'</div><section class="part-page" id="{anchor}"><div class="part-label">Part {pm.group(1)}</div>'
                    f'<h1 class="part-title">{html.escape(pm.group(2))}</h1></section><div class="flow">')
        if cm:
            toc.append(("chapter", cm.group(1), cm.group(2), anchor))
            return (f'</div><div class="flow chapter" id="{anchor}"><div class="ch-label">Chapter {cm.group(1)}</div>'
                    f'<h1 class="ch-title">{html.escape(cm.group(2))}</h1><div class="ch-rule"></div>')
        toc.append(("back", "", text, anchor))
        return f'</div><div class="flow chapter back" id="{anchor}"><h1 class="ch-title">{html.escape(text)}</h1><div class="ch-rule"></div>'

    out = re.sub(r"<h1[^>]*>(.*?)</h1>", repl, h)
    # [[DIAGRAM:name|caption]] lines become inline vector diagrams (funnel-v2/diagrams).
    def diagram(m):
        svg_markup = (V2 / "diagrams" / f"{m.group(1)}.svg").read_text()
        return f'<figure class="diagram">{svg_markup}<figcaption>{m.group(2)}</figcaption></figure>'
    out = re.sub(r"<p>\[\[DIAGRAM:([\w-]+)\|(.*?)\]\]</p>", diagram, out)
    # Field notes: the blockquote that starts with "Field note:"
    out = re.sub(r"<blockquote>\s*<p><em>Field note:(.*?)</em></p>\s*</blockquote>",
                 r'<aside class="field-note"><span>Field note</span>\1</aside>', out, flags=re.S)
    out = '<div class="flow">' + out + "</div>"
    # Empty wrappers between forced page breaks would print as blank pages.
    out = re.sub(r'<div class="flow">\s*</div>', "", out)
    return out, toc


def toc_html(toc, pages):
    rows = []
    for kind, num, title, anchor in toc:
        pg = pages.get(anchor, "")
        if kind == "part":
            rows.append(f'<li class="toc-part"><a href="#{anchor}">{num}: {html.escape(title)}</a></li>')
        elif kind == "chapter":
            rows.append(f'<li><a href="#{anchor}"><span class="n">{num}</span><span class="t">{html.escape(title)}</span><span class="p">{pg}</span></a></li>')
        else:
            rows.append(f'<li class="toc-back"><a href="#{anchor}"><span class="t">{html.escape(title)}</span><span class="p">{pg}</span></a></li>')
    return '<section class="front toc"><h2>Contents</h2><ul>' + "".join(rows) + "</ul></section>"


def front_html(toc_block: str) -> str:
    cover = (V2 / "covers" / "cover-book.png").as_uri()
    how = pandoc((MATTER / "how-to-use.md").read_text()).replace("<h1", '<h2').replace("</h1>", "</h2>")
    cover_page = "" if PRINT_INTERIOR else f'<section class="cover"><img src="{cover}" alt=""></section>'
    return f"""
{cover_page}
<section class="front half-title"><div>{TITLE}</div></section>
<section class="front title-page">
  <div class="tp-title">{TITLE}</div>
  <div class="tp-sub">{SUBTITLE}</div>
  <div class="tp-rule"></div>
  <div class="tp-author">{AUTHOR}</div>
</section>
<section class="front copyright">
  <p><b>{TITLE}: {SUBTITLE}</b></p>
  <p>Copyright &copy; {YEAR} by {PUBLISHER}. All rights reserved.</p>
  <p>No part of this book may be reproduced, stored, or transmitted in any form or by any means without written permission from the publisher, except for brief quotations in reviews.</p>
  <p>This book is for general information and self-help only. It is not therapy, medical advice, financial advice, or legal advice, and it is not a substitute for professional help. If you feel unsafe in a relationship, please see "Where to Get Help" at the back of this book.</p>
  <p>The examples in this book are composites written to illustrate common situations. Any resemblance to specific people is coincidental.</p>
  <p>First edition, {YEAR}</p>
</section>
<section class="front dedication"><p>For everyone who was ever told<br>they were too sensitive.</p></section>
{toc_block}
<section class="front how-to-use">{how}</section>
"""


CSS = r"""
@page { size: 6in 9in; margin: 0.8in 0.7in 0.85in 0.85in;
  @bottom-center { content: counter(page); font: 9pt 'EB Garamond', Georgia, serif; color: #6b6458; } }
@page :left { margin: 0.8in 0.85in 0.85in 0.7in; }
@page front { @bottom-center { content: none; } }
@page bare { margin: 0; @bottom-center { content: none; } }
@page partpage { @bottom-center { content: none; } }
* { box-sizing: border-box; }
body { font-family: 'EB Garamond', Georgia, serif; font-size: 11.8pt; line-height: 1.5; color: #1c1b18; margin: 0;
  hyphens: auto; text-align: justify; orphans: 3; widows: 3; }
a { color: inherit; text-decoration: none; }
p { margin: 0 0 0.62em; }
.cover { page: bare; break-after: page; width: 6in; height: 9in; }
.cover img { width: 6in; height: 9in; object-fit: cover; display: block; }
.front { page: front; break-after: page; }
.half-title { display: flex; align-items: center; justify-content: center; height: 6.7in; font-size: 18pt; letter-spacing: 0.18em; text-transform: uppercase; }
.title-page { height: 6.7in; display: flex; flex-direction: column; justify-content: center; text-align: center; }
.tp-title { font-size: 30pt; letter-spacing: 0.12em; text-transform: uppercase; line-height: 1.15; }
.tp-sub { font-style: italic; font-size: 13pt; margin-top: 14pt; color: #4a443b; }
.tp-rule { width: 50pt; height: 1.5pt; background: #8a5a2b; margin: 26pt auto; }
.tp-author { font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 10pt; letter-spacing: 0.3em; text-transform: uppercase; }
.copyright { display: flex; flex-direction: column; justify-content: flex-end; height: 6.7in; font-size: 8pt; line-height: 1.5; text-align: left; color: #3f3a33; }
.copyright p { margin-bottom: 0.7em; }
.dedication { display: flex; align-items: center; justify-content: center; height: 5.5in; text-align: center; font-style: italic; font-size: 12pt; }
.toc h2, .how-to-use h2 { font-weight: normal; font-size: 20pt; margin: 0.4in 0 0.25in; text-align: left; }
.toc ul { list-style: none; padding: 0; margin: 0; font-size: 9.6pt; }
.toc li a { display: flex; gap: 8pt; padding: 2.2pt 0; }
.toc .n { width: 16pt; color: #8a5a2b; }
.toc .t { flex: 1; }
.toc .p { min-width: 18pt; text-align: right; color: #6b6458; }
.toc .toc-part { margin-top: 9pt; font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 7.5pt; letter-spacing: 0.16em; text-transform: uppercase; color: #8a5a2b; }
.toc .toc-back { margin-top: 3pt; }
.toc .toc-back .t { padding-left: 24pt; }
.how-to-use { text-align: left; }
.part-page { page: partpage; break-before: page; break-after: page; height: 6.7in; display: flex; flex-direction: column; justify-content: center; text-align: center; }
.part-label { font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 9pt; letter-spacing: 0.35em; text-transform: uppercase; color: #8a5a2b; margin-bottom: 16pt; }
.part-title { font-weight: normal; font-size: 24pt; line-height: 1.2; margin: 0 0.3in; }
.chapter { break-before: page; }
.ch-label { font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 8.5pt; letter-spacing: 0.32em; text-transform: uppercase; color: #8a5a2b; margin-top: 0.9in; }
.ch-title { font-weight: normal; font-size: 22pt; line-height: 1.18; margin: 8pt 0 0; text-align: left; hyphens: none; }
.back .ch-title { margin-top: 0.9in; }
.ch-rule { width: 40pt; height: 1.5pt; background: #8a5a2b; margin: 18pt 0 22pt; }
.ch-rule + p::first-letter { float: left; font-size: 3.1em; line-height: 0.85; padding: 3pt 5pt 0 0; color: #1c1b18; }
h2 { font-weight: normal; font-size: 13.5pt; margin: 1.4em 0 0.5em; text-align: left; break-after: avoid; hyphens: none; }
h3 { font-size: 11pt; margin: 1.1em 0 0.35em; text-align: left; break-after: avoid; }
h4 { font-size: 10.5pt; font-style: italic; font-weight: normal; margin: 0.9em 0 0.3em; }
blockquote { margin: 0.7em 0 0.9em 0.15in; padding-left: 0.12in; border-left: 1.5pt solid #c9b18c; text-align: left; break-inside: avoid; }
blockquote p { margin-bottom: 0.3em; }
ul, ol { padding-left: 0.22in; margin: 0 0 0.7em; text-align: left; }
li { margin-bottom: 0.25em; }
hr { border: 0; border-top: 0.5pt solid #d8cfbf; margin: 1.2em 0; }
.field-note { display: block; margin: 1.6em 0 0.4em; padding: 10pt 12pt; background: #f4efe6; border-radius: 3pt; font-style: italic; text-align: left; break-inside: avoid; }
.field-note span { display: block; font-style: normal; font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 7pt; letter-spacing: 0.25em; text-transform: uppercase; color: #8a5a2b; margin-bottom: 4pt; }
table { width: 100%; border-collapse: collapse; font-size: 8pt; line-height: 1.35; margin: 0.6em 0 1em; text-align: left; hyphens: none; }
th { font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 6.8pt; letter-spacing: 0.08em; text-transform: uppercase; color: #6b6458; border-bottom: 1pt solid #8a5a2b; padding: 3pt 4pt; }
td { border-bottom: 0.5pt solid #e2d9ca; padding: 3pt 4pt; vertical-align: top; }
tr { break-inside: avoid; }
.diagram { margin: 1.1em 0 1.3em; break-inside: avoid; text-align: center; }
.diagram svg { display: block; width: 100%; height: auto; }
.diagram figcaption { font-style: italic; font-size: 9.6pt; color: #6b6458; margin-top: 6pt; text-align: center; hyphens: none; }
"""


def render(doc_html: str, pdf: pathlib.Path):
    OUT_HTML.write_text(doc_html)
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                    f"--print-to-pdf={pdf}", OUT_HTML.as_uri()], capture_output=True, check=True)


def find_pages(pdf: pathlib.Path, toc) -> dict:
    """Page number where each chapter/back section starts, by reading the rendered PDF."""
    n = int(re.search(r"Pages:\s+(\d+)", subprocess.run(["pdfinfo", str(pdf)], capture_output=True, text=True).stdout).group(1))
    texts = [subprocess.run(["pdftotext", "-f", str(i), "-l", str(i), "-layout", str(pdf), "-"], capture_output=True, text=True).stdout
             for i in range(1, n + 1)]
    pages, start = {}, 0
    for kind, num, title, anchor in toc:
        if kind == "part":
            continue
        needle = f"CHAPTER {num}" if kind == "chapter" else title[:22]
        for i in range(start, n):
            head = re.sub(r"\s+", " ", texts[i][:400]).upper()
            if needle.upper() in head and (kind != "chapter" or title[:12].upper() in head):
                pages[anchor] = i + 1
                start = i + 1
                break
    return pages


def build_docx():
    """Word version (6x9 page setup) with the same front and back matter, for editing."""
    import os
    front = (f"# {TITLE}\n\n## {SUBTITLE}\n\n*{AUTHOR}*\n\n---\n\n**{TITLE}: {SUBTITLE}**\n\n"
             f"Copyright \u00a9 {YEAR} by {PUBLISHER}. All rights reserved. No part of this book may be reproduced, stored, or "
             "transmitted in any form or by any means without written permission from the publisher, except for brief quotations in reviews.\n\n"
             "This book is for general information and self-help only. It is not therapy, medical advice, financial advice, or legal advice, "
             "and it is not a substitute for professional help. If you feel unsafe in a relationship, please see \"Where to Get Help\" at the "
             "back of this book. The examples in this book are composites written to illustrate common situations.\n\n"
             f"First edition, {YEAR}.\n\n---\n\n*For everyone who was ever told they were too sensitive.*\n\n")
    md = front + (MATTER / "how-to-use.md").read_text() + "\n\n" + body_markdown()
    md = re.sub(r"^\[\[DIAGRAM:([\w-]+)\|(.*?)\]\]$", lambda m: f"![{m.group(2)}]({V2 / 'diagrams' / (m.group(1) + '.png')})", md, flags=re.M)
    out = pathlib.Path(os.path.expanduser("~/Desktop/shadow-persuasion/docs/Shadow Persuasion - Complete Book (6x9 layout).docx"))
    subprocess.run(["pandoc", "-f", "markdown", "--toc", "--toc-depth=1", f"--reference-doc={HERE / 'book-6x9-reference.docx'}", "-o", str(out)],
                   input=md, text=True, check=True)


def main():
    body, toc = style_headings(pandoc(body_markdown()))

    def document(pages):
        return (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{TITLE}</title><style>{FONT_CSS}{CSS}</style></head>'
                f"<body>{front_html(toc_html(toc, pages))}{body}</body></html>")

    draft = HERE / ".draft.pdf"
    render(document({}), draft)          # pass 1: find where each chapter lands
    pages = find_pages(draft, toc)
    render(document(pages), OUT_PDF)     # pass 2: contents page with page numbers
    draft.unlink(missing_ok=True)
    found = sum(1 for k, *_ in toc if k != "part")
    print(f"built {OUT_PDF.name}; page numbers found for {len(pages)}/{found} sections")
    if PRINT_INTERIOR:
        # Lulu's standard black & white wants true grayscale; RGB black prints as heavy four-colour ink.
        gray = OUT_PDF.with_name(OUT_PDF.stem + "-gray.pdf")
        subprocess.run(["gs", "-q", "-o", str(gray), "-sDEVICE=pdfwrite", "-sColorConversionStrategy=Gray", "-dProcessColorModel=/DeviceGray",
                        "-dCompatibilityLevel=1.6", "-dEmbedAllFonts=true", "-dSubsetFonts=true", str(OUT_PDF)], check=True)
        print(f"grayscale print file: {gray.name}")
    else:
        build_docx()


if __name__ == "__main__":
    main()
