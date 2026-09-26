#!/usr/bin/env python3
"""Screenshot named cards of a gallery page, and print any shader compile error the page logs.

Serve the site first (viewer `site`: python3 -m http.server 8792 from the root).

    tools/shoot_gallery_cards.py out/ai "Cosmic Nebula" "Water Dance"   # -> out/ai-Cosmic_Nebula-1280.png ...
    tools/shoot_gallery_cards.py out/x "Water Dance" --page galleryAI.html --widths 1280,390
"""
import argparse
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("out", help="prefix; -<name>-<width>.png is appended")
ap.add_argument("names", nargs="+", help="card title, as in .shader-name")
ap.add_argument("--base", default="http://localhost:8792/")
ap.add_argument("--page", default="galleryAI.html")
ap.add_argument("--widths", default="1280,390")
a = ap.parse_args()

with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
    for w in (int(x) for x in a.widths.split(",")):
        pg = b.new_page(viewport={"width": w, "height": 900})
        logs = []
        pg.on("pageerror", lambda e: logs.append(str(e)))
        pg.on("console", lambda m: logs.append(m.text) if m.type in ("error", "warning") else None)
        pg.goto(a.base + a.page, wait_until="networkidle")
        pg.wait_for_timeout(1500)
        for name in a.names:
            if pg.locator("button.previous").count():  # back to page 1 for each card
                while pg.locator("button.previous").first.is_enabled():
                    pg.locator("button.previous").first.click()
            card = pg.locator("div", has=pg.locator(".shader-name", has_text=name)).last
            for _ in range(10):  # under 768px the gallery shows 6 cards a page: turn pages until it is there
                if card.count() or not pg.locator("button.next").count() \
                        or not pg.locator("button.next").first.is_enabled():
                    break
                pg.locator("button.next").first.click()
                pg.wait_for_timeout(800)
            card.scroll_into_view_if_needed()
            pg.wait_for_timeout(800)  # a card scrolled in may start drawing only now
            path = f"{a.out}-{name.replace(' ', '_')}-{w}.png"
            card.screenshot(path=path)
            print(path)
        print(f"{w}: page errors/warnings:", [l for l in logs if "THREE" in l or "ERROR" in l or "rror" in l] or "none")
        pg.close()
    b.close()
