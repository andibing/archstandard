# ADS Translation Glossary

A reference for translators: canonical French and German equivalents for ADS-specific terms, plus rules for which terms should be kept in English.

**Status:** Living document. Pull requests welcome from native speakers.

---

## Translation principles

1. **Acronyms stay in English.** SAD, HLD, ADR, RAID, IAM, WAF, RTO, RPO, SLO, SLA, TCO, ARB, etc. Architectural English acronyms are international standard usage and translating them confuses readers familiar with the concepts.

2. **Cloud provider terms stay in English.** AWS Well-Architected, Azure Well-Architected, GCP, Oracle Cloud, IBM Cloud, and their pillar names (Operational Excellence, Reliability, Performance Efficiency, Cost Optimization, Sustainability) — these are product/framework names with specific meaning.

3. **RFC 2119 keywords stay in English** uppercase: **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **MAY**, **OPTIONAL**. Translating them would lose the normative force.

4. **Spell out the acronym on first use** in the target language, then use the English acronym. Example in French: *« Le Document d'Architecture de Solution (SAD) ... »*; in German: *„Das Solution Architecture Document (SAD) ..."*.

5. **UK English is the source.** Translate from UK English (organise, optimisation, behaviour, licence-as-noun) — not US English. Some UK-only words have no exact French/German equivalent (e.g., *whilst*) — use idiomatic equivalents.

---

## Core concepts

| English | Français | Deutsch | Notes |
|---------|----------|---------|-------|
| Architecture Description Standard | Standard de description d'architecture | Architekturbeschreibungsstandard | Acronym **ADS** kept in all languages |
| Solution Architecture Document | Document d'architecture de solution | Solution Architecture Document | Acronym **SAD** kept; in DE often left in English |
| High Level Design | Conception de haut niveau | High Level Design | Acronym **HLD** kept; DE typically keeps the English term |
| Architecture Decision Record | Enregistrement de décision d'architecture | Architekturentscheidungsdokument | Acronym **ADR** kept |
| Documentation Depth | Niveau de documentation | Dokumentationstiefe | The three values stay in English: Minimum, Recommended, Comprehensive |
| Compliance Score | Score de conformité | Konformitätsbewertung | Range 0–5 |
| Maturity Level | Niveau de maturité | Reifegrad | Synonym for Documentation Depth in some contexts |
| View / Architectural View | Vue / Vue architecturale | Ansicht / Architekturansicht | |
| Quality Attribute | Attribut de qualité | Qualitätsattribut | Plural: *Attributs de qualité* / *Qualitätsattribute* |
| Stakeholder | Partie prenante | Stakeholder | DE keeps English term (international usage) |
| Concern | Préoccupation | Anliegen | Per ISO 42010 |
| Constraint | Contrainte | Einschränkung | |
| Assumption | Hypothèse | Annahme | |
| Risk | Risque | Risiko | |
| Dependency | Dépendance | Abhängigkeit | |
| Issue | Problème | Problem | |
| Use Case | Cas d'utilisation | Anwendungsfall | |
| Scenario | Scénario | Szenario | |

## Documentation depth values

These are kept in English to match the schema enums and the RFC 2119 keyword mapping:

| Schema value | English label | Use this in FR text | Use this in DE text |
|--------------|---------------|---------------------|---------------------|
| `minimum` | Minimum | Minimum | Minimum |
| `recommended` | Recommended | Recommended (or *Recommandé* in narrative) | Recommended (or *Empfohlen* in narrative) |
| `comprehensive` | Comprehensive | Comprehensive (or *Complet* in narrative) | Comprehensive (or *Umfassend* in narrative) |

**Rule:** when referring to the schema field, keep the English value. When narrating in FR/DE, the localised word is acceptable in prose.

## Architectural views (Section 3)

| English | Français | Deutsch |
|---------|----------|---------|
| Logical View | Vue logique | Logische Sicht |
| Integration & Data Flow View | Vue intégration et flux de données | Integration und Datenfluss |
| Physical View | Vue physique | Physische Sicht |
| Data View | Vue des données | Datensicht |
| Security View | Vue sécurité | Sicherheitssicht |
| Scenarios | Scénarios | Szenarien |
| Views Overview | Aperçu des vues | Ansichtenübersicht |

## Quality attributes (Section 4)

Section names follow the AWS Well-Architected pillar naming convention (US English) when used as a section heading, with localised descriptions in body text.

| English | Français | Deutsch |
|---------|----------|---------|
| Operational Excellence | Excellence opérationnelle | Operative Exzellenz |
| Reliability & Resilience | Fiabilité et résilience | Zuverlässigkeit und Resilienz |
| Performance Efficiency | Efficacité des performances | Leistungseffizienz |
| Cost Optimisation | Optimisation des coûts | Kostenoptimierung |
| Sustainability | Durabilité | Nachhaltigkeit |

> **Spelling note:** ADS uses UK English *Cost Optimisation* (with `s`) as the section name. AWS, Azure, and GCP use US English *Cost Optimization* (with `z`) as a product/framework name — quote the US spelling when referring to those frameworks specifically.

## Lifecycle and governance

| English | Français | Deutsch |
|---------|----------|---------|
| Lifecycle Management | Gestion du cycle de vie | Lebenszyklusmanagement |
| Development Lifecycle | Cycle de vie du développement | Entwicklungslebenszyklus |
| Operations | Opérations | Betrieb |
| Exit Plan / Exit Planning | Plan de sortie / Planification de sortie | Ausstiegsplanung |
| Decision Making & Governance | Prise de décision et gouvernance | Entscheidungsfindung und Governance |
| Compliance Traceability | Traçabilité de la conformité | Compliance-Rückverfolgbarkeit |
| Governance Gate | Étape de gouvernance | Governance-Gate |
| Architecture Review Board | Comité de revue d'architecture | Architektur-Prüfungsausschuss |
| Design Authority | Autorité de conception | Design Authority |

## Document parts

| English | Français | Deutsch |
|---------|----------|---------|
| Document Control | Contrôle du document | Dokumentenkontrolle |
| Executive Summary | Résumé exécutif | Zusammenfassung |
| Stakeholders & Concerns | Parties prenantes et préoccupations | Stakeholder und Anliegen |
| Appendices | Annexes | Anhänge |
| Glossary | Glossaire | Glossar |
| References | Références | Referenzen |
| Approvals | Approbations | Freigaben |

## Domain acronyms (keep in English)

These are international IT/architecture terms that should not be translated. Spell out on first use if helpful.

| Acronym | Spelled out (English) | First-use FR | First-use DE |
|---------|----------------------|--------------|--------------|
| API | Application Programming Interface | API (interface de programmation) | API (Programmierschnittstelle) |
| IAM | Identity and Access Management | IAM (gestion des identités et des accès) | IAM (Identitäts- und Zugriffsverwaltung) |
| WAF | Web Application Firewall | WAF (pare-feu d'application Web) | WAF (Web Application Firewall) |
| DDoS | Distributed Denial of Service | DDoS | DDoS |
| DR | Disaster Recovery | DR (reprise après sinistre) | DR (Notfallwiederherstellung) |
| RTO | Recovery Time Objective | RTO (objectif de temps de reprise) | RTO (Wiederherstellungszeit) |
| RPO | Recovery Point Objective | RPO (point de reprise) | RPO (Wiederherstellungspunkt) |
| SLO | Service Level Objective | SLO (objectif de niveau de service) | SLO (Service-Level-Objective) |
| SLA | Service Level Agreement | SLA (accord de niveau de service) | SLA (Service-Level-Agreement) |
| TCO | Total Cost of Ownership | TCO (coût total de possession) | TCO (Gesamtkosten) |
| MTTR | Mean Time To Recovery | MTTR | MTTR |
| MFA | Multi-Factor Authentication | MFA (authentification multifacteur) | MFA (Mehr-Faktor-Authentifizierung) |
| SSO | Single Sign-On | SSO | SSO |
| CI/CD | Continuous Integration / Continuous Delivery | CI/CD | CI/CD |
| FinOps | Financial Operations | FinOps | FinOps |
| OWASP | Open Web Application Security Project | OWASP | OWASP |

## Frequent translation traps

### French

- **« Données »** is plural in French even when treated as singular in English. *"Data is"* → *« Les données sont »*.
- **« Architecte solution »** vs **« architecte de solution »** — both seen; ADS uses *« architecte solution »* (no preposition) as it matches industry usage in France.
- **« Conception »** vs **« design »** — French enterprises increasingly use *« design »* as a loanword. ADS uses *« conception »* in formal text, *« design »* only in compound terms (Design Authority).
- **Capitalisation:** French does not capitalise titles word-by-word. *"Logical View"* → *« Vue logique »*, not *« Vue Logique »*.

### German

- **Stripped umlauts:** never let `ä → a`, `ö → o`, `ü → u`, `ß → ss` slip through. The build pipeline can mangle umlauts during copy-paste; check final output. See `scripts/fix-umlauts.py` for the recovery dictionary.
- **Compound words:** German loves compounds. *"Quality Attribute Reference"* → *„Qualitätsattributreferenz"* (one word), not *„Qualitäts-Attribut-Referenz"* (hyphenated).
- **English loanwords:** modern German IT writing freely uses English loanwords (Cloud, Stakeholder, Container, Pipeline). Don't over-translate. *"Cloud-Anbieter"* is correct; *„Wolkenanbieter"* is not.
- **« Sie » throughout:** ADS addresses readers as *Sie* (formal), not *du* (informal). Match the existing FR (vouvoiement) tone.

## How to extend this glossary

If you encounter a term not listed here while translating:

1. Search this file for the English term first
2. Search [IATE](https://iate.europa.eu) (EU terminology database) for an EU-standard equivalent
3. Search the [Microsoft Language Portal](https://www.microsoft.com/en-us/language) — useful for IT terms specifically
4. Consult ISO 42010 translations if available in your language
5. If still unclear, leave a comment in your PR and the maintainer can decide

When adding a term, keep this file alphabetised within sections.
