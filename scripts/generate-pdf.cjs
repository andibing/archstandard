#!/usr/bin/env node
/**
 * ADS PDF Generator
 *
 * Concatenates all standard pages into one Markdown file,
 * then converts to PDF using Pandoc.
 *
 * Prerequisites:
 *   - Pandoc installed (https://pandoc.org/installing.html)
 *
 * Usage:
 *   node scripts/generate-pdf.cjs
 *
 * Output:
 *   public/ads-standard-v1.pdf
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find Pandoc - check common locations
function findPandoc() {
  const locations = [
    'pandoc',
    path.join(process.env.LOCALAPPDATA || '', 'Pandoc', 'pandoc.exe'),
    'C:\\Program Files\\Pandoc\\pandoc.exe',
    '/usr/local/bin/pandoc',
    '/usr/bin/pandoc',
  ];
  for (const loc of locations) {
    try {
      execSync(`"${loc}" --version`, { stdio: 'pipe' });
      return loc;
    } catch (e) { /* continue */ }
  }
  return null;
}

// Language to generate — pass as first arg: node generate-pdf.cjs [en|fr|de]
const LANG = process.argv[2] || 'en';
const LANG_DIR = LANG === 'en' ? 'standard' : `${LANG}/standard`;
const LANG_SUFFIX = LANG === 'en' ? '' : `-${LANG}`;
const LANG_NAMES = { en: 'English', fr: 'French', de: 'German' };

const STANDARD_DIR = path.join(__dirname, '..', 'src', 'content', 'docs', LANG_DIR);
const OUTPUT_MD = path.join(__dirname, '..', 'dist-pdf', `ads-standard${LANG_SUFFIX}.md`);
const OUTPUT_PDF = path.join(__dirname, '..', 'public', `ads-standard-v1${LANG_SUFFIX}.pdf`);

// Pages in reading order
const PAGES = [
  'overview.mdx',
  'how-to-use.mdx',
  'design-principles.mdx',
  'framework-alignment.mdx',
  '0-document-control.mdx',
  '1-executive-summary.mdx',
  '2-stakeholders.mdx',
  '3-views-overview.mdx',
  '3-1-logical-view.mdx',
  '3-2-process-view.mdx',
  '3-3-physical-view.mdx',
  '3-4-data-view.mdx',
  '3-5-security-view.mdx',
  '3-6-scenarios.mdx',
  '4-quality-attributes-overview.mdx',
  '4-1-operational-excellence.mdx',
  '4-2-reliability.mdx',
  '4-3-performance.mdx',
  '4-4-cost-optimisation.mdx',
  '4-5-sustainability.mdx',
  '5-lifecycle.mdx',
  '6-decision-making.mdx',
  '7-appendices.mdx',
  'templates.mdx',
  'schema.mdx',
  'version-history.mdx',
];

function extractTitle(content) {
  const match = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  return match ? match[1] : 'Untitled';
}

function stripFrontmatter(content) {
  // Remove YAML frontmatter
  const stripped = content.replace(/^---[\s\S]*?---\n*/, '');
  return stripped;
}

function stripMdxComponents(content) {
  // Remove import statements
  content = content.replace(/^import\s+.*$/gm, '');

  // Remove Astro/Starlight components
  content = content.replace(/<Aside[^>]*>[\s\S]*?<\/Aside>/g, '');
  content = content.replace(/<Card[^>]*>[\s\S]*?<\/Card>/g, '');
  content = content.replace(/<CardGrid[^>]*>[\s\S]*?<\/CardGrid>/g, '');
  content = content.replace(/<Image[^>]*\/>/g, '');
  content = content.replace(/<Mermaid[^>]*\/>/g, '*[Diagram — see web version]*');

  // Remove HTML span badges (keep the text)
  content = content.replace(/<span class="maturity-indicator[^"]*">([^<]+)<\/span>/g, '**[$1]**');
  content = content.replace(/<span class="framework-badge[^"]*">([^<]+)<\/span>/g, '`$1`');

  // Remove guidance-box divs (keep content)
  content = content.replace(/<div class="guidance-box">\n<h4>([^<]+)<\/h4>/g, '> **$1**');
  content = content.replace(/<\/div>/g, '');

  // Remove quality-attribute-ref divs (keep content)
  content = content.replace(/<div class="quality-attribute-ref">/g, '');

  // Remove example-sad divs
  content = content.replace(/<div class="example-sad">/g, '');

  // Remove other HTML elements
  content = content.replace(/<figure[^>]*>[\s\S]*?<\/figure>/g, '');
  content = content.replace(/<small[^>]*>[\s\S]*?<\/small>/g, '');

  // Remove Starlight notes (:::note ... :::)
  content = content.replace(/:::note\[?[^\]]*\]?\n([\s\S]*?):::/g, '> $1');
  content = content.replace(/:::note\n([\s\S]*?):::/g, '> $1');

  // Remove section-map and workflow-steps divs
  content = content.replace(/<div class="section-map">/g, '');
  content = content.replace(/<div class="workflow-steps">/g, '');

  // Clean up multiple blank lines
  content = content.replace(/\n{4,}/g, '\n\n\n');

  return content;
}

function main() {
  console.log(`Generating combined Markdown for PDF (${LANG_NAMES[LANG] || LANG})...`);

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_MD);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const sections = [];

  // Title page
  sections.push(`---
title: "Architecture Description Standard (ADS)"
subtitle: "Version 1.3.1"
author: "Andi Chandler"
date: "${new Date().toISOString().split('T')[0]}"
---

# Architecture Description Standard

**Version 1.3.1** | **Author:** Andi Chandler | **Licence:** CC BY 4.0

**Published by:** ArchStandard ([archstandard.org](https://archstandard.org))

---

`);

  // Process each page
  for (const page of PAGES) {
    const filePath = path.join(STANDARD_DIR, page);
    if (!fs.existsSync(filePath)) {
      console.warn(`  SKIP: ${page} (not found)`);
      continue;
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const title = extractTitle(raw);
    let content = stripFrontmatter(raw);
    content = stripMdxComponents(content);

    sections.push(`\\newpage\n\n# ${title}\n\n${content}\n\n`);
    console.log(`  Added: ${page} (${title})`);
  }

  // Write combined Markdown
  const combined = sections.join('\n');
  fs.writeFileSync(OUTPUT_MD, combined, 'utf-8');
  console.log(`\nCombined Markdown: ${OUTPUT_MD} (${Math.round(combined.length / 1024)}KB)`);

  // Find Pandoc
  const pandoc = findPandoc();
  if (!pandoc) {
    console.error('\nPandoc not found. Install from: https://pandoc.org/installing.html');
    console.log('The combined Markdown is available at:', OUTPUT_MD);
    process.exit(1);
  }
  console.log(`\nUsing Pandoc: ${pandoc}`);

  // Generate DOCX (always works, no LaTeX needed)
  const OUTPUT_DOCX = OUTPUT_PDF.replace('.pdf', '.docx');
  console.log('Generating DOCX...');
  try {
    execSync(
      `"${pandoc}" "${OUTPUT_MD}" -o "${OUTPUT_DOCX}" ` +
      `--toc --toc-depth=3 ` +
      `--metadata=lang:en-GB ` +
      `--highlight-style=tango`,
      { stdio: 'inherit' }
    );
    console.log(`  DOCX generated: ${OUTPUT_DOCX}`);
  } catch (e) {
    console.error('  DOCX generation failed:', e.message);
  }

  // Generate PDF (requires LaTeX engine)
  console.log('Generating PDF...');
  let pdfOk = false;
  // Try xelatex first (better Unicode/font support)
  try {
    execSync(
      `"${pandoc}" "${OUTPUT_MD}" -o "${OUTPUT_PDF}" ` +
      `--pdf-engine=xelatex ` +
      `--toc --toc-depth=3 ` +
      `-V geometry:margin=2.5cm ` +
      `-V fontsize=11pt ` +
      `-V documentclass=report ` +
      `-V linkcolor=blue ` +
      `-V toccolor=blue ` +
      `-V mainfont="Segoe UI" ` +
      `-V lang=en-GB ` +
      `--metadata=lang:en-GB ` +
      `--highlight-style=tango`,
      { stdio: 'inherit' }
    );
    console.log(`  PDF generated: ${OUTPUT_PDF}`);
    pdfOk = true;
  } catch (e) {
    // Try pdflatex as fallback
    try {
      execSync(
        `"${pandoc}" "${OUTPUT_MD}" -o "${OUTPUT_PDF}" ` +
        `--toc --toc-depth=3 ` +
        `-V geometry:margin=2.5cm ` +
        `-V fontsize=11pt ` +
        `-V documentclass=report ` +
        `-V linkcolor=blue ` +
        `-V toccolor=blue ` +
        `-V lang=en-GB ` +
        `--metadata=lang:en-GB ` +
        `--highlight-style=tango`,
        { stdio: 'inherit' }
      );
      console.log(`  PDF generated: ${OUTPUT_PDF}`);
      pdfOk = true;
    } catch (e2) {
      console.warn('  PDF generation requires a LaTeX engine (MiKTeX or TeX Live).');
      console.warn('  Install from: https://miktex.org/ or https://tug.org/texlive/');
      console.log('  DOCX was generated successfully — use that or install LaTeX for PDF.');
    }
  }

  // Clean up temp directory
  fs.rmSync(outputDir, { recursive: true, force: true });

  console.log('\nDone.');
  if (pdfOk) console.log(`  PDF: ${OUTPUT_PDF}`);
  console.log(`  DOCX: ${OUTPUT_DOCX}`);
}

main();
