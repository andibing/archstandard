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
