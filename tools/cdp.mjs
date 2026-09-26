// Minimal headless-Chrome driver over the DevTools protocol (no puppeteer: the repo has no package.json).
//   const page = await openChrome({ width, flags });  await page.goto(url);  page.evaluate(expr) ...
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const wait = ms => new Promise(r => setTimeout(r, ms));

export async function openChrome({ width = 1280, height = 1100, flags = [] } = {}) {
    const port = 9300 + Math.floor(Math.random() * 500);
    const chrome = spawn(process.env.CHROME || 'google-chrome', [
        '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'cdp-'))}`,
        '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars', '--mute-audio',
        ...flags, 'about:blank',
    ], { stdio: 'ignore' });

    let target;
    // a cold Chrome, or several probes at once, can take more than 10 s to open its port
    for (let i = 0; i < 100 && !target; i++) {
        await wait(200);
        try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); } catch { }
    }
    if (!target) { chrome.kill(); throw new Error(`Chrome did not open its DevTools port ${port} in 20 s`); }
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);
    let id = 0;
    const pending = new Map(), listeners = [];
    ws.onmessage = e => {
        const m = JSON.parse(e.data);
        if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
        else if (m.method) listeners.forEach(l => l(m));
    };
    const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 720 });
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Log.enable');

    return {
        send,
        on: listener => listeners.push(listener),
        // every console line and browser warning, as text
        onConsole: fn => listeners.push(m => {
            if (m.method === 'Runtime.consoleAPICalled') fn(m.params.args.map(a => a.value ?? a.description ?? '').join(' '));
            if (m.method === 'Log.entryAdded') fn(m.params.entry.text);
        }),
        goto: async (url, settle = 4000) => { await send('Page.navigate', { url }); await wait(settle); },
        beforeLoad: source => send('Page.addScriptToEvaluateOnNewDocument', { source }),
        evaluate: async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.result.value,
        screenshot: async file => writeFileSync(file, Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).result.data, 'base64')),
        close: () => chrome.kill(),
    };
}
