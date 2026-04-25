# Contributing to the Architecture Description Standard

Thank you for considering a contribution. ADS is an open standard (CC BY 4.0 for content, MIT for code) maintained by Andi Chandler. Community contributions are welcome.

## What you can contribute

**Most valuable:**
- **Completed example SADs** covering project types or industries we don't yet have
- **AI prompts** for new review lenses (FinOps, legal, accessibility, clinical safety)
- **Guidance content** — anti-patterns, decision guides, industry mappings
- **Translation improvements** (French, German) or new translations
- **Corrections** — typos, broken links, outdated references

**Also valuable:**
- **Bug reports** for the website or schema
- **Feature ideas** for the standard (via GitHub issue, with rationale)
- **Schema additions** (new enum values, new custom-section patterns)

**Not accepted:**
- Rewrites of the standard structure without prior discussion
- Content that references specific commercial products as mandatory
- Organisation-specific content that does not generalise

## How to contribute

### For small changes (typos, links, clarifications)

Open a pull request directly. Title it `fix: ...` or `docs: ...`. No issue required.

### For new content (examples, guidance, prompts)

1. **Open an issue first** describing what you want to add and why.
2. Wait for a thumbs-up before doing substantial work — this avoids wasted effort.
3. Fork the repository, make your changes on a feature branch.
4. Follow the existing patterns (see below).
5. Open a pull request referencing the issue.

### For schema changes

Schema changes need more care because they affect downstream tooling. Open an issue first describing:
- The field or change proposed
- A use case from a real SAD
- Backward compatibility implications

## Style guide

### Language

- **UK English** throughout (organise, optimisation, licence as noun, colour). The only exceptions are direct quotes from American-English sources (e.g., AWS "Cost Optimization" as a pillar name).
- **Active voice** over passive.
- **Short sentences**. Break up long ones.
- **Present tense** for describing the standard and solutions.

### Markdown conventions

- Headings use sentence case.
- Tables over prose for structured content.
- Code fences (` ``` `) with language identifier (`bash`, `yaml`, `json`).
- Links use the Markdown `[text](url)` form, not bare URLs.

### Terminology

Don't invent new terms for concepts the standard already names. Check the [glossary](https://archstandard.org/v1/standard/7-appendices/#71-glossary). Use:

- **SAD** (Solution Architecture Document), not "design doc"
- **RAID** (Risks, Assumptions, Issues, Dependencies), not "project risks"
- **Documentation Depth** (Minimum / Recommended / Comprehensive), not "maturity levels"
- **Views** not "perspectives"
- **Quality Attributes** not "non-functional requirements" in the structured table sense

### Names in examples

- Use the **Bloggs / Doe** families of fictional names only. Mix of genders.
- Fictional organisations only. No real company names (Meridian Financial Services, NorthWind Retail, Medwick Healthcare, Stellar Engineering are the current fictional names in use).
- No real people's names.

### Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new content or functionality
- `fix:` corrections, typos, bug fixes
- `docs:` documentation changes (includes most standard content)
- `style:` formatting, whitespace
- `refactor:` structural changes without content changes
- `chore:` dependencies, tooling

## Contributing a new example SAD

Examples are the most impactful contributions. To contribute a new example:

1. Pick a project type / industry not already covered.
2. Use a **fictional but realistic** organisation name (not Acme, Contoso — pick something with character).
3. Pick a depth appropriate to the criticality.
4. Create three files:
   - `src/content/docs/examples/your-example.mdx` — the web version with MDX components and Mermaid diagrams
   - `public/examples/your-example.md` — plain Markdown for download
   - `public/examples/your-example.json` — at minimum a schema-conformant summary JSON
5. Wrap the content in `<div class="example-sad">` ... `</div>`
6. Include an "About This Example" guidance box at the top
7. Pattern-match the structure of existing examples (start with `employee-directory.mdx` for simpler examples, `customer-api-platform.mdx` for more complex)
8. Update `src/content/docs/examples/index.mdx` to list your example
9. Run the build locally to verify no errors

## Contributing an AI prompt

AI prompts live in `public/prompts/` and are referenced from `src/content/docs/standard/prompts.mdx`.

1. Pick a review lens not already covered.
2. Start from an existing prompt (e.g. `security-review.md`) and keep the same structure:
   - Title and "How to use" section
   - The full System Prompt under a `---`
   - Scope, what to check, output format, tone, caveats
3. Include realistic output format examples.
4. Update `prompts.mdx` to list the new prompt.

## Contributing a translation

ADS is canonically maintained in **English (UK)**. French and German pages are provided for orientation only — five Tier-1 pages per locale (landing, Quickstart, Cheat Sheet, Why ADS?, Conformance and Usage). Deeper sections, examples, templates, and guidance remain in English, in line with international architecture standard convention (ISO, TOGAF, arc42).

When the standard reaches a stable point (currently planned for v2.0.0), full translations of additional sections will become valuable.

### Before you translate

1. **Read the [Translation Glossary](./docs/translation-glossary.md).** It defines canonical FR/DE equivalents for ADS-specific terms and lists which terms (acronyms, RFC 2119 keywords, framework names) must stay in English.
2. **Translate from a tagged release**, not from `dev` or `main`. The tag `vX.Y.Z-en-canonical` (e.g. `v1.3.0-en-canonical`) marks a stable English baseline. Note the tag in your PR description.
3. **Open an issue first** if you are starting a new locale or a substantial expansion. We may have constraints (Crowdin setup, glossary updates) that affect your approach.

### Tier 1 — orientation pages (active)

These five pages per locale are the current translation surface. PRs welcome:

- `index.mdx` — locale landing page
- `standard/quickstart.mdx`
- `standard/cheat-sheet.mdx`
- `standard/why-ads.mdx`
- `standard/how-to-use.mdx`

Match the structure of the English source. Keep the bilingual notice Aside on the landing page that points readers to the English standard for deeper content.

### Tier 2 — deferred until standard stabilises

Sections 0–7, examples, guidance, templates page, AI prompts, FAQ, downloads, schema reference, version history, framework alignment, design principles. Do not translate these yet — the maintenance cost outweighs the benefit while the standard is still iterating.

### Translation conventions

- Translate from UK English source (organise, optimisation, behaviour, licence-as-noun).
- Keep all acronyms (SAD, HLD, ADR, IAM, WAF, RTO, etc.) in English.
- Keep RFC 2119 keywords (SHALL, SHOULD, MAY, OPTIONAL) in English uppercase.
- Documentation depth values stay as `minimum` / `recommended` / `comprehensive` in schema references; localised words are acceptable in narrative prose.
- For German: never let umlauts get stripped. Run `python scripts/fix-umlauts.py` if you suspect an encoding issue.
- For French: vouvoiement throughout (use *vous*, not *tu*).

### Tooling

If you want to run a translation workflow at scale (e.g., Crowdin, Weblate), open a discussion so we can align on the source-of-truth set-up before you start.

### Translation baseline tags

Each release that is intended as a translation baseline gets a companion tag:

```
v1.3.0          # the release
v1.3.0-en-canonical  # the EN content baseline against which FR/DE were last synced
```

If you contribute a translation, add a note in the file header:

```yaml
---
title: "..."
description: "..."
translatedFromTag: v1.3.0-en-canonical
---
```

This lets future translators see when a page might be due for a re-sync.

## Local development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build the site
npm run build

# Regenerate templates from schema
npm run generate:templates

# Validate the site
npm run validate

# Full publish workflow (validates, regenerates, builds, commits, pushes)
./scripts/publish.sh "your commit message"
```

## Questions

- **General questions** → Open a [GitHub Discussion](https://github.com/andibing/archstandard/discussions)
- **Bug reports** → Open a [GitHub Issue](https://github.com/andibing/archstandard/issues)
- **Sensitive issues** (security vulnerabilities) → Email the maintainer directly via the contact on [andi.me](https://andi.me/)

## Code of Conduct

This project follows a simple principle: **be respectful, stay on-topic, assume good faith**. See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for the full text.

## Licence

By contributing, you agree that your contributions will be licensed under:
- **CC BY 4.0** for content (MDX pages, templates, schema, examples, guidance)
- **MIT** for code (JavaScript, CSS, Astro config, build scripts)

You retain copyright to your contributions; the licence is non-exclusive.
