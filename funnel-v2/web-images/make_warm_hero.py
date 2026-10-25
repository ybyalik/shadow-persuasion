"""Warm 'after' illustrations for the light test version (/v6): same linocut style, terracotta accent.
Output: lino/raw-warm-<name>.png, then mapped to ink / paper / terracotta."""
import base64, json, pathlib, urllib.request, concurrent.futures as cf
from PIL import Image
HERE = pathlib.Path(__file__).parent
KEY = next(l.split("=", 1)[1].strip().strip('"') for l in open(pathlib.Path.home() / "Desktop/second-wind/.env.local") if l.startswith("GEMINI_API_KEY="))
REFS = [base64.b64encode((HERE / "style-test" / f"{n}.png").read_bytes()).decode() for n in ("queen", "phone", "table")]
STYLE = ("Match the exact print style of the three reference images: a hand-carved linocut print, bold near-black ink with visible gouge marks, "
         "printed on warm off-white paper, two colours only (ink and paper) plus a warm terracotta orange (#c0623f) used generously for light, warmth and a few accents. "
         "Flat colour, no gradients, coarse paper grain, editorial book illustration, calm and hopeful mood, generous empty paper around the subject. "
         "The face may be shown in gentle three-quarter view with a soft relaxed expression, simple carved features, not detailed. "
         "Absolutely no text, letters, numbers, logos, borders or frames. No glow, no blur, no 3D, no photorealism.")
JOBS = {
    "tea": ("4:3", "A woman in her fifties sitting at a kitchen table in warm morning light, both hands around a mug of tea, shoulders relaxed, a small contented smile. Her smartphone lies face down on the table beside her, buzzing, with little vibration marks around it, and she is calmly ignoring it. A window behind her with sunlight falling across the table."),
    "garden": ("4:3", "A woman in her fifties sitting on a garden bench in the late afternoon sun, reading a book, a cup of tea beside her, legs crossed, completely at ease. Flowers and leaves around her, warm sunlight."),
}
def gen(n):
    aspect, prompt = JOBS[n]
    parts = [{"inline_data": {"mime_type": "image/png", "data": r}} for r in REFS] + [{"text": prompt + " " + STYLE}]
    body = {"contents": [{"parts": parts}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": aspect, "imageSize": "2K"}}}
    req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-nano-banana-2.1:generateContent", data=json.dumps(body).encode(), headers={"x-goog-api-key": KEY, "Content-Type": "application/json"})
    r = json.loads(urllib.request.urlopen(req, timeout=300).read())
    d = next(p["inlineData"]["data"] for p in r["candidates"][0]["content"]["parts"] if "inlineData" in p)
    raw = HERE / "lino" / f"raw-warm-{n}.png"; raw.write_bytes(base64.b64decode(d))
    # Map to three colours so the paper equals the page background exactly.
    INK, PAPER, TERRA = (28, 27, 24), (244, 239, 230), (192, 98, 63)
    pal = Image.new("P", (1, 1)); pal.putpalette(list(INK) + list(PAPER) + list(TERRA) + [0, 0, 0] * 253)
    q = Image.open(raw).convert("RGB").quantize(palette=pal, dither=Image.Dither.NONE).convert("RGB")
    q.thumbnail((1600, 1600)); q.save(HERE.parents[1] / "public/v2/lino" / f"warm-{n}.jpg", quality=84, optimize=True, progressive=True)
    return n
with cf.ThreadPoolExecutor(2) as ex:
    for f in cf.as_completed([ex.submit(gen, n) for n in JOBS]):
        try: print("made", f.result())
        except Exception as e: print("failed", e)
