#!/usr/bin/env python3
"""Check the explainer's Before | title | Next row fits the viewport (r14).

Serve the site first (viewer `site`, port 8792). Prints each box's left..right
per page and width, and exits 1 if any box leaves the viewport.
"""
import sys
from playwright.sync_api import sync_playwright

PAGES = ["index.html", "explicationSounds.html"]
SIZES = [(390, 844), (1280, 800)]
bad = 0
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
    for u in PAGES:
        for w, h in SIZES:
            pg = b.new_page(viewport={"width": w, "height": h})
            pg.goto("http://localhost:8792/" + u, wait_until="networkidle")
            pg.wait_for_selector("#nextButton")
            for sel in ["#previousButton", "#titleSection", "#nextButton"]:
                r = pg.eval_on_selector(sel, "e => { const b = e.getBoundingClientRect(); return [b.left, b.right] }")
                ok = r[0] >= 0 and r[1] <= w
                bad += not ok
                print(f"{u} {w} {sel} {r[0]:.0f}..{r[1]:.0f}", "" if ok else "OUTSIDE")
            pg.close()
    b.close()
sys.exit(1 if bad else 0)
