#!/usr/bin/env python3
"""Click the way to this site from its parent's showcase, and the way back, under their real URLs.

The parent is simonbedardprog.com (r7, answer A): its showcase page
/perso/projets/shader-demo links here with "Voir en ligne", and this site's header logo and
footer link back to that page. Both URLs are answered from disk (page.route), so the clicks
work before either side is deployed:
  javakhanstudio.github.io/Shader_Demo_Conf/*  -> this checkout
  simonbedardprog.com/*                         -> the parent's built dist/ (SPA: no file -> index.html)
Everything else (three.js CDN, fonts) goes to the network.

    tools/parent_link_probe.py ~/Documents/GitHub/simonbedardprog_frontend/dist out/parent

Writes <out>-1-parent.png (showcase, its link outlined), -2-landed.png (here, logo and footer
link outlined), -3-back.png (the showcase again, after clicking the logo). Exits 1 if a click
does not land where it should.
"""
import argparse
import mimetypes
import pathlib
import sys
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent.parent
CHILD = "https://javakhanstudio.github.io/Shader_Demo_Conf/"
PARENT = "https://simonbedardprog.com/perso/projets/shader-demo"
OUTLINE = "e => { e.style.outline = '4px solid #ff00aa'; e.style.outlineOffset = '3px' }"

ap = argparse.ArgumentParser()
ap.add_argument("parent_dist", type=pathlib.Path)
ap.add_argument("out", help="prefix; -1-parent.png etc. are appended")
ap.add_argument("--width", type=int, default=1280)
a = ap.parse_args()


def serve(root, prefix, spa):
    def handler(route):
        rel = route.request.url.split("?")[0][len(prefix):] or "index.html"
        f = root / rel
        if f.is_dir():
            f = f / "index.html"
        if not f.is_file():
            if not spa:
                return route.fulfill(status=404, body="not found")
            f = root / "index.html"
        route.fulfill(status=200, body=f.read_bytes(),
                      content_type=mimetypes.guess_type(f.name)[0] or "application/octet-stream")
    return handler


fails = []
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
    ctx = b.new_context(viewport={"width": a.width, "height": 900})
    ctx.route(CHILD + "**", serve(HERE, CHILD, spa=False))
    ctx.route("https://simonbedardprog.com/**", serve(a.parent_dist.resolve(), "https://simonbedardprog.com/", spa=True))

    pg = ctx.new_page()
    pg.goto(PARENT, wait_until="networkidle")
    live = pg.locator(f'a[href="{CHILD}"]').first
    live.wait_for()
    live.evaluate(OUTLINE)
    pg.screenshot(path=f"{a.out}-1-parent.png")
    print("parent:", pg.url, "->", live.inner_text(), live.get_attribute("href"))

    with ctx.expect_page() as new:
        live.click()
    child = new.value
    child.wait_for_load_state("networkidle")
    child.evaluate("window.loadAllSections")
    child.wait_for_timeout(1500)
    if not child.url.startswith(CHILD):
        fails.append(f"Voir en ligne landed on {child.url}")
    logo = child.locator("header a.logo")
    foot = child.locator("footer a.parent-site")
    for el in (logo, foot):
        if el.get_attribute("href") != PARENT:
            fails.append(f"{el} href is {el.get_attribute('href')}")
        el.evaluate(OUTLINE)
    child.screenshot(path=f"{a.out}-2-landed.png", full_page=True)
    print("landed:", child.url, "| logo ->", logo.get_attribute("href"), "| footer ->", foot.get_attribute("href"))

    logo.click()
    child.wait_for_load_state("networkidle")
    child.wait_for_timeout(1000)
    child.screenshot(path=f"{a.out}-3-back.png")
    title = child.locator("article.showcase h2").inner_text()
    print("back:", child.url, "|", title)
    if child.url != PARENT or title != "Shader Shop":
        fails.append(f"logo landed on {child.url} titled {title!r}")
    b.close()

print("FAIL:" if fails else "OK", *fails, sep="\n  ")
sys.exit(1 if fails else 0)
