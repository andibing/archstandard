#!/usr/bin/env node
/**
 * ADS Validation Script
 *
 * Checks the entire project for consistency, broken references,
 * missing files, and schema validity. Run before every deploy.
 *
 * Usage: node scripts/validate.cjs
 */

const fs = require('fs');
const path = require('path');

let errors = 0;
let warnings = 0;

function error(msg) { console.log('  ❌ ERROR: ' + msg); errors++; }
function warn(msg) { console.log('  ⚠  WARN:  ' + msg); warnings++; }
function pass(msg) { console.log('  ✓  ' + msg); }

// ─────────────────────────────────────────────
console.log('\n=== 1. File Existence ===\n');

const requiredFiles = [
  'schema/ads.schema.json',
  'public/templates/sad-template.md',
  'public/templates/sad-template.yaml',
  'public/templates/sad-template.json',
  'public/templates/sad-template.docx',
  'public/favicon.svg',
  'public/robots.txt',
  'public/scripts/reading-prefs.js',
  'src/assets/ads-logo.svg',
  'src/assets/section-map.svg',
  'src/content/docs/index.mdx',
  'src/content/docs/standard/overview.mdx',
  'src/content/docs/standard/quickstart.mdx',
  'src/content/docs/standard/cheat-sheet.mdx',
  'src/content/docs/standard/how-to-use.mdx',
  'src/content/docs/standard/design-principles.mdx',
  'src/content/docs/standard/framework-alignment.mdx',
  'src/content/docs/standard/why-ads.mdx',
  'src/content/docs/standard/0-document-control.mdx',
  'src/content/docs/standard/1-executive-summary.mdx',
  'src/content/docs/standard/2-stakeholders.mdx',
  'src/content/docs/standard/3-views-overview.mdx',
  'src/content/docs/standard/3-1-logical-view.mdx',
  'src/content/docs/standard/3-2-process-view.mdx',
  'src/content/docs/standard/3-3-physical-view.mdx',
  'src/content/docs/standard/3-4-data-view.mdx',
  'src/content/docs/standard/3-5-security-view.mdx',
  'src/content/docs/standard/3-6-scenarios.mdx',
  'src/content/docs/standard/4-quality-attributes-overview.mdx',
  'src/content/docs/standard/4-1-operational-excellence.mdx',
  'src/content/docs/standard/4-2-reliability.mdx',
  'src/content/docs/standard/4-3-performance.mdx',
  'src/content/docs/standard/4-4-cost-optimisation.mdx',
  'src/content/docs/standard/4-5-sustainability.mdx',
  'src/content/docs/standard/5-lifecycle.mdx',
  'src/content/docs/standard/6-decision-making.mdx',
  'src/content/docs/standard/7-appendices.mdx',
  'src/content/docs/standard/schema.mdx',
  'src/content/docs/standard/templates.mdx',
  'src/content/docs/standard/downloads.mdx',
  'src/content/docs/standard/version-history.mdx',
  'src/content/docs/examples/index.mdx',
  'src/content/docs/examples/employee-directory.mdx',
  'src/content/docs/examples/customer-api-platform.mdx',
  'src/content/docs/examples/cloud-migration.mdx',
  'src/content/docs/examples/archstandard-org.mdx',
  'LICENSE',
  'README.md',
];

for (const f of requiredFiles) {
  if (fs.existsSync(f)) {
    pass(f);
  } else {
    error('Missing: ' + f);
  }
}

// ─────────────────────────────────────────────
console.log('\n=== 2. Translation Parity ===\n');

const enDir = 'src/content/docs/standard';
const frDir = 'src/content/docs/fr/standard';
const deDir = 'src/content/docs/de/standard';

const enFiles = fs.readdirSync(enDir).filter(f => f.endsWith('.mdx')).sort();
const frFiles = fs.existsSync(frDir) ? fs.readdirSync(frDir).filter(f => f.endsWith('.mdx')).sort() : [];
const deFiles = fs.existsSync(deDir) ? fs.readdirSync(deDir).filter(f => f.endsWith('.mdx')).sort() : [];

pass(`English: ${enFiles.length} pages`);
pass(`French:  ${frFiles.length} pages`);
pass(`German:  ${deFiles.length} pages`);

for (const f of enFiles) {
  if (!frFiles.includes(f)) warn(`French missing: ${f}`);
  if (!deFiles.includes(f)) warn(`German missing: ${f}`);
}

// ─────────────────────────────────────────────
console.log('\n=== 3. JSON Schema Validity ===\n');

try {
  const schema = JSON.parse(fs.readFileSync('schema/ads.schema.json', 'utf-8'));
  pass('Schema is valid JSON');

  if (schema.$schema) pass('Has $schema reference');
  else warn('Missing $schema');

  if (schema.$defs) pass(`Has ${Object.keys(schema.$defs).length} definitions`);
  else error('Missing $defs');

  // Check x-ads-section metadata exists
  let xAdsCount = 0;
  const checkXAds = (obj) => {
    if (obj && typeof obj === 'object') {
      if (obj['x-ads-section']) xAdsCount++;
      for (const v of Object.values(obj)) checkXAds(v);
    }
  };
  checkXAds(schema);
  if (xAdsCount > 0) pass(`Found ${xAdsCount} x-ads-section annotations`);
  else warn('No x-ads-section annotations found');
} catch (e) {
  error('Schema parse error: ' + e.message);
}

// ─────────────────────────────────────────────
console.log('\n=== 4. JSON Template Validity ===\n');

try {
  const tmpl = JSON.parse(fs.readFileSync('public/templates/sad-template.json', 'utf-8'));
  pass('JSON template is valid');

  const requiredKeys = ['schemaVersion', 'documentControl', 'executiveSummary', 'architecturalViews', 'riskGovernance'];
  for (const k of requiredKeys) {
    if (tmpl[k] !== undefined) pass(`Has required key: ${k}`);
    else error(`Missing required key: ${k}`);
  }

  const optionalKeys = ['stakeholders', 'qualityAttributes', 'lifecycleManagement', 'appendices', 'complianceScoring'];
  for (const k of optionalKeys) {
    if (tmpl[k] !== undefined) pass(`Has optional key: ${k}`);
    else warn(`Missing optional key: ${k}`);
  }
} catch (e) {
  error('JSON template parse error: ' + e.message);
}

// ─────────────────────────────────────────────
console.log('\n=== 5. YAML Template Validity ===\n');

try {
  const yaml = fs.readFileSync('public/templates/sad-template.yaml', 'utf-8');
  if (yaml.includes('schemaVersion:')) pass('YAML has schemaVersion');
  else error('YAML missing schemaVersion');

  if (yaml.includes('documentControl:')) pass('YAML has documentControl');
  else error('YAML missing documentControl');

  if (yaml.includes('qualityAttributes:')) pass('YAML has qualityAttributes (not pillars)');
  else if (yaml.includes('qualityPillars:')) error('YAML still uses qualityPillars');
  else warn('YAML missing qualityAttributes');

  if (yaml.includes('riskGovernance:') || yaml.includes('decisionMaking:')) pass('YAML has governance section');
  else warn('YAML missing governance section');
} catch (e) {
  error('YAML read error: ' + e.message);
}

// ─────────────────────────────────────────────
console.log('\n=== 6. Terminology Consistency ===\n');

const allMdx = [];
function collectMdx(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, f.name);
    if (f.isDirectory()) collectMdx(fp);
    else if (f.name.endsWith('.mdx')) allMdx.push(fp);
  }
}
collectMdx('src/content/docs/standard');

// Check for deprecated terms
const deprecatedTerms = [
  { pattern: /ADS-001/g, msg: 'ADS-001 (should be ADS)' },
  { pattern: /Risk & Governance/g, msg: 'Risk & Governance (should be Decision Making & Governance)' },
  { pattern: /\bCARDI\b/g, msg: 'CARDI (should be RAID or removed)' },
  { pattern: /qualityPillar/g, msg: 'qualityPillar (should be qualityAttribute)' },
  { pattern: /quality-pillar-ref/g, msg: 'quality-pillar-ref CSS class (should be quality-attribute-ref)' },
  { pattern: /The Six Views/gi, msg: '"The Six Views" (should be "The Views")' },
  { pattern: /Five Quality/gi, msg: '"Five Quality" (should not hardcode count)' },
];

for (const fp of allMdx) {
  const content = fs.readFileSync(fp, 'utf-8');
  const rel = path.relative('.', fp);
  for (const { pattern, msg } of deprecatedTerms) {
    const matches = content.match(pattern);
    if (matches) {
      error(`${rel}: Found deprecated term "${msg}" (${matches.length} occurrences)`);
    }
  }
}

if (errors === 0) pass('No deprecated terms found in English standard pages');

// ─────────────────────────────────────────────
console.log('\n=== 7. Corporate References Check ===\n');

const corporateTerms = [
  /\bAviva\b/gi, /\bLSEG\b/gi, /\bRefinitiv\b/gi,
  /\bWipro\b/gi, /\bTCS\b/gi, /\bDiligenta\b/gi,
  /\bATOS\b/g, /avivaworld/gi, /novonet/gi
];

let corpFound = false;
for (const fp of allMdx) {
  const content = fs.readFileSync(fp, 'utf-8');
  const rel = path.relative('.', fp);
  for (const pattern of corporateTerms) {
    if (pattern.test(content)) {
      error(`${rel}: Found corporate reference matching ${pattern}`);
      corpFound = true;
    }
  }
}
if (!corpFound) pass('No corporate references found');

// ─────────────────────────────────────────────
console.log('\n=== 8. Scoring Guidance ===\n');

const scoredSections = [
  '1-executive-summary.mdx', '3-1-logical-view.mdx', '3-2-process-view.mdx',
  '3-3-physical-view.mdx', '3-4-data-view.mdx', '3-5-security-view.mdx',
  '3-6-scenarios.mdx', '4-1-operational-excellence.mdx', '4-2-reliability.mdx',
  '4-3-performance.mdx', '4-4-cost-optimisation.mdx', '4-5-sustainability.mdx',
  '5-lifecycle.mdx', '6-decision-making.mdx'
];

for (const f of scoredSections) {
  const fp = path.join('src/content/docs/standard', f);
  if (fs.existsSync(fp)) {
    const content = fs.readFileSync(fp, 'utf-8');
    if (content.includes('Scoring Guidance')) pass(`${f}: has scoring guidance`);
    else warn(`${f}: missing scoring guidance`);
  }
}

// ─────────────────────────────────────────────
console.log('\n=== 9. Depth Badges ===\n');

for (const f of enFiles) {
  const fp = path.join(enDir, f);
  const content = fs.readFileSync(fp, 'utf-8');
  // Only check numbered sections (0-7)
  if (/^[0-7]/.test(f) || f.startsWith('3-') || f.startsWith('4-') || f.startsWith('5-') || f.startsWith('6-')) {
    if (content.includes('maturity-indicator')) pass(`${f}: has depth badge(s)`);
    else warn(`${f}: no depth badges found`);
  }
}

// ─────────────────────────────────────────────
console.log('\n=== 10. Public Schema Copy ===\n');

const srcSchema = 'schema/ads.schema.json';
const pubSchema = 'public/schema/v1.0.0/ads.schema.json';

if (fs.existsSync(pubSchema)) {
  const src = fs.readFileSync(srcSchema, 'utf-8');
  const pub = fs.readFileSync(pubSchema, 'utf-8');
  if (src === pub) pass('Public schema matches source');
  else warn('Public schema is out of sync with source — run npm run generate:templates');
} else {
  error('Public schema missing: ' + pubSchema);
}

// ─────────────────────────────────────────────
console.log('\n=== Summary ===\n');
console.log(`  Errors:   ${errors}`);
console.log(`  Warnings: ${warnings}`);
console.log(`  Result:   ${errors === 0 ? '✓ PASS' : '❌ FAIL'}`);
console.log('');

process.exit(errors > 0 ? 1 : 0);
