"""@font-face rules for EB Garamond and Inter (both free, SIL Open Font License, see OFL.txt and OFL-Inter.txt).
Static (non-variable) files in fonts/static so print PDFs convert cleanly to grayscale. Imported by the PDF builders."""
import pathlib
_S = pathlib.Path(__file__).resolve().parent / "static"
_FACES = [("EB Garamond", "EBGaramond-Regular", 400, "normal"), ("EB Garamond", "EBGaramond-Italic", 400, "italic"),
          ("EB Garamond", "EBGaramond-SemiBold", 600, "normal"), ("EB Garamond", "EBGaramond-SemiBoldItalic", 600, "italic"),
          ("EB Garamond", "EBGaramond-Bold", 700, "normal"), ("EB Garamond", "EBGaramond-BoldItalic", 700, "italic"),
          ("Inter", "Inter-Regular", 400, "normal"), ("Inter", "Inter-SemiBold", 600, "normal"), ("Inter", "Inter-Bold", 700, "normal")]
CSS = "".join(f"@font-face{{font-family:'{fam}';src:url('{(_S / (f + '.ttf')).as_uri()}') format('truetype');font-weight:{w};font-style:{st};}}"
              for fam, f, w, st in _FACES)
