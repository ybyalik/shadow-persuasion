"""A new hero image: the paperback alone, large, three-quarter view, with the journal open beside it, on chroma green for a cut-out."""
import base64, json, pathlib, urllib.request
HERE = pathlib.Path(__file__).parent; COVERS = HERE.parent / "covers"
KEY = next(l.split("=", 1)[1].strip().strip('"') for l in open(pathlib.Path.home() / "Desktop/second-wind/.env.local") if l.startswith("GEMINI_API_KEY="))
parts = [{"inline_data": {"mime_type": "image/png", "data": base64.b64encode((COVERS / f"cover-{n}.png").read_bytes()).decode()}} for n in ("book", "journal")]
parts.append({"text": ("Premium product photograph isolated on a perfectly flat, evenly lit pure chroma-key green background (#00B140) with no floor, no table and no shadow on the background. "
    "The first image is the front cover of a 6x9 inch paperback book about 250 pages thick: show it large, standing upright and turned three-quarters so the thick spine and page edges are clearly visible, leaning very slightly back. "
    "Beside and slightly in front of it, a thin printed journal using the second image as its cover lies open at an angle with blank lined pages and a fountain pen resting on it. "
    "Reproduce the covers exactly with all text legible and unchanged; add no other text. Warm soft light from the left, crisp clean edges, nothing green on the objects.")})
body = {"contents": [{"parts": parts}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "4:3", "imageSize": "2K"}}}
req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-nano-banana-2.1:generateContent", data=json.dumps(body).encode(), headers={"x-goog-api-key": KEY, "Content-Type": "application/json"})
r = json.loads(urllib.request.urlopen(req, timeout=300).read())
d = next(p["inlineData"]["data"] for p in r["candidates"][0]["content"]["parts"] if "inlineData" in p)
(HERE / "raw" / "hero2-green.png").write_bytes(base64.b64decode(d)); print("made")
