#!/usr/bin/env node
/**
 * SEO checks a machine can be certain about, read straight from the repo
 * (static site, no build: the files on main are what GitHub Pages serves).
 *
 *   node tools/seo-check.mjs              check the repo, exit 1 on a finding
 *   node tools/seo-check.mjs --self-test  break a copy three ways, expect three failures
 *
 * - sitemap.xml lists exactly the public pages, under BASE;
 * - every public page has <link rel="canonical"> equal to its sitemap URL;
 * - no public page carries a robots noindex;
 * - every .html at the root is either PUBLIC or PRIVATE below, so a new page
 *   cannot slip in unlisted.
 *
 * There is no robots.txt: the host root javakhanstudio.github.io/ belongs to
 * no repo, so the sitemap is submitted through Search Console instead.
 */

import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BASE = 'https://javakhanstudio.github.io/Shader_Demo_Conf/';

/** file → the URL it is canonical at and listed under in sitemap.xml */
const PUBLIC = {
  'index.html': BASE,
  'galleryExtern.html': BASE + 'galleryExtern.html',
  'galleryAI.html': BASE + 'galleryAI.html',
  'galleryStyle.html': BASE + 'galleryStyle.html',
  'galleryToApply.html': BASE + 'galleryToApply.html',
  'explicationSounds.html': BASE + 'explicationSounds.html',
};
/** root pages deliberately kept out of the sitemap (parts/* are fragments, never listed) */
const PRIVATE = ['shaderBuilder.html'];

const attr = (html, re) => (html.match(re) || [])[1] ?? null;

/** files: { name → text } for every root .html plus 'sitemap.xml'. Returns a list of findings. */
function check(files) {
  const problems = [];
  const sitemap = files['sitemap.xml'];
  if (sitemap == null) return ['sitemap.xml is missing'];
  const urls = [...sitemap.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(m => m[1]);
  const want = Object.values(PUBLIC);

  for (const u of want) if (!urls.includes(u)) problems.push(`sitemap.xml lacks ${u}`);
  for (const u of urls) if (!want.includes(u)) problems.push(`sitemap.xml lists ${u}, which is not a public page`);
  const dup = urls.filter((u, i) => urls.indexOf(u) !== i);
  if (dup.length) problems.push(`sitemap.xml lists twice: ${dup.join(', ')}`);

  for (const name of Object.keys(files)) {
    if (!name.endsWith('.html')) continue;
    if (!(name in PUBLIC) && !PRIVATE.includes(name))
      problems.push(`${name} is neither PUBLIC nor PRIVATE in tools/seo-check.mjs`);
  }

  for (const [name, url] of Object.entries(PUBLIC)) {
    const html = files[name];
    if (html == null) { problems.push(`${name} is in PUBLIC but not in the repo`); continue; }
    const links = [...html.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi)];
    if (links.length !== 1) problems.push(`${name}: ${links.length} canonical links (want 1)`);
    const canonical = links.length ? attr(links[0][0], /href=["']([^"']+)["']/) : null;
    if (links.length && canonical !== url) problems.push(`${name}: canonical ${canonical} ≠ sitemap URL ${url}`);
    for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
      if (/name=["'](robots|googlebot|bingbot)["']/i.test(tag) && /noindex/i.test(tag))
        problems.push(`${name}: ${tag}`);
    }
  }
  return problems;
}

async function loadRepo() {
  const files = {};
  for (const name of await readdir(ROOT)) {
    if (name.endsWith('.html') || name === 'sitemap.xml') files[name] = await readFile(join(ROOT, name), 'utf8');
  }
  return files;
}

const files = await loadRepo();

if (process.argv.includes('--self-test')) {
  const breaks = {
    'page missing from sitemap': f => ({ ...f, 'sitemap.xml': f['sitemap.xml'].replace(/.*galleryAI\.html.*\n/, '') }),
    'noindex on a public page': f => ({ ...f, 'galleryStyle.html': f['galleryStyle.html'].replace('</title>', '</title>\n<meta name="robots" content="noindex">') }),
    'canonical mismatch': f => ({ ...f, 'index.html': f['index.html'].replace(`href="${BASE}"`, `href="${BASE}index.html"`) }),
    'unlisted new page': f => ({ ...f, 'newPage.html': '<html></html>' }),
  };
  let bad = check(files).length ? 1 : 0;
  if (bad) console.log('  ✗ the repo itself fails: run without --self-test');
  for (const [what, brk] of Object.entries(breaks)) {
    const found = check(brk(files));
    console.log(`  ${found.length ? '✓' : '✗'} ${what}: ${found.length ? found.join('; ') : 'NOT caught'}`);
    if (!found.length) bad++;
  }
  process.exit(bad ? 1 : 0);
}

const problems = check(files);
console.log(`\n  SEO — ${Object.keys(PUBLIC).length} public pages under ${BASE}`);
for (const p of problems) console.log(`      ✗ ${p}`);
console.log(problems.length ? `  ✗ ${problems.length} problem(s)\n` : '  ✓ sitemap, canonicals and robots agree\n');
process.exit(problems.length ? 1 : 0);
