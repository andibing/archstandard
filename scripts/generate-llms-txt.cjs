#!/usr/bin/env node
/**
 * ADS llms.txt + llms-full.txt Generator
 *
 * Auto-discovers all MDX pages from the filesystem and generates:
 *   public/llms.txt      — structured link index (llmstxt.org format)
 *   public/llms-full.txt — full page content inline (for LLM ingestion)
 *
 * New pages are included automatically — no manual manifest to maintain.
 * Run as the first step of the build: node scripts/generate-llms-txt.cjs
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT   = path.join(__dirname, '..');
const SRC    = path.join(ROOT, 'src', 'content', 'docs');
const PUBLIC = path.join(ROOT, 'public');
const BASE   = 'https://archstandard.org';

// ---------------------------------------------------------------------------
// MDX parsing
// ---------------------------------------------------------------------------

function extractFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const raw = m[1];
  const title = (raw.match(/^title:\s*["']?(.+?)["']?\s*$/m) || [])[1] || null;
  const desc  = (raw.match(/^description:\s*["']?(.+?)["']?\s*$/m) || [])[1] || null;
  return { title, desc };
}

function stripMdx(content) {
  // Remove frontmatter
  content = content.replace(/^---[\s\S]*?---\n*/, '');
  // Remove import statements
  content = content.replace(/^import\s+.*$/gm, '');
  // Unwrap JSX components — keep their text content
  content = content.replace(/<Aside[^>]*>([\s\S]*?)<\/Aside>/g, '$1');
  content = content.replace(/<Card[^>]*>([\s\S]*?)<\/Card>/g, '$1');
  content = content.replace(/<CardGrid[^>]*>([\s\S]*?)<\/CardGrid>/g, '$1');
  content = content.replace(/<Image[^>]*\/>/g, '');
  content = content.replace(/<Mermaid[^>]*\/>/g, '');
  // Convert badge spans to plain text
  content = content.replace(/<span class="maturity-indicator[^"]*">([^<]+)<\/span>/g, '[$1]');
  content = content.replace(/<span class="framework-badge[^"]*">([^<]+)<\/span>/g, '$1');
  // Guidance boxes — keep heading and body
  content = content.replace(/<div[^>]*>\n?<h4>([^<]+)<\/h4>/g, '\n**$1**\n');
  content = content.replace(/<\/div>/g, '');
  // Strip remaining HTML tags
  content = content.replace(/<[^>]+>/g, '');
  // Strip Starlight directives (:::note, :::tip etc.) but keep body
  content = content.replace(/:::(?:note|tip|caution|danger|warning)\[?[^\]]*\]?\n([\s\S]*?):::/g, '$1');
  // Strip code fences (too noisy for LLM index)
  content = content.replace(/```[\s\S]*?```/g, '');
  // Strip JSX expressions
  content = content.replace(/\{[^}]*\}/g, '');
  // Tidy whitespace
  content = content.replace(/\n{4,}/g, '\n\n');
  return content.trim();
}

// ---------------------------------------------------------------------------
// Page discovery
// ---------------------------------------------------------------------------

// Pages to skip entirely (index/hub pages with no unique content, or binary)
const SKIP_FILES = new Set(['index.mdx']);

// Within standard/, these slugs go into Resources rather than Orientation
const RESOURCE_SLUGS = new Set([
  'templates', 'downloads', 'schema', 'faq', 'version-history', 'prompts', 'glossary',
]);

// Predefined ordering for standard section files (0-7 + their sub-pages)
const SECTION_ORDER = [
  '0-document-control', '1-executive-summary', '2-stakeholders',
  '3-views-overview', '3-1-logical-view', '3-2-integration-view',
  '3-3-physical-view', '3-4-data-view', '3-5-security-view', '3-6-scenarios',
  '4-quality-attributes-overview',
  '4-1-operational-excellence', '4-2-reliability', '4-3-performance',
  '4-4-cost-optimisation', '4-5-sustainability',
  '5-lifecycle', '6-decision-making', '7-appendices',
];

// Predefined ordering for orientation pages
const ORIENTATION_ORDER = [
  'overview', 'quickstart', 'adoption-guide', 'how-to-use', 'cheat-sheet',
  'design-principles', 'framework-alignment',
];

function isSectionFile(slug) {
  return /^\d/.test(slug);
}

function scanDir(dir, prefix) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.mdx') && !SKIP_FILES.has(f))
    .map(f => {
      const slug = f.replace(/\.mdx$/, '');
      const raw  = fs.readFileSync(path.join(dir, f), 'utf-8');
      const fm   = extractFrontmatter(raw);
      return {
        file: `${prefix}/${f}`,
        slug: `${prefix}/${slug}`,
        title: fm.title || slug,
        desc:  fm.desc  || '',
        body:  stripMdx(raw),
      };
    });
}

function discoverPages() {
  const standardAll = scanDir(path.join(SRC, 'standard'), 'standard');
  const examplesAll = scanDir(path.join(SRC, 'examples'), 'examples');
  const guidanceAll = scanDir(path.join(SRC, 'guidance'), 'guidance');

  // Split standard pages into three groups
  const orientation = [];
  const sections    = [];
  const resources   = [];

  for (const p of standardAll) {
    const s = p.slug.replace('standard/', '');
    if (RESOURCE_SLUGS.has(s))   { resources.push(p);    continue; }
    if (isSectionFile(s))         { sections.push(p);     continue; }
    orientation.push(p);
  }

  // Sort by predefined order, unknown pages append alphabetically
  const sortBy = (order) => (a, b) => {
    const sa = a.slug.split('/').pop();
    const sb = b.slug.split('/').pop();
    const ia = order.indexOf(sa);
    const ib = order.indexOf(sb);
    if (ia === -1 && ib === -1) return sa.localeCompare(sb);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  };

  orientation.sort(sortBy(ORIENTATION_ORDER));
  sections.sort(sortBy(SECTION_ORDER));

  // Warn about auto-discovered extras not in the predefined order lists
  const unknownOrientation = orientation.filter(p => !ORIENTATION_ORDER.includes(p.slug.split('/').pop()));
  const unknownSections    = sections.filter(p => !SECTION_ORDER.includes(p.slug.split('/').pop()));
  if (unknownOrientation.length) console.warn('  NEW orientation pages (auto-included):', unknownOrientation.map(p => p.slug).join(', '));
  if (unknownSections.length)    console.warn('  NEW section pages (auto-included):',    unknownSections.map(p => p.slug).join(', '));

  return { orientation, sections, examples: examplesAll, guidance: guidanceAll, resources };
}

// ---------------------------------------------------------------------------
// URL builder
// ---------------------------------------------------------------------------

function url(slug) { return `${BASE}/v1/${slug}/`; }

// ---------------------------------------------------------------------------
// Generate llms.txt
// ---------------------------------------------------------------------------

function generateIndex({ orientation, sections, examples, guidance, resources }) {
  const lines = [];

  lines.push('# ADS: Architecture Description Standard');
  lines.push('');
  lines.push('> A free, open-source standard that prescribes the structure, content, and quality criteria of Solution Architecture Documents (SADs). Built upon ISO/IEC/IEEE 42010, the 4+1 View Model, the cloud Well-Architected Frameworks, and TOGAF. Backed by a formal JSON Schema (Draft 2020-12) for machine validation and generation.');
  lines.push('');
  lines.push('ADS defines which sections a SAD must contain, what each section must answer, and what "good" looks like at three documentation depths (Minimum / Recommended / Comprehensive — mapped to RFC 2119 SHALL / SHOULD / MAY). The current standard version is v1.3.3; the JSON Schema version is v1.0.0. Licensed under CC BY 4.0 (content) and MIT (code).');
  lines.push('');
  lines.push('Three names appear throughout. **ADS** is this standard. **SAD** (Solution Architecture Document) is the document you produce. **HLD** (High Level Design) is the architectural-views and quality-attributes content within a SAD.');
  lines.push('');

  lines.push('## Orientation');
  lines.push('');
  for (const p of orientation) {
    lines.push(`- [${p.title}](${url(p.slug)}): ${p.desc}`);
  }
  lines.push('');

  lines.push('## The Standard (Sections 0–7)');
  lines.push('');
  for (const p of sections) {
    lines.push(`- [${p.title}](${url(p.slug)}): ${p.desc}`);
  }
  lines.push('');

  lines.push('## Schema and Templates');
  lines.push('');
  lines.push(`- [JSON Schema (canonical)](${BASE}/schema/v1.0.0/ads.schema.json): machine-readable contract, JSON Schema Draft 2020-12. Validate against this URL.`);
  lines.push(`- [Markdown template](${BASE}/v1/templates/sad-template.md)`);
  lines.push(`- [YAML template](${BASE}/v1/templates/sad-template.yaml)`);
  lines.push(`- [JSON template](${BASE}/v1/templates/sad-template.json)`);
  lines.push(`- [Word template](${BASE}/v1/templates/sad-template.docx)`);
  lines.push(`- [Complete standard PDF](${BASE}/v1/ads-standard-v1.pdf)`);
  lines.push('');

  lines.push('## Worked Example SADs');
  lines.push('');
  lines.push('Validated against the schema, covering different industries, scales, and depths.');
  lines.push('');
  for (const p of examples) {
    const name = p.slug.replace('examples/', '');
    lines.push(`- [${p.title}](${url(p.slug)}): ${p.desc} [JSON](${BASE}/v1/examples/${name}.json) [Markdown](${BASE}/v1/examples/${name}.md)`);
  }
  lines.push('');

  lines.push('## Guidance');
  lines.push('');
  for (const p of guidance) {
    lines.push(`- [${p.title}](${url(p.slug)}): ${p.desc}`);
  }
  lines.push('');

  lines.push('## Optional');
  lines.push('');
  for (const p of resources) {
    lines.push(`- [${p.title}](${url(p.slug)}): ${p.desc}`);
  }
  lines.push(`- [GitHub repository](https://github.com/andibing/archstandard): source for the site, schema, templates, and examples.`);
  lines.push(`- [Full content (llms-full.txt)](${BASE}/llms-full.txt): all page content concatenated for LLM ingestion.`);
  lines.push('');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Generate llms-full.txt
// ---------------------------------------------------------------------------

function generateFull({ orientation, sections, examples, guidance, resources }) {
  const allPages = [...orientation, ...sections, ...examples, ...guidance, ...resources];
  const parts = [];

  parts.push(`# ADS: Architecture Description Standard — Full Content`);
  parts.push(`> Source: ${BASE} | Standard v1.3.3 | Schema v1.0.0 | CC BY 4.0`);
  parts.push(`> This file contains the complete text of the ADS website for LLM ingestion.`);
  parts.push(`> For a structured link index see ${BASE}/llms.txt`);
  parts.push('');

  for (const p of allPages) {
    parts.push(`---`);
    parts.push(`## ${p.title}`);
    parts.push(`URL: ${url(p.slug)}`);
    if (p.desc) parts.push(`> ${p.desc}`);
    parts.push('');
    parts.push(p.body);
    parts.push('');
  }

  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('Generating llms.txt and llms-full.txt...');

  const pages = discoverPages();
  const totalPages = Object.values(pages).reduce((n, g) => n + g.length, 0);
  console.log(`  Discovered ${totalPages} pages`);

  const index = generateIndex(pages);
  fs.writeFileSync(path.join(PUBLIC, 'llms.txt'), index, 'utf-8');
  console.log(`  Written: public/llms.txt (${Math.round(index.length / 1024)}KB)`);

  const full = generateFull(pages);
  fs.writeFileSync(path.join(PUBLIC, 'llms-full.txt'), full, 'utf-8');
  console.log(`  Written: public/llms-full.txt (${Math.round(full.length / 1024)}KB)`);

  console.log('Done.');
}

main();
