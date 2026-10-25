"""Style test: two-colour linocut illustrations for the sales page (Nano Banana 2.1)."""
import base64, json, pathlib, urllib.request, concurrent.futures as cf
HERE = pathlib.Path(__file__).parent / "style-test"
KEY = next(l.split("=", 1)[1].strip().strip('"') for l in open(pathlib.Path.home() / "Desktop/second-wind/.env.local") if l.startswith("GEMINI_API_KEY="))
STYLE = ("Hand-carved linocut print, bold black ink lines with visible gouge marks, printed on warm off-white paper, "
         "only two colours: near-black ink and the paper, plus one small spot of warm amber only where light falls. "
         "Flat colour, no gradients, coarse paper grain, slight ink spread and imperfect registration, editorial book illustration, "
         "high contrast, simple composition, large empty negative space. Faces turned away or in shadow. "
         "No text, no letters, no logos, no glow, no blur, no 3D render, no photorealism, no purple, no teal.")
JOBS = {
    "replay": "A person lying awake in bed at night seen from above, eyes open, a phone glowing on the nightstand, long shadows. " + STYLE,
    "table": "A family holiday dinner table seen from the end, one figure sitting slightly apart with shoulders hunched while others lean toward them talking. " + STYLE,
    "queen": "A single chess queen standing on a board while shadows of many hands reach toward it and stop short. " + STYLE,
    "phone": "Two hands holding a smartphone, thumb hovering over the screen, a cold cup of tea beside it on a kitchen table. " + STYLE,
}
def gen(n):
    body = {"contents": [{"parts": [{"text": JOBS[n]}]}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "4:3", "imageSize": "1K"}}}
    req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-nano-banana-2.1:generateContent",
        data=json.dumps(body).encode(), headers={"x-goog-api-key": KEY, "Content-Type": "application/json"})
    r = json.loads(urllib.request.urlopen(req, timeout=300).read())
    d = next(p["inlineData"]["data"] for p in r["candidates"][0]["content"]["parts"] if "inlineData" in p)
    (HERE / f"{n}.png").write_bytes(base64.b64decode(d)); return n
with cf.ThreadPoolExecutor(4) as ex:
    for f in cf.as_completed([ex.submit(gen, n) for n in JOBS]):
        try: print("made", f.result())
        except Exception as e: print("failed", e)
