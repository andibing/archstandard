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
				{
					label: 'About ADS',
					translations: { fr: 'À propos de ADS', de: 'Über ADS' },
					collapsed: true,
					items: [
						{ label: 'Overview', slug: 'standard/overview', translations: { fr: 'Aperçu', de: 'Übersicht' } },
						{ label: 'Why ADS?', slug: 'standard/why-ads', translations: { fr: 'Pourquoi ADS ?', de: 'Warum ADS?' } },
						{ label: 'Conformance and Usage', slug: 'standard/how-to-use', translations: { fr: 'Conformité et utilisation', de: 'Konformität und Verwendung' } },
						{ label: 'Framework Alignment', slug: 'standard/framework-alignment', translations: { fr: 'Alignement des cadres', de: 'Framework-Zuordnung' } },
						{ label: 'Design Principles', slug: 'standard/design-principles', translations: { fr: 'Principes de conception', de: 'Designprinzipien' } },
					],
				},
				// Standard sections — single-child groups flattened to direct links;
				// only Section 3 and Section 4 keep group treatment because they have multiple sub-pages.
				{ label: '0. Document Control', slug: 'standard/0-document-control', translations: { fr: '0. Contrôle du document', de: '0. Dokumentenkontrolle' } },
				{ label: '1. Executive Summary', slug: 'standard/1-executive-summary', translations: { fr: '1. Résumé exécutif', de: '1. Zusammenfassung' } },
				{ label: '2. Stakeholders & Concerns', slug: 'standard/2-stakeholders', translations: { fr: '2. Parties prenantes', de: '2. Stakeholder und Anforderungen' } },
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
				{ label: '5. Lifecycle Management', slug: 'standard/5-lifecycle', translations: { fr: '5. Gestion du cycle de vie', de: '5. Lebenszyklusmanagement' } },
				{ label: '6. Decision Making & Governance', slug: 'standard/6-decision-making', translations: { fr: '6. Prise de décision et gouvernance', de: '6. Entscheidungsfindung und Governance' } },
				{ label: '7. Appendices', slug: 'standard/7-appendices', translations: { fr: '7. Annexes', de: '7. Anhänge' } },
				// Examples — adoption-critical, kept here for now
				{
					label: 'Examples',
					translations: { fr: 'Exemples', de: 'Beispiele' },
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
