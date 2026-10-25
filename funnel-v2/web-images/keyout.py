"""Cuts an object out of a chroma-green background (with green spill removed). Usage: keyout.py in.png out.webp"""
import sys
from PIL import Image
import numpy as np
im = Image.open(sys.argv[1]).convert("RGB"); a = np.asarray(im).astype(float)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
gness = g - np.maximum(r, b)
alpha = np.clip(1 - (gness - 25) / 60, 0, 1)
g2 = np.where(g > np.maximum(r, b), np.maximum(r, b) + (g - np.maximum(r, b)) * 0.15, g)
o = Image.fromarray(np.dstack([r, g2, b, alpha * 255]).astype("uint8"), "RGBA")
o = o.crop(o.split()[3].point(lambda v: 255 if v > 20 else 0).getbbox())
o.thumbnail((1400, 1400)); o.save(sys.argv[2], "WEBP", quality=86, method=6)
bg = Image.new("RGB", o.size, (26, 23, 20)); bg.paste(o, (0, 0), o); bg.thumbnail((700, 700)); bg.save(sys.argv[2] + ".preview.jpg")
print(o.size)
