// Count what a gallery keeps alive: WebGL contexts not lost, rAF callbacks run per frame
// (one per render loop), and on-screen cards whose canvas has no live context; then apply
// the first card's shader to header, main and footer, scroll through the page a viewport at
// a time (one screenshot per stop: <name>-<width>-scrollNN.png) and, on a phone (<= 768 px,
// paged), page Next/Previous, counting again at each step.
//
//   python3 -m http.server 8765 &   # from the repo root
//   node tools/gallery-context-probe.mjs galleryAI.html [width] [outDir]
// Exits 1 when a context was lost, a card has no live context, or loops outnumber
// live renderers (a loop left running on a renderer that is gone or shared).
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openChrome, wait } from './cdp.mjs';

const file = process.argv[2] || 'galleryAI.html';
const width = parseInt(process.argv[3] || '1280');
const outDir = process.argv[4] || 'tools/out';
mkdirSync(outDir, { recursive: true });

const page = await openChrome({ width, height: 900 });
const warnings = [];
page.onConsole(t => { if (/Too many active/i.test(t)) warnings.push(t); });
await page.beforeLoad(`
    window.__gl = [];
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...rest) {
        const ctx = getContext.call(this, kind, ...rest);
        if (ctx && /webgl/.test(kind) && !window.__gl.some(g => g.ctx === ctx)) window.__gl.push({ ctx, canvas: this });
        return ctx;
    };
    window.__rafPerFrame = 0;
    let count = 0, frame = -1;
    const raf = window.__raf = window.requestAnimationFrame.bind(window);  // __raf: the probe's own, uncounted
    window.requestAnimationFrame = cb => raf(t => {
        if (t !== frame) { window.__rafPerFrame = count; count = 0; frame = t; }
        count++;
        cb(t);
    });
`);
await page.goto(`http://localhost:8765/${file}`, 5000);

// read after two frames, so the loop count is of a frame that ran after any start/stop
const state = () => page.evaluate(`new Promise(r => __raf(() => __raf(r))).then(() => {
    const live = window.__gl.filter(g => !g.ctx.isContextLost());
    const cards = [...document.querySelectorAll('.shader-item')];
    return {
        created: window.__gl.length, live: live.length,
        liveInPage: live.filter(g => g.canvas.isConnected).length,
        header: live.filter(g => g.canvas.isConnected && g.canvas.closest('header')).length,
        cards: cards.length,
        // a card only needs a context while it is on screen (galleryShadersViews starts/stops them)
        cardsDark: cards.filter(c => { const r = c.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; })
            .filter(c => !live.some(g => g.canvas === c.querySelector('canvas'))).map(c => c.querySelector('.shader-name').textContent),
        rafPerFrame: window.__rafPerFrame,
    };
})`);
// poll until the on-screen cards are drawing and loops match renderers, or 10 s pass
// (a loaded machine takes seconds to start them); the time it took is logged
const settled = async () => {
    const t0 = Date.now();
    let s = await state();
    while ((s.cardsDark.length || s.rafPerFrame > s.liveInPage) && Date.now() - t0 < 10000) {
        await wait(250);
        s = await state();
    }
    return { ...s, settleMs: Date.now() - t0 };
};
const failures = [];
const check = (label, s) => {
    console.log(label.padEnd(22), JSON.stringify(s));
    if (s.cardsDark.length) failures.push(`${label}: cards with no live context: ${s.cardsDark.join(', ')}`);
    if (s.rafPerFrame > s.liveInPage) failures.push(`${label}: ${s.rafPerFrame} loops for ${s.liveInPage} live renderers`);
    if (s.live > s.liveInPage) failures.push(`${label}: ${s.live - s.liveInPage} contexts alive off the page`);
};

check('loaded', await settled());

// apply the first card's shader to header, main and footer: each area gets its own renderer
for (const area of ['header', 'main', 'footer', 'header', 'header']) {
    await page.evaluate(`document.querySelector('.shader-item .${area}-icon').click()`);
    await wait(300);
}
await wait(500);
check('applied h,m,f,h,h', await settled());

// scroll through the page a viewport at a time: every card on screen must be drawing
const name = file.replace('.html', '');
const pageHeight = await page.evaluate('document.documentElement.scrollHeight');
let frame = 0;
for (let y = 0; ; y += 700) {
    await page.evaluate(`window.scrollTo(0, ${y})`);
    await wait(800);
    check(`scrolled to ${y}`, await settled());
    await page.screenshot(join(outDir, `${name}-${width}-scroll${String(frame++).padStart(2, '0')}.png`));
    if (y + 900 >= pageHeight) break;
}
await page.evaluate('window.scrollTo(0, 0)');
await wait(800);
check('back to the top', await settled());

if (await page.evaluate(`!!document.querySelector('.pagination-controls .next')`)) {
    for (const sel of ['.next', '.next', '.previous', '.previous']) {
        await page.evaluate(`document.querySelector('.pagination-controls ${sel}').click()`);
        await wait(400);
    }
    await wait(500);
    check('paged next x2, prev x2', await settled());
}
if (warnings.length) failures.push(`${warnings.length} context warnings: ${warnings[0]}`);
failures.forEach(f => console.log('FAIL', f));
page.close();
process.exit(failures.length ? 1 : 0);
