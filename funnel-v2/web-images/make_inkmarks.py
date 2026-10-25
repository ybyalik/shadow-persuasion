"""Hand-made ink marks (underline, circle, arrows, bracket, check, cross-out) for the page,
in the same carved-ink style as the linocuts. The paper becomes transparent afterwards."""
import base64, json, pathlib, sys, urllib.request, concurrent.futures as cf
HERE = pathlib.Path(__file__).parent
OUT = HERE / "ink"; OUT.mkdir(exist_ok=True)
KEY = next(l.split("=", 1)[1].strip().strip('"') for l in open(pathlib.Path.home() / "Desktop/second-wind/.env.local") if l.startswith("GEMINI_API_KEY="))
BASE = ("A single isolated hand-drawn mark made with a thick brush or carved linocut stroke in near-black ink, with rough dry-brush edges and slight texture, "
        "on plain flat white paper, centred, nothing else in the image. No text, no letters, no shadows, no paper texture, no frame.")
JOBS = {
    "underline": ("16:9", "One long slightly wavy horizontal underline stroke, thicker in the middle, tapering at both ends, like a confident pen underline under a word."),
    "underline2": ("16:9", "A quick double underline: two loose parallel horizontal strokes, slightly uneven, like someone emphasising a sentence."),
    "circle": ("16:9", "A loose hand-drawn oval loop, like circling a phrase on a page, the ends overlapping slightly, wider than tall."),
    "arrow": ("1:1", "A hand-drawn curved arrow, swooping from top left down to bottom right, with a simple open arrowhead."),
    "arrow2": ("1:1", "A short hand-drawn arrow curving from the right side down and to the left, with a simple open arrowhead."),
    "check": ("1:1", "A single bold hand-drawn check mark tick."),
    "cross": ("16:9", "A single rough horizontal strike-through scribble line, like crossing out a word."),
    "bracket": ("9:16", "A tall hand-drawn curly bracket brace, like a margin mark grouping lines of text."),
}
def gen(n):
    aspect, p = JOBS[n]
    body = {"contents": [{"parts": [{"text": p + " " + BASE}]}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": aspect, "imageSize": "1K"}}}
    req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-nano-banana-2.1:generateContent",
        data=json.dumps(body).encode(), headers={"x-goog-api-key": KEY, "Content-Type": "application/json"})
    r = json.loads(urllib.request.urlopen(req, timeout=300).read())
    d = next(x["inlineData"]["data"] for x in r["candidates"][0]["content"]["parts"] if "inlineData" in x)
    (OUT / f"raw-{n}.png").write_bytes(base64.b64decode(d)); return n
with cf.ThreadPoolExecutor(4) as ex:
    for f in cf.as_completed([ex.submit(gen, n) for n in (sys.argv[1:] or JOBS)]):
        try: print("made", f.result(), flush=True)
        except Exception as e: print("failed", e, flush=True)
