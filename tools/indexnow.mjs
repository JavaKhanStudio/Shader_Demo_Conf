#!/usr/bin/env node
/**
 * Tell Bing (and through IndexNow, DuckDuckGo, Ecosia, Qwant, Yandex, Seznam)
 * that every URL in sitemap.xml exists or has changed.
 *
 *   node tools/indexnow.mjs            # POST the sitemap's URLs
 *   node tools/indexnow.mjs --dry-run  # print what would be sent, send nothing
 *
 * Run it after a push to main that adds or renames a page, once GitHub Pages
 * serves the push. It is outward-facing: it checks the live site serves the
 * key first and refuses otherwise, because a ping whose key the engine cannot
 * fetch is answered 403 and counts against the host.
 *
 * The key is not a secret: <KEY>.txt at the repo root holds it. The host root
 * javakhanstudio.github.io/ belongs to no repo, so the key lives under
 * /Shader_Demo_Conf/, and a key under a path only vouches for URLs under that
 * path: the tool refuses any sitemap URL outside it.
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const KEY = '2611b4116d9db33f51e1cd9651635c96';
const HOST = 'javakhanstudio.github.io';
const BASE = `https://${HOST}/Shader_Demo_Conf/`;
const KEY_LOCATION = `${BASE}${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const dryRun = process.argv.includes('--dry-run');

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const localKey = (await readFile(join(ROOT, `${KEY}.txt`), 'utf8').catch(() => '')).trim();
if (localKey !== KEY) {
  console.error(`✗ ${KEY}.txt at the repo root is missing or does not hold the key`);
  process.exit(1);
}

const sitemap = await readFile(join(ROOT, 'sitemap.xml'), 'utf8');
const urlList = [...sitemap.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(m => m[1]);
if (!urlList.length) {
  console.error('✗ sitemap.xml lists no <loc> URLs');
  process.exit(1);
}
const outside = urlList.filter(u => !u.startsWith(BASE));
if (outside.length) {
  console.error(`✗ sitemap.xml has URLs the key under ${BASE} does not cover: ${outside.join(', ')}`);
  process.exit(1);
}

const body = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList };
console.log(`  ${urlList.length} URL(s) from sitemap.xml:`);
for (const u of urlList) console.log(`    ${u}`);

if (dryRun) {
  console.log('\n  --dry-run: nothing sent. Body would be:');
  console.log(JSON.stringify(body, null, 2));
  process.exit(0);
}

const served = await fetch(KEY_LOCATION, { redirect: 'follow' });
const servedText = served.ok ? (await served.text()).trim() : '';
if (servedText !== KEY) {
  console.error(`✗ ${KEY_LOCATION} answered ${served.status}${served.ok ? ' without the key' : ''}.`);
  console.error('  GitHub Pages does not serve the key yet — push main, wait for the Pages build, re-run.');
  process.exit(1);
}
console.log(`\n  ✓ ${KEY_LOCATION} serves the key`);

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});
const text = await res.text();
// 200: accepted. 202: accepted, key validation pending. Anything else refused.
const meaning = { 200: 'accepted', 202: 'accepted, key validation pending', 400: 'bad request',
                  403: 'key not valid for this host', 422: 'URLs do not belong to the host',
                  429: 'too many requests' }[res.status] ?? 'unexpected';
const ok = res.status === 200 || res.status === 202;
console.log(`  ${ok ? '✓' : '✗'} ${ENDPOINT} → ${res.status} (${meaning})${text ? `\n    ${text}` : ''}`);
process.exit(ok ? 0 : 1);
