#!/usr/bin/env python3
"""Screenshot the sounds page (explicationSounds.html) with amplitude forced by hand,
no mic needed: window.AudioAnalysisData.amplitude is set every frame before the shot.

Serve the site first (viewer `site`: python3 -m http.server 8792 from the root).

    tools/shoot_sounds_amplitude.py out/mic --amps 0,0.05,0.3   # -> out/mic-amp0.png ...
"""
import argparse
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("out", help="prefix; -amp<value>.png is appended")
ap.add_argument("--base", default="http://localhost:8792/")
ap.add_argument("--amps", default="0,0.05,0.3")
ap.add_argument("--width", type=int, default=1280)
a = ap.parse_args()

with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
    for amp in a.amps.split(","):
        pg = b.new_page(viewport={"width": a.width, "height": 800})
        errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        pg.goto(a.base + "explicationSounds.html", wait_until="networkidle")
        pg.wait_for_selector("#presentingShader canvas")
        pg.evaluate("""a => { const f = () => { window.AudioAnalysisData.amplitude = a;
                                                 requestAnimationFrame(f); }; f(); }""", float(amp))
        pg.wait_for_timeout(1000)
        path = f"{a.out}-amp{amp}.png"
        pg.locator("#presentingShader").screenshot(path=path)
        print(path, "errors:", errors or "none")
        pg.close()
    b.close()
