"""Custom linocut icons and a few extra prints for the sales page, matching the approved linocut set.
Icons are drawn on plain white so the paper can be made transparent afterwards (process_icons.py)."""
import base64, json, pathlib, sys, urllib.request, concurrent.futures as cf
HERE = pathlib.Path(__file__).parent
OUT = HERE / "icons"
KEY = next(l.split("=", 1)[1].strip().strip('"') for l in open(pathlib.Path.home() / "Desktop/second-wind/.env.local") if l.startswith("GEMINI_API_KEY="))
REFS = [base64.b64encode((HERE / "style-test" / f"{n}.png").read_bytes()).decode() for n in ("queen", "phone")]
ICON = ("Match the carved linocut print style of the reference images: bold near-black ink with visible gouge marks and slight ink texture, "
        "plus at most one small touch of warm amber. A single small icon-like object, centred, simple and bold, readable at small size, "
        "on a perfectly plain flat pure white background with nothing else. No text, no letters, no numbers, no frame, no border, no shadow, no paper texture.")
PRINT = ("Match the carved linocut print style of the reference images exactly: near-black ink with gouge marks on warm off-white paper, "
         "only ink and paper plus one small spot of warm amber. Editorial book illustration, high contrast, generous empty paper. "
         "No text, letters, numbers, logos, borders or frames. No glow, blur, 3D or photorealism.")
JOBS = {
    "i-eye": ("1:1", "An open human eye, looking alert, with simple radiating lines.", ICON),
    "i-hourglass": ("1:1", "An hourglass with sand trickling, the falling sand in amber.", ICON),
    "i-hand": ("1:1", "A raised open hand, palm facing forward, fingers together, a calm stop gesture.", ICON),
    "i-moon": ("1:1", "A crescent moon beside a small round alarm clock showing the middle of the night.", ICON),
    "i-book": ("1:1", "An open hardback book seen from slightly above, pages fanning.", ICON),
    "i-briefcase": ("1:1", "A simple leather briefcase.", ICON),
    "i-rings": ("1:1", "Two interlocking wedding rings.", ICON),
    "i-house": ("1:1", "A small simple house with a chimney and one lit window in amber.", ICON),
    "i-head": ("1:1", "A human head in side profile silhouette with a small swirl inside it, thinking.", ICON),
    "i-compass": ("1:1", "An old brass pocket compass, the needle in amber.", ICON),
    "i-calendar": ("1:1", "A tear-off desk calendar with one page curling off.", ICON),
    "i-sprout": ("1:1", "A small sprout with two leaves growing from a mound of soil.", ICON),
    "i-speech": ("1:1", "A hand-drawn speech bubble with a small crossed-out scribble inside it.", ICON),
    "i-pen": ("1:1", "A fountain pen nib, close up, a drop of ink at the tip.", ICON),
    "i-lantern": ("1:1", "An old lantern with a small amber flame inside.", ICON),
    "i-key": ("1:1", "An old-fashioned iron key.", ICON),
    "i-push": ("1:1", "A single hand pushing forward with the flat of the palm, seen from the side, a few motion lines behind it.", ICON),
    "i-smooth": ("1:1", "A small white flag on a short stick, waving, a gesture of giving in.", ICON),
    "i-learn": ("1:1", "An old iron padlock hanging open, its key still in it.", ICON),
    "i-weight": ("1:1", "A heavy iron weight with a ring handle, pressing down, small cracks under it.", ICON),
    "i-clock": ("1:1", "A round wind-up alarm clock with two bells on top, hands showing seven minutes past three.", ICON),
    "i-receipt": ("1:1", "A long curled paper receipt.", ICON),
    "i-queen": ("1:1", "A single chess queen piece standing tall, a small amber highlight on its crown.", ICON),
    "i-shield": ("1:1", "A simple rounded shield, plain, with a single amber stripe.", ICON),
    "i-ice": ("1:1", "A single ice cube with a few frost lines, cold and hard.", ICON),
    "i-scissors": ("1:1", "An open pair of old scissors.", ICON),
    "i-rosette": ("1:1", "An award rosette: a ring of pleated ribbon around a large completely plain empty round centre, with two ribbon tails hanging below; the centre is blank, smooth and white.", ICON),
    # prints
    "path": ("21:9", "A long winding footpath seen from above as it crosses quiet hills from left to right, with small stepping stones along it and a small amber sun rising at the far right end.", PRINT),
    "part1": ("16:9", "A bedside table at night: a glowing phone face down, a glass of water and a small clock showing a few minutes past three, the rest of the room dark.", PRINT),
    "part4": ("16:9", "A thick open book lying on a table with a ribbon bookmark, a pencil resting across the pages and a small amber lamp glow at the edge.", PRINT),
}
def gen(n):
    aspect, prompt, style = JOBS[n]
    parts = [{"inline_data": {"mime_type": "image/png", "data": r}} for r in REFS] + [{"text": prompt + " " + style}]
    body = {"contents": [{"parts": parts}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": aspect, "imageSize": "1K" if n.startswith("i-") else "2K"}}}
    req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-nano-banana-2.1:generateContent",
        data=json.dumps(body).encode(), headers={"x-goog-api-key": KEY, "Content-Type": "application/json"})
    r = json.loads(urllib.request.urlopen(req, timeout=300).read())
    d = next(p["inlineData"]["data"] for p in r["candidates"][0]["content"]["parts"] if "inlineData" in p)
    (OUT / f"raw-{n}.png").write_bytes(base64.b64decode(d)); return n
with cf.ThreadPoolExecutor(5) as ex:
    for f in cf.as_completed([ex.submit(gen, n) for n in (sys.argv[1:] or JOBS)]):
        try: print("made", f.result(), flush=True)
        except Exception as e: print("failed", e, flush=True)
