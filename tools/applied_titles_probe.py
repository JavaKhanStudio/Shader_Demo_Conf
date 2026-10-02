#!/usr/bin/env python3
"""Check that every Applied card (galleryToApply.html) shows its whole title, and shoot the page.

Serve the site first (viewer `site`: python3 -m http.server 8792 from the root).

    tools/applied_titles_probe.py out/applied        # -> out/applied-1280.png, out/applied-390.png

A card's h2 counts as shown when its box lies inside the card's box: the card has
overflow:hidden, so anything past its bottom edge is cut. Exits 1 if any title is cut.
"""
import argparse
import sys
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("out", help="prefix; -<width>.png is appended")
ap.add_argument("--base", default="http://localhost:8792/")
ap.add_argument("--widths", default="1280,390")
a = ap.parse_args()

CUT = """() => [...document.querySelectorAll('main .shader-item')].map(card => {
    const c = card.getBoundingClientRect(), t = card.querySelector('h2').getBoundingClientRect();
    return [card.querySelector('h2').textContent, t.top >= c.top && t.bottom <= c.bottom];
})"""

bad = 0
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
    for w in (int(x) for x in a.widths.split(",")):
        pg = b.new_page(viewport={"width": w, "height": 900})
        pg.goto(a.base + "galleryToApply.html", wait_until="networkidle")
        pg.wait_for_timeout(2500)
        for name, shown in pg.evaluate(CUT):
            print(f"{w}: {name}: {'shown' if shown else 'CUT'}")
            bad += not shown
        pg.screenshot(path=f"{a.out}-{w}.png", full_page=True)
        pg.close()
    b.close()
sys.exit(1 if bad else 0)
