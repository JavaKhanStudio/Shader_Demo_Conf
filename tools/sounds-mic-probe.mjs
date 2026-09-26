// Probe the sounds page's mic toggle in headless Chrome, over the DevTools protocol.
// Checks that "Enable Audio Analysis" is visible, clicks it with Chrome's fake mic
// (a periodic beep) granted, then reads window.AudioAnalysisData and screenshots.
//
//   python3 -m http.server 8765 &   # from the repo root
//   node tools/sounds-mic-probe.mjs [width] [outDir]
// Exits 1 when the toggle is not visible.
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const width = parseInt(process.argv[2] || '1280');
const outDir = process.argv[3] || 'tools/out';
const url = process.env.PAGE_URL || 'http://localhost:8765/explicationSounds.html';
const port = 9300 + Math.floor(Math.random() * 500);
mkdirSync(outDir, { recursive: true });

const chrome = spawn(process.env.CHROME || 'google-chrome', [
    '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'mic-'))}`,
    '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars', '--mute-audio',
    '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream',
    '--autoplay-policy=no-user-gesture-required', 'about:blank',
], { stdio: 'ignore' });

const wait = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
    await wait(200);
    try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); } catch { }
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0; const pending = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.result.value;
const shot = async name => {
    const { result } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    writeFileSync(join(outDir, name), Buffer.from(result.data, 'base64'));
};

await send('Emulation.setDeviceMetricsOverride', { width, height: 1100, deviceScaleFactor: 1, mobile: width < 720 });
await send('Page.enable');
await send('Page.navigate', { url });
await wait(4000);

const box = await evaluate(`(() => {
    const cb = document.querySelector('#analyzeToggle');
    if (!cb) return null;
    const r = cb.getBoundingClientRect(), l = document.querySelector('label[for=analyzeToggle]').getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, labelW: l.width, docW: document.documentElement.clientWidth };
})()`);
console.log('toggle box', JSON.stringify(box));
const visible = box && box.w > 0 && box.h > 0;
if (visible) await evaluate(`document.querySelector('.interactionSection').scrollIntoView({block: 'center'})`);
await shot(`sounds-${width}-off.png`);

if (visible) {
    const sample = async () => JSON.stringify(await evaluate(`(() => { const d = window.AudioAnalysisData; return { ...d, amplitude: +d.amplitude.toFixed(4), bands: d.bandAmplitudes.map(b => +b.toFixed(1)) , bandAmplitudes: undefined }; })()`));
    console.log('before click', await sample());
    await evaluate(`document.querySelector('#analyzeToggle').click()`);
    let peak = 0;
    for (let i = 0; i < 40; i++) {
        await wait(100);
        const a = await evaluate('window.AudioAnalysisData.amplitude');
        if (a > peak) { peak = a; await shot(`sounds-${width}-on.png`); }
    }
    console.log('after click ', await sample(), 'peak amplitude over 4 s', peak.toFixed(4));
    if (!peak) await shot(`sounds-${width}-on.png`);
}
chrome.kill();
process.exit(visible ? 0 : 1);
