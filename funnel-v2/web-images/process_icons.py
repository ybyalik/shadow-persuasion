"""Makes icons/raw-i-*.png transparent: the white paper goes, ink stays ink, amber stays amber. -> public/v2/icons/<name>.png"""
import sys, pathlib
import numpy as np
from PIL import Image
HERE = pathlib.Path(__file__).parent; OUT = HERE.parents[1] / "public/v2/icons"
for n in sys.argv[1:]:
    a = np.asarray(Image.open(HERE / "icons" / f"raw-i-{n}.png").convert("RGB")).astype(float)
    L = a.mean(axis=2); sat = a.max(axis=2) - a.min(axis=2)
    alpha = np.clip((235 - L) / 160, 0, 1)
    amber = sat > 60
    rgb = np.where(amber[..., None], a, np.array([28, 27, 24]))
    alpha = np.where(amber, np.maximum(alpha, 0.95), alpha)
    o = Image.fromarray(np.dstack([rgb, alpha * 255]).astype("uint8"), "RGBA")
    o = o.crop(o.split()[3].point(lambda v: 255 if v > 30 else 0).getbbox())
    o.thumbnail((320, 320)); o.save(OUT / f"{n}.png"); print(n, o.size)
