# SAD Builder Website — Product Specification

**Author:** Andi Chandler
**Version:** 0.1 (Draft)
**Date:** 2026-04-05
**Related:** ADS v1.1.0 (archstandard.org)

---

## 1. Purpose

A web application that guides users through completing a Solution Architecture Document (SAD) conforming to the Architecture Description Standard (ADS). It removes the blank-page problem by providing a step-by-step form-based interface backed by the ADS JSON Schema.

## 2. Problem Statement

Even with templates and examples, architects face friction when starting a SAD:
- Markdown/YAML templates require technical familiarity
- The full standard has many sections — it is not obvious where to start or what to skip
- There is no way to save progress, collaborate, or track completeness
- Governance teams cannot easily audit or compare SADs across a portfolio

## 3. Target Users

| User | Need |
|------|------|
| **Solution Architects** | Complete a SAD quickly with guided prompts and validation |
| **Enterprise Architects** | Review and compare SADs across a portfolio |
| **Architecture Governance** | Audit completeness, score compliance, track coverage |
| **AI/Tooling** | Import/export structured SADs for analysis |

## 4. Core Features

### 4.1 Guided SAD Completion

- Step-by-step wizard grouped by section (Document Control → Executive Summary → Views → Quality Attributes → Lifecycle → Governance → Appendices)
- Each field rendered as the appropriate form control:
  - `enum` → dropdown
  - `boolean` → toggle/checkbox
  - `yesNoNa` → tri-state radio
  - `riskLevel` → colour-coded dropdown
  - `string` → text input or textarea
  - `integer`/`number` → numeric input
  - `array of objects` → repeatable row (add/remove)
- Documentation depth selector (Minimum / Recommended / Comprehensive) — hides sections above the selected depth
- Inline guidance from the standard (pulled from `description` fields in the schema and `x-ads-depth` metadata)
- Progress indicator showing percentage complete per section and overall

### 4.2 AI-Assisted Drafting

- "Generate from brief" button — user enters a 1-2 paragraph project description, the app sends it with the JSON Schema to an LLM, and populates the form with a structured first draft
- "Suggest improvements" button per section — sends the current section content to an LLM for gap analysis
- "Explain this field" — contextual AI help for any field
- LLM provider: configurable (OpenAI, Anthropic, Azure OpenAI, or bring-your-own API key)

### 4.3 Import / Export

| Format | Import | Export |
|--------|--------|--------|
| JSON | Yes | Yes |
| YAML | Yes | Yes |
| Markdown | No (lossy) | Yes |
| Word (DOCX) | No | Yes |
| ODF (ODT) | No | Yes |
| PDF | No | Yes |

- Import: load an existing SAD (JSON/YAML) to continue editing
- Export: generate a complete SAD in any format
- Schema validation on import and export
- Clipboard copy (Markdown) for pasting into Confluence/wiki

### 4.4 Compliance Scoring

- Auto-score based on field completeness (0-5 per section)
- Manual override for governance reviewers
- Visual dashboard showing scores per section with colour coding
- Weakest-link overall score (lowest section score, not average)
- Export scoring summary as part of the SAD

### 4.5 Best Practice Guidance

The builder should actively guide architects towards best practice, not just validate structural completeness. This goes beyond schema validation (which checks "is this field filled in?") to contextual intelligence (which checks "does this make sense?").

#### Completeness Prompts

When a section has no entries or suspiciously few, prompt the architect:

| Section | Prompt When Empty |
|---------|------------------|
| Risks (6.3) | "No risks identified. Common risks include vendor lock-in, skill gaps, integration complexity, and performance under load. Are you sure?" |
| Assumptions (6.2) | "No assumptions documented. Consider: API availability, team capacity, third-party timelines, data quality." |
| Dependencies (6.4) | "No dependencies listed. Does this solution depend on any other systems, teams, or vendors?" |
| Constraints (6.1) | "No constraints recorded. Consider: budget, regulatory, technology mandates, delivery deadlines." |
| Out of Scope (1.4) | "Nothing listed as out of scope. Defining boundaries prevents scope creep." |

#### Consistency Checks

Flag logical inconsistencies between sections:

| Check | Condition | Warning |
|-------|-----------|---------|
| **RTO without DR** | RTO target defined but DR strategy is "None" | "You have an RTO target but no DR strategy. How will you recover within the target?" |
| **PII without encryption** | Data stores contain PII but encryption is "None" | "Personal data is stored without encryption. This is likely a compliance risk." |
| **Internet-facing without WAF** | Internet-facing is Yes but WAF is No | "Internet-facing applications typically require a Web Application Firewall." |
| **High criticality, low depth** | Business criticality is Tier 1/2 but documentation depth is Minimum | "Critical systems typically require Recommended or Comprehensive documentation depth." |
| **No authentication** | Security view has no authentication method | "No authentication method specified. Is this intentionally unauthenticated?" |
| **Cloud without exit plan** | Cloud hosting selected but exit plan not documented | "Cloud-hosted solutions should document an exit strategy to avoid vendor lock-in." |
| **No backup for production data** | Data stores exist but backup is not enabled | "Production data stores typically require a backup strategy." |

#### Scoring Recommendations

When a section scores below 3, show specific recommendations:

| Section | Score < 3 | Recommendation |
|---------|-----------|---------------|
| Security View | Missing threat model, incomplete authentication | "Add a threat model. Document authentication for all access types. Specify encryption at rest and in transit." |
| Performance | No targets defined | "Define response time, throughput, and concurrency targets. Add growth projections." |
| Lifecycle | No CI/CD documented | "Document the deployment pipeline, release frequency, and support model." |

#### Implementation Approach

Best practice rules are defined as a separate JSON configuration file, not hardcoded:

```json
{
  "rules": [
    {
      "id": "BP-001",
      "name": "Risks should not be empty",
      "section": "riskGovernance.risks",
      "condition": "empty",
      "severity": "warning",
      "message": "No risks identified. Common risks include..."
    },
    {
      "id": "BP-002",
      "name": "PII requires encryption",
      "condition": "dataView.dataStores[].containsPersonalData == true AND dataView.dataStores[].encryptionLevel == 'none'",
      "severity": "error",
      "message": "Personal data stored without encryption."
    }
  ]
}
```

This allows organisations to add their own best practice rules without modifying the builder code.

### 4.6 Portfolio View (future)

- Organisation-level dashboard showing all SADs
- Compare SADs: side-by-side field comparison
- Coverage heatmap: which sections are commonly incomplete
- Technology radar: aggregate technology choices across SADs
- Risk register: aggregate risks across the portfolio

### 4.6 Collaboration (future)

- Multi-user editing with role-based access (Author, Reviewer, Approver)
- Comments and review threads per section
- Approval workflow (Draft → In Review → Approved)
- Version history with diff view

## 5. Technical Architecture

### 5.1 Frontend

| Choice | Rationale |
|--------|-----------|
| **React / Next.js** | Widely adopted, strong form libraries, SSR for SEO |
| **TypeScript** | Type safety, schema-driven development |
| **Form library** | react-hook-form or Formik — handles dynamic forms well |
| **UI framework** | shadcn/ui or Radix — accessible, composable components |

### 5.2 Schema-Driven Forms

The app does NOT hardcode sections or fields. It reads the ADS JSON Schema at runtime and dynamically generates the form:

```
ADS JSON Schema (hosted at archstandard.org)
        |
        v
  Schema parser
        |
        v
  Dynamic form renderer
        |
        v
  User fills in fields
        |
        v
  Validated JSON output
        |
        v
  Export to any format
```

This means:
- When the standard is updated, the builder automatically reflects the changes
- No code changes needed for new fields or sections
- The `x-ads-section`, `x-ads-title`, and `x-ads-depth` metadata drive the UI grouping and labels

### 5.3 Backend

| Option | Pros | Cons |
|--------|------|------|
| **Serverless (Cloudflare Workers / AWS Lambda)** | No infrastructure to manage, scales automatically, low cost | Cold starts, limited runtime |
| **Node.js API (Express/Fastify)** | Full control, easy to develop | Needs hosting, scaling |
| **No backend (client-only)** | Simplest, no server costs, privacy-preserving | No collaboration, no portfolio view, no server-side AI |

**Recommendation:** Start with **client-only** (Phase 1). All data stays in the browser (localStorage or IndexedDB). Export to files. Add a backend in Phase 2 for collaboration and portfolio features.

### 5.4 AI Integration

```
User brief → App → LLM API → Structured JSON → Form populated
                     |
                     v
              ADS JSON Schema (as system prompt context)
```

- The schema is sent as context with every AI request
- The LLM generates JSON conforming to the schema
- The app validates the output before populating the form
- API key management: user provides their own key (stored in browser only)

### 5.5 Data Storage

**Phase 1 (client-only):**
- IndexedDB for in-progress SADs
- File export for persistence
- No accounts, no server storage

**Phase 2 (with backend):**
- PostgreSQL or Supabase for SAD storage
- Authentication (OAuth via GitHub, Google, or Microsoft)
- Organisation/team scoping

## 6. Schema Integration

The builder reads the schema from:
```
https://archstandard.org/schema/v1.0.0/ads.schema.json
```

Key schema features the builder uses:

| Schema Feature | Builder Use |
|----------------|------------|
| `x-ads-section` | Groups fields into wizard steps |
| `x-ads-title` | Section headings in the UI |
| `x-ads-depth` | Shows/hides fields based on selected depth |
| `enum` | Renders dropdowns with defined options |
| `type: boolean` | Renders checkboxes/toggles |
| `required` | Marks mandatory fields, drives completeness scoring |
| `description` | Inline help text for each field |
| `$ref` | Resolves shared definitions (riskLevel, yesNoNa, etc.) |
| `items` (array) | Renders repeatable rows with add/remove |
| `pattern` | Client-side validation (version numbers, IDs) |

## 7. Phased Delivery

### Phase 1: MVP (client-only SAD builder)
- Schema-driven form wizard
- Documentation depth selector
- Import JSON/YAML
- Export JSON, YAML, Markdown, DOCX
- Auto-scoring
- AI draft generation (BYOK)
- No accounts, no server
- **Target:** 4-6 weeks

### Phase 2: Collaboration
- User accounts (OAuth)
- Server-side SAD storage
- Multi-user editing
- Comments and review
- Approval workflow
- **Target:** Phase 1 + 6-8 weeks

### Phase 3: Portfolio
- Organisation dashboard
- SAD comparison
- Coverage heatmap
- Technology radar
- Risk aggregation
- **Target:** Phase 2 + 8-12 weeks

## 8. Hosting

| Option | Recommendation |
|--------|---------------|
| **Phase 1** | Cloudflare Pages (same as archstandard.org) — static SPA, no server needed |
| **Phase 2+** | Cloudflare Pages + Workers (API) or Supabase (managed backend) |

**Domain:** `builder.archstandard.org` or `app.archstandard.org`

## 9. Relationship to archstandard.org

| archstandard.org | builder.archstandard.org |
|-----------------|------------------------|
| The standard itself (reference documentation) | A tool for producing SADs |
| Read-only | Interactive |
| Templates for download | Guided form completion |
| JSON Schema as a file | JSON Schema as a live form engine |
| Examples as reference | Examples as pre-filled starting points |

The builder links back to archstandard.org for guidance on each section. The "Explain this section" button opens the relevant standard page.

## 10. Success Metrics

| Metric | Target |
|--------|--------|
| Time to complete a Minimum SAD | Under 30 minutes |
| Time to complete a Recommended SAD | Under 2 hours |
| Export validation pass rate | 100% (all exports conform to schema) |
| AI draft acceptance rate | Over 60% of generated fields kept by user |
| Monthly active users (Phase 1) | 100+ |

## 11. Open Questions

1. Should the builder be open-source (like the standard) or a commercial product?
2. Should AI features require a subscription, or is BYOK (bring your own API key) sufficient?
3. Should the portfolio view be a separate product aimed at enterprise governance teams?
4. Should the builder support custom organisation profiles (mapping to internal tools/standards)?
5. What is the data residency model? (Client-only Phase 1 avoids this entirely)
