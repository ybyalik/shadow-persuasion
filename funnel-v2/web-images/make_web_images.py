"""Sales-page pictures from Google's Nano Banana 2.1 (gemini-nano-banana-2.1).
Scene photos are text-to-image; product shots are image edits that use the real covers so titles stay exact.
Words on the page are always set in HTML, never drawn by the model.
Key: GEMINI_API_KEY from ~/Desktop/second-wind/.env.local.
Usage: python3 make_web_images.py [name ...]   (writes raw/<name>.png)"""
import base64, json, pathlib, sys, urllib.request, concurrent.futures as cf

HERE = pathlib.Path(__file__).parent
COVERS = HERE.parent / "covers"
OUT = HERE / "raw"
KEY = next(l.split("=", 1)[1].strip().strip('"') for l in open(pathlib.Path.home() / "Desktop/second-wind/.env.local") if l.startswith("GEMINI_API_KEY="))
MODEL = "gemini-nano-banana-2.1"

SCENE = ("Editorial documentary photograph, shot on a Leica Q2, natural and unposed, cinematic low-key lighting with warm amber "
         "practical light and deep shadows, muted earthy palette of near-black, walnut brown and soft gold, subtle film grain. "
         "Real ordinary people, not models. Absolutely no text, letters, numbers, logos or watermarks anywhere in the frame.")
STILL = ("Fine-art still life photograph, cinematic low-key lighting, deep near-black background with warm amber light, "
         "elegant and restrained. Absolutely no text, letters, numbers, logos or watermarks.")
PRODUCT = ("Photorealistic premium product photograph. Reproduce every cover EXACTLY as given, with all cover text legible and unchanged; "
           "do not invent or add any other text anywhere. Warm lamp light from the left, dark walnut desk, deep dark background, "
           "shallow depth of field, realistic paper thickness and soft shadows.")

def cover(name):
    return base64.b64encode((COVERS / f"cover-{name}.png").read_bytes()).decode()

JOBS = {
    # text-to-image scenes: (aspect, prompt)
    "scene-3am": ("3:2", "A woman in her early fifties lying awake in bed at 3 in the morning, staring at the ceiling, her face lit faintly by a phone glowing face-down on the nightstand, the rest of the bedroom in darkness, a sense of quiet replaying worry. " + SCENE),
    "scene-holiday": ("3:2", "A family holiday dinner table in a warm dining room, candles and serving dishes, an older relative leaning in and talking pointedly while a man in his late forties sits back with a polite strained smile, looking down at his plate. Tension under politeness. " + SCENE),
    "scene-office": ("3:2", "A small office meeting room, late afternoon light through blinds, a confident colleague standing and presenting with one hand raised while a quieter woman in her forties sits at the table holding her notes, watching her idea being presented as his. " + SCENE),
    "scene-phone": ("3:2", "Close view of a man's hands in his late fifties holding a smartphone at a kitchen table at night, the screen glowing softly and completely blank, a cold cup of tea beside it, his posture tense and hesitant, deciding how to reply. " + SCENE),
    "scene-calm": ("3:2", "A woman in her fifties standing by a large window in early morning light holding a cup of coffee, shoulders relaxed, a calm small smile, looking out, composed and unhurried. Warm golden light, peaceful. " + SCENE),
    "scene-desk": ("3:2", "A writer's desk at night seen from above at an angle: open notebooks full of handwriting too small to read, index cards, a fountain pen, reading glasses and a brass desk lamp casting warm light, the rest falling into darkness. " + STILL),
    "still-seal": ("1:1", "A single round blank dark oxblood-red wax seal pressed onto thick cream cotton paper, seen straight from above, soft warm side light showing the wax texture, the seal face smooth and completely blank. " + STILL),
    "still-strings": ("16:9", "Several cut marionette strings hanging loose from above, the cut ends catching warm light, wide composition with lots of dark empty space on both sides. Minimal, symbolic, quiet freedom. " + STILL),
    "still-folder": ("3:2", "A worn manila case-file folder lying slightly open on a dark walnut desk, a few blank typed sheets and a paperclip visible, a brass lamp casting warm light, deep shadows. The paper is blank. " + STILL),
    # image edits with real covers: (aspect, [cover names], prompt)
    "bundle-hero": ("4:3", ["book", "journal", "spotter", "shrinking", "planner"],
        "Arrange these as one product bundle: the first image is a 6x9 inch paperback book (about 250 pages thick) standing upright at the front and largest; behind it, slightly fanned, four thin printed letter-size guides using the other four images as their covers, smaller and partly overlapped. Beside the book, a smartphone lying on the desk with its screen dark. " + PRODUCT),
    "bump-scripts": ("1:1", ["scripts"], "Show this as a thin printed booklet lying at a slight angle on the desk, with a fountain pen beside it. " + PRODUCT),
    "upsell-pack": ("4:3", ["playbooks", "pay"], "Show these two covers as two thin printed guides on the desk, the first lying flat, the second leaning against it at an angle, side by side. " + PRODUCT),
    "paperback-hand": ("4:5", ["book"], "A person's hand holding this 6x9 inch paperback book (about 250 pages thick) up toward the camera in a cozy living room with warm lamp light, the cover facing the camera and filling much of the frame. " + PRODUCT),
}

def gen(name):
    job = JOBS[name]
    if len(job) == 2:
        aspect, prompt = job; parts = [{"text": prompt}]
    else:
        aspect, names, prompt = job
        parts = [{"inline_data": {"mime_type": "image/png", "data": cover(n)}} for n in names] + [{"text": prompt}]
    body = {"contents": [{"parts": parts}],
            "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": aspect, "imageSize": "2K"}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
                                 data=json.dumps(body).encode(), headers={"x-goog-api-key": KEY, "Content-Type": "application/json"})
    resp = json.loads(urllib.request.urlopen(req, timeout=300).read())
    data = next(p["inlineData"]["data"] for p in resp["candidates"][0]["content"]["parts"] if "inlineData" in p)
    (OUT / f"{name}.png").write_bytes(base64.b64decode(data))
    return name

names = sys.argv[1:] or list(JOBS)
with cf.ThreadPoolExecutor(4) as ex:
    for f in cf.as_completed([ex.submit(gen, n) for n in names]):
        try: print("made", f.result(), flush=True)
        except Exception as e: print("failed:", e, flush=True)
