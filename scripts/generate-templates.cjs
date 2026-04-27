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

// Acronym overrides applied after naive title-casing of kebab-case enum values.
// Schema enums are kebab-case (e.g. "api-key"); naive titlecase produces
// "Api Key", which is wrong. This dictionary corrects each word.
const ACRONYM_FIXES = {
  // Protocols
  'Http': 'HTTP', 'Https': 'HTTPS',
  'Tcp': 'TCP', 'Udp': 'UDP',
  'Tls': 'TLS', 'Ssl': 'SSL',
  'Ssh': 'SSH', 'Sftp': 'SFTP', 'Ftp': 'FTP', 'Ftps': 'FTPS',
  'Smtp': 'SMTP', 'Smtps': 'SMTPS',
  'Imap': 'IMAP', 'Pop3': 'POP3',
  'Amqp': 'AMQP', 'Amqps': 'AMQPS',
  'Mqtt': 'MQTT', 'Mqtts': 'MQTTS',
  'Wss': 'WSS', 'Ws': 'WS', 'Websocket': 'WebSocket',
  'Grpc': 'gRPC',
  'Jdbc': 'JDBC', 'Odbc': 'ODBC',
  'Ldap': 'LDAP', 'Ldaps': 'LDAPS',
  'Soap': 'SOAP', 'Rest': 'REST', 'Graphql': 'GraphQL',
  // Auth and identity
  'Mtls': 'mTLS',
  'Oauth': 'OAuth', 'Oauth2': 'OAuth2',
  'Oidc': 'OIDC', 'Saml': 'SAML', 'Jwt': 'JWT',
  'Iam': 'IAM', 'Sso': 'SSO', 'Mfa': 'MFA', '2fa': '2FA',
  'Rbac': 'RBAC', 'Abac': 'ABAC', 'Pbac': 'PBAC', 'Acl': 'ACL',
  'Pam': 'PAM', 'Idm': 'IDM',
  'Hsm': 'HSM', 'Kms': 'KMS', 'Pki': 'PKI',
  'Byok': 'BYOK', 'Hyok': 'HYOK',
  'Fips140': 'FIPS 140',
  // Data and APIs
  'Api': 'API', 'Apis': 'APIs',
  'Json': 'JSON', 'Xml': 'XML', 'Yaml': 'YAML', 'Csv': 'CSV',
  'Url': 'URL', 'Uri': 'URI',
  'Html': 'HTML', 'Css': 'CSS',
  'Sql': 'SQL', 'Nosql': 'NoSQL',
  'Db': 'DB',
  'Cqrs': 'CQRS', 'Bff': 'BFF',
  // Cloud and platforms
  'Aws': 'AWS', 'Gcp': 'GCP',
  'Saas': 'SaaS', 'Iaas': 'IaaS', 'Paas': 'PaaS',
  'Faas': 'FaaS', 'Caas': 'CaaS', 'Dbaas': 'DBaaS', 'Xaas': 'XaaS',
  'Cdn': 'CDN', 'Waf': 'WAF',
  'Vpn': 'VPN', 'Vpc': 'VPC',
  'Lan': 'LAN', 'Wan': 'WAN', 'Vlan': 'VLAN', 'Nat': 'NAT',
  'Dns': 'DNS',
  'Eks': 'EKS', 'Aks': 'AKS', 'Gke': 'GKE', 'Ecs': 'ECS',
  'Sns': 'SNS', 'Sqs': 'SQS', 'Rds': 'RDS',
  'Vm': 'VM', 'Vms': 'VMs',
  'Iot': 'IoT', 'Os': 'OS',
  // Security
  'Cors': 'CORS', 'Csrf': 'CSRF', 'Xss': 'XSS', 'Ssrf': 'SSRF',
  'Ddos': 'DDoS',
  'Hsts': 'HSTS', 'Csp': 'CSP',
  'Sast': 'SAST', 'Dast': 'DAST', 'Sca': 'SCA',
  'Apm': 'APM', 'Siem': 'SIEM', 'Soar': 'SOAR',
  'Cve': 'CVE', 'Owasp': 'OWASP',
  // Operational and SLAs
  'Sla': 'SLA', 'Slo': 'SLO', 'Sli': 'SLI',
  'Rpo': 'RPO', 'Rto': 'RTO',
  'Mttr': 'MTTR', 'Mttf': 'MTTF', 'Mtbf': 'MTBF',
  // Compliance
  'Pii': 'PII', 'Pci': 'PCI',
  'Hipaa': 'HIPAA', 'Wcag': 'WCAG',
  'Iso': 'ISO', 'Soc2': 'SOC 2', 'Soc': 'SOC',
  'Gdpr': 'GDPR', 'Ccpa': 'CCPA', 'Sox': 'SOX', 'Fca': 'FCA',
  'Dsp': 'DSP', 'Dspt': 'DSPT',
  'Ietf': 'IETF', 'Rfc': 'RFC',
  // Business / domain
  'Crm': 'CRM', 'Erp': 'ERP', 'Cms': 'CMS', 'Lms': 'LMS', 'Wms': 'WMS',
  'Pos': 'POS', 'Tco': 'TCO', 'Roi': 'ROI',
  'Capex': 'CapEx', 'Opex': 'OpEx',
  'Ml': 'ML', 'Ai': 'AI', 'Llm': 'LLM',
  'Ux': 'UX', 'Ui': 'UI',
  'Cli': 'CLI', 'Gui': 'GUI', 'Sdk': 'SDK', 'Ide': 'IDE',
  // Resilience / DR (these only appear in schema-derived labels, not human prose)
  'Dr': 'DR', 'Rto': 'RTO', 'Rpo': 'RPO',
  'Ha': 'HA', 'Az': 'AZ',
  // Operational roles
  'Sre': 'SRE', 'Sres': 'SREs',
  'Devops': 'DevOps', 'Secops': 'SecOps',
  'Mlops': 'MLOps', 'Dataops': 'DataOps', 'Aiops': 'AIOps',
  'Dba': 'DBA', 'Dbas': 'DBAs',
  // More acronyms / proper nouns
  'Cpu': 'CPU', 'Cpus': 'CPUs',
  'Gpu': 'GPU', 'Gpus': 'GPUs',
  'Ram': 'RAM',
  'Rhel': 'RHEL', 'Suse': 'SUSE', 'Centos': 'CentOS',
  'Qa': 'QA',
  'Cyberark': 'CyberArk',
  'Cicd': 'CI/CD',
  // Hyphenation
  'Tradeoff': 'Trade-off', 'Tradeoffs': 'Trade-offs',
  // Misc
  'It': 'IT',
};

// Apply acronym fixes to a Title-Cased string (per word).
function prettifyLabel(text) {
  // Per-word substitution
  let out = text.split(' ').map(w => ACRONYM_FIXES[w] || w).join(' ');
  // Size suffixes: "1gb" → "1 GB", "100tb" → "100 TB", etc.
  out = out.replace(/(\d+)gb\b/gi, '$1 GB')
           .replace(/(\d+)tb\b/gi, '$1 TB')
           .replace(/(\d+)pb\b/gi, '$1 PB')
           .replace(/(\d+)mb\b/gi, '$1 MB')
           .replace(/(\d+)kb\b/gi, '$1 KB');
  return out;
}

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

// ---------------------------------------------
// Schema Resolution
// ---------------------------------------------

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

// ---------------------------------------------
// JSON Template Generation
// ---------------------------------------------

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

// ---------------------------------------------
// YAML Template Generation
// ---------------------------------------------

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
    '# ADS v1.3.0 — Solution Architecture Document Template',
    '# Standard published by: ArchStandard (archstandard.org)',
    '# Standard licence: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)',
    '# Generated from: schema/ads.schema.json',
    '#',
    '# Document author / owner: complete in Section 0 (Document Control) below.',
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
      lines.push('# ' + '-'.repeat(45));
      lines.push(`# Section ${section.num}: ${section.title}`);
      lines.push('# ' + '-'.repeat(45));
    }

    generateYamlLines(schema, prop, key, 0, lines);
  }

  // Add compliance scoring
  lines.push('');
  lines.push('# ' + '-'.repeat(45));
  lines.push('# Compliance Scoring (0-5 per section)');
  lines.push('# 0=Not Addressed, 1=Acknowledged, 2=Partial,');
  lines.push('# 3=Mostly Addressed, 4=Fully Addressed, 5=Exemplary');
  lines.push('# ' + '-'.repeat(45));
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
  lines.push('# ' + '-'.repeat(45));
  lines.push('# Organisation Profile (OPTIONAL)');
  lines.push('# ' + '-'.repeat(45));
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

// ---------------------------------------------
// Markdown Template Generation
// ---------------------------------------------

function enumToCheckboxes(node, schema) {
  node = resolveNode(schema, node);
  if (!node || !node.enum) return '';
  return node.enum.map(v => {
    // Convert kebab-case to Title Case, then apply acronym overrides
    const titleCased = v.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return `[ ] ${prettifyLabel(titleCased)}`;
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
      const label = prettifyLabel(key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim());
      if (resolved && resolved.enum) {
        lines.push(`| **${label}** | ${enumToCheckboxes(prop, schema)} |`);
      } else if (resolved && resolved.type === 'boolean') {
        lines.push(`| **${label}** | [ ] Yes [ ] No |`);
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
    '> **Standard:** ADS v1.3.0 (Architecture Description Standard)',
    '> **Standard published by:** ArchStandard (archstandard.org)',
    '> **Standard licence:** CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)',
    '> **Generated from:** schema/ads.schema.json',
    '',
    '> *Document author and owner: complete in Section 0 (Document Control) below.*',
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
  lines.push('| Solution Architect | | | [ ] Approved [ ] Approved with Conditions [ ] Rejected [ ] Deferred |');
  lines.push('| Security Architect | | | [ ] Approved [ ] Approved with Conditions [ ] Rejected [ ] Deferred |');
  lines.push('| ARB / Design Authority | | | [ ] Approved [ ] Approved with Conditions [ ] Rejected [ ] Deferred |');
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
            lines.push(`| **${propLabel}** | [ ] Yes [ ] No |`);
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
        const cols = Object.keys(itemNode.properties);

        // Wide-array threshold: tables with > 5 columns are illegible in
        // A4 portrait Word output (cells become 1-2 chars wide). Render
        // vertically as a Field/Value form per expected item instead.
        const WIDE_TABLE_THRESHOLD = 5;

        if (cols.length > WIDE_TABLE_THRESHOLD) {
          // Vertical "form" layout: one Field/Value table per item, with
          // a hint to repeat for additional items.
          // Singularise the label for the "Repeat the table below for each X"
          // hint. Tricky cases like "boxes" -> "box" (drop -es) are RARE in the
          // schema's array names; safer to drop just the trailing "s" and accept
          // a small risk of awkward output (e.g. "for each boxe") than to
          // produce wrong outputs like "use cases" -> "use cas".
          // Compound labels with a leading plural (e.g. "Apis & Interfaces")
          // also get only the trailing -s stripped; a small explicit override
          // map handles the awkward ones.
          const explicitSingulars = {
            'apis & interfaces': 'API or interface',
            'data transfers': 'data transfer',
            'change history': 'change record',
            'reference documents': 'reference document',
          };
          const singularise = (s) => {
            const explicit = explicitSingulars[s];
            if (explicit) return explicit;
            if (/ies$/.test(s)) return s.replace(/ies$/, 'y');
            if (/s$/.test(s)) return s.replace(/s$/, '');
            return s;
          };
          const itemNoun = singularise(label.toLowerCase().replace(/^[\d\.\s]+/, ''));
          lines.push(`*Repeat the table below for each ${itemNoun}.*`);
          lines.push('');
          lines.push('| Field | Value |');
          lines.push('|-------|-------|');
          for (const c of cols) {
            const colNode = resolveNode(schema, itemNode.properties[c]);
            const colLabel = getDisplayName(c);
            if (colNode && colNode.enum) {
              lines.push(`| **${colLabel}** | ${enumToCheckboxes(itemNode.properties[c], schema)} |`);
            } else if (colNode && colNode.type === 'boolean') {
              lines.push(`| **${colLabel}** | [ ] Yes [ ] No |`);
            } else {
              lines.push(`| **${colLabel}** | |`);
            }
          }
          lines.push('');
        } else {
          // Narrow-array layout: one row, columns across (existing behaviour).
          const headers = cols.map(c => getDisplayName(c));
          lines.push(`| ${headers.join(' | ')} |`);
          lines.push(`|${cols.map(() => '------').join('|')}|`);
          const cells = cols.map(c => {
            const colNode = resolveNode(schema, itemNode.properties[c]);
            if (colNode && colNode.enum) return enumToCheckboxes(itemNode.properties[c], schema);
            if (colNode && colNode.type === 'boolean') return '[ ] Yes [ ] No';
            return '';
          });
          lines.push(`| ${cells.join(' | ')} |`);
          lines.push('');
        }
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
    tradeoffs: 'Quality Attribute Trade-offs',
    qualityAttributeRefs: 'Quality Attribute References',
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
    // Awkward auto-labels — explicit overrides
    resourcesRightsized: 'Resources Right-Sized',
    hostingLocationOptimisedForCarbon: 'Hosting Location Optimised for Carbon',
    nonProdAutoShutdown: 'Non-Production Auto-Shutdown',
    workloadPattern: 'Workload Pattern',
    cloudToOnPrem: 'Cloud-to-On-Premises Connectivity',
    thirdPartyConnectivity: 'Third-Party Connectivity',
    wirelessRequired: 'Wireless Required',
    peakEgressMbps: 'Peak Egress (Mbps)',
    peakIngressMbps: 'Peak Ingress (Mbps)',
    keyRotationDays: 'Key Rotation (Days)',
    intendedLifespan: 'Intended Lifespan',
    exitPlanDocumented: 'Exit Plan Documented',
    vendorLockInLevel: 'Vendor Lock-In Level',
  };

  if (names[key]) return names[key];

  // Convert camelCase to Title Case, then apply acronym overrides
  return prettifyLabel(
    key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim()
  );
}

// ---------------------------------------------
// Main
// ---------------------------------------------

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

  // Generate DOCX template via Pandoc (en-GB language). Best-effort:
  // requires Pandoc to be installed; skipped silently if not.
  try {
    const { execSync } = require('child_process');
    const pandocCandidates = [
      'pandoc',
      path.join(process.env.LOCALAPPDATA || '', 'Pandoc', 'pandoc.exe'),
      'C:\\Program Files\\Pandoc\\pandoc.exe',
      '/usr/local/bin/pandoc',
      '/usr/bin/pandoc',
    ];
    let pandoc = null;
    for (const cand of pandocCandidates) {
      try {
        execSync(`"${cand}" --version`, { stdio: 'pipe' });
        pandoc = cand;
        break;
      } catch (_) { /* keep trying */ }
    }
    if (pandoc) {
      const docxPath = path.join(OUTPUT_DIR, 'sad-template.docx');
      // Reference doc with narrower margins (15mm) so wide tables fit
      // better — the SAD template has many many-column array tables.
      const refDocxPath = path.join(__dirname, 'sad-template-reference.docx');
      const refArg = fs.existsSync(refDocxPath) ? `--reference-doc="${refDocxPath}" ` : '';
      execSync(
        `"${pandoc}" "${mdPath}" -o "${docxPath}" ` +
        refArg +
        `--metadata=lang:en-GB ` +
        `--metadata=title:"ADS — Solution Architecture Document Template"`,
        { stdio: 'pipe' }
      );
      console.log('  Generated:', docxPath, '(en-GB)');
    } else {
      console.log('  Skipped DOCX generation (Pandoc not found)');
    }
  } catch (e) {
    console.warn('  DOCX generation failed:', e.message);
  }

  // Copy schema to public directory for serving at /schema/v1.0.0/ads.schema.json
  const publicSchemaDir = path.join(__dirname, '..', 'public', 'schema', 'v1.0.0');
  if (!fs.existsSync(publicSchemaDir)) {
    fs.mkdirSync(publicSchemaDir, { recursive: true });
  }
  const publicSchemaPath = path.join(publicSchemaDir, 'ads.schema.json');
  fs.copyFileSync(SCHEMA_PATH, publicSchemaPath);
  console.log('  Copied schema to:', publicSchemaPath);

  console.log('\nDone. All templates generated from schema.');
}

main();
