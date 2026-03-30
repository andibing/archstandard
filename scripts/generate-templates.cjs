#!/usr/bin/env node
/**
 * ADS Template Generator
 *
 * Generates SAD templates in JSON, YAML, and Markdown formats
 * from the master JSON Schema (schema/ads.schema.json).
 *
 * Usage:
 *   node scripts/generate-templates.js
 *
 * Output:
 *   public/templates/sad-template.json
 *   public/templates/sad-template.yaml
 *   public/templates/sad-template.md
 */

const fs = require('fs');
const path = require('path');

const SCHEMA_PATH = path.join(__dirname, '..', 'schema', 'ads.schema.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'templates');

// Section metadata for Markdown generation — maps schema keys to display names
const SECTION_MAP = {
  documentControl: { num: '0', title: 'Document Control' },
  executiveSummary: { num: '1', title: 'Executive Summary' },
  stakeholders: { num: '2', title: 'Stakeholders & Concerns' },
  architecturalViews: { num: '3', title: 'Architectural Views' },
  qualityAttributes: { num: '4', title: 'Quality Attributes' },
  lifecycleManagement: { num: '5', title: 'Lifecycle Management' },
  riskGovernance: { num: '6', title: 'Decision Making & Governance' },
  appendices: { num: '7', title: 'Appendices' },
  complianceScoring: { num: '7.3', title: 'Compliance Scoring' },
};

const VIEW_NAMES = {
  logicalView: '3.1 Logical View',
  integrationView: '3.2 Integration & Data Flow View',
  physicalView: '3.3 Physical View',
  dataView: '3.4 Data View',
  securityView: '3.5 Security View',
  scenarios: '3.6 Scenarios',
};

const QUALITY_NAMES = {
  operationalExcellence: '4.1 Operational Excellence',
  reliability: '4.2 Reliability & Resilience',
  performance: '4.3 Performance Efficiency',
  costOptimisation: '4.4 Cost Optimisation',
  sustainability: '4.5 Sustainability',
};

// Compliance scoring sections (used for both YAML and JSON generation)
const SCORING_SECTIONS = [
  '1. Executive Summary',
  '3.1 Logical View',
  '3.2 Integration & Data Flow',
  '3.3 Physical View',
  '3.4 Data View',
  '3.5 Security View',
  '3.6 Scenarios',
  '4.1 Operational Excellence',
  '4.2 Reliability',
  '4.3 Performance',
  '4.4 Cost Optimisation',
  '4.5 Sustainability',
  '5. Lifecycle',
  '6. Decision Making',
];

// ─────────────────────────────────────────────
// Schema Resolution
// ─────────────────────────────────────────────

function loadSchema() {
  const raw = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function resolveRef(schema, ref) {
  // Resolve $ref like "#/$defs/documentControl"
  const parts = ref.replace('#/', '').split('/');
  let node = schema;
  for (const p of parts) {
    node = node[p];
    if (!node) throw new Error(`Cannot resolve $ref: ${ref}`);
  }
  return node;
}

function resolveNode(schema, node) {
  if (!node) return node;
  if (node.$ref) {
    return resolveNode(schema, resolveRef(schema, node.$ref));
  }
  return node;
}

// ─────────────────────────────────────────────
// JSON Template Generation
// ─────────────────────────────────────────────

function generateDefaultValue(schema, node) {
  node = resolveNode(schema, node);
  if (!node) return null;

  if (node.const) return node.const;

  switch (node.type) {
    case 'string':
      if (node.enum) return node.enum[0];
      if (node.format === 'date') return '';
      return '';
    case 'integer':
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'array':
      if (node.items) {
        const itemNode = resolveNode(schema, node.items);
        if (itemNode.type === 'object') {
          return [generateDefaultObject(schema, itemNode)];
        }
        return [];
      }
      return [];
    case 'object':
      return generateDefaultObject(schema, node);
    default:
      return '';
  }
}

function generateDefaultObject(schema, node) {
  node = resolveNode(schema, node);
  if (!node || !node.properties) return {};

  const obj = {};
  for (const [key, prop] of Object.entries(node.properties)) {
    obj[key] = generateDefaultValue(schema, prop);
  }
  return obj;
}

function generateJsonTemplate(schema) {
  const template = {};
  const root = schema;

  for (const [key, prop] of Object.entries(root.properties)) {
    if (key === 'organisationProfile' || key === 'customSections') continue;
    template[key] = generateDefaultValue(schema, prop);
  }

  // Override compliance scoring with proper section list
  template.complianceScoring = {
    assessments: SCORING_SECTIONS.map(s => ({
      section: s, score: 0, assessor: '', date: '', notes: ''
    })),
    overallScore: 0,
    overallAssessor: '',
    overallDate: '',
    overallNotes: ''
  };

  return JSON.stringify(template, null, 2);
}

// ─────────────────────────────────────────────
// YAML Template Generation
// ─────────────────────────────────────────────

function enumComment(node, schema) {
  node = resolveNode(schema, node);
  if (!node) return '';
  if (node.enum) return `# ${node.enum.join(' | ')}`;
  if (node.format === 'date') return '# YYYY-MM-DD';
  if (node.pattern) return `# pattern: ${node.pattern}`;
  return '';
}

function toYamlValue(val) {
  if (val === '') return '""';
  if (val === true) return 'true';
  if (val === false) return 'false';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'string') {
    if (/^[a-z0-9._-]+$/i.test(val)) return val;
    return `"${val}"`;
  }
  return String(val);
}

function generateYamlLines(schema, node, key, indent, lines) {
  node = resolveNode(schema, node);
  if (!node) return;

  const pad = '  '.repeat(indent);
  const desc = node.description ? `  # ${node.description}` : '';

  if (node.type === 'object' && node.properties) {
    if (key) {
      lines.push(`${pad}${key}:${desc}`);
    }
    for (const [propKey, propVal] of Object.entries(node.properties)) {
      generateYamlLines(schema, propVal, propKey, key ? indent + 1 : indent, lines);
    }
  } else if (node.type === 'array') {
    const itemNode = resolveNode(schema, node.items);
    if (itemNode && itemNode.type === 'object' && itemNode.properties) {
      lines.push(`${pad}${key}:${desc}`);
      // Generate one sample item
      const innerPad = '  '.repeat(indent + 1);
      const props = Object.entries(itemNode.properties);
      props.forEach(([propKey, propVal], i) => {
        const resolved = resolveNode(schema, propVal);
        const comment = enumComment(propVal, schema);
        const defaultVal = generateDefaultValue(schema, propVal);
        if (i === 0) {
          lines.push(`${innerPad}- ${propKey}: ${toYamlValue(defaultVal)}${comment ? '  ' + comment : ''}`);
        } else if (resolved && resolved.type === 'object') {
          lines.push(`${innerPad}  ${propKey}:`);
          // Don't expand nested objects in arrays to keep template manageable
        } else if (resolved && resolved.type === 'array') {
          lines.push(`${innerPad}  ${propKey}: []${comment ? '  ' + comment : ''}`);
        } else {
          lines.push(`${innerPad}  ${propKey}: ${toYamlValue(defaultVal)}${comment ? '  ' + comment : ''}`);
        }
      });
    } else {
      lines.push(`${pad}${key}: []${desc}`);
    }
  } else {
    const comment = enumComment(node, schema);
    const defaultVal = generateDefaultValue(schema, node);
    lines.push(`${pad}${key}: ${toYamlValue(defaultVal)}${comment ? '  ' + comment : ''}`);
  }
}

function generateYamlTemplate(schema) {
  const lines = [
    '# ADS v1.0.0 — Solution Architecture Document Template',
    '# Generated from: schema/ads.schema.json',
    '# Published by: ArchStandard (archstandard.org)',
    '#',
    '# DESIGN PRINCIPLE: Fields are atomic — use enums, booleans,',
    '# and structured options to reduce ambiguity and enable',
    '# machine processing.',
    '',
  ];

  const root = schema;
  const sectionOrder = [
    'schemaVersion', 'documentControl', 'executiveSummary', 'stakeholders',
    'architecturalViews', 'qualityAttributes', 'lifecycleManagement',
    'riskGovernance', 'appendices'
  ];

  for (const key of sectionOrder) {
    const prop = root.properties[key];
    if (!prop) continue;
    const resolved = resolveNode(schema, prop);

    // Add section separator
    const section = SECTION_MAP[key];
    if (section) {
      lines.push('');
      lines.push('# ' + '─'.repeat(45));
      lines.push(`# Section ${section.num}: ${section.title}`);
      lines.push('# ' + '─'.repeat(45));
    }

    generateYamlLines(schema, prop, key, 0, lines);
  }

  // Add compliance scoring
  lines.push('');
  lines.push('# ' + '─'.repeat(45));
  lines.push('# Compliance Scoring (0-5 per section)');
  lines.push('# 0=Not Addressed, 1=Acknowledged, 2=Partial,');
  lines.push('# 3=Mostly Addressed, 4=Fully Addressed, 5=Exemplary');
  lines.push('# ' + '─'.repeat(45));
  lines.push('complianceScoring:');
  lines.push('  assessments:');
  for (const section of SCORING_SECTIONS) {
    lines.push(`    - section: "${section}"`);
    lines.push('      score: 0');
    lines.push('      assessor: ""');
    lines.push('      date: ""');
    lines.push('      notes: ""');
  }
  lines.push('  overallScore: 0');
  lines.push('  overallAssessor: ""');
  lines.push('  overallDate: ""');
  lines.push('  overallNotes: ""');

  // Add commented-out organisation profile
  lines.push('');
  lines.push('# ' + '─'.repeat(45));
  lines.push('# Organisation Profile (OPTIONAL)');
  lines.push('# ' + '─'.repeat(45));
  lines.push('# organisationProfile:');
  lines.push('#   organisationName: ""');
  lines.push('#   tooling:');
  lines.push('#     cmdb: ""');
  lines.push('#     secretStore: ""');
  lines.push('#     monitoring: ""');
  lines.push('#     siem: ""');

  lines.push('');
  return lines.join('\n');
}

// ─────────────────────────────────────────────
// Markdown Template Generation
// ─────────────────────────────────────────────

function enumToCheckboxes(node, schema) {
  node = resolveNode(schema, node);
  if (!node || !node.enum) return '';
  return node.enum.map(v => {
    // Convert kebab-case to Title Case
    const label = v.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return `☐ ${label}`;
  }).join(' ');
}

function generateMdTable(schema, objectNode, titlePrefix) {
  objectNode = resolveNode(schema, objectNode);
  if (!objectNode || !objectNode.properties) return '';

  const lines = [];
  const props = Object.entries(objectNode.properties);

  // Simple key-value table for objects with mostly scalar fields
  const hasNestedObjects = props.some(([, v]) => {
    const r = resolveNode(schema, v);
    return r && (r.type === 'object' || r.type === 'array');
  });

  if (!hasNestedObjects || props.length <= 3) {
    lines.push('| Field | Value |');
    lines.push('|-------|-------|');
    for (const [key, prop] of props) {
      const resolved = resolveNode(schema, prop);
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim();
      if (resolved && resolved.enum) {
        lines.push(`| **${label}** | ${enumToCheckboxes(prop, schema)} |`);
      } else if (resolved && resolved.type === 'boolean') {
        lines.push(`| **${label}** | ☐ Yes ☐ No |`);
      } else {
        lines.push(`| **${label}** | |`);
      }
    }
    return lines.join('\n');
  }

  return '';
}

function generateMarkdownTemplate(schema) {
  const lines = [
    '# Solution Architecture Document',
    '',
    '> **Standard:** ADS v1.0.0 (Architecture Description Standard)',
    '> **Template Version:** 1.0.0',
    '> **Published by:** ArchStandard (archstandard.org)',
    '> **Generated from:** schema/ads.schema.json',
    '',
    '---',
    '',
    '> **Note:** This template was auto-generated from the ADS JSON Schema.',
    '> For guidance on completing each section, see [archstandard.org](https://archstandard.org).',
    '',
  ];

  // We generate a structured but readable Markdown template
  // For complex nested schemas, we produce tables with checkboxes

  const root = schema;
  const sectionOrder = [
    'documentControl', 'executiveSummary', 'stakeholders',
    'architecturalViews', 'qualityAttributes', 'lifecycleManagement',
    'riskGovernance', 'appendices'
  ];

  for (const sectionKey of sectionOrder) {
    const prop = root.properties[sectionKey];
    if (!prop) continue;
    const resolved = resolveNode(schema, prop);
    const section = SECTION_MAP[sectionKey];
    if (!section) continue;

    lines.push(`## ${section.num}. ${section.title}`);
    lines.push('');

    if (resolved && resolved.properties) {
      generateMdSection(schema, resolved, lines, 3, sectionKey);
    }

    lines.push('---');
    lines.push('');
  }

  // Add compliance scoring
  lines.push('## 7.3 Compliance Scoring');
  lines.push('');
  lines.push('| Section | Score (0–5) | Assessor | Date | Notes |');
  lines.push('|---------|:-----------:|----------|------|-------|');
  for (const section of SCORING_SECTIONS) {
    lines.push(`| ${section} | | | | |`);
  }
  lines.push('| **Overall** | | | | |');
  lines.push('');
  lines.push('*Scoring: 0=Not Addressed, 1=Acknowledged, 2=Partial, 3=Mostly Addressed, 4=Fully Addressed, 5=Exemplary. Overall = lowest individual score.*');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Approval sign-off
  lines.push('## 7.4 Approval Sign-Off');
  lines.push('');
  lines.push('| Role | Name | Date | Decision |');
  lines.push('|------|------|------|----------|');
  lines.push('| Solution Architect | | | ☐ Approved ☐ Approved with Conditions ☐ Rejected ☐ Deferred |');
  lines.push('| Security Architect | | | ☐ Approved ☐ Approved with Conditions ☐ Rejected ☐ Deferred |');
  lines.push('| ARB / Design Authority | | | ☐ Approved ☐ Approved with Conditions ☐ Rejected ☐ Deferred |');
  lines.push('');

  return lines.join('\n');
}

function generateMdSection(schema, node, lines, headingLevel, contextKey) {
  node = resolveNode(schema, node);
  if (!node || !node.properties) return;

  const hPrefix = '#'.repeat(headingLevel);

  for (const [key, prop] of Object.entries(node.properties)) {
    const resolved = resolveNode(schema, prop);
    if (!resolved) continue;

    const label = getDisplayName(key, contextKey);

    if (resolved.type === 'object' && resolved.properties) {
      lines.push(`${hPrefix} ${label}`);
      lines.push('');

      // Check if this is a simple object (all scalar fields) — render as table
      const allScalar = Object.values(resolved.properties).every(v => {
        const r = resolveNode(schema, v);
        return r && r.type !== 'object' && r.type !== 'array';
      });

      if (allScalar) {
        lines.push('| Field | Value |');
        lines.push('|-------|-------|');
        for (const [propKey, propVal] of Object.entries(resolved.properties)) {
          const propResolved = resolveNode(schema, propVal);
          const propLabel = getDisplayName(propKey);
          if (propResolved && propResolved.enum) {
            lines.push(`| **${propLabel}** | ${enumToCheckboxes(propVal, schema)} |`);
          } else if (propResolved && propResolved.type === 'boolean') {
            lines.push(`| **${propLabel}** | ☐ Yes ☐ No |`);
          } else if (propResolved && propResolved.type === 'integer') {
            lines.push(`| **${propLabel}** | |`);
          } else {
            lines.push(`| **${propLabel}** | |`);
          }
        }
        lines.push('');
      } else {
        generateMdSection(schema, resolved, lines, Math.min(headingLevel + 1, 6), key);
      }
    } else if (resolved.type === 'array') {
      const itemNode = resolveNode(schema, resolved.items);
      if (itemNode && itemNode.type === 'object' && itemNode.properties) {
        lines.push(`${hPrefix} ${label}`);
        lines.push('');
        // Generate a table with columns from the item properties
        const cols = Object.keys(itemNode.properties);
        const headers = cols.map(c => getDisplayName(c));
        lines.push(`| ${headers.join(' | ')} |`);
        lines.push(`|${cols.map(() => '------').join('|')}|`);
        // One sample row with checkboxes for enums
        const cells = cols.map(c => {
          const colNode = resolveNode(schema, itemNode.properties[c]);
          if (colNode && colNode.enum) return enumToCheckboxes(itemNode.properties[c], schema);
          if (colNode && colNode.type === 'boolean') return '☐ Yes ☐ No';
          return '';
        });
        lines.push(`| ${cells.join(' | ')} |`);
        lines.push('');
      } else {
        // Simple array of strings
        lines.push(`**${label}:**`);
        lines.push('- ');
        lines.push('');
      }
    } else {
      // Scalar — skip, these are handled in parent table
    }
  }
}

function getDisplayName(key, context) {
  // Special display names
  const names = {
    // Views
    logicalView: '3.1 Logical View',
    integrationView: '3.2 Integration & Data Flow View',
    physicalView: '3.3 Physical View',
    dataView: '3.4 Data View',
    securityView: '3.5 Security View',
    scenarios: '3.6 Scenarios',
    // Quality attributes
    operationalExcellence: '4.1 Operational Excellence',
    reliability: '4.2 Reliability & Resilience',
    performance: '4.3 Performance Efficiency',
    costOptimisation: '4.4 Cost Optimisation',
    sustainability: '4.5 Sustainability',
    // Other
    metadata: 'Document Metadata',
    changeHistory: 'Change History',
    contributors: 'Contributors & Approvals',
    solutionOverview: 'Solution Overview',
    businessContext: 'Business Context & Drivers',
    strategicAlignment: 'Strategic Alignment',
    sharedServiceReuse: 'Shared Service Reuse',
    currentState: 'Current State / As-Is Architecture',
    keyDecisions: 'Key Decisions & Constraints',
    projectDetails: 'Project Details',
    businessCriticality: 'Business Criticality',
    register: 'Stakeholder Register',
    compliance: 'Compliance & Regulatory Context',
    regulatoryRequirements: 'Regulatory Requirements',
    internalConnectivity: 'Internal Component Connectivity',
    externalIntegrations: 'External Integrations',
    apis: 'APIs & Interfaces',
    hosting: 'Hosting & Infrastructure',
    compute: 'Compute',
    userAccess: 'User & Administrator Access',
    transportProtocols: 'Transport Protocols',
    networking: 'Network Connectivity',
    environments: 'Environments',
    dataStores: 'Data Stores',
    dataTransfers: 'Data Transfers',
    businessImpact: 'Business Impact Assessment',
    authentication: 'Authentication',
    authorisation: 'Authorisation',
    privilegedAccess: 'Privileged Access',
    encryptionAtRest: 'Encryption at Rest',
    secretManagement: 'Secret Management',
    securityMonitoring: 'Security Monitoring',
    useCases: 'Key Use Cases',
    adrs: 'Architecture Decision Records',
    tradeoffs: 'Quality Attribute Tradeoffs',
    constraints: '6.1 Constraints',
    assumptions: '6.2 Assumptions',
    risks: '6.3 Risks',
    dependencies: '6.4 Dependencies',
    issues: '6.5 Issues',
    complianceTraceability: '6.8 Compliance Traceability',
    migration: 'Migration',
    resourcing: 'Resourcing & Skills',
    growthProjections: 'Capacity & Growth Projections',
    glossary: 'Glossary',
    references: 'References',
    approvals: 'Approvals',
  };

  if (names[key]) return names[key];

  // Convert camelCase to Title Case
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, c => c.toUpperCase())
    .trim();
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

function main() {
  console.log('Loading schema from', SCHEMA_PATH);
  const schema = loadSchema();

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Generate JSON template
  const jsonTemplate = generateJsonTemplate(schema);
  const jsonPath = path.join(OUTPUT_DIR, 'sad-template.json');
  fs.writeFileSync(jsonPath, jsonTemplate, 'utf-8');
  console.log('  Generated:', jsonPath);

  // Generate YAML template
  const yamlTemplate = generateYamlTemplate(schema);
  const yamlPath = path.join(OUTPUT_DIR, 'sad-template.yaml');
  fs.writeFileSync(yamlPath, yamlTemplate, 'utf-8');
  console.log('  Generated:', yamlPath);

  // Generate Markdown template
  const mdTemplate = generateMarkdownTemplate(schema);
  const mdPath = path.join(OUTPUT_DIR, 'sad-template.md');
  fs.writeFileSync(mdPath, mdTemplate, 'utf-8');
  console.log('  Generated:', mdPath);

  console.log('\nDone. All templates generated from schema.');
}

main();
