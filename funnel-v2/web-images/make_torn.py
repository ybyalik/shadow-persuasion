"""Real torn-paper edge strips for the hero's bottom border. -> raw/torn-<name>.png (chroma green, keyed out after)"""
import base64, json, pathlib, urllib.request, concurrent.futures as cf
HERE = pathlib.Path(__file__).parent
KEY = next(l.split("=", 1)[1].strip().strip('"') for l in open(pathlib.Path.home() / "Desktop/second-wind/.env.local") if l.startswith("GEMINI_API_KEY="))
BASE = ("Flat overhead macro photograph of a long horizontal strip of warm cream uncoated paper (colour #f4efe6) filling the lower part of the frame edge to edge, "
        "on a perfectly flat pure chroma-key green background (#00B140) above it. The paper's bottom edge runs off the bottom of the frame. No shadow on the green, no text, nothing else. ")
JOBS = {
    "soft": BASE + "The top edge of the paper is hand-torn in a gentle uneven wave, with fine white paper fibres and a thin lighter torn rim along the edge.",
    "rough": BASE + "The top edge of the paper is roughly torn with deep irregular bites and peaks, a pale white torn layer showing along the edge and fine loose fibres sticking up.",
}
def gen(n):
    body = {"contents": [{"parts": [{"text": JOBS[n]}]}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "21:9", "imageSize": "2K"}}}
    req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-nano-banana-2.1:generateContent", data=json.dumps(body).encode(), headers={"x-goog-api-key": KEY, "Content-Type": "application/json"})
    r = json.loads(urllib.request.urlopen(req, timeout=300).read())
    d = next(p["inlineData"]["data"] for p in r["candidates"][0]["content"]["parts"] if "inlineData" in p)
    (HERE / "raw" / f"torn-{n}.png").write_bytes(base64.b64decode(d)); return n
with cf.ThreadPoolExecutor(2) as ex:
    for f in cf.as_completed([ex.submit(gen, n) for n in JOBS]):
        try: print("made", f.result())
        except Exception as e: print("failed", e)
