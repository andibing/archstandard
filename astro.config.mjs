// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
export default defineConfig({
	site: 'https://archstandard.org',
	base: '/v1',
	integrations: [
		starlight({
			title: 'Architecture Description Standard',
			description: 'ADS: The Architecture Description Standard — defining the structure and content of Solution Architecture Documents.',
			logo: {
				src: './src/assets/ads-logo.svg',
				alt: 'ADS',
			},
			customCss: ['./src/styles/custom.css'],
			favicon: '/favicon.svg',
			credits: false,
			components: {
				Footer: './src/components/overrides/Footer.astro',
			},
			head: [
				{
					tag: 'script',
					attrs: { type: 'module' },
					content: `
						import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
						mermaid.initialize({ startOnLoad: true, theme: 'neutral', securityLevel: 'strict' });
					`,
				},
				{
					tag: 'script',
					attrs: { src: '/v1/scripts/reading-prefs.js', defer: true },
				},
				{
					tag: 'meta',
					attrs: { property: 'og:type', content: 'website' },
				},
				{
					tag: 'meta',
					attrs: { property: 'og:site_name', content: 'Architecture Description Standard' },
				},
				{
					tag: 'meta',
					attrs: { property: 'og:image', content: 'https://archstandard.org/og-image.png' },
				},
				{
					tag: 'meta',
					attrs: { property: 'og:image:width', content: '1200' },
				},
				{
					tag: 'meta',
					attrs: { property: 'og:image:height', content: '630' },
				},
				{
					tag: 'meta',
					attrs: { name: 'twitter:card', content: 'summary_large_image' },
				},
				{
					tag: 'meta',
					attrs: { name: 'twitter:image', content: 'https://archstandard.org/og-image.png' },
				},
				{
					tag: 'meta',
					attrs: { name: 'author', content: 'Andi Chandler' },
				},
			],
			defaultLocale: 'root',
			locales: {
				root: {
					label: 'English',
					lang: 'en',
				},
				fr: {
					label: 'Français',
					lang: 'fr',
				},
				de: {
					label: 'Deutsch',
					lang: 'de',
				},
			},
			sidebar: [
				// Getting Started — only the truly getting-started items
				{
					label: 'Getting Started',
					translations: { fr: 'Pour commencer', de: 'Erste Schritte' },
					items: [
						{ label: 'Quickstart', slug: 'standard/quickstart', translations: { fr: 'Démarrage rapide', de: 'Schnellstart' } },
						{ label: 'Depth Cheat Sheet', slug: 'standard/cheat-sheet', translations: { fr: 'Aide-mémoire', de: 'Spickzettel' } },
					],
				},
				// About ADS — gains Overview and Conformance (both reference reading)
				// Default-expanded so first-time visitors see the full breadth.
				{
					label: 'About ADS',
					translations: { fr: 'À propos de ADS', de: 'Über ADS' },
					collapsed: false,
					items: [
						{ label: 'Overview', slug: 'standard/overview', translations: { fr: 'Aperçu', de: 'Übersicht' } },
						{ label: 'Why ADS?', slug: 'standard/why-ads', translations: { fr: 'Pourquoi ADS ?', de: 'Warum ADS?' } },
						{ label: 'Conformance and Usage', slug: 'standard/how-to-use', translations: { fr: 'Conformité et utilisation', de: 'Konformität und Verwendung' } },
						{ label: 'Framework Alignment', slug: 'standard/framework-alignment', translations: { fr: 'Alignement des cadres', de: 'Framework-Zuordnung' } },
						{ label: 'Design Principles', slug: 'standard/design-principles', translations: { fr: 'Principes de conception', de: 'Designprinzipien' } },
					],
				},
				// Standard sections.
				// Sections 3 and 4 are split across multiple files (one per view / quality attribute).
				// Sections 0, 1, 2, 5, 6, 7 are single files with multiple H2 sub-sections — surfaced
				// as anchor links here so the sidebar reflects the standard's full structure.
				{
					label: '0. Document Control',
					translations: { fr: '0. Contrôle du document', de: '0. Dokumentenkontrolle' },
					items: [
						{ label: 'Section 0 (overview)', slug: 'standard/0-document-control', translations: { fr: 'Section 0 (aperçu)', de: 'Abschnitt 0 (Übersicht)' } },
						{ label: '0.1 Document Metadata', link: '/standard/0-document-control/#01-document-metadata' },
						{ label: '0.2 Change History', link: '/standard/0-document-control/#02-change-history' },
						{ label: '0.3 Contributors & Approvals', link: '/standard/0-document-control/#03-contributors--approvals' },
						{ label: '0.4 Document Purpose & Scope', link: '/standard/0-document-control/#04-document-purpose--scope' },
					],
				},
				{
					label: '1. Executive Summary',
					translations: { fr: '1. Résumé exécutif', de: '1. Zusammenfassung' },
					collapsed: true,
					items: [
						{ label: 'Section 1 (overview)', slug: 'standard/1-executive-summary', translations: { fr: 'Section 1 (aperçu)', de: 'Abschnitt 1 (Übersicht)' } },
						{ label: '1.1 Solution Overview', link: '/standard/1-executive-summary/#11-solution-overview' },
						{ label: '1.2 Business Context & Drivers', link: '/standard/1-executive-summary/#12-business-context--drivers' },
						{ label: '1.3 Strategic Alignment', link: '/standard/1-executive-summary/#13-strategic-alignment' },
						{ label: '1.4 Scope', link: '/standard/1-executive-summary/#14-scope' },
						{ label: '1.5 Current State / As-Is', link: '/standard/1-executive-summary/#15-current-state--as-is-architecture' },
						{ label: '1.6 Key Decisions & Constraints', link: '/standard/1-executive-summary/#16-key-decisions--constraints' },
						{ label: '1.7 Project Details', link: '/standard/1-executive-summary/#17-project-details' },
						{ label: '1.8 Business Criticality', link: '/standard/1-executive-summary/#18-business-criticality' },
					],
				},
				{
					label: '2. Stakeholders & Concerns',
					translations: { fr: '2. Parties prenantes', de: '2. Stakeholder und Anforderungen' },
					items: [
						{ label: 'Section 2 (overview)', slug: 'standard/2-stakeholders', translations: { fr: 'Section 2 (aperçu)', de: 'Abschnitt 2 (Übersicht)' } },
						{ label: '2.1 Stakeholder Register', link: '/standard/2-stakeholders/#21-stakeholder-register' },
						{ label: '2.2 Concerns Matrix', link: '/standard/2-stakeholders/#22-concerns-matrix' },
						{ label: '2.3 Compliance & Regulatory Context', link: '/standard/2-stakeholders/#23-compliance--regulatory-context' },
					],
				},
				{
					label: '3. Architectural Views',
					translations: { fr: '3. Vues architecturales', de: '3. Architekturansichten' },
					items: [
						{ label: 'Views Overview', slug: 'standard/3-views-overview', translations: { fr: 'Aperçu des vues', de: 'Ansichtenübersicht' } },
						{ label: '3.1 Logical View', slug: 'standard/3-1-logical-view', translations: { fr: '3.1 Vue logique', de: '3.1 Logische Sicht' } },
						{ label: '3.2 Integration & Data Flow', slug: 'standard/3-2-process-view', translations: { fr: '3.2 Intégration et flux de données', de: '3.2 Integration und Datenfluss' } },
						{ label: '3.3 Physical View', slug: 'standard/3-3-physical-view', translations: { fr: '3.3 Vue physique', de: '3.3 Physische Sicht' } },
						{ label: '3.4 Data View', slug: 'standard/3-4-data-view', translations: { fr: '3.4 Vue des données', de: '3.4 Datensicht' } },
						{ label: '3.5 Security View', slug: 'standard/3-5-security-view', translations: { fr: '3.5 Vue sécurité', de: '3.5 Sicherheitssicht' } },
						{ label: '3.6 Scenarios', slug: 'standard/3-6-scenarios', translations: { fr: '3.6 Scénarios', de: '3.6 Szenarien' } },
					],
				},
				{
					label: '4. Quality Attributes',
					translations: { fr: '4. Attributs de qualité', de: '4. Qualitätsattribute' },
					items: [
						{ label: 'Overview', slug: 'standard/4-quality-attributes-overview', translations: { fr: 'Aperçu', de: 'Übersicht' } },
						{ label: '4.1 Operational Excellence', slug: 'standard/4-1-operational-excellence', translations: { fr: '4.1 Excellence opérationnelle', de: '4.1 Operative Exzellenz' } },
						{ label: '4.2 Reliability & Resilience', slug: 'standard/4-2-reliability', translations: { fr: '4.2 Fiabilité et résilience', de: '4.2 Zuverlässigkeit und Resilienz' } },
						{ label: '4.3 Performance Efficiency', slug: 'standard/4-3-performance', translations: { fr: '4.3 Efficacité des performances', de: '4.3 Leistungseffizienz' } },
						{ label: '4.4 Cost Optimisation', slug: 'standard/4-4-cost-optimisation', translations: { fr: '4.4 Optimisation des coûts', de: '4.4 Kostenoptimierung' } },
						{ label: '4.5 Sustainability', slug: 'standard/4-5-sustainability', translations: { fr: '4.5 Durabilité', de: '4.5 Nachhaltigkeit' } },
					],
				},
				{
					label: '5. Lifecycle Management',
					translations: { fr: '5. Gestion du cycle de vie', de: '5. Lebenszyklusmanagement' },
					collapsed: true,
					items: [
						{ label: 'Section 5 (overview)', slug: 'standard/5-lifecycle', translations: { fr: 'Section 5 (aperçu)', de: 'Abschnitt 5 (Übersicht)' } },
						{ label: '5.1 Software Development & CI/CD', link: '/standard/5-lifecycle/#51-software-development--cicd' },
						{ label: '5.2 Service Transition & Migration', link: '/standard/5-lifecycle/#52-service-transition--migration' },
						{ label: '5.3 Test Strategy', link: '/standard/5-lifecycle/#53-test-strategy' },
						{ label: '5.4 Release Management', link: '/standard/5-lifecycle/#54-release-management' },
						{ label: '5.5 Operations & Support', link: '/standard/5-lifecycle/#55-operations--support' },
						{ label: '5.6 Resourcing & Skills', link: '/standard/5-lifecycle/#56-resourcing--skills' },
						{ label: '5.7 Service Start', link: '/standard/5-lifecycle/#57-service-start' },
						{ label: '5.8 Maintainability', link: '/standard/5-lifecycle/#58-maintainability' },
						{ label: '5.9 Decommissioning & Legacy Removal', link: '/standard/5-lifecycle/#59-decommissioning--legacy-removal' },
						{ label: '5.10 Exit Planning', link: '/standard/5-lifecycle/#510-exit-planning' },
					],
				},
				{
					label: '6. Decision Making & Governance',
					translations: { fr: '6. Prise de décision et gouvernance', de: '6. Entscheidungsfindung und Governance' },
					collapsed: true,
					items: [
						{ label: 'Section 6 (overview)', slug: 'standard/6-decision-making', translations: { fr: 'Section 6 (aperçu)', de: 'Abschnitt 6 (Übersicht)' } },
						{ label: '6.1 Constraints', link: '/standard/6-decision-making/#61-constraints' },
						{ label: '6.2 Assumptions', link: '/standard/6-decision-making/#62-assumptions' },
						{ label: '6.3 Risks', link: '/standard/6-decision-making/#63-risks' },
						{ label: '6.4 Dependencies', link: '/standard/6-decision-making/#64-dependencies' },
						{ label: '6.5 Issues', link: '/standard/6-decision-making/#65-issues' },
						{ label: '6.6 Technical Debt Register', link: '/standard/6-decision-making/#66-technical-debt-register' },
						{ label: '6.7 Guardrail Exceptions', link: '/standard/6-decision-making/#67-guardrail-exceptions' },
						{ label: '6.8 Architectural Decisions Log', link: '/standard/6-decision-making/#68-architectural-decisions-log' },
						{ label: '6.9 Compliance Traceability', link: '/standard/6-decision-making/#69-compliance-traceability' },
						{ label: '6.10 Approval Sign-Off', link: '/standard/6-decision-making/#610-approval-sign-off' },
					],
				},
				{
					label: '7. Appendices',
					translations: { fr: '7. Annexes', de: '7. Anhänge' },
					items: [
						{ label: 'Section 7 (overview)', slug: 'standard/7-appendices', translations: { fr: 'Section 7 (aperçu)', de: 'Abschnitt 7 (Übersicht)' } },
						{ label: '7.1 Glossary', link: '/standard/7-appendices/#71-glossary' },
						{ label: '7.2 Reference Documents', link: '/standard/7-appendices/#72-reference-documents' },
						{ label: '7.3 Standards & Patterns Referenced', link: '/standard/7-appendices/#73-standards--patterns-referenced' },
					],
				},
				// Examples — adoption-critical, kept here for now
				{
					label: 'Examples',
					translations: { fr: 'Exemples', de: 'Beispiele' },
					collapsed: true,
					items: [
						{ label: 'Example SADs', slug: 'examples', translations: { fr: 'Exemples de SAD', de: 'Beispiel-SADs' } },
						{ label: 'Employee Directory', slug: 'examples/employee-directory', translations: { fr: 'Annuaire des employés', de: 'Mitarbeiterverzeichnis' } },
						{ label: 'Customer API Platform', slug: 'examples/customer-api-platform', translations: { fr: 'Plateforme API client', de: 'Kunden-API-Plattform' } },
						{ label: 'Cloud Migration', slug: 'examples/cloud-migration', translations: { fr: 'Migration cloud', de: 'Cloud-Migration' } },
						{ label: 'NorthWind Retail', slug: 'examples/northwind-retail' },
						{ label: 'Medwick Healthcare', slug: 'examples/medwick-healthcare' },
						{ label: 'Stellar Platform', slug: 'examples/stellar-platform' },
						{ label: 'archstandard.org', slug: 'examples/archstandard-org' },
					],
				},
				// Guidance — Cheat Cards and Pitch promoted to Resources for shareability
				{
					label: 'Guidance',
					translations: { fr: 'Guide', de: 'Anleitung' },
					collapsed: true,
					items: [
						{ label: 'Overview', slug: 'guidance' },
						{ label: 'What Good Looks Like', slug: 'guidance/what-good-looks-like' },
						{ label: 'Anti-Patterns', slug: 'guidance/anti-patterns' },
						{ label: 'Decision Guides', slug: 'guidance/decision-guides' },
						{ label: 'Reviewer Perspectives', slug: 'guidance/reviewer-perspectives' },
						{ label: 'Starter Kits', slug: 'guidance/starter-kits' },
						{ label: 'Review Checklist', slug: 'guidance/review-checklist' },
						{ label: 'Industry Mappings', slug: 'guidance/industry-mappings' },
					],
				},
				// Resources — gains Cheat Cards and 2-Minute Pitch (both designed to be shared/printed)
				{
					label: 'Resources',
					translations: { fr: 'Ressources', de: 'Ressourcen' },
					collapsed: true,
					items: [
						{ label: 'Templates', slug: 'standard/templates', translations: { fr: 'Modèles', de: 'Vorlagen' } },
						{ label: 'Downloads', slug: 'standard/downloads', translations: { fr: 'Téléchargements', de: 'Downloads' } },
						{ label: 'AI Prompts', slug: 'standard/prompts' },
						{ label: 'Cheat Cards', slug: 'guidance/cheat-cards' },
						{ label: '2-Minute Pitch', slug: 'guidance/pitch' },
						{ label: 'FAQ', slug: 'standard/faq' },
						{ label: 'JSON Schema', slug: 'standard/schema', translations: { fr: 'Schéma JSON', de: 'JSON-Schema' } },
						{ label: 'Version History', slug: 'standard/version-history', translations: { fr: 'Historique des versions', de: 'Versionsgeschichte' } },
					],
				},
			],
		}),
	],
});
