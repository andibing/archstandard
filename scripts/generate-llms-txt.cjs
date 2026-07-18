#!/usr/bin/env node
/**
 * ADS llms.txt + llms-full.txt Generator
 *
 * Generates two LLM-oriented index files from the MDX source:
 *   public/llms.txt      — structured link index (llmstxt.org format)
 *   public/llms-full.txt — full page content inline (for LLMs that can't follow links)
 *
 * Run as part of the build: node scripts/generate-llms-txt.cjs
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT    = path.join(__dirname, '..');
const SRC     = path.join(ROOT, 'src', 'content', 'docs');
const PUBLIC  = path.join(ROOT, 'public');
const BASE    = 'https://archstandard.org';

// ---------------------------------------------------------------------------
// Page manifest — grouped for llms.txt, ordered for llms-full.txt
// ---------------------------------------------------------------------------

const ORIENTATION = [
  { file: 'standard/overview.mdx',        slug: 'standard/overview',        desc: 'Structure, concepts, and rationale of ADS in one page; includes comparison with TOGAF, arc42, and cloud WAFs.' },
  { file: 'standard/quickstart.mdx',       slug: 'standard/quickstart',       desc: '30-minute walkthrough to produce a first SAD at Minimum depth.' },
  { file: 'standard/adoption-guide.mdx',   slug: 'standard/adoption-guide',   desc: 'How to roll ADS out in an organisation — evaluate fit, pilot, map to governance, customise, onboard, measure.' },
  { file: 'standard/how-to-use.mdx',       slug: 'standard/how-to-use',       desc: 'Conformance levels, depth model, RFC 2119 mapping, terminology, compliance scoring.' },
  { file: 'standard/cheat-sheet.mdx',      slug: 'standard/cheat-sheet',      desc: 'Single-page table of which sections are required at each documentation depth.' },
  { file: 'standard/design-principles.mdx',slug: 'standard/design-principles',desc: 'Atomic fields, schema-as-truth, extensibility without ambiguity.' },
  { file: 'standard/framework-alignment.mdx',slug:'standard/framework-alignment',desc:'Traceability to ISO 42010, 4+1, TOGAF, AWS/Azure WAF.' },
];

const STANDARD_SECTIONS = [
  { file: 'standard/0-document-control.mdx',          slug: 'standard/0-document-control',          desc: 'Metadata, change history, contributors, sign-offs.' },
  { file: 'standard/1-executive-summary.mdx',         slug: 'standard/1-executive-summary',         desc: 'Solution overview, business context and drivers, scope, criticality.' },
  { file: 'standard/2-stakeholders.mdx',              slug: 'standard/2-stakeholders',              desc: 'Stakeholder register, concerns matrix, compliance and regulatory context.' },
  { file: 'standard/3-views-overview.mdx',            slug: 'standard/3-views-overview',            desc: 'How the six architectural views fit together.' },
  { file: 'standard/3-1-logical-view.mdx',            slug: 'standard/3-1-logical-view',            desc: 'Components, capabilities, design patterns.' },
  { file: 'standard/3-2-integration-view.mdx',        slug: 'standard/3-2-integration-view',        desc: 'How components communicate internally and externally.' },
  { file: 'standard/3-3-physical-view.mdx',           slug: 'standard/3-3-physical-view',           desc: 'Hosting, compute, networks, environments.' },
  { file: 'standard/3-4-data-view.mdx',               slug: 'standard/3-4-data-view',               desc: 'Data stores, classification, data lifecycle.' },
  { file: 'standard/3-5-security-view.mdx',           slug: 'standard/3-5-security-view',           desc: 'Authentication, authorisation, encryption, monitoring, threat model.' },
  { file: 'standard/3-6-scenarios.mdx',               slug: 'standard/3-6-scenarios',               desc: 'Key use cases and Architecture Decision Records (ADRs).' },
  { file: 'standard/4-quality-attributes-overview.mdx',slug:'standard/4-quality-attributes-overview',desc:'The five cross-cutting evaluation perspectives.' },
  { file: 'standard/4-1-operational-excellence.mdx',  slug: 'standard/4-1-operational-excellence',  desc: 'Logging, monitoring, alerting, runbooks, operational maturity.' },
  { file: 'standard/4-2-reliability.mdx',             slug: 'standard/4-2-reliability',             desc: 'DR strategy, RTO/RPO, backup, fault tolerance.' },
  { file: 'standard/4-3-performance.mdx',             slug: 'standard/4-3-performance',             desc: 'Performance targets, growth projections, load testing.' },
  { file: 'standard/4-4-cost-optimisation.mdx',       slug: 'standard/4-4-cost-optimisation',       desc: 'Cost analysis, monitoring, right-sizing.' },
  { file: 'standard/4-5-sustainability.mdx',          slug: 'standard/4-5-sustainability',          desc: 'Carbon-aware hosting, auto-shutdown, sustainability metrics.' },
  { file: 'standard/5-lifecycle.mdx',                 slug: 'standard/5-lifecycle',                 desc: 'CI/CD, migration, test strategy, release, operations, decommissioning, exit planning.' },
  { file: 'standard/6-decision-making.mdx',           slug: 'standard/6-decision-making',           desc: 'RAID log, technical debt, guardrail exceptions, ADRs, compliance traceability, sign-off.' },
  { file: 'standard/7-appendices.mdx',                slug: 'standard/7-appendices',                desc: 'Glossary, references, supporting standards.' },
];

const EXAMPLES = [
  { file: 'examples/employee-directory.mdx',    slug: 'examples/employee-directory',    desc: 'Minimum depth — internal HR web app.' },
  { file: 'examples/customer-api-platform.mdx', slug: 'examples/customer-api-platform', desc: 'Recommended depth — regulated open-banking API.' },
  { file: 'examples/cloud-migration.mdx',       slug: 'examples/cloud-migration',       desc: 'Recommended depth — lift-and-shift to AWS.' },
  { file: 'examples/northwind-retail.mdx',      slug: 'examples/northwind-retail',      desc: 'Recommended depth, Tier 2 — PCI-DSS regulated e-commerce on AWS.' },
  { file: 'examples/medwick-healthcare.mdx',    slug: 'examples/medwick-healthcare',    desc: 'Comprehensive depth, Tier 1 — national healthcare patient portal with FHIR R4.' },
  { file: 'examples/stellar-platform.mdx',      slug: 'examples/stellar-platform',      desc: 'Recommended depth, Tier 3 — multi-cloud Internal Developer Platform on Kubernetes.' },
  { file: 'examples/archstandard-org.mdx',      slug: 'examples/archstandard-org',      desc: 'Minimum depth — SAD for this very site.' },
];

const GUIDANCE = [
  { file: 'guidance/what-good-looks-like.mdx',  slug: 'guidance/what-good-looks-like',  desc: 'High-quality content excerpts showing what a well-written SAD section looks like.' },
  { file: 'guidance/anti-patterns.mdx',         slug: 'guidance/anti-patterns',         desc: 'Common mistakes with before-and-after examples.' },
  { file: 'guidance/decision-guides.mdx',       slug: 'guidance/decision-guides',       desc: 'Flowcharts for picking depth, threat modelling, splitting SADs, classifying RAID items.' },
  { file: 'guidance/reviewer-perspectives.mdx', slug: 'guidance/reviewer-perspectives', desc: 'What ARB, Security, Data, SRE, Finance, Change, and Product reviewers each look for.' },
  { file: 'guidance/starter-kits.mdx',          slug: 'guidance/starter-kits',          desc: 'Pre-scoped guidance for new cloud apps, migrations, integrations, and platforms.' },
  { file: 'guidance/review-checklist.mdx',      slug: 'guidance/review-checklist',      desc: 'Printable one-pager for governance reviewers.' },
  { file: 'guidance/industry-mappings.mdx',     slug: 'guidance/industry-mappings',     desc: 'Traceability to GDS Service Standard, NIST CSF, PCI-DSS, ISO 27001, NHS DSPT, UK GDPR, FCA.' },
  { file: 'guidance/cheat-cards.mdx',           slug: 'guidance/cheat-cards',           desc: 'One-page printable quick-reference cards.' },
  { file: 'guidance/pitch.mdx',                 slug: 'guidance/pitch',                 desc: 'Speaker notes for introducing ADS to an organisation in two minutes.' },
];

const RESOURCES = [
  { file: 'standard/templates.mdx',      slug: 'standard/templates',      desc: 'How to use templates, customise per organisation, and convert between formats.' },
  { file: 'standard/downloads.mdx',      slug: 'standard/downloads',      desc: 'All downloadable files in one place.' },
  { file: 'standard/prompts.mdx',        slug: 'standard/prompts',        desc: 'AI prompt library — first-draft, validation, scoring, improvement, security and governance review.' },
  { file: 'standard/schema.mdx',         slug: 'standard/schema',         desc: 'JSON Schema structure, validation instructions in Node and Python.' },
  { file: 'standard/faq.mdx',            slug: 'standard/faq',            desc: 'Frequently asked questions about ADS.' },
  { file: 'standard/version-history.mdx',slug: 'standard/version-history',desc: 'Release notes and schema-compatibility table.' },
];

const ALL_PAGES = [
  ...ORIENTATION,
  ...STANDARD_SECTIONS,
  ...EXAMPLES,
  ...GUIDANCE,
  ...RESOURCES,
];

// ---------------------------------------------------------------------------
// MDX stripping (reused from generate-pdf.cjs)
// ---------------------------------------------------------------------------

function extractTitle(content) {
  const m = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  return m ? m[1] : null;
}

function extractDescription(content) {
  const m = content.match(/^description:\s*["']?(.+?)["']?\s*$/m);
  return m ? m[1] : null;
}

function stripFrontmatter(content) {
  return content.replace(/^---[\s\S]*?---\n*/, '');
}

function stripMdx(content) {
  content = content.replace(/^import\s+.*$/gm, '');
  content = content.replace(/<Aside[^>]*>([\s\S]*?)<\/Aside>/g, '$1');
  content = content.replace(/<Card[^>]*>([\s\S]*?)<\/Card>/g, '$1');
  content = content.replace(/<CardGrid[^>]*>([\s\S]*?)<\/CardGrid>/g, '$1');
  content = content.replace(/<Image[^>]*\/>/g, '');
  content = content.replace(/<Mermaid[^>]*\/>/g, '');
  content = content.replace(/<span class="maturity-indicator[^"]*">([^<]+)<\/span>/g, '[$1]');
  content = content.replace(/<span class="framework-badge[^"]*">([^<]+)<\/span>/g, '$1');
  content = content.replace(/<div[^>]*>\n?<h4>([^<]+)<\/h4>/g, '\n**$1**\n');
  content = content.replace(/<\/div>/g, '');
  content = content.replace(/<[^>]+>/g, '');
  content = content.replace(/:::(?:note|tip|caution|danger)\[?[^\]]*\]?\n([\s\S]*?):::/g, '$1');
  content = content.replace(/```[^`]*```/gs, '');
  content = content.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  content = content.replace(/\n{4,}/g, '\n\n');
  return content.trim();
}

function readPage(file) {
  const full = path.join(SRC, file);
  if (!fs.existsSync(full)) return null;
  const raw = fs.readFileSync(full, 'utf-8');
  return {
    title:       extractTitle(raw),
    description: extractDescription(raw),
    body:        stripMdx(stripFrontmatter(raw)),
  };
}

function url(slug) {
  return `${BASE}/v1/${slug}/`;
}

// ---------------------------------------------------------------------------
// Generate llms.txt (structured index)
// ---------------------------------------------------------------------------

function generateIndex() {
  const lines = [];

  lines.push('# ADS: Architecture Description Standard');
  lines.push('');
  lines.push('> A free, open-source standard that prescribes the structure, content, and quality criteria of Solution Architecture Documents (SADs). Built upon ISO/IEC/IEEE 42010, the 4+1 View Model, the cloud Well-Architected Frameworks, and TOGAF. Backed by a formal JSON Schema (Draft 2020-12) for machine validation and generation.');
  lines.push('');
  lines.push('ADS defines which sections a SAD must contain, what each section must answer, and what "good" looks like at three documentation depths (Minimum / Recommended / Comprehensive — mapped to RFC 2119 SHALL / SHOULD / MAY). The current standard version is v1.3.2; the JSON Schema version is v1.0.0. Licensed under CC BY 4.0 (content) and MIT (code).');
  lines.push('');
  lines.push('Three names appear throughout. **ADS** is this standard. **SAD** (Solution Architecture Document) is the document you produce. **HLD** (High Level Design) is the architectural-views and quality-attributes content within a SAD.');
  lines.push('');

  lines.push('## Orientation');
  lines.push('');
  for (const p of ORIENTATION) {
    lines.push(`- [${readPage(p.file)?.title || p.slug}](${url(p.slug)}): ${p.desc}`);
  }
  lines.push('');

  lines.push('## The Standard (Sections 0–7)');
  lines.push('');
  for (const p of STANDARD_SECTIONS) {
    lines.push(`- [${readPage(p.file)?.title || p.slug}](${url(p.slug)}): ${p.desc}`);
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
  lines.push('Seven examples, each validated against the schema, covering different industries, scales, and depths.');
  lines.push('');
  for (const p of EXAMPLES) {
    const slug = p.slug.replace('examples/', '');
    lines.push(`- [${readPage(p.file)?.title || slug}](${url(p.slug)}): ${p.desc} [JSON](${BASE}/v1/examples/${slug}.json) [Markdown](${BASE}/v1/examples/${slug}.md)`);
  }
  lines.push('');

  lines.push('## Guidance');
  lines.push('');
  for (const p of GUIDANCE) {
    lines.push(`- [${readPage(p.file)?.title || p.slug}](${url(p.slug)}): ${p.desc}`);
  }
  lines.push('');

  lines.push('## Optional');
  lines.push('');
  for (const p of RESOURCES) {
    lines.push(`- [${readPage(p.file)?.title || p.slug}](${url(p.slug)}): ${p.desc}`);
  }
  lines.push(`- [GitHub repository](https://github.com/andibing/archstandard): source for the site, schema, templates, and examples.`);
  lines.push(`- [Full content (llms-full.txt)](${BASE}/llms-full.txt): all page content concatenated for LLM ingestion.`);
  lines.push('');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Generate llms-full.txt (full content)
// ---------------------------------------------------------------------------

function generateFull() {
  const sections = [];

  sections.push(`# ADS: Architecture Description Standard — Full Content`);
  sections.push(`> Source: ${BASE} | Standard v1.3.2 | Schema v1.0.0 | CC BY 4.0`);
  sections.push(`> This file contains the complete text of the ADS website for LLM ingestion.`);
  sections.push(`> For a structured link index, see ${BASE}/llms.txt`);
  sections.push('');

  for (const p of ALL_PAGES) {
    const page = readPage(p.file);
    if (!page) {
      console.warn(`  SKIP (not found): ${p.file}`);
      continue;
    }
    sections.push(`---`);
    sections.push(`## ${page.title || p.slug}`);
    sections.push(`URL: ${url(p.slug)}`);
    if (page.description) sections.push(`> ${page.description}`);
    sections.push('');
    sections.push(page.body);
    sections.push('');
  }

  return sections.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('Generating llms.txt and llms-full.txt...');

  const index = generateIndex();
  fs.writeFileSync(path.join(PUBLIC, 'llms.txt'), index, 'utf-8');
  console.log(`  Written: public/llms.txt (${Math.round(index.length / 1024)}KB)`);

  const full = generateFull();
  fs.writeFileSync(path.join(PUBLIC, 'llms-full.txt'), full, 'utf-8');
  console.log(`  Written: public/llms-full.txt (${Math.round(full.length / 1024)}KB)`);

  console.log('Done.');
}

main();
