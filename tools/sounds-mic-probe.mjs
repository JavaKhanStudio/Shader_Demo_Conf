// Probe the sounds page's mic toggle in headless Chrome.
// Checks that "Enable Audio Analysis" is visible, clicks it with Chrome's fake mic
// (a periodic beep) granted, then reads window.AudioAnalysisData and screenshots.
// Then toggles off / on / off and checks every mic track ended and every AudioContext closed,
// and reloads with the mic DENIED: the box must uncheck and micIsOn stay false.
//
//   python3 -m http.server 8765 &   # from the repo root
//   node tools/sounds-mic-probe.mjs [width] [outDir]
// Exits 1 when the toggle is not visible or a check fails.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openChrome, wait } from './cdp.mjs';

const width = parseInt(process.argv[2] || '1280');
const outDir = process.argv[3] || 'tools/out';
const url = process.env.PAGE_URL || 'http://localhost:8765/explicationSounds.html';
mkdirSync(outDir, { recursive: true });

const page = await openChrome({
    width,
    flags: ['--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'],
});
const shot = name => page.screenshot(join(outDir, name));
const setMic = setting => page.send('Browser.setPermission', { permission: { name: 'microphone' }, setting, origin: new URL(url).origin });

// record every mic stream and AudioContext the page opens
await page.beforeLoad(`
    window.__streams = []; window.__contexts = [];
    const gum = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = c => gum(c).then(s => (window.__streams.push(s), s));
    const AC = window.AudioContext;
    window.AudioContext = class extends AC { constructor(...a) { super(...a); window.__contexts.push(this); } };
`);
const audioState = () => page.evaluate(`({
    tracksLive: window.__streams.flatMap(s => s.getTracks()).filter(t => t.readyState === 'live').length,
    tracks: window.__streams.flatMap(s => s.getTracks()).length,
    contextsOpen: window.__contexts.filter(c => c.state !== 'closed').length,
    contexts: window.__contexts.length,
    checked: document.querySelector('#analyzeToggle').checked,
    micIsOn: window.AudioAnalysisData.micIsOn,
})`);
const click = () => page.evaluate(`document.querySelector('#analyzeToggle').click()`);
const failures = [];
const expect = (what, ok) => { console.log(ok ? 'ok  ' : 'FAIL', what); if (!ok) failures.push(what); };

// the toggle arrives after three.js and the first shader: poll for it rather than trust a fixed wait
const load = async () => {
    await page.goto(url, 1000);
    for (let i = 0; i < 40 && !await page.evaluate(`!!document.querySelector('#analyzeToggle')`); i++) await wait(250);
};

await setMic('granted');
await load();

const box = await page.evaluate(`(() => {
    const cb = document.querySelector('#analyzeToggle');
    if (!cb) return null;
    const r = cb.getBoundingClientRect(), l = document.querySelector('label[for=analyzeToggle]').getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, labelW: l.width, docW: document.documentElement.clientWidth };
})()`);
console.log('toggle box', JSON.stringify(box));
const visible = box && box.w > 0 && box.h > 0;
expect('toggle visible', visible);
if (visible) await page.evaluate(`document.querySelector('.interactionSection').scrollIntoView({block: 'center'})`);
await shot(`sounds-${width}-off.png`);

if (visible) {
    const sample = async () => JSON.stringify(await page.evaluate(`(() => { const d = window.AudioAnalysisData; return { ...d, amplitude: +d.amplitude.toFixed(4), bands: d.bandAmplitudes.map(b => +b.toFixed(1)) , bandAmplitudes: undefined }; })()`));
    console.log('before click', await sample());
    await click();
    let peak = 0;
    for (let i = 0; i < 40; i++) {
        await wait(100);
        const a = await page.evaluate('window.AudioAnalysisData.amplitude');
        if (a > peak) { peak = a; await shot(`sounds-${width}-on.png`); }
    }
    console.log('after click ', await sample(), 'peak amplitude over 4 s', peak.toFixed(4));
    if (!peak) await shot(`sounds-${width}-on.png`);
    expect('mic on: amplitude moved', peak > 0);

    // off / on / off
    for (const [i, want] of [[1, false], [2, true], [3, false]]) {
        await click();
        await wait(800);
        const s = await audioState();
        console.log(`toggle ${i} ->`, want ? 'on ' : 'off', JSON.stringify(s));
        if (want) expect(`toggle ${i} on: one live track, one open context`, s.tracksLive === 1 && s.contextsOpen === 1 && s.micIsOn);
        else expect(`toggle ${i} off: no live track, no open context`, s.tracksLive === 0 && s.contextsOpen === 0 && !s.micIsOn);
    }

    // denied
    await setMic('denied');
    await load();
    await click();
    await wait(1000);
    const d = await audioState();
    console.log('denied ->', JSON.stringify(d));
    await page.evaluate(`document.querySelector('.interactionSection').scrollIntoView({block: 'center'})`);
    await shot(`sounds-${width}-denied.png`);
    expect('denied: box unchecked, micIsOn false, nothing open', !d.checked && !d.micIsOn && d.tracksLive === 0 && d.contextsOpen === 0);
}
page.close();
process.exit(failures.length ? 1 : 0);
