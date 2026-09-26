#!/usr/bin/env python3
"""Screenshot the first screen (one viewport, no scroll) of a page of the site.

Serve the site first (viewer `site`: python3 -m http.server 8792 from the root).

    tools/shoot_first_screen.py index.html out/index            # -> out/index-1280.png, -390.png
    tools/shoot_first_screen.py index.html out/x --widths 1280 --full
    tools/shoot_first_screen.py index.html out/landing --drop "#main-placeholder"

--drop removes the matching elements before the shot: it lets a layout draft
(e.g. "the intro alone, explainer moved elsewhere") be judged without a draft page.
--links prints every nav href and whether it answers 200.
WebGL runs on SwiftShader so the explainer's canvas is drawn, not blank.
"""
import argparse
import urllib.request
from playwright.sync_api import sync_playwright

HEIGHTS = {1280: 800, 390: 844}

ap = argparse.ArgumentParser()
ap.add_argument("page")
ap.add_argument("out", help="prefix; -<width>.png is appended")
ap.add_argument("--base", default="http://localhost:8792/")
ap.add_argument("--widths", default="1280,390")
ap.add_argument("--full", action="store_true", help="whole page, not just the first screen")
ap.add_argument("--drop", action="append", default=[], help="CSS selector to remove first")
ap.add_argument("--links", action="store_true")
a = ap.parse_args()

with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
    for w in (int(x) for x in a.widths.split(",")):
        pg = b.new_page(viewport={"width": w, "height": HEIGHTS.get(w, 800)})
        errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        pg.goto(a.base + a.page, wait_until="networkidle")
        pg.evaluate("window.loadAllSections")
        pg.wait_for_timeout(1500)  # shader compile + first frames
        for sel in a.drop:
            pg.evaluate("s => document.querySelectorAll(s).forEach(e => e.remove())", sel)
        path = f"{a.out}-{w}.png"
        pg.screenshot(path=path, full_page=a.full)
        print(path, "errors:", errors or "none")
        if a.links:
            for href in pg.eval_on_selector_all("nav a, .intro a", "as => as.map(a => a.getAttribute('href'))"):
                if href.startswith("http"):
                    print("  ", href, "(external)")
                    continue
                code = urllib.request.urlopen(a.base + href).status
                print("  ", href, code)
        pg.close()
    b.close()
