// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	integrations: [
		starlight({
			title: 'ArchStandard',
			description: 'ADS-001: The Architecture Description Standard — defining the structure and content of Solution Architecture Documents.',
			customCss: ['./src/styles/custom.css'],
			sidebar: [
				{
					label: 'Introduction',
					items: [
						{ label: '1. Overview', slug: 'standard/overview' },
						{ label: '2. Conformance and Usage', slug: 'standard/how-to-use' },
						{ label: 'Design Principles', slug: 'standard/design-principles' },
						{ label: 'Framework Alignment', slug: 'standard/framework-alignment' },
					],
				},
				{
					label: '0. Document Control',
					items: [
						{ label: 'Document Control', slug: 'standard/0-document-control' },
					],
				},
				{
					label: '1. Executive Summary',
					items: [
						{ label: 'Executive Summary', slug: 'standard/1-executive-summary' },
					],
				},
				{
					label: '2. Stakeholders & Concerns',
					items: [
						{ label: 'Stakeholders & Concerns', slug: 'standard/2-stakeholders' },
					],
				},
				{
					label: '3. Architectural Views',
					items: [
						{ label: 'Views Overview', slug: 'standard/3-views-overview' },
						{ label: '3.1 Logical View', slug: 'standard/3-1-logical-view' },
						{ label: '3.2 Integration & Data Flow', slug: 'standard/3-2-process-view' },
						{ label: '3.3 Physical View (Infra)', slug: 'standard/3-3-physical-view' },
						{ label: '3.4 Data View', slug: 'standard/3-4-data-view' },
						{ label: '3.5 Security View', slug: 'standard/3-5-security-view' },
						{ label: '3.6 Scenarios', slug: 'standard/3-6-scenarios' },
					],
				},
				{
					label: '4. Quality Pillars',
					items: [
						{ label: 'Pillars Overview', slug: 'standard/4-pillars-overview' },
						{ label: '4.1 Operational Excellence', slug: 'standard/4-1-operational-excellence' },
						{ label: '4.2 Reliability & Resilience', slug: 'standard/4-2-reliability' },
						{ label: '4.3 Performance Efficiency', slug: 'standard/4-3-performance' },
						{ label: '4.4 Cost Optimisation', slug: 'standard/4-4-cost-optimisation' },
						{ label: '4.5 Sustainability', slug: 'standard/4-5-sustainability' },
					],
				},
				{
					label: '5. Lifecycle Management',
					items: [
						{ label: 'Lifecycle Management', slug: 'standard/5-lifecycle' },
					],
				},
				{
					label: '6. Risk & Governance',
					items: [
						{ label: 'Risk & Governance', slug: 'standard/6-risk-governance' },
					],
				},
				{
					label: '7. Appendices',
					items: [
						{ label: 'Appendices', slug: 'standard/7-appendices' },
					],
				},
				{
					label: 'Resources',
					items: [
						{ label: 'Templates', slug: 'standard/templates' },
						{ label: 'JSON Schema', slug: 'standard/schema' },
						{ label: 'Version History', slug: 'standard/version-history' },
					],
				},
			],
		}),
	],
});
