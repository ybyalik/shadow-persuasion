"""Full wraparound cover (back + spine + front) for a 6x9 Lulu paperback, with 0.125 in bleed.
Spine width is estimated; Lulu's cover template for the final page count gives the exact figure."""
import pathlib, subprocess, sys
HERE = pathlib.Path(__file__).parent
import sys as _sys
_sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / 'fonts'))
from fontface import CSS as FONT_CSS  # EB Garamond
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PAGES = int(sys.argv[1]) if len(sys.argv) > 1 else 248
HARDCOVER = "--hardcover" in sys.argv
TW, TH = 6.0, 9.0
if HARDCOVER:
    # Casewrap: Lulu's /cover-dimensions/ gives 14.563 x 10.750 in for 247 pages (0600X0900.BW.STD.CW).
    # 0.875 in on every outer edge wraps around the board (0.125 bleed + 0.75 turn-in).
    W, H = 14.563, 10.75
    BLEED = (H - TH) / 2
    SPINE = round(W - 2 * (TW + BLEED), 3)
else:
    SPINE = round(PAGES / 444 + 0.06, 3)          # inches, Lulu-style estimate for 60# paper
    BLEED = 0.125
    W, H = BLEED * 2 + TW * 2 + SPINE, TH + BLEED * 2
OUT = "lulu-cover-hardcover" if HARDCOVER else "lulu-cover-wrap"
DPI = 150
art = (HERE.parent / "covers" / "art" / "book-b.png").as_uri()
html = f"""<!doctype html><html><head><meta charset="utf-8"><style>{FONT_CSS}
@page {{ size: {W}in {H}in; margin: 0; }}
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{ width:{W}in; height:{H}in; background:#0b0a08; color:#efe7da; font-family: 'EB Garamond', Georgia, serif; position:relative; overflow:hidden; }}
.back {{ position:absolute; left:0; top:0; width:{BLEED+TW}in; height:{H}in; background:#14110d; padding:{BLEED+0.7}in 0.75in 0.7in {BLEED+0.75}in; }}
.back h2 {{ font-weight:normal; font-size:19pt; line-height:1.3; margin-bottom:16pt; color:#fff; }}
.back p {{ font-size:10.5pt; line-height:1.55; margin-bottom:10pt; color:#ddd3c3; }}
.back ul {{ margin: 0 0 12pt 14pt; font-size:10.5pt; line-height:1.55; color:#ddd3c3; }}
.back .url {{ position:absolute; bottom:{BLEED+0.6}in; left:{BLEED+0.75}in; font: 9pt 'Inter', Helvetica, Arial, sans-serif; letter-spacing:.25em; text-transform:uppercase; color:#c9a46b; }}
.spine {{ position:absolute; left:{BLEED+TW}in; top:0; width:{SPINE}in; height:{H}in; background:#0b0a08; display:flex; align-items:center; justify-content:center; }}
.spine span {{ transform: rotate(90deg); white-space:nowrap; font-size:13pt; letter-spacing:.2em; text-transform:uppercase; }}
.spine b {{ font: 8pt 'Inter', Helvetica, Arial, sans-serif; letter-spacing:.3em; color:#c9a46b; margin-left:28pt; font-weight:normal; }}
.front {{ position:absolute; right:0; top:0; width:{TW+BLEED}in; height:{H}in; background:url('{art}') center 70%/cover; }}
.front:after {{ content:''; position:absolute; inset:0; background:linear-gradient(180deg,rgba(8,7,6,.82) 0%,rgba(8,7,6,.35) 38%,rgba(8,7,6,0) 55%,rgba(8,7,6,.55) 88%,rgba(8,7,6,.85) 100%); }}
.ft {{ position:absolute; z-index:2; left:0; right:{BLEED}in; top:{BLEED+0.75}in; text-align:center; }}
.ft h1 {{ font-weight:normal; font-size:40pt; line-height:1.05; letter-spacing:.06em; }}
.ft .r {{ width:40pt; height:1.5pt; background:#c9a46b; margin:16pt auto 14pt; }}
.ft .s {{ font-style:italic; font-size:13pt; line-height:1.35; color:#e6dccb; }}
.fa {{ position:absolute; z-index:2; left:0; right:{BLEED}in; bottom:{BLEED+0.5}in; text-align:center; font: 10pt 'Inter', Helvetica, Arial, sans-serif; letter-spacing:.35em; }}
</style></head><body>
<div class="back">
<h2>You were taught to keep everyone comfortable. Nobody taught you what to do when people take advantage of it.</h2>
<p>The yes you didn't mean. The raise you didn't ask for. The joke at your expense you laughed along with. The phone call that ended, again, with you apologizing for something they did.</p>
<p><i>Shadow Persuasion</i> shows you how it happens and how to stop it, calmly:</p>
<ul><li>the hidden rules that keep nice people agreeable</li><li>a 21-day reset that changes how you answer people</li><li>the tactics people use on you, and the calm words that stop each one</li><li>quiet power: being heard, asking for what you're owed, and making it stick</li></ul>
<p>Protect yourself first. Then learn to influence fairly, without becoming the people you've learned to defend against.</p>
<div class="url">ShadowPersuasion.com</div>
</div>
<div class="spine"><span>Shadow Persuasion<b>NATE HARLAN</b></span></div>
<div class="front"><div class="ft"><h1>SHADOW<br>PERSUASION</h1><div class="r"></div><div class="s">How to Stop Being Used<br>and Take Your Power Back</div></div><div class="fa">NATE HARLAN</div></div>
</body></html>"""
src = HERE / ("cover-hardcover.html" if HARDCOVER else "cover-wrap.html"); src.write_text(html)
subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", f"--print-to-pdf={HERE / (OUT + '.pdf')}", src.as_uri()], capture_output=True, check=True)
subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--window-size={round(W*96)},{round(H*96)}",
                f"--force-device-scale-factor={DPI/96}", f"--screenshot={HERE / (OUT + '.png')}", src.as_uri()], capture_output=True)
print(f"spine {SPINE} in, full wrap {W:.3f} x {H:.3f} in")
