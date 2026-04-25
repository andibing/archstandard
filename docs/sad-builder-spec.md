# SAD Builder Specification

**Specification ID:** ADS-BUILDER-SPEC v0.2
**Author:** Andi Chandler
**Date:** 2026-04-25
**Conforms to:** ADS v1.3.0 (https://archstandard.org/v1/)
**Status:** Draft — open for community feedback

> This is a **specification for tooling**, not a product roadmap. It defines the
> required, recommended, and optional capabilities of a tool that helps users
> author Solution Architecture Documents (SADs) conforming to the Architecture
> Description Standard (ADS). Anyone may build a tool — open source, commercial,
> or internal — that conforms to this specification.

---

## 1. Purpose

This specification defines what it means for a software tool to be an
**ADS-conformant SAD Builder**. A conforming tool guides its users through
producing a SAD whose output validates against the ADS JSON Schema and respects
the standard's documentation depth model.

The goal is interoperability: a SAD produced by any conforming builder MUST be
loadable, viewable, and editable by any other conforming builder.

## 2. Terminology

The key words **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **MAY**, and
**OPTIONAL** in this specification are to be interpreted as described in
[RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and
[RFC 8174](https://www.rfc-editor.org/rfc/rfc8174).

| Term | Meaning |
|------|---------|
| **SAD** | Solution Architecture Document — a document conforming to ADS |
| **Builder** | A software tool that helps a user produce a SAD |
| **Schema** | The ADS JSON Schema published at `https://archstandard.org/schema/v1.0.0/ads.schema.json` |
| **Documentation depth** | One of `minimum`, `recommended`, or `comprehensive` (see ADS Section 1) |
| **Section** | A top-level or sub-level grouping in the schema, identified by `x-ads-section` |
| **Field** | A leaf property in the schema (string, enum, boolean, etc.) |

## 3. Conformance Levels

A builder MAY claim conformance at one of three levels. A higher level implies
all requirements of the levels below it.

### 3.1 Level 1 — Basic Conformance

A Level 1 builder SHALL:

1. Load the ADS JSON Schema at runtime (or embed a versioned copy)
2. Render input controls for every field present at the **Minimum** documentation depth
3. Validate user input against the schema's `type`, `enum`, `pattern`, and `required` constraints before export
4. Export a valid JSON document that conforms to the schema
5. Display the schema version and ADS version it targets
6. Display attribution to ADS in user-facing UI (see §11)

A Level 1 builder MAY ignore comprehensive-depth fields, custom sections, and
the organisation profile.

### 3.2 Level 2 — Standard Conformance

A Level 2 builder SHALL meet Level 1 and additionally:

1. Support all three documentation depths (`minimum`, `recommended`, `comprehensive`) with a user-selectable depth control that hides fields above the selected depth
2. Render input controls for every field at every depth (including `customSections` and `organisationProfile`)
3. Import a valid SAD (JSON) and round-trip it without data loss
4. Export Markdown in addition to JSON, with a deterministic structure suitable for diff and review
5. Compute a per-section completeness indicator
6. Validate cross-field references (e.g., `qualityAttributeRefs`) against the document being authored

### 3.3 Level 3 — Full Conformance

A Level 3 builder SHALL meet Level 2 and additionally:

1. Implement compliance scoring as defined in §8
2. Support a pluggable best-practice rule engine (§9)
3. Support YAML import and export
4. Support at least one document format export beyond JSON/YAML/Markdown (DOCX, ODT, or PDF)
5. Preserve unknown extension properties (`x-*`) and `customSections` content on round-trip

## 4. Schema as the Source of Truth

A builder SHALL NOT hardcode section names, field names, enumerations, or
field ordering that are present in the schema. Instead, it SHALL derive them by
reading the schema at build time or runtime.

### 4.1 Schema Loading

A builder SHALL fetch the schema from one of:

- The canonical published URL: `https://archstandard.org/schema/v1.0.0/ads.schema.json`
- A user-supplied URL (for forks or internal mirrors)
- An embedded copy whose version SHALL be displayed in the UI

A builder SHOULD support multiple schema versions concurrently to allow editing
documents authored against an older version.

### 4.2 Schema Extensions Used by Builders

The schema includes the following non-standard extension properties (prefixed
`x-ads-`). A builder SHALL respect them where present:

| Extension | Purpose | Builder behaviour |
|-----------|---------|-------------------|
| `x-ads-section` | Section number, e.g. `"3.1"` | Group fields into wizard steps and headings |
| `x-ads-title` | Display name, e.g. `"Logical View"` | Section heading in the UI |
| `x-ads-depth` | One of `minimum`, `recommended`, `comprehensive` | Show/hide based on selected depth |

Future ADS releases MAY add further `x-ads-*` extensions. A builder SHOULD
ignore unknown `x-*` properties without error.

## 5. Form Rendering

When generating UI controls from the schema, a builder SHALL apply the
following mapping. Implementations MAY choose any visual presentation
consistent with accessibility guidelines.

| Schema construct | UI control |
|------------------|------------|
| `type: string` (no `enum`) | Single-line text input |
| `type: string` with `format: textarea` or `description` exceeding 200 chars | Multi-line text area |
| `type: string` with `enum` | Dropdown / select |
| `type: string` with `pattern` | Text input with client-side validation |
| `$ref: "#/$defs/yesNoNa"` | Tri-state radio group: Yes / No / N/A |
| `$ref: "#/$defs/riskLevel"` | Coloured dropdown: Low / Medium / High / Critical |
| `type: boolean` | Toggle or checkbox |
| `type: integer` / `type: number` | Numeric input with `minimum`/`maximum` if defined |
| `type: array` of objects | Repeatable rows with add/remove controls |
| `type: array` of primitives | Tag input or comma-separated text input |
| `type: object` | Nested field group with collapsible header |

A builder SHALL display the schema's `description` text as inline help for each
field. A builder SHOULD display `examples` from the schema as placeholder text
or a "fill with example" affordance.

## 6. Documentation Depth Behaviour

A Level 2+ builder SHALL provide a user-visible depth selector with the values
`minimum`, `recommended`, and `comprehensive`.

When a depth is selected:

- Fields tagged `x-ads-depth: minimum` SHALL be visible at all selected depths
- Fields tagged `x-ads-depth: recommended` SHALL be visible only when the selected depth is `recommended` or `comprehensive`
- Fields tagged `x-ads-depth: comprehensive` SHALL be visible only when the selected depth is `comprehensive`

A builder SHOULD warn the user if they switch to a lower depth and would lose
visibility (but not data) of already-completed fields.

A builder SHALL NOT delete data when the user switches depth. Hidden fields
SHALL be preserved on export.

## 7. Validation

A builder SHALL validate documents against the JSON Schema before export. A
builder SHOULD validate continuously during editing (per-field or per-section)
and surface errors near the offending field.

A builder SHALL support, at minimum, validation against:

- `type` constraints
- `enum` constraints
- `pattern` constraints (regex)
- `required` constraints
- `minLength` / `maxLength`
- `minimum` / `maximum`

A builder SHOULD additionally validate:

- Cross-field references (e.g., a `qualityAttributeRefs` value matches an existing quality attribute)
- Unique identifiers within arrays where the schema defines them
- Date format conformance for date fields

## 8. Compliance Scoring (Level 3)

A Level 3 builder SHALL compute a 0–5 compliance score for each scorable
section listed in ADS Section 7 ("Architecture Compliance Scoring").

### 8.1 Auto-Score Formula

Auto-scoring is a baseline; reviewers SHOULD be able to override per-section
scores with a justification.

The reference auto-score formula for a section:

```
Let R = number of required fields in the section at the selected depth
Let O = number of optional fields in the section at the selected depth
Let r = number of required fields completed
Let o = number of optional fields completed

If R > 0 and r < R:        score = floor((r / R) * 2)        // 0, 1, or 2
Else if r == R and o == 0: score = 3                          // all required, no optional present
Else:                       score = 3 + floor((o / O) * 2)   // 3, 4, or 5
```

A score of **5** SHOULD additionally require evidence references (links,
attached documents) where the schema permits them.

### 8.2 Overall Score

The overall score for a SAD SHALL be computed as the **lowest individual
section score** (weakest-link principle), not the average. This matches ADS
governance guidance.

A builder MAY display both the weakest-link score and an indicative average
for transparency, but the weakest-link score is normative.

## 9. Best-Practice Rule Engine (Level 3)

A Level 3 builder SHALL support a pluggable rule engine that evaluates a
document against rules expressed in a declarative format. This enables
organisations to add their own rules without modifying the builder.

### 9.1 Rule File Format

Rules SHALL be loadable from a JSON file conforming to the following structure:

```json
{
  "ruleSetId": "ads-default-rules",
  "ruleSetVersion": "1.0.0",
  "appliesToSchema": "https://archstandard.org/schema/v1.0.0/ads.schema.json",
  "rules": [
    {
      "id": "BP-001",
      "name": "Risks should not be empty",
      "section": "riskGovernance.risks",
      "condition": "empty",
      "severity": "warning",
      "message": "No risks identified. Common risks include vendor lock-in, skill gaps, integration complexity, and performance under load."
    },
    {
      "id": "BP-002",
      "name": "PII requires encryption",
      "condition": "any(dataView.dataStores, store => store.containsPersonalData == true && store.encryptionLevel == 'none')",
      "severity": "error",
      "message": "Personal data is stored without encryption. This is likely a compliance risk."
    }
  ]
}
```

### 9.2 Severity Levels

| Severity | Effect |
|----------|--------|
| `info` | Informational only; does not affect score or block export |
| `warning` | Surfaced to the user; SHOULD be acknowledged but does not block export |
| `error` | Surfaced to the user; SHOULD reduce relevant section score; MAY block export depending on builder configuration |

### 9.3 Reference Rule Set

A reference rule set covering common architectural concerns (Annex A) SHOULD
ship with any Level 3 builder. The rule set published alongside this
specification is non-normative and MAY be replaced or extended by
implementations.

### 9.4 Condition Expression Language

A builder MAY define its own expression language for rule conditions. The
language SHOULD support, at minimum:

- Property access by dotted path (`dataView.dataStores`)
- Equality and inequality (`==`, `!=`)
- Logical operators (`&&`, `||`, `!`)
- Quantifiers over arrays (`any`, `all`, `count`)
- The keyword `empty` as a shorthand for "no entries / null / empty string"

This specification does not mandate a specific language. Implementations
SHOULD document their language in user-facing documentation.

## 10. Import and Export

### 10.1 Required Formats

| Format | Level 1 | Level 2 | Level 3 |
|--------|:-------:|:-------:|:-------:|
| JSON import | SHALL | SHALL | SHALL |
| JSON export | SHALL | SHALL | SHALL |
| YAML import | MAY | SHOULD | SHALL |
| YAML export | MAY | SHOULD | SHALL |
| Markdown export | MAY | SHALL | SHALL |
| DOCX / ODT / PDF export | MAY | MAY | SHALL (at least one) |

### 10.2 Round-Trip Requirements

A Level 2+ builder SHALL preserve all data on JSON round-trip, including:

- Unknown extension properties (`x-*`)
- `customSections` content
- `organisationProfile` content
- Field ordering within objects (where the schema is order-sensitive)

A builder MAY normalise whitespace, key ordering within objects (where order
is not significant), and date formats on export.

### 10.3 Markdown Export Structure

Markdown export SHALL:

- Emit one section per ADS top-level section, using `##` for sections and `###` for sub-sections
- Use the `x-ads-section` number prefix in headings (e.g., `## 3.1 Logical View`)
- Render tabular data as Markdown tables
- Include the SAD metadata as a key-value table near the top
- Preserve `customSections` content with their declared `parentSection` placement

Markdown export SHOULD produce deterministic output (same input → same bytes)
to support diff-based review.

## 11. Attribution and Branding

The Architecture Description Standard is licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The JSON Schema is
licensed under the same terms.

A builder SHALL:

1. Display attribution to ADS in user-facing UI — e.g., "Built on the Architecture Description Standard (https://archstandard.org)"
2. Display the schema version and ADS version targeted
3. Not imply official endorsement by the ADS author or ArchStandard unless explicitly granted

A builder MAY:

1. Use the term "ADS-conformant" if it meets the requirements of §3
2. Include a phrase such as "ADS Level 1 conformant", "ADS Level 2 conformant", or "ADS Level 3 conformant"

A builder SHALL NOT:

1. Use the ADS logo without permission
2. Modify the schema and continue to claim conformance to the unmodified standard. Forks SHALL clearly indicate they target a derivative schema

## 12. Versioning and Compatibility

The schema follows semantic versioning. Breaking changes increment the major
version; additive changes increment the minor version.

A builder SHOULD:

- Display the schema version with which a SAD was authored
- Refuse (or warn loudly) when loading a SAD authored against an incompatible major version
- Permit loading SADs authored against the same major version with newer minor versions, ignoring unknown fields gracefully

A builder MAY support multiple schema versions concurrently and let the user
choose which to author against.

## 13. Accessibility and Internationalisation

A builder SHOULD:

- Meet WCAG 2.1 Level AA conformance
- Support keyboard-only navigation through all form controls
- Provide accessible labels (programmatically associated) for every input
- Support screen readers for the wizard navigation, error messages, and validation summaries
- Offer the user a choice of UI language where translations exist
- Render UI text from a translation catalogue, not hardcoded strings

The ADS standard is available in English, French, and German at v1.3.0.
Builders SHOULD support these languages where translations of `description`,
`x-ads-title`, and other user-facing schema strings are available.

## 14. AI Assistance (non-normative)

A builder MAY integrate with large language models (LLMs) to assist authoring.
This specification does not mandate AI features, but where present they SHOULD
follow these principles:

- The schema SHALL be passed to the model as part of the system context so the
  model produces structured output
- Generated content SHALL be validated against the schema before being inserted
  into the document
- The user SHALL retain editorial control — AI-generated text is a draft, not a
  commitment
- Any data sent to a third-party model SHALL be disclosed to the user before
  the request, including which provider receives the data
- The builder SHOULD support "bring your own key" so users can choose their
  provider rather than being locked to one

## 15. Reference Implementation (non-normative)

Implementers MAY find the following technology choices useful as a starting
point. None are normative — any technology stack that meets §3–§13 is
conformant.

| Concern | Possible choice |
|---------|----------------|
| Frontend framework | React, Vue, Svelte, Solid, vanilla web components |
| Form library | react-hook-form, Formik, Tanstack Form, Felte |
| Schema parser | ajv (JS), jsonschema (Python), networknt/json-schema-validator (Java), gojsonschema (Go) |
| Document generation | Pandoc for Markdown→DOCX/ODT/PDF; docx (JS) for DOCX; jsPDF for PDF |
| Storage (Phase 1) | Browser IndexedDB or localStorage |
| Storage (Phase 2) | PostgreSQL, Supabase, Cloudflare D1, or any database |
| Hosting | Cloudflare Pages, Netlify, Vercel, GitHub Pages, self-hosted |

A reference rule set (Annex A) and a reference Markdown export format
specification (Annex B) accompany this document.

## 16. Open Questions for the Community

The following are explicitly open and will be resolved by community feedback
before this specification reaches v1.0.0:

1. Should compliance scoring (§8) be normative or remain a reference algorithm with implementations free to deviate?
2. Should the rule engine condition language (§9.4) be standardised across implementations to enable rule portability?
3. Should there be a formal conformance test suite published alongside this specification?
4. Should "ADS-conformant" be a protected mark with self-declared certification, or is the honour system sufficient?
5. Should this specification mandate any specific AI safety requirements beyond §14?

Comments and proposals are welcomed via
[GitHub Issues on the archstandard repository](https://github.com/andibing/archstandard/issues).

## 17. Change Log

| Version | Date | Change |
|---------|------|--------|
| 0.2 | 2026-04-25 | Restructured as a third-party-implementable specification. Added conformance levels, RFC 2119 keywords, attribution requirements, accessibility requirements. Removed product-specific roadmap content. |
| 0.1 | 2026-04-05 | Initial draft as a single-product roadmap. |

---

## Annex A — Reference Best-Practice Rule Set (non-normative)

The following rules are suggested for a default rule set. Implementations SHOULD
treat them as a starting point, not as required content.

### Completeness Prompts

| Rule ID | Section | Condition | Severity | Message |
|---------|---------|-----------|----------|---------|
| BP-101 | `riskGovernance.risks` | `empty` | warning | "No risks identified. Common risks include vendor lock-in, skill gaps, integration complexity, and performance under load. Are you sure?" |
| BP-102 | `riskGovernance.assumptions` | `empty` | warning | "No assumptions documented. Consider: API availability, team capacity, third-party timelines, data quality." |
| BP-103 | `riskGovernance.dependencies` | `empty` | warning | "No dependencies listed. Does this solution depend on any other systems, teams, or vendors?" |
| BP-104 | `riskGovernance.constraints` | `empty` | warning | "No constraints recorded. Consider: budget, regulatory, technology mandates, delivery deadlines." |
| BP-105 | `executiveSummary.scope.outOfScope` | `empty` | warning | "Nothing listed as out of scope. Defining boundaries prevents scope creep." |

### Consistency Checks

| Rule ID | Condition | Severity | Message |
|---------|-----------|----------|---------|
| BP-201 | `qualityAttributes.reliability.rto` defined && `qualityAttributes.reliability.disasterRecoveryStrategy == 'none'` | error | "You have an RTO target but no DR strategy. How will you recover within the target?" |
| BP-202 | `any(dataView.dataStores, s => s.containsPersonalData && s.encryptionLevel == 'none')` | error | "Personal data is stored without encryption. This is likely a compliance risk." |
| BP-203 | `architecturalViews.physicalView.internetFacing == true && securityView.wafEnabled == false` | warning | "Internet-facing applications typically require a Web Application Firewall." |
| BP-204 | `executiveSummary.businessCriticality in ['tier-1','tier-2'] && documentControl.metadata.documentationDepth == 'minimum'` | warning | "Critical systems typically require Recommended or Comprehensive documentation depth." |
| BP-205 | `securityView.authenticationMethods` is `empty` | error | "No authentication method specified. Is this intentionally unauthenticated?" |
| BP-206 | `physicalView.hostingModel == 'cloud' && lifecycleManagement.exitPlan` is `empty` | warning | "Cloud-hosted solutions should document an exit strategy to avoid vendor lock-in." |
| BP-207 | `dataView.dataStores` is non-empty && `any(dataView.dataStores, s => s.backupEnabled == false)` | warning | "Production data stores typically require a backup strategy." |

### Scoring Recommendations

| Rule ID | Section | Condition | Severity | Message |
|---------|---------|-----------|----------|---------|
| BP-301 | `architecturalViews.securityView` | score < 3 | info | "Add a threat model. Document authentication for all access types. Specify encryption at rest and in transit." |
| BP-302 | `qualityAttributes.performance` | score < 3 | info | "Define response time, throughput, and concurrency targets. Add growth projections." |
| BP-303 | `lifecycleManagement` | score < 3 | info | "Document the deployment pipeline, release frequency, and support model." |

The exact paths shown above target the v1.0.0 schema. Implementers SHOULD
adjust paths if targeting a different schema version.

## Annex B — Markdown Export Reference Format (non-normative)

A conformant Markdown export should follow this structure to maximise
interoperability:

```markdown
# Solution Architecture Document — {{ solutionName }}

| Field | Value |
|-------|-------|
| Author | {{ author }} |
| Version | {{ version }} |
| Status | {{ status }} |
| Classification | {{ classification }} |
| ADS Version | {{ adsVersion }} |
| Documentation Depth | {{ depth }} |

## 0. Document Control
...

## 1. Executive Summary
...

## 2. Stakeholders & Concerns
...

## 3. Architectural Views

### 3.1 Logical View
...

### 3.2 Integration & Data Flow
...

[and so on for 3.3 through 3.6]

## 4. Quality Attributes
...

## 5. Lifecycle Management
...

## 6. Decision Making & Governance
...

## 7. Appendices
...
```

A builder MAY interleave its own commentary, but interleaved content SHOULD be
clearly demarcated (e.g., as a blockquote labelled "Builder note") so that
re-importing the Markdown does not pollute the structured document.
