#!/usr/bin/env python3
"""Render the shaders no gallery list imports, with the real gallery code, to judge what they are worth.

Serve the site first (viewer `site`: python3 -m http.server 8792 from the root).

    tools/orphan_shaders_probe.py out/orphans     # -> one png per orphan card, and per page

galleryExtern.html is loaded with its list (js/externShaderMaterials/ZShadersList.js) swapped for
one naming the orphans; galleryToApply.html with The Puppy entry as it was before 7ad4f7b.
Prints, per page, the console errors (a shader that fails to compile shows up here) and
the frames drawn in 3 s next to the same page as it is today, so a shader that stalls\nthe page shows as a low count. Then The Puppy again with its search
one texel at a time. Last, shaderBuilder.html is fed a stubbed OpenAI reply.
"""
import argparse
import json
from playwright.sync_api import sync_playwright

ORPHAN_EXTERN = """
import GraySky from '../aiMadeShaderMaterials/GraySky.js';
import MonsterV2 from './monsterV2.js';
import TrigGraph from './trigGraph.js';
import Tunnel from '../complexShadersMaterials/tunnel.js';
import TunnelV2 from '../complexShadersMaterials/tunnelV2.js';
export const shaders = [
    {...GraySky, name: 'GraySky (aiMade, never listed)'},
    {...MonsterV2, name: 'monsterV2 (extern, unlisted a69f9fb)', author: '?'},
    {...TrigGraph, name: 'trigGraph (unlisted c8831d0)', author: '?'},
    {name: 'Tunnel (complex, never shown)', material: Tunnel, author: 'nayk'},
    {name: 'Tunnel V2 (complex, never shown)', material: TunnelV2, author: 'nayk'},
];
"""

ORPHAN_APPLIED = """
import ThePuppyMaterial from './thePuppy.js';
export const shaders = [
    {
        name: 'The Puppy (unlisted 7ad4f7b)',
        material: ThePuppyMaterial,
        description: 'as listed before 7ad4f7b',
        baseImage: './images/bebe/1_bebe.jpg',
        optionalImage2: './images/bebe/1_bebe_central.jpg',
        optionalImage3: './images/bebe/1_bebe_around.jpg',
        author: '?',
    },
];
"""

# Counts frames in a page-side loop and reads the count with a sync evaluate, so a page whose
# GPU work stalls rAF still answers (a Promise waiting on rAF would hang the probe).
COUNT = "() => { window.__n = 0; (function f() { window.__n++; requestAnimationFrame(f) })() }"

ap = argparse.ArgumentParser()
ap.add_argument("out")
ap.add_argument("--base", default="http://localhost:8792/")
a = ap.parse_args()

def fulfil_with(body):
    # one parameter: playwright passes (route, request) to a handler that takes two
    return lambda route: route.fulfill(status=200, body=body, content_type="application/javascript")


def launch(p):
    return p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])


def run(b, page, swaps, tag, cards):
    pg = b.new_page(viewport={"width": 1280, "height": 900})
    errors = []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.on("console", lambda m: m.type == "error" and errors.append(m.text))
    for listfile, body in swaps:
        pg.route(a.base + listfile, fulfil_with(body))
    pg.set_default_timeout(20000)
    pg.goto(a.base + page, wait_until="load")
    pg.wait_for_timeout(2500)
    pg.evaluate(COUNT)
    pg.wait_for_timeout(3000)
    frames = pg.evaluate("window.__n")
    print(f"{tag}: {frames} frames in 3 s; errors: {errors or 'none'}", flush=True)
    if cards:
        for i, card in enumerate(pg.locator("main .shader-item").all()):
            card.scroll_into_view_if_needed()
            pg.wait_for_timeout(1500)
            card.screenshot(path=f"{a.out}-{tag}-{i}.png")
    else:
        try:
            pg.screenshot(path=f"{a.out}-{tag}.png", timeout=10000)
        except Exception:
            print(f"{tag}: frozen, no screenshot in 10 s", flush=True)
            return
    pg.close()


# thePuppy.js steps decal by 1e-7 up to 1.0: up to 10M texture reads per pixel per frame.
# The same search one texel at a time (the bebe images are 682 wide) is at most 682.
PUPPY_SLOW = """            while(getLength(color_around) > 2.9)
            {
                color_around = texture2D(uTexture_3, mod(vec2(vUv.x + time + decal, vUv.y), 1.0));
                decal += 0.0000001 ; 
                if(decal > 1.0) {
                    break ; 
                }
            }"""
PUPPY_TEXEL = """            for (int i = 0; i < 682; i++) {
                if (getLength(color_around) <= 2.9) break;
                decal += 1.0 / 682.0;
                color_around = texture2D(uTexture_3, mod(vec2(vUv.x + time + decal, vUv.y), 1.0));
            }"""


def puppy_texel_step():
    src = open("js/toApplyShaderMaterials/thePuppy.js").read()
    assert PUPPY_SLOW in src, "thePuppy.js changed: update PUPPY_SLOW"
    return src.replace(PUPPY_SLOW, PUPPY_TEXEL)


RED = "void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }"


def builder(b):
    """shaderBuilder.html with api.openai.com answering a red shader: is it shown, is the plane red?"""
    pg = b.new_page(viewport={"width": 1280, "height": 900})
    pg.route("https://api.openai.com/**", lambda route: route.fulfill(
        status=200, content_type="application/json",
        body=json.dumps({"choices": [{"message": {"content": RED}}]})))
    pg.goto(a.base + "shaderBuilder.html", wait_until="load")
    pg.wait_for_timeout(2500)
    pg.fill("#apiKey", "sk-probe")
    pg.fill("#userPrompt", "a red shader")
    pg.click(".promptSection button")
    pg.wait_for_timeout(2000)
    shown = pg.evaluate("document.getElementById('fragmentCode').textContent")
    # the canvas is judged on the screenshot: readPixels on a cleared drawing buffer reads 0
    print("builder: reply shown in #fragmentCode:", RED in shown, flush=True)
    pg.screenshot(path=f"{a.out}-builder.png", full_page=True)
    pg.close()


# A browser per check: closing the page The Puppy froze hangs, closing its browser does not.
with sync_playwright() as p:
    for args in [("galleryExtern.html", [], "extern-as-is", False),
                 ("galleryExtern.html", [("js/externShaderMaterials/ZShadersList.js", ORPHAN_EXTERN)], "extern-orphans", True),
                 ("galleryToApply.html", [], "applied-as-is", False),
                 ("galleryToApply.html", [("js/toApplyShaderMaterials/ZtoApplyShaderList.js", ORPHAN_APPLIED)], "applied-puppy", False),
                 ("galleryToApply.html", [("js/toApplyShaderMaterials/ZtoApplyShaderList.js", ORPHAN_APPLIED),
                                          ("js/toApplyShaderMaterials/thePuppy.js", puppy_texel_step())],
                  "applied-puppy-texel-step", False)]:
        b = launch(p)
        run(b, *args)
        b.close()
    b = launch(p)
    builder(b)
    b.close()
