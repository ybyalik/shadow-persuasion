"""Cover artwork (no text) from Google's Nano Banana 2.1. Titles are set later in HTML so lettering stays sharp.
Key: GEMINI_API_KEY from ~/Desktop/second-wind/.env.local (Prime Journal's Google project).
Usage: python3 make_art.py [name ...]"""
import base64, json, pathlib, sys, urllib.request, concurrent.futures as cf

OUT = pathlib.Path(__file__).parent / "art"
KEY = next(l.split("=", 1)[1].strip().strip('"') for l in open(pathlib.Path.home() / "Desktop/second-wind/.env.local") if l.startswith("GEMINI_API_KEY="))
MODEL = "gemini-nano-banana-2.1"
STYLE = ("Fine-art book cover artwork, photographic, cinematic low-key lighting, deep near-black background with warm amber light, "
         "elegant and restrained, generous empty dark space in the upper half for a title. Absolutely no text, no letters, no numbers, "
         "no logos, no watermark, no frame or border. Portrait orientation.")
PROMPTS = {
    "book-a": "Several cut puppet strings hanging loose from above, the cut ends catching warm light, against darkness. The strings are slack and free. Minimal, symbolic, quiet. " + STYLE,
    "book-b": "A single white chess queen standing calmly on a dark board while long dramatic shadows of many reaching hands stretch toward it and stop short. Quiet strength. " + STYLE,
    "journal-a": "An open blank leather-bound journal with a fountain pen resting across the pages, lit by a single warm lamp from the side, dark wooden desk fading to black. Calm, private, hopeful. " + STYLE,
    "scripts-a": "A single folded note card standing slightly open on a dark surface, soft warm light falling on it, a sense of calm and composure. Minimal still life. " + STYLE,
    "spotter-a": "A brass magnifying glass resting on a dark leather desk, its lens catching a warm glint of light. Calm, observant, precise. " + STYLE,
    "shrinking-a": "A single tall candle burning with a steady, upright flame in a dark room, the flame perfectly still. Quiet confidence. " + STYLE,
    "planner-a": "A fountain pen lying beside a single sheet of blank paper on a dark wooden desk, warm side light, orderly and calm. " + STYLE,
    "playbooks-a": "Several chess pieces mid-game on a dark wooden board seen from a low angle, warm light on the pieces, a sense of considered strategy. " + STYLE,
    "pay-a": "A neat short stack of gold coins next to a fountain pen on a dark surface, warm light, understated and dignified. " + STYLE,
    "scripts-b": "A simple ceramic cup of tea on a saucer on a dark wooden table, a thin calm wisp of steam rising, warm side light, still and composed. " + STYLE,
    "scripts-c": "A clear glass of water standing perfectly still on a dark table, the surface completely calm, a soft highlight of warm light on the glass. " + STYLE,
    "scripts-d": "A smartphone lying face up on a dark wooden table, its screen glowing softly and completely blank with no text or icons, beside a cup of tea, warm lamp light. " + STYLE,
}

def gen(name):
    body = {"contents": [{"parts": [{"text": PROMPTS[name]}]}],
            "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "2:3", "imageSize": "2K"}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
                                 data=json.dumps(body).encode(), headers={"x-goog-api-key": KEY, "Content-Type": "application/json"})
    resp = json.loads(urllib.request.urlopen(req, timeout=300).read())
    parts = resp["candidates"][0]["content"]["parts"]
    img = next(p["inlineData"]["data"] for p in parts if "inlineData" in p)
    (OUT / f"{name}.png").write_bytes(base64.b64decode(img))
    return name

names = sys.argv[1:] or list(PROMPTS)
with cf.ThreadPoolExecutor(4) as ex:
    for f in cf.as_completed([ex.submit(gen, n) for n in names]):
        try: print("made", f.result())
        except Exception as e: print("failed:", e)
