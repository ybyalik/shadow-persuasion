"""Hero picture options for the owner to choose from. Usage: make_hero_options.py [name ...] -> raw/hero-<name>.png"""
import base64, json, pathlib, sys, urllib.request, concurrent.futures as cf
HERE = pathlib.Path(__file__).parent; COVERS = HERE.parent / "covers"
KEY = next(l.split("=", 1)[1].strip().strip('"') for l in open(pathlib.Path.home() / "Desktop/second-wind/.env.local") if l.startswith("GEMINI_API_KEY="))
def img(p): return {"inline_data": {"mime_type": "image/png", "data": base64.b64encode(p.read_bytes()).decode()}}
GREEN = ("Premium product photograph isolated on a perfectly flat, evenly lit pure chroma-key green background (#00B140) with no floor, no table and no shadow on the background. "
         "Reproduce the book cover from the first image exactly with all text legible and unchanged; add no other text anywhere. Warm soft light from the left, crisp clean edges, nothing green on the objects. ")
JOBS = {
    "hands": ([COVERS / "cover-book.png"], "4:3", GREEN + "Two hands of a woman in her fifties, wearing a simple cream knit sleeve, hold the 6x9 inch paperback (about 250 pages thick) up toward the viewer, tilted slightly, cover facing us, spine visible. Only hands and forearms, cropped at the bottom edge of the frame."),
    "strings": ([COVERS / "cover-book.png"], "4:3", GREEN + "The 6x9 inch paperback, about 250 pages thick, stands upright turned three-quarters. High above it, clearly separate and NOT touching or attached to the book, floats a wooden marionette control bar whose strings have been cut short; the short frayed string ends hang from the bar and stop far above the book, with a large empty gap between them and the book. A few loose cut pieces of string lie on the ground beside the book. A small pair of brass scissors lies open in front of the book."),
    "night": ([COVERS / "cover-book.png"], "4:3", GREEN + "The 6x9 inch paperback, about 250 pages thick, lies at an angle with its cover up. Leaning against it, a smartphone with a dark screen showing only the time 3:07 in large thin white digits. Beside them a pair of reading glasses and a ceramic mug of tea. Arranged as a tight group seen from slightly above."),
    "parcel": ([COVERS / "cover-book.png", COVERS / "cover-journal.png"], "4:3", GREEN + "The 6x9 inch paperback, about 250 pages thick, sits half out of an opened brown kraft paper mailer, tied with loose cotton twine, the cover fully visible. Behind it, partly visible, the thin journal from the second image. It looks like a book that just arrived in the mail."),
    "lino": (sorted((HERE / "style-test").glob("*.png"))[:3], "4:3", "Match the exact print style of the reference images: a hand-carved linocut print, bold near-black ink with visible gouge marks, flat colour, high contrast, on a plain pure white background with nothing else. "
             "Subject: two hands, one holding open scissors, cutting the strings of a marionette control bar above them; the cut strings fall away loosely. Simple, centred, generous white space all around. No text, no borders, no frame, no faces."),
}
def gen(name):
    refs, aspect, prompt = JOBS[name]
    body = {"contents": [{"parts": [img(r) for r in refs] + [{"text": prompt}]}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": aspect, "imageSize": "2K"}}}
    req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-nano-banana-2.1:generateContent", data=json.dumps(body).encode(), headers={"x-goog-api-key": KEY, "Content-Type": "application/json"})
    r = json.loads(urllib.request.urlopen(req, timeout=300).read())
    d = next(p["inlineData"]["data"] for p in r["candidates"][0]["content"]["parts"] if "inlineData" in p)
    (HERE / "raw" / f"hero-{name}.png").write_bytes(base64.b64decode(d)); return name
names = sys.argv[1:] or list(JOBS)
with cf.ThreadPoolExecutor(5) as ex:
    for f in cf.as_completed([ex.submit(gen, n) for n in names]):
        try: print("made", f.result())
        except Exception as e: print("failed", e)
