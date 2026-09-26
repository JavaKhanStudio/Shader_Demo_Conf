// Walk every explainer step twice (Next to the end, Previous to the start, again) and count
// what the pager leaves alive: WebGL contexts not lost, and requestAnimationFrame callbacks
// run per frame (one render loop = 1).
//
//   python3 -m http.server 8765 &   # from the repo root
//   node tools/explainer-context-probe.mjs [page]     # default index.html
// Exits 1 when more than one context or loop is alive at the end.
import { openChrome, wait } from './cdp.mjs';

const url = `http://localhost:8765/${process.argv[2] || 'index.html'}`;
const page = await openChrome();
const warnings = [];
page.onConsole(t => { if (/WebGL|context/i.test(t)) warnings.push(t); });

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
await page.goto(url);

// the header's shaderInjector context is not the pager's: count only canvases inside #presentingShader
const state = () => page.evaluate(`(() => {
    const live = window.__gl.filter(g => !g.ctx.isContextLost());
    return { created: window.__gl.length, live: live.length,
             livePager: live.filter(g => !g.canvas.isConnected || g.canvas.closest('#presentingShader')).length,
             rafPerFrame: window.__rafPerFrame };
})()`);

const before = await state();
const click = sel => page.evaluate(`(() => { const b = document.querySelector('${sel}'); if (b.disabled) return false; b.click(); return true; })()`);
let steps = 0;
for (let pass = 0; pass < 2; pass++) {
    while (await click('#nextButton')) { steps++; await wait(250); }
    while (await click('#previousButton')) { steps++; await wait(250); }
}
await wait(1000);
const after = await state();
// the header shader keeps its own context and loop
const expected = { live: before.live, rafPerFrame: before.rafPerFrame };
console.log('after load ', JSON.stringify(before));
console.log(`after ${steps} steps`, JSON.stringify(after));
const lost = warnings.filter(w => /Too many active/.test(w)).length;
console.log(`context warnings: ${warnings.length} (${lost} 'Too many active WebGL contexts')`);
page.close();
process.exit(after.live <= expected.live && after.rafPerFrame <= expected.rafPerFrame ? 0 : 1);
