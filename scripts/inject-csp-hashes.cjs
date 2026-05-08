#!/usr/bin/env node
/**
 * Replace 'unsafe-inline' in dist/_headers' CSP with sha256 hashes.
 *
 * Walks every HTML file in dist/, extracts every inline <script> and <style>,
 * computes SHA-256 hashes of their bodies, and rewrites the CSP in
 * dist/_headers so the hashes appear in script-src and style-src in place
 * of 'unsafe-inline'.
 *
 * Run after `npm run build` (wired into package.json's build script).
 *
 * Why we do this:
 * - Mozilla Observatory penalises 'unsafe-inline' in CSP. Hash-based CSP
 *   passes the same test while still allowing exactly the inline content
 *   Astro/Starlight ship.
 * - Hashes regenerate on every build, so an Astro/Starlight upgrade that
 *   changes an inline script body is reflected automatically.
 *
 * Caveat: browsers ignore 'unsafe-inline' when hashes are also present
 * (CSP3), but Observatory checks the header text. We strip 'unsafe-inline'
 * rather than leaving it as a fallback, so the static check passes too.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DIST = path.join(__dirname, '..', 'dist');
const HEADERS_FILE = path.join(DIST, '_headers');

const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
const INLINE_STYLE = /<style(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/style>/g;

function sha256Base64(content) {
  return crypto.createHash('sha256').update(content, 'utf-8').digest('base64');
}

function walk(dir, suffix, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(fp, suffix, out);
    else if (ent.name.endsWith(suffix)) out.push(fp);
  }
  return out;
}

function collectHashes() {
  const scripts = new Set();
  const styles = new Set();
  for (const f of walk(DIST, '.html')) {
    const text = fs.readFileSync(f, 'utf-8');
    INLINE_SCRIPT.lastIndex = 0;
    let m;
    while ((m = INLINE_SCRIPT.exec(text)) !== null) {
      scripts.add(sha256Base64(m[1]));
    }
    INLINE_STYLE.lastIndex = 0;
    while ((m = INLINE_STYLE.exec(text)) !== null) {
      styles.add(sha256Base64(m[1]));
    }
  }
  return { scripts, styles };
}

function rewriteDirective(csp, directive, hashes) {
  // Match the directive's value, up to the next semicolon.
  const re = new RegExp(`(${directive}\\s+)([^;]*)`);
  return csp.replace(re, (_, prefix, body) => {
    // Drop 'unsafe-inline'. Browsers ignore it when hashes are present,
    // but Observatory's static check penalises its presence.
    body = body.replace(/\s*'unsafe-inline'\s*/g, ' ').replace(/\s+/g, ' ').trim();
    const hashList = [...hashes].sort().map((h) => `'sha256-${h}'`).join(' ');
    return prefix + body + ' ' + hashList;
  });
}

function main() {
  if (!fs.existsSync(HEADERS_FILE)) {
    console.error(`${HEADERS_FILE} not found; run 'npm run build' first`);
    process.exit(1);
  }

  let text = fs.readFileSync(HEADERS_FILE, 'utf-8');
  const cspLine = /^(\s*Content-Security-Policy:\s*)(.*)$/m;
  const m = cspLine.exec(text);
  if (!m) {
    console.log('No Content-Security-Policy header found in _headers; nothing to do');
    return;
  }

  const { scripts, styles } = collectHashes();
  console.log(
    `Found ${scripts.size} distinct inline scripts, ${styles.size} distinct inline styles`
  );

  let csp = m[2];
  csp = rewriteDirective(csp, 'script-src', scripts);
  csp = rewriteDirective(csp, 'style-src', styles);

  text = text.replace(cspLine, (_, prefix) => prefix + csp);
  fs.writeFileSync(HEADERS_FILE, text, { encoding: 'utf-8' });
  console.log(`Updated ${HEADERS_FILE}`);
}

main();
