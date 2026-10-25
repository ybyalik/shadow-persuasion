"""Photo-style mockups of the printed book from the real cover, via Nano Banana 2.1 image editing."""
import base64, json, pathlib, urllib.request, concurrent.futures as cf
HERE = pathlib.Path(__file__).parent
KEY = next(l.split("=", 1)[1].strip().strip('"') for l in open(pathlib.Path.home() / "Desktop/second-wind/.env.local") if l.startswith("GEMINI_API_KEY="))
MODEL = "gemini-nano-banana-2.1"
front = base64.b64encode((HERE.parent / "covers" / "cover-book.png").read_bytes()).decode()
wrap = base64.b64encode((HERE / "lulu-cover-wrap.png").read_bytes()).decode()
JOBS = {
    "mockup-paperback-desk": (front, "Create a photorealistic product photograph of a 6 x 9 inch paperback book using EXACTLY this image as its front cover, with the cover text reproduced exactly and legibly, unchanged. The book lies at a slight angle on a warm oak desk beside a ceramic coffee mug and reading glasses, soft natural window light, shallow depth of field, realistic paper thickness of about 250 pages. No extra text anywhere."),
    "mockup-hardcover-standing": (front, "Create a photorealistic product photograph of a 6 x 9 inch hardcover book standing upright, using EXACTLY this image as its front cover, cover text reproduced exactly and legibly, unchanged. The book stands on a dark wood shelf, slightly turned so the spine is visible, warm lamp light, dark background, premium feel. No extra text anywhere."),
    "mockup-wrap-flat": (wrap, "Create a photorealistic overhead photograph of a paperback book lying open face-down on a light linen tablecloth so the back cover, spine and front cover are all visible, using EXACTLY this full cover wrap image (back cover on the left, spine in the middle, front cover on the right). Keep all text exactly as in the image. Soft daylight. No extra text."),
}
def gen(name):
    img, prompt = JOBS[name]
    body = {"contents": [{"parts": [{"inline_data": {"mime_type": "image/png", "data": img}}, {"text": prompt}]}],
            "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "3:2", "imageSize": "2K"}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
                                 data=json.dumps(body).encode(), headers={"x-goog-api-key": KEY, "Content-Type": "application/json"})
    resp = json.loads(urllib.request.urlopen(req, timeout=300).read())
    parts = resp["candidates"][0]["content"]["parts"]
    data = next(p["inlineData"]["data"] for p in parts if "inlineData" in p)
    (HERE / f"{name}.png").write_bytes(base64.b64decode(data)); return name
with cf.ThreadPoolExecutor(3) as ex:
    for f in cf.as_completed([ex.submit(gen, n) for n in JOBS]):
        try: print("made", f.result())
        except Exception as e: print("failed:", e)
