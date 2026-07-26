#!/usr/bin/env node
/**
 * ADS Accessibility Validator — WCAG 2.1 AA
 *
 * Two stages:
 *   1. MDX source checks — run before build, catch issues at authoring time
 *      - Images missing alt text (WCAG 1.1.1)
 *      - Skipped heading levels (WCAG 1.3.1)
 *      - Generic link text — "click here", "here", etc. (WCAG 2.4.4)
 *
 *   2. Built HTML checks — run after build, catch issues in rendered output
 *      - lang attribute on <html> (WCAG 3.1.1)
 *      - Non-empty <title> (WCAG 2.4.2)
 *      - <img> missing alt (WCAG 1.1.1)
 *      - Duplicate IDs (WCAG 4.1.1)
 *      - Tables without <th> headers (WCAG 1.3.1)
 *      - Links with no accessible text (WCAG 2.4.4)
 *
 * Colour contrast (WCAG 1.4.3) requires a live browser. Run manually with:
 *   npx pa11y --standard WCAG2AA https://archstandard.org
 *
 * Exits 1 on errors; warnings are surfaced but do not fail the build.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC  = path.join(ROOT, 'src', 'content', 'docs');
const DIST = path.join(ROOT, 'dist');

let errors   = 0;
let warnings = 0;

function err(file, msg)  { console.error(`  ✗  ${file}: ${msg}`); errors++; }
function warn(file, msg) { console.warn(`  ⚠  ${file}: ${msg}`); warnings++; }
function pass(msg)       { console.log(`  ✓  ${msg}`); }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAllMdxFiles(dir, skipDirs = new Set()) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir)) {
    if (skipDirs.has(entry)) continue;
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      results.push(...getAllMdxFiles(full, skipDirs));
    } else if (entry.endsWith('.mdx') || entry.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Stage 1: MDX source checks
// ---------------------------------------------------------------------------

const HTML_IMG_RE     = /<img(?:\s[^>]*)?\/?>/gi;
const GENERIC_LINK_RE = /\[\s*(click here|here|read more|more|link|this|see here|view here)\s*\]\(/i;

function checkMdxFile(filePath) {
  const rel   = path.relative(ROOT, filePath);
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');

  // Per-line checks
  lines.forEach((line, i) => {
    const n = i + 1;

    // <img> in MDX without alt attribute
    for (const tag of (line.match(HTML_IMG_RE) || [])) {
      if (!/\balt[\s=\/>]/i.test(tag)) {
        err(rel, `Line ${n}: <img> missing alt attribute — WCAG 1.1.1`);
      }
    }

    // Markdown image with empty alt — may be intentionally decorative, warn
    if (/!\[\]\([^)]+\)/.test(line)) {
      warn(rel, `Line ${n}: Image has empty alt text — confirm decorative or add description — WCAG 1.1.1`);
    }

    // Generic link text
    if (GENERIC_LINK_RE.test(line)) {
      warn(rel, `Line ${n}: Generic link text detected — use descriptive text — WCAG 2.4.4`);
    }
  });

  // Heading hierarchy — skip frontmatter block
  let fmEnd = 0;
  if (lines[0]?.trim() === '---') {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') { fmEnd = i + 1; break; }
    }
  }

  const headings = [];
  lines.slice(fmEnd).forEach((line, i) => {
    const m = line.match(/^(#{1,6})\s/);
    if (m) headings.push({ level: m[1].length, lineNum: fmEnd + i + 1 });
  });

  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1];
    const curr = headings[i];
    if (curr.level > prev.level + 1) {
      err(rel, `Line ${curr.lineNum}: Heading jumps h${prev.level}→h${curr.level} (skipped level) — WCAG 1.3.1`);
    }
  }
}

function runMdxChecks() {
  console.log('=== 1. MDX Source Checks ===\n');

  // English content only — FR/DE removed
  const files = getAllMdxFiles(SRC, new Set(['fr', 'de']));
  for (const f of files) checkMdxFile(f);
  pass(`${files.length} MDX files checked`);
}

// ---------------------------------------------------------------------------
// Stage 2: Built HTML checks (representative sample)
// ---------------------------------------------------------------------------

// Tests a cross-section of pages: orientation, each standard section, examples, guidance
const HTML_SAMPLES = [
  'index.html',
  'standard/overview/index.html',
  'standard/quickstart/index.html',
  'standard/adoption-guide/index.html',
  'standard/0-document-control/index.html',
  'standard/1-executive-summary/index.html',
  'standard/2-stakeholders/index.html',
  'standard/3-views-overview/index.html',
  'standard/3-1-logical-view/index.html',
  'standard/3-2-integration-view/index.html',
  'standard/3-3-physical-view/index.html',
  'standard/3-4-data-view/index.html',
  'standard/3-5-security-view/index.html',
  'standard/3-6-scenarios/index.html',
  'standard/4-quality-attributes-overview/index.html',
  'standard/4-1-operational-excellence/index.html',
  'standard/4-3-performance/index.html',
  'standard/4-5-sustainability/index.html',
  'standard/5-lifecycle/index.html',
  'standard/6-decision-making/index.html',
  'standard/7-appendices/index.html',
  'standard/glossary/index.html',
  'standard/faq/index.html',
  'standard/downloads/index.html',
  'standard/schema/index.html',
  'standard/version-history/index.html',
  'examples/index.html',
  'examples/employee-directory/index.html',
  'examples/cloud-migration/index.html',
  'examples/medwick-healthcare/index.html',
  'guidance/review-checklist/index.html',
  'guidance/what-good-looks-like/index.html',
  'guidance/anti-patterns/index.html',
];

function checkHtmlFile(filePath) {
  const rel  = path.relative(ROOT, filePath);
  const html = fs.readFileSync(filePath, 'utf-8');

  // Lang attribute — WCAG 3.1.1
  if (!/<html[^>]+lang=["'][a-z]/.test(html)) {
    err(rel, 'Missing or empty lang attribute on <html> — WCAG 3.1.1');
  }

  // Non-empty <title> — WCAG 2.4.2
  const titleM = html.match(/<title>([^<]*)<\/title>/i);
  if (!titleM || !titleM[1].trim()) {
    err(rel, 'Missing or empty <title> — WCAG 2.4.2');
  }

  // <img> without alt — WCAG 1.1.1
  for (const tag of (html.match(/<img(?:\s[^>]*)?\/?>/gi) || [])) {
    if (!/\balt[\s=\/>]/i.test(tag)) {
      err(rel, `<img> missing alt attribute — WCAG 1.1.1: ${tag.substring(0, 80)}`);
    }
  }

  // Duplicate IDs — WCAG 4.1.1
  const allIds  = [...html.matchAll(/\bid="([^"]+)"/gi)].map(m => m[1]);
  const seen    = new Set();
  const dupes   = new Set();
  for (const id of allIds) { if (seen.has(id)) dupes.add(id); seen.add(id); }
  if (dupes.size > 0) {
    warn(rel, `Duplicate IDs: ${[...dupes].slice(0, 5).join(', ')} — WCAG 4.1.1`);
  }

  // Tables without <th> — WCAG 1.3.1
  let tableIndex = 0;
  for (const table of (html.match(/<table[\s\S]*?<\/table>/gi) || [])) {
    tableIndex++;
    if (!/<th[\s>]/i.test(table)) {
      warn(rel, `Table ${tableIndex} has no <th> header cells — WCAG 1.3.1`);
    }
  }

  // Links with no accessible text — WCAG 2.4.4
  for (const link of (html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) || [])) {
    if (/aria-label\s*=/i.test(link))       continue;
    if (/aria-labelledby\s*=/i.test(link))  continue;
    const text = link.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (!text) warn(rel, 'Link with no accessible text or aria-label — WCAG 2.4.4');
  }
}

function runHtmlChecks() {
  console.log('\n=== 2. Built HTML Checks ===\n');

  const v1 = path.join(DIST, 'v1');
  if (!fs.existsSync(v1)) {
    console.log('  ℹ  dist/v1/ not found — HTML checks skipped (run npm run build first)\n');
    return;
  }

  let checked = 0;
  for (const sample of HTML_SAMPLES) {
    const full = path.join(v1, sample);
    if (fs.existsSync(full)) { checkHtmlFile(full); checked++; }
  }

  pass(`${checked} HTML pages checked (representative sample of ${HTML_SAMPLES.length} targets)`);
  console.log('\n  ℹ  Colour contrast (WCAG 1.4.3) requires a live browser-based tool.');
  console.log('     Run: npx pa11y --standard WCAG2AA https://archstandard.org\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log('\nADS Accessibility Validator — WCAG 2.1 AA\n');

runMdxChecks();
runHtmlChecks();

console.log('\n=== Summary ===\n');
console.log(`  Errors:   ${errors}`);
console.log(`  Warnings: ${warnings}`);

if (errors > 0) {
  console.log('  Result:   ✗ FAIL\n');
  process.exit(1);
} else {
  console.log('  Result:   ✓ PASS\n');
}
