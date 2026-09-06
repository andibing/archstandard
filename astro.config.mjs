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
					tag: 'script',
					attrs: { src: '/v1/scripts/sidebar-scrollspy.js', defer: true },
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
			sidebar: [
				// Getting Started
				{
					label: 'Getting Started',
					items: [
						{ label: 'Quickstart', slug: 'standard/quickstart' },
						{ label: 'Adoption Guide', slug: 'standard/adoption-guide' },
						{ label: 'Depth Cheat Sheet', slug: 'standard/cheat-sheet' },
					],
				},
				// About ADS — default-expanded so first-time visitors see the full breadth.
				{
					label: 'About ADS',
					collapsed: false,
					items: [
						{ label: 'Overview', slug: 'standard/overview' },
						{ label: 'Why ADS?', slug: 'standard/why-ads' },
						{ label: 'Conformance and Usage', slug: 'standard/how-to-use' },
						{ label: 'Framework Alignment', slug: 'standard/framework-alignment' },
						{ label: 'Design Principles', slug: 'standard/design-principles' },
					],
				},
				// Standard sections.
				// Sections 3 and 4 are split across multiple files (one per view / quality attribute).
				// Sections 0, 1, 2, 5, 6, 7 are single files with multiple H2 sub-sections — surfaced
				// as anchor links here so the sidebar reflects the standard's full structure.
				{
					label: '0. Document Control',
					items: [
						{ label: 'Section 0 (overview)', slug: 'standard/0-document-control' },
						{ label: '0.1 Document Metadata', link: '/standard/0-document-control/#01-document-metadata' },
						{ label: '0.2 Change History', link: '/standard/0-document-control/#02-change-history' },
						{ label: '0.3 Contributors & Approvals', link: '/standard/0-document-control/#03-contributors--approvals' },
						{ label: '0.4 Document Purpose & Scope', link: '/standard/0-document-control/#04-document-purpose--scope' },
					],
				},
				{
					label: '1. Executive Summary',
					collapsed: true,
					items: [
						{ label: 'Section 1 (overview)', slug: 'standard/1-executive-summary' },
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
					items: [
						{ label: 'Section 2 (overview)', slug: 'standard/2-stakeholders' },
						{ label: '2.1 Stakeholder Register', link: '/standard/2-stakeholders/#21-stakeholder-register' },
						{ label: '2.2 Concerns Matrix', link: '/standard/2-stakeholders/#22-concerns-matrix' },
						{ label: '2.3 Compliance & Regulatory Context', link: '/standard/2-stakeholders/#23-compliance--regulatory-context' },
					],
				},
				{
					label: '3. Architectural Views',
					items: [
						{ label: 'Views Overview', slug: 'standard/3-views-overview' },
						{ label: '3.1 Logical View', slug: 'standard/3-1-logical-view' },
						{ label: '3.2 Integration & Data Flow', slug: 'standard/3-2-integration-view' },
						{ label: '3.3 Physical View', slug: 'standard/3-3-physical-view' },
						{ label: '3.4 Data View', slug: 'standard/3-4-data-view' },
						{ label: '3.5 Security View', slug: 'standard/3-5-security-view' },
						{ label: '3.6 Scenarios', slug: 'standard/3-6-scenarios' },
					],
				},
				{
					label: '4. Quality Attributes',
					items: [
						{ label: 'Overview', slug: 'standard/4-quality-attributes-overview' },
						{ label: '4.1 Operational Excellence', slug: 'standard/4-1-operational-excellence' },
						{ label: '4.2 Reliability & Resilience', slug: 'standard/4-2-reliability' },
						{ label: '4.3 Performance Efficiency', slug: 'standard/4-3-performance' },
						{ label: '4.4 Cost Optimisation', slug: 'standard/4-4-cost-optimisation' },
						{ label: '4.5 Sustainability', slug: 'standard/4-5-sustainability' },
					],
				},
				{
					label: '5. Lifecycle Management',
					collapsed: true,
					items: [
						{ label: 'Section 5 (overview)', slug: 'standard/5-lifecycle' },
						{ label: '5.1 Software Development & CI/CD', link: '/standard/5-lifecycle/#51-software-development--cicd' },
						{ label: '5.2 Service Transition & Migration', link: '/standard/5-lifecycle/#52-service-transition--migration' },
						{ label: '5.3 Test & Release', link: '/standard/5-lifecycle/#53-test--release' },
						{ label: '5.4 Operations', link: '/standard/5-lifecycle/#54-operations' },
						{ label: '5.5 Resourcing & Skills', link: '/standard/5-lifecycle/#55-resourcing--skills' },
						{ label: '5.6 Decommissioning & Exit', link: '/standard/5-lifecycle/#56-decommissioning--exit' },
					],
				},
				{
					label: '6. Decision Making & Governance',
					collapsed: true,
					items: [
						{ label: 'Section 6 (overview)', slug: 'standard/6-decision-making' },
						{ label: '6.1 CRAIDS Log', link: '/standard/6-decision-making/#61-craids-log' },
						{ label: '6.2 Technical Debt Register', link: '/standard/6-decision-making/#62-technical-debt-register' },
						{ label: '6.3 Guardrail Exceptions', link: '/standard/6-decision-making/#63-guardrail-exceptions' },
						{ label: '6.4 Architectural Decisions Log', link: '/standard/6-decision-making/#64-architectural-decisions-log' },
						{ label: '6.5 Compliance Traceability', link: '/standard/6-decision-making/#65-compliance-traceability' },
						{ label: '6.6 Approval Sign-Off', link: '/standard/6-decision-making/#66-approval-sign-off' },
					],
				},
				{
					label: '7. Appendices',
					collapsed: true,
					items: [
						{ label: 'Section 7 (overview)', slug: 'standard/7-appendices' },
						{ label: '7.1 Glossary', link: '/standard/7-appendices/#71-glossary' },
						{ label: '7.2 Reference Documents', link: '/standard/7-appendices/#72-reference-documents' },
						{ label: '7.3 Standards & Patterns Referenced', link: '/standard/7-appendices/#73-standards--patterns-referenced' },
					],
				},
				// Examples
				{
					label: 'Examples',
					collapsed: true,
					items: [
						{ label: 'Example SADs', slug: 'examples' },
						{ label: 'Employee Directory', slug: 'examples/employee-directory' },
						{ label: 'Customer API Platform', slug: 'examples/customer-api-platform' },
						{ label: 'Cloud Migration', slug: 'examples/cloud-migration' },
						{ label: 'NorthWind Retail', slug: 'examples/northwind-retail' },
						{ label: 'Medwick Healthcare', slug: 'examples/medwick-healthcare' },
						{ label: 'Stellar Platform', slug: 'examples/stellar-platform' },
						{ label: 'archstandard.org', slug: 'examples/archstandard-org' },
					],
				},
				// Guidance
				{
					label: 'Guidance',
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
				// Resources
				{
					label: 'Resources',
					collapsed: true,
					items: [
						{ label: 'Templates', slug: 'standard/templates' },
						{ label: 'Downloads', slug: 'standard/downloads' },
						{ label: 'AI Prompts', slug: 'standard/prompts' },
						{ label: 'Cheat Cards', slug: 'guidance/cheat-cards' },
						{ label: '2-Minute Pitch', slug: 'guidance/pitch' },
						{ label: 'Glossary', slug: 'standard/glossary' },
						{ label: 'FAQ', slug: 'standard/faq' },
						{ label: 'JSON Schema', slug: 'standard/schema' },
						{ label: 'Version History', slug: 'standard/version-history' },
					],
				},
			],
		}),
	],
});
