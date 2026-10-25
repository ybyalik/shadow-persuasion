"""The book bundle as a cut-out (transparent background) so it sits on the page instead of looking like a photo.
Generated on a flat chroma-green background from the real covers, then keyed out."""
import base64, json, pathlib, urllib.request
HERE = pathlib.Path(__file__).parent
COVERS = HERE.parent / "covers"
KEY = next(l.split("=", 1)[1].strip().strip('"') for l in open(pathlib.Path.home() / "Desktop/second-wind/.env.local") if l.startswith("GEMINI_API_KEY="))
names = ["book", "journal", "spotter", "shrinking", "planner"]
parts = [{"inline_data": {"mime_type": "image/png", "data": base64.b64encode((COVERS / f"cover-{n}.png").read_bytes()).decode()}} for n in names]
parts.append({"text": (
    "Product photograph of a book bundle, isolated on a perfectly flat, evenly lit, pure chroma-key green background (#00B140) with no gradient, "
    "no floor, no table, no horizon and no shadow on the background. The first image is a 6x9 inch paperback book about 250 pages thick, standing upright "
    "at the front, slightly turned to show its spine. Behind it, slightly fanned, four thin printed guides using the other four images as covers. "
    "Reproduce every cover exactly with its text legible and unchanged; add no other text. Warm soft light from the left, crisp clean edges, "
    "nothing green on the books themselves.")})
body = {"contents": [{"parts": parts}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "4:3", "imageSize": "2K"}}}
req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-nano-banana-2.1:generateContent",
    data=json.dumps(body).encode(), headers={"x-goog-api-key": KEY, "Content-Type": "application/json"})
r = json.loads(urllib.request.urlopen(req, timeout=300).read())
d = next(p["inlineData"]["data"] for p in r["candidates"][0]["content"]["parts"] if "inlineData" in p)
(HERE / "raw" / "bundle-green.png").write_bytes(base64.b64decode(d)); print("made")
