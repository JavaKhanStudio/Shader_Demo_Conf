// Count what a gallery keeps alive: WebGL contexts not lost, rAF callbacks run per frame
// (one per render loop), cards and cards whose canvas has a live context; then click the
// first card's "header" apply button 3 times and, on a phone (<= 768 px, paged), page
// Next/Previous, and count again. Screenshots the gallery.
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
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = cb => raf(t => {
        if (t !== frame) { window.__rafPerFrame = count; count = 0; frame = t; }
        count++;
        cb(t);
    });
`);
await page.goto(`http://localhost:8765/${file}`, 5000);

const state = () => page.evaluate(`(() => {
    const live = window.__gl.filter(g => !g.ctx.isContextLost());
    const cards = [...document.querySelectorAll('.shader-item')];
    return {
        created: window.__gl.length, live: live.length,
        liveInPage: live.filter(g => g.canvas.isConnected).length,
        header: live.filter(g => g.canvas.isConnected && g.canvas.closest('header')).length,
        cards: cards.length,
        cardsDark: cards.filter(c => !live.some(g => g.canvas === c.querySelector('canvas'))).map(c => c.querySelector('.shader-name').textContent),
        rafPerFrame: window.__rafPerFrame,
    };
})()`);
const failures = [];
const check = (label, s) => {
    console.log(label.padEnd(22), JSON.stringify(s));
    if (s.cardsDark.length) failures.push(`${label}: cards with no live context: ${s.cardsDark.join(', ')}`);
    if (s.rafPerFrame > s.liveInPage) failures.push(`${label}: ${s.rafPerFrame} loops for ${s.liveInPage} live renderers`);
    if (s.live > s.liveInPage) failures.push(`${label}: ${s.live - s.liveInPage} contexts alive off the page`);
};

check('loaded', await state());
// the whole page: grow the viewport to the document (a beyond-viewport capture leaves WebGL blank)
const fullHeight = await page.evaluate('document.documentElement.scrollHeight');
await page.send('Emulation.setDeviceMetricsOverride', { width, height: fullHeight, deviceScaleFactor: 1, mobile: width < 720 });
await wait(1500);
await page.screenshot(join(outDir, `${file.replace('.html', '')}-${width}.png`));
await page.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 720 });
await wait(500);

for (let i = 0; i < 3; i++) {
    await page.evaluate(`document.querySelector('.shader-item .header-icon').click()`);
    await wait(300);
}
await wait(500);
check('header applied x3', await state());

if (await page.evaluate(`!!document.querySelector('.pagination-controls .next')`)) {
    for (const sel of ['.next', '.next', '.previous', '.previous']) {
        await page.evaluate(`document.querySelector('.pagination-controls ${sel}').click()`);
        await wait(400);
    }
    await wait(500);
    check('paged next x2, prev x2', await state());
}
if (warnings.length) failures.push(`${warnings.length} context warnings: ${warnings[0]}`);
failures.forEach(f => console.log('FAIL', f));
page.close();
process.exit(failures.length ? 1 : 0);
