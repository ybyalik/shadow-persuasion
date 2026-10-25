"""Cleans every linocut so the set matches exactly: pixels are mapped onto three colours
(ink #1c1b18, paper #f4efe6, amber #c9862f) with no dithering, then saved as web JPGs in public/v2/lino.
The paper colour equals the page background, so the prints sit directly on the page."""
import glob, os, pathlib
from PIL import Image
HERE = pathlib.Path(__file__).parent
OUT = HERE.parents[1] / "public" / "v2" / "lino"
OUT.mkdir(parents=True, exist_ok=True)
INK, PAPER, AMBER = (28, 27, 24), (244, 239, 230), (201, 134, 47)
pal = Image.new("P", (1, 1)); pal.putpalette(list(INK) + list(PAPER) + list(AMBER) + [0, 0, 0] * 253)
for f in sorted(glob.glob(str(HERE / "lino" / "raw-*.png"))):
    name = os.path.basename(f)[4:-4]
    im = Image.open(f).convert("RGB")
    q = im.quantize(palette=pal, dither=Image.Dither.NONE).convert("RGB")
    # Trim empty paper around the print (keep a small margin) so the drawing fills its space.
    if not name.startswith("t-"):
        from PIL import ImageChops
        diff = ImageChops.difference(q, Image.new("RGB", q.size, PAPER)).convert("L").point(lambda v: 255 if v > 40 else 0)
        box = diff.getbbox()
        if box:
            pad = int(max(q.size) * 0.03)
            box = (max(0, box[0] - pad), max(0, box[1] - pad), min(q.width, box[2] + pad), min(q.height, box[3] + pad))
            q = q.crop(box)
    q.thumbnail((1600, 1600) if not name.startswith("t-") else (700, 700))
    q.save(OUT / f"{name}.jpg", quality=82, optimize=True, progressive=True)
    print(name, q.size, os.path.getsize(OUT / f"{name}.jpg") // 1024, "KB")
