#!/usr/bin/env node
/**
 * Post-build script: moves Astro output into /v1/ subdirectory.
 *
 * Astro's `base: '/v1'` prefixes all URLs/links with /v1/ but
 * doesn't change the output directory structure. This script
 * moves the built files into dist/v1/ so the directory structure
 * matches the URL structure.
 *
 * Files in public/ that should stay at the root (index.html,
 * _redirects, v2/) are preserved at the root level.
 */

const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
const V1_DIR = path.join(DIST, 'v1');
const TEMP = path.join(__dirname, '..', 'dist-temp');

// Files/dirs that should stay at the root (not moved into /v1/)
// root-landing.html is renamed to index.html at the root
// Files / directories that stay at the root, not moved into /v1/.
// 'schema' is here because the JSON Schema's own $id is the unversioned
// URL https://archstandard.org/schema/v1.0.0/ads.schema.json — the schema
// file is independently versioned from the site, and tooling resolves
// the $id directly.
const ROOT_KEEP = ['_redirects', 'v2', 'robots.txt', 'og-image.png', 'og-image.svg', 'favicon.svg', 'schema'];

console.log('Post-build: Moving Astro output into /v1/ subdirectory...');

// 1. Save root items to temp
if (!fs.existsSync(TEMP)) fs.mkdirSync(TEMP, { recursive: true });

// Save the root landing page (public/root-landing.html -> dist/root-landing.html)
const landingSrc = path.join(DIST, 'root-landing.html');
const landingDest = path.join(TEMP, 'index.html');
if (fs.existsSync(landingSrc)) {
  fs.renameSync(landingSrc, landingDest);
}

for (const item of ROOT_KEEP) {
  const src = path.join(DIST, item);
  const dest = path.join(TEMP, item);
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
  }
}

// 2. Move everything remaining in dist/ into dist/v1/
if (!fs.existsSync(V1_DIR)) fs.mkdirSync(V1_DIR, { recursive: true });
for (const item of fs.readdirSync(DIST)) {
  if (item === 'v1') continue;
  fs.renameSync(path.join(DIST, item), path.join(V1_DIR, item));
}

// 3. Restore root items from temp
for (const item of fs.readdirSync(TEMP)) {
  fs.renameSync(path.join(TEMP, item), path.join(DIST, item));
}

// 4. Clean up temp
fs.rmSync(TEMP, { recursive: true, force: true });

console.log('Post-build: Done. Output structure:');
for (const item of fs.readdirSync(DIST).sort()) {
  const stat = fs.statSync(path.join(DIST, item));
  console.log(`  ${stat.isDirectory() ? '[dir]' : '[file]'} ${item}`);
}
