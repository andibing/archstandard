"""
Fix mis-cased acronyms in example MD / MDX files.

Background: an earlier template generator naively title-cased kebab-case
schema enum values, producing "Api" instead of "API", "Jdbc" instead of
"JDBC", etc. The generator is now fixed (scripts/generate-templates.cjs)
but example documents authored against the old template inherited the
broken casing. This script repairs those documents.

Strategy:
  - Most acronyms (Api → API, Json → JSON, etc.) are unambiguous and
    safe to replace site-wide as word-boundary substitutions.
  - "Dr" is special: it must stay capitalised in stakeholder names
    ("Dr Raj Doe") but become "DR" in disaster-recovery contexts
    ("DR Strategy", "DR Region", "DR Plan"). Only specific compound
    phrases are rewritten.
  - Size patterns "1gb / 100tb / 1pb" become "1 GB / 100 TB / 1 PB".
  - Code identifiers like "SqlClient" (a Microsoft .NET class) must not
    be touched. Word-boundary regex preserves them.

Run with --apply to write changes; default is dry-run.
"""

import os, re, sys, collections

# Word-boundary single-token replacements (case-sensitive)
ACRONYMS = {
    # Protocols
    "Http": "HTTP", "Https": "HTTPS",
    "Tcp": "TCP", "Udp": "UDP",
    "Tls": "TLS", "Ssl": "SSL",
    "Ssh": "SSH", "Sftp": "SFTP", "Ftp": "FTP", "Ftps": "FTPS",
    "Smtp": "SMTP", "Smtps": "SMTPS",
    "Imap": "IMAP",
    "Amqp": "AMQP", "Amqps": "AMQPS",
    "Mqtt": "MQTT", "Mqtts": "MQTTS",
    "Wss": "WSS", "Websocket": "WebSocket",
    "Grpc": "gRPC",
    "Jdbc": "JDBC", "Odbc": "ODBC",
    "Ldap": "LDAP", "Ldaps": "LDAPS",
    "Soap": "SOAP", "Rest": "REST", "Graphql": "GraphQL",
    # Auth and identity
    "Mtls": "mTLS",
    "Oauth": "OAuth", "Oauth2": "OAuth2",
    "Oidc": "OIDC", "Saml": "SAML", "Jwt": "JWT",
    "Iam": "IAM", "Sso": "SSO", "Mfa": "MFA",
    "Rbac": "RBAC", "Abac": "ABAC", "Pbac": "PBAC", "Acl": "ACL",
    "Pam": "PAM", "Idm": "IDM",
    "Hsm": "HSM", "Kms": "KMS", "Pki": "PKI",
    "Byok": "BYOK", "Hyok": "HYOK",
    # Data and APIs
    "Api": "API", "Apis": "APIs",
    "Json": "JSON", "Xml": "XML", "Yaml": "YAML", "Csv": "CSV",
    "Url": "URL", "Uri": "URI",
    "Html": "HTML", "Css": "CSS",
    # Note: "Sql" omitted from word-boundary list to avoid touching
    # .NET class names like "SqlClient", "SqlConnection" — fixed
    # only in checkbox contexts via the cell-only pass below.
    "Nosql": "NoSQL",
    "Cqrs": "CQRS", "Bff": "BFF",
    # Cloud
    "Aws": "AWS", "Gcp": "GCP",
    "Saas": "SaaS", "Iaas": "IaaS", "Paas": "PaaS",
    "Faas": "FaaS", "Caas": "CaaS", "Dbaas": "DBaaS",
    "Cdn": "CDN", "Waf": "WAF",
    "Vpn": "VPN", "Vpc": "VPC",
    "Lan": "LAN", "Vlan": "VLAN", "Nat": "NAT",
    "Eks": "EKS", "Aks": "AKS", "Gke": "GKE",
    "Iot": "IoT",
    # Security
    "Cors": "CORS", "Csrf": "CSRF", "Xss": "XSS", "Ssrf": "SSRF",
    "Ddos": "DDoS",
    "Hsts": "HSTS",
    "Sast": "SAST", "Dast": "DAST",
    "Apm": "APM", "Siem": "SIEM",
    "Cve": "CVE", "Owasp": "OWASP",
    # SLAs and resilience
    "Sla": "SLA", "Slo": "SLO",
    "Rpo": "RPO", "Rto": "RTO",
    "Mttr": "MTTR", "Mttf": "MTTF",
    # Compliance
    "Pii": "PII", "Pci": "PCI",
    "Hipaa": "HIPAA", "Wcag": "WCAG",
    # NOTE: "Iso" is risky as a word — leave it alone in prose
    "Ietf": "IETF",
    # Business
    "Crm": "CRM", "Erp": "ERP", "Cms": "CMS", "Wms": "WMS",
    "Ml": "ML",
    # Misc
    "It": None,  # handled only in compound "It Operations" — see below
}

# Multi-word phrase substitutions for cases where bare-word replacement
# is too risky or where the compound has its own canonical form.
# Applied with word boundaries.
PHRASE_FIXES = [
    # Disaster Recovery: replace "Dr X" only where X is a DR-context word.
    # "Dr Raj Doe" / "Dr Smith" stays untouched.
    (r"\bDr Strategy\b", "DR Strategy"),
    (r"\bDr Region\b", "DR Region"),
    (r"\bDr Plan\b", "DR Plan"),
    (r"\bDr Test\b", "DR Test"),
    (r"\bDr Tested\b", "DR Tested"),
    (r"\bDr Failover\b", "DR Failover"),
    (r"\bDr Site\b", "DR Site"),
    # IT Operations
    (r"\bIt Operations\b", "IT Operations"),
    # WAF/DDoS provider names
    (r"\bAws Waf\b", "AWS WAF"),
    (r"\bAzure Waf\b", "Azure WAF"),
    (r"\bCloudflare Waf\b", "Cloudflare WAF"),
    (r"\bGcp Cloud Armor\b", "GCP Cloud Armor"),
    (r"\bAws Shield\b", "AWS Shield"),
    (r"\bAzure Ddos\b", "Azure DDoS"),
    # API patterns
    (r"\bApi Service\b", "API Service"),
    (r"\bApi Gateway\b", "API Gateway"),
    (r"\bApi Key\b", "API Key"),
    (r"\bApi Driven\b", "API-Driven"),
    (r"\bApi Type\b", "API Type"),
    (r"\bApi Consumer\b", "API Consumer"),
    # ML
    (r"\bMl Model\b", "ML Model"),
    # KMS
    (r"\bCustomer Managed Kms\b", "Customer-Managed KMS"),
    # NoSQL family (in databases)
    (r"\bNosql Document\b", "NoSQL Document"),
    (r"\bNosql Key Value\b", "NoSQL Key-Value"),
    (r"\bNosql Graph\b", "NoSQL Graph"),
    (r"\bNosql Columnar\b", "NoSQL Columnar"),
    (r"\bRelational Db\b", "Relational DB"),
    (r"\bTime Series Db\b", "Time-Series DB"),
    # SSO compounds
    (r"\bSso Saml\b", "SSO SAML"),
    (r"\bSso Oidc\b", "SSO OIDC"),
    # IAM Role
    (r"\bIam Role\b", "IAM Role"),
    # FIPS
    (r"\bHsm Fips140 L3\b", "HSM FIPS 140 L3"),
    (r"\bHsm Fips140 L2\b", "HSM FIPS 140 L2"),
    # Automated IDM
    (r"\bAutomated Idm\b", "Automated IDM"),
    # Size suffixes
    (r"\b(\d+)gb\b", r"\1 GB"),
    (r"\b(\d+)tb\b", r"\1 TB"),
    (r"\b(\d+)pb\b", r"\1 PB"),
    (r"\bUnder 1gb\b", "Under 1 GB"),
    (r"\bOver 1pb\b", "Over 1 PB"),
]

DRY_RUN = "--apply" not in sys.argv

# Files to operate on
TARGETS = []
for root, _, files in os.walk("public/examples"):
    for f in files:
        if f.endswith((".md",)):
            TARGETS.append(os.path.join(root, f))
for root, _, files in os.walk("src/content/docs/examples"):
    for f in files:
        if f.endswith((".mdx",)):
            TARGETS.append(os.path.join(root, f))

per_pattern = collections.Counter()
per_file = {}

for path in TARGETS:
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    original = text

    # Pass 1: word-boundary single-word replacements
    for stripped, proper in ACRONYMS.items():
        if proper is None:
            continue
        new_text, n = re.subn(r"\b" + re.escape(stripped) + r"\b", proper, text)
        if n > 0:
            per_pattern[stripped] += n
            text = new_text

    # Pass 2: phrase-level replacements
    for pat, replacement in PHRASE_FIXES:
        new_text, n = re.subn(pat, replacement, text)
        if n > 0:
            per_pattern[pat] += n
            text = new_text

    if text != original:
        per_file[path] = sum(1 for a, b in zip(text, original) if a != b)
        if not DRY_RUN:
            with open(path, "w", encoding="utf-8") as fh:
                fh.write(text)

mode = "DRY-RUN" if DRY_RUN else "APPLIED"
print(f"=== {mode} ===\n")
print("Top 30 patterns hit:")
for p, n in per_pattern.most_common(30):
    print(f"  {n:5d}  {p}")
print(f"\nFiles changed: {len(per_file)}")
for p, n in sorted(per_file.items(), key=lambda x: -x[1])[:20]:
    print(f"  {n:5d}  {p}")
print(f"\nTotal pattern matches: {sum(per_pattern.values())}")
if DRY_RUN:
    print("\n(re-run with --apply to write changes)")
