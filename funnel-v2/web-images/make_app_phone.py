"""A smartphone photographed straight-on, screen filled with flat magenta so the real app screen can be placed into it."""
import base64, json, pathlib, urllib.request
HERE = pathlib.Path(__file__).parent
KEY = next(l.split("=", 1)[1].strip().strip('"') for l in open(pathlib.Path.home() / "Desktop/second-wind/.env.local") if l.startswith("GEMINI_API_KEY="))
prompt = ("Premium product photograph of a modern smartphone with thin dark bronze edges, seen perfectly straight-on from the front, upright, centred, "
          "isolated on a perfectly flat pure chroma-key green background (#00B140), no shadow on the background. "
          "The entire screen area is filled edge to edge with one flat solid pure magenta colour (#FF00FF), no reflections, no icons, no text, no notch content. Soft warm light.")
body = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "9:16", "imageSize": "2K"}}}
req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-nano-banana-2.1:generateContent", data=json.dumps(body).encode(), headers={"x-goog-api-key": KEY, "Content-Type": "application/json"})
r = json.loads(urllib.request.urlopen(req, timeout=300).read())
d = next(p["inlineData"]["data"] for p in r["candidates"][0]["content"]["parts"] if "inlineData" in p)
(HERE / "raw" / "app-phone.png").write_bytes(base64.b64decode(d)); print("made phone")
