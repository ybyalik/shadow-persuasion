"""The sales page illustration set: two-colour linocut prints (Nano Banana 2.1).
Every image is generated with the same style block AND three approved test prints as style references,
so the set matches. Words are never drawn by the model.
Usage: python3 make_linocuts.py [name ...]  -> lino/raw-<name>.png"""
import base64, json, pathlib, sys, urllib.request, concurrent.futures as cf
HERE = pathlib.Path(__file__).parent
OUT = HERE / "lino"
KEY = next(l.split("=", 1)[1].strip().strip('"') for l in open(pathlib.Path.home() / "Desktop/second-wind/.env.local") if l.startswith("GEMINI_API_KEY="))
REFS = [base64.b64encode((HERE / "style-test" / f"{n}.png").read_bytes()).decode() for n in ("queen", "phone", "table")]
STYLE = ("Match the exact print style of the three reference images: a hand-carved linocut print, bold near-black ink with visible gouge marks, "
         "printed on warm off-white paper, only two colours (ink and paper) plus at most one small spot of warm amber where light falls. "
         "Flat colour, no gradients, coarse paper grain, slight ink spread, editorial book illustration, high contrast, simple composition, "
         "generous empty paper around the subject. Faces turned away, in profile or in shadow, never detailed faces. "
         "Absolutely no text, letters, numbers, logos, borders or frames. No glow, no blur, no 3D, no photorealism, no purple, no teal.")
JOBS = {
    # scenes (wide)
    "replay":   ("3:2", "A woman lying awake in bed at night seen from slightly above, eyes open, staring at the ceiling, a phone glowing amber face-down on the nightstand, the dark room carved in heavy black."),
    "table":    ("3:2", "A family holiday dinner table seen from the end: an older woman leaning in and talking pointedly, a man sitting back with a strained polite posture looking down at his plate, candles, dishes."),
    "office":   ("3:2", "A small office meeting: a confident man standing and presenting with one hand raised, a woman seated at the table holding her notes, watching her own idea being presented, window blinds casting stripes."),
    "phone":    ("3:2", "Close view of an older man's two hands holding a smartphone over a kitchen table at night, thumb hesitating above the screen, a cold cup of tea beside it."),
    "calm":     ("3:2", "A woman in her fifties standing by a tall window in morning light holding a mug, shoulders relaxed, seen from behind and slightly to the side, light falling across the floor."),
    "desk":     ("3:2", "A writer's desk at night seen from above at an angle: an open notebook, a fountain pen, reading glasses and a desk lamp casting a pool of amber light."),
    "strings":  ("16:9", "Several cut puppet strings hanging loose from the top of the frame, the cut ends frayed, lots of empty space on both sides."),
    "queen":    ("3:2", "A single chess queen standing tall on a board while shadows of many hands reach toward it and stop short, the queen catching amber light."),
    "contract": ("3:2", "A child's small hand holding a pencil, signing at the bottom of a long document on a table, an adult's large hand pressing the paper flat beside it."),
    "door":     ("3:2", "A closed bedroom door in a dim hallway, a thin line of amber light under it, a person sitting on the floor outside it with their back against the wall."),
    # tactic vignettes (square, small)
    "t-guilt":     ("1:1", "An old-fashioned balance scale heavily tipped to one side by a pile of small wrapped gifts."),
    "t-rewrite":   ("1:1", "A hand holding a pencil eraser rubbing out part of an old photograph."),
    "t-silence":   ("1:1", "A telephone off its hook on a small table, the cord dangling, silence."),
    "t-charm":     ("1:1", "A hand offering a single flower, with a fishing hook hidden among the stem."),
    "t-squeeze":   ("1:1", "A stack of boxes on someone's back growing taller, each box slightly bigger than the one below."),
    "t-intimidate":("1:1", "A huge looming shadow of a person falling over a small seated figure."),
    "t-urgency":   ("1:1", "An alarm clock ringing hard, its hammer blurred between the bells."),
    "t-group":     ("1:1", "A crowd of identical dark silhouettes all pointing in the same direction, one lighter figure standing still."),
}
def gen(name):
    aspect, prompt = JOBS[name]
    parts = [{"inline_data": {"mime_type": "image/png", "data": r}} for r in REFS] + [{"text": prompt + " " + STYLE}]
    body = {"contents": [{"parts": parts}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": aspect, "imageSize": "2K"}}}
    req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-nano-banana-2.1:generateContent",
        data=json.dumps(body).encode(), headers={"x-goog-api-key": KEY, "Content-Type": "application/json"})
    r = json.loads(urllib.request.urlopen(req, timeout=300).read())
    d = next(p["inlineData"]["data"] for p in r["candidates"][0]["content"]["parts"] if "inlineData" in p)
    (OUT / f"raw-{name}.png").write_bytes(base64.b64decode(d)); return name
names = sys.argv[1:] or list(JOBS)
with cf.ThreadPoolExecutor(5) as ex:
    for f in cf.as_completed([ex.submit(gen, n) for n in names]):
        try: print("made", f.result(), flush=True)
        except Exception as e: print("failed", e, flush=True)
