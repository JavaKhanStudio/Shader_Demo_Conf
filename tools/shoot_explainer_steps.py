#!/usr/bin/env python3
"""Screenshot explainer steps (index.html?page=N&lang=L) from the title down to the canvas,
so the "Code Explanation" box can be read next to the shader it explains.

Serve the site first (viewer `site`: python3 -m http.server 8792 from the root).

    tools/shoot_explainer_steps.py out/steps --pages 0,7,12 --langs ENG,FR
    # -> out/steps-p0-ENG.png ... ; prints the box's text length and any page error per shot
"""
import argparse
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("out", help="prefix; -p<page>-<lang>.png is appended")
ap.add_argument("--base", default="http://localhost:8792/")
ap.add_argument("--pages", default="0,7,12")
ap.add_argument("--langs", default="ENG,FR")
a = ap.parse_args()

with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
    for page in a.pages.split(","):
        for lang in a.langs.split(","):
            pg = b.new_page(viewport={"width": 1280, "height": 800})
            errors = []
            pg.on("pageerror", lambda e: errors.append(str(e)))
            pg.goto(f"{a.base}index.html?page={page}&lang={lang}", wait_until="networkidle")
            pg.wait_for_selector("#presentingShader canvas")
            pg.wait_for_timeout(1500)  # texture load + first frames
            if page in ("12", "13"):  # a mouse step: put the mouse on the plane
                box = pg.locator("#presentingShader canvas").bounding_box()
                pg.mouse.move(box["x"] + box["width"] * 0.6, box["y"] + box["height"] * 0.4)
                pg.wait_for_timeout(300)
            title = pg.inner_text("#titleSection")
            text = pg.input_value("#explanation")
            top = pg.locator("#topSection").bounding_box()
            shader = pg.locator("#presentingShader").bounding_box()
            path = f"{a.out}-p{page}-{lang}.png"
            pg.screenshot(path=path, full_page=True, clip={
                "x": 0, "y": top["y"], "width": 1280,
                "height": shader["y"] + shader["height"] - top["y"]})
            print(path, repr(title), f"{len(text)} chars", "errors:", errors or "none")
            pg.close()
    b.close()
