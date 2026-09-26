#!/usr/bin/env python3
"""Contact sheet: each explainer step reached by clicking Next (the pager swaps the material
on one renderer) next to the same step loaded fresh with ?page=N. The two columns must show
the same shader; time-animated ones may be at a different phase.

    python3 -m http.server 8765 &   # from the repo root
    tools/explainer_swap_sheet.py out.png [--base http://localhost:8765/] [--width 1280]
"""
import argparse, io
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("out")
ap.add_argument("--base", default="http://localhost:8765/")
ap.add_argument("--width", type=int, default=1280)
a = ap.parse_args()
ARGS = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]


def canvas_shot(pg):
    pg.wait_for_timeout(700)  # texture load + first frames
    return Image.open(io.BytesIO(pg.locator("#presentingShader canvas").screenshot()))


with sync_playwright() as p:
    b = p.chromium.launch(args=ARGS)
    view = {"width": a.width, "height": 900}
    walked, errors = [], []
    pg = b.new_page(viewport=view)
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.goto(f"{a.base}index.html", wait_until="networkidle")
    pg.wait_for_selector("#presentingShader canvas")
    while True:
        walked.append((pg.inner_text("#titleSection"), canvas_shot(pg)))
        if pg.is_disabled("#nextButton"):
            break
        pg.click("#nextButton")
    canvases = pg.locator("#presentingShader canvas").count()
    pg.close()

    fresh = []
    for n in range(len(walked)):
        pg = b.new_page(viewport=view)
        pg.goto(f"{a.base}index.html?page={n}", wait_until="networkidle")
        pg.wait_for_selector("#presentingShader canvas")
        fresh.append(canvas_shot(pg))
        pg.close()
    b.close()

w, h = 360, int(360 * walked[0][1].height / walked[0][1].width)
sheet = Image.new("RGB", (2 * w + 30, len(walked) * (h + 24) + 24), "white")
d = ImageDraw.Draw(sheet)
d.text((10, 6), "walked with Next (one renderer)", fill="black")
d.text((w + 20, 6), "fresh load ?page=N", fill="black")
for i, ((title, a_img), b_img) in enumerate(zip(walked, fresh)):
    y = 24 + i * (h + 24)
    d.text((10, y), f"{i}: {title}", fill="black")
    sheet.paste(a_img.convert("RGB").resize((w, h)), (10, y + 14))
    sheet.paste(b_img.convert("RGB").resize((w, h)), (w + 20, y + 14))
sheet.save(a.out)
print(a.out, f"{len(walked)} steps, canvases in #presentingShader after the walk: {canvases}, errors: {errors or 'none'}")
