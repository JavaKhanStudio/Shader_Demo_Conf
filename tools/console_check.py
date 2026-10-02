#!/usr/bin/env python3
"""Open every page of the site and print its console errors, failed requests and frames drawn.

Serve the site first (viewer `site`: python3 -m http.server 8792 from the root).

    tools/console_check.py            # every *.html at the root; exits 1 on any error
    tools/console_check.py index.html galleryAI.html
"""
import argparse
import pathlib
import sys
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("pages", nargs="*")
ap.add_argument("--base", default="http://localhost:8792/")
a = ap.parse_args()
root = pathlib.Path(__file__).resolve().parent.parent
pages = a.pages or sorted(p.name for p in root.glob("*.html"))

bad = 0
with sync_playwright() as p:
    for page in pages:
        # a browser per page: a page that stalls the GPU cannot hold up the next one
        b = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        pg = b.new_page(viewport={"width": 1280, "height": 900})
        errors = []
        pg.on("pageerror", lambda e: errors.append("pageerror: " + str(e)))
        pg.on("console", lambda m: m.type == "error" and errors.append("console: " + m.text))
        pg.on("requestfailed", lambda r: errors.append("failed: " + r.url))
        pg.on("response", lambda r: r.status >= 400 and errors.append(f"{r.status}: {r.url}"))
        pg.goto(a.base + page, wait_until="load")
        pg.wait_for_timeout(3000)
        pg.evaluate("() => { window.__n = 0; (function f() { window.__n++; requestAnimationFrame(f) })() }")
        pg.wait_for_timeout(2000)
        n = pg.evaluate("window.__n")
        print(f"{page}: {n} frames in 2 s;", "clean" if not errors else f"{len(errors)} error(s)")
        for e in errors:
            print("   ", e[:300])
        bad += bool(errors)
        b.close()
sys.exit(1 if bad else 0)
