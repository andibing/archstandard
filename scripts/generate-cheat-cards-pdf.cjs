#!/usr/bin/env node
/**
 * Generate PDF versions of the cheat cards.
 *
 * Reads src/content/docs/guidance/cheat-cards.mdx, strips MDX
 * components, splits at the card boundaries, and produces:
 *   - public/cheat-cards/cheat-cards-all.pdf      (combined)
 *   - public/cheat-cards/cheat-card-1-views.pdf
 *   - public/cheat-cards/cheat-card-2-quality.pdf
 *   - public/cheat-cards/cheat-card-3-raid.pdf
 *   - public/cheat-cards/cheat-card-4-scoring.pdf
 *   - public/cheat-cards/cheat-card-5-depth.pdf
 *
 * Prerequisites:
 *   - Pandoc (https://pandoc.org/installing.html)
 *   - A LaTeX distribution (MiKTeX on Windows, TeX Live on macOS/Linux)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function findPandoc() {
  const candidates = [
    'pandoc',
    path.join(process.env.LOCALAPPDATA || '', 'Pandoc', 'pandoc.exe'),
    'C:\\Program Files\\Pandoc\\pandoc.exe',
    '/usr/local/bin/pandoc',
    '/usr/bin/pandoc',
  ];
  for (const loc of candidates) {
    try {
      execSync(`"${loc}" --version`, { stdio: 'pipe' });
      return loc;
    } catch (_) { /* keep looking */ }
  }
  return null;
}

const SRC = path.join(__dirname, '..', 'src', 'content', 'docs', 'guidance', 'cheat-cards.mdx');
const OUT_DIR = path.join(__dirname, '..', 'public', 'cheat-cards');
const TMP_DIR = path.join(__dirname, '..', 'dist-pdf', 'cheat-cards-tmp');

const PANDOC = findPandoc();
if (!PANDOC) {
  console.error('Pandoc not found. Install from https://pandoc.org/installing.html');
  process.exit(1);
}

console.log(`Using pandoc: ${PANDOC}`);

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// 1. Read source
let raw = fs.readFileSync(SRC, 'utf8');

// 2. Strip frontmatter
raw = raw.replace(/^---[\s\S]*?---\n+/, '');

// 3. Strip <style>{`…`}</style> blocks (MDX-style inline styles)
raw = raw.replace(/<style>\{`[\s\S]*?`\}<\/style>/g, '');

// 4. Strip <div class="cheat-card"> wrappers (keep inner content)
raw = raw.replace(/<div class="cheat-card">/g, '');
raw = raw.replace(/<\/div>/g, '');

// 5. Convert <span class="maturity-indicator …"> to plain bold
raw = raw.replace(/<span class="maturity-indicator[^"]*">([^<]+)<\/span>/g, '**$1**');

// 6. Trim leading "Tips for printing" footer (everything after the last horizontal rule before "Tips for printing")
const tipsIdx = raw.indexOf('## Tips for printing');
if (tipsIdx > -1) raw = raw.slice(0, tipsIdx).trimEnd();

// 6a. Substitute unicode characters that pdflatex can't handle without xelatex
const UNICODE_FIXES = [
  [/≥/g, '>='],
  [/≤/g, '<='],
  [/≠/g, '!='],
  [/×/g, 'x'],
  [/÷/g, '/'],
  [/→/g, '->'],
  [/←/g, '<-'],
  [/⇒/g, '=>'],
];
for (const [pat, repl] of UNICODE_FIXES) {
  raw = raw.replace(pat, repl);
}

// 7. Split on `## Card N — …` headings into individual cards
const cardHeadingRe = /^## Card (\d+) — (.+)$/gm;
const matches = [...raw.matchAll(cardHeadingRe)];
const cards = [];
for (let i = 0; i < matches.length; i++) {
  const m = matches[i];
  const start = m.index;
  const end = i < matches.length - 1 ? matches[i + 1].index : raw.length;
  // Slice and clean up trailing horizontal-rule separators
  let body = raw.slice(start, end).replace(/\n---\s*$/g, '').trim();
  cards.push({ num: m[1], title: m[2].trim(), body });
}

console.log(`Parsed ${cards.length} cards.`);

// Use pdflatex (default LaTeX in MiKTeX). Avoid mainfont= (xelatex only)
// and avoid raw header-includes (Windows shell escaping is fragile).
const PANDOC_OPTS = [
  '--pdf-engine=pdflatex',
  '-V', 'geometry:a4paper,margin=18mm',
  '-V', 'fontsize=10pt',
  '-V', 'colorlinks=true',
  '-V', 'linkcolor=NavyBlue',
];

function runPandoc(mdPath, pdfPath, title, subtitle) {
  const args = [
    `"${mdPath}"`,
    '-o', `"${pdfPath}"`,
    ...PANDOC_OPTS,
    '--metadata', `title="${title}"`,
  ];
  if (subtitle) args.push('--metadata', `subtitle="${subtitle}"`);
  const cmd = `"${PANDOC}" ${args.join(' ')}`;
  try {
    execSync(cmd, { stdio: 'inherit' });
    const sizeKB = (fs.statSync(pdfPath).size / 1024).toFixed(1);
    console.log(`  Built ${path.basename(pdfPath)} (${sizeKB} KB)`);
  } catch (e) {
    console.error(`  Failed: ${path.basename(pdfPath)}`);
    throw e;
  }
}

// 8. Per-card PDF
const slug = (s) =>
  s.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);

for (const card of cards) {
  const cardSlug = slug(card.title);
  const fileName = `cheat-card-${card.num}-${cardSlug}`;
  const md = path.join(TMP_DIR, `${fileName}.md`);
  const pdf = path.join(OUT_DIR, `${fileName}.pdf`);
  // Strip the original H2 heading; pandoc will use --metadata title for the page title
  const body = card.body.replace(/^## Card \d+ — .+$/m, '').trim();
  fs.writeFileSync(md, body, 'utf8');
  runPandoc(md, pdf, `ADS Cheat Card ${card.num}`, card.title);
}

// 9. Combined PDF (one file, all 5 cards, page break per card)
const combined = cards
  .map((c) => c.body + '\n\n\\newpage\n')
  .join('\n');
const combinedMd = path.join(TMP_DIR, 'cheat-cards-all.md');
const combinedPdf = path.join(OUT_DIR, 'cheat-cards-all.pdf');
fs.writeFileSync(combinedMd, combined, 'utf8');
runPandoc(combinedMd, combinedPdf, 'ADS Cheat Cards', 'All five reference cards');

// 10. Clean up temp
fs.rmSync(TMP_DIR, { recursive: true, force: true });

console.log(`\nAll PDFs written to ${OUT_DIR}`);
console.log('Done.');
