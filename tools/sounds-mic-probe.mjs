// Probe the sounds page's mic toggle in headless Chrome.
// Checks that "Enable Audio Analysis" is visible, clicks it with Chrome's fake mic
// (a periodic beep) granted, then reads window.AudioAnalysisData and screenshots.
//
//   python3 -m http.server 8765 &   # from the repo root
//   node tools/sounds-mic-probe.mjs [width] [outDir]
// Exits 1 when the toggle is not visible.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openChrome, wait } from './cdp.mjs';

const width = parseInt(process.argv[2] || '1280');
const outDir = process.argv[3] || 'tools/out';
const url = process.env.PAGE_URL || 'http://localhost:8765/explicationSounds.html';
mkdirSync(outDir, { recursive: true });

const page = await openChrome({
    width,
    flags: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'],
});
const shot = name => page.screenshot(join(outDir, name));
await page.goto(url);

const box = await page.evaluate(`(() => {
    const cb = document.querySelector('#analyzeToggle');
    if (!cb) return null;
    const r = cb.getBoundingClientRect(), l = document.querySelector('label[for=analyzeToggle]').getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, labelW: l.width, docW: document.documentElement.clientWidth };
})()`);
console.log('toggle box', JSON.stringify(box));
const visible = box && box.w > 0 && box.h > 0;
if (visible) await page.evaluate(`document.querySelector('.interactionSection').scrollIntoView({block: 'center'})`);
await shot(`sounds-${width}-off.png`);

if (visible) {
    const sample = async () => JSON.stringify(await page.evaluate(`(() => { const d = window.AudioAnalysisData; return { ...d, amplitude: +d.amplitude.toFixed(4), bands: d.bandAmplitudes.map(b => +b.toFixed(1)) , bandAmplitudes: undefined }; })()`));
    console.log('before click', await sample());
    await page.evaluate(`document.querySelector('#analyzeToggle').click()`);
    let peak = 0;
    for (let i = 0; i < 40; i++) {
        await wait(100);
        const a = await page.evaluate('window.AudioAnalysisData.amplitude');
        if (a > peak) { peak = a; await shot(`sounds-${width}-on.png`); }
    }
    console.log('after click ', await sample(), 'peak amplitude over 4 s', peak.toFixed(4));
    if (!peak) await shot(`sounds-${width}-on.png`);
}
page.close();
process.exit(visible ? 0 : 1);
