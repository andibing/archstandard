# Solution Architecture Document — Stellar Platform (Internal Developer Platform)

> **Standard:** ADS v1.1.0 (Architecture Description Standard)
> **Author:** Tom Bloggs, Principal Platform Engineer
> **Organisation:** Stellar Engineering Ltd
> **Status:** Approved
> **Version:** 1.0

---

## 0. Document Control

### Document Metadata

| Field | Value |
|-------|-------|
| **Document Title** | Solution Architecture Document -- Stellar Platform (Internal Developer Platform) |
| **Application / Solution Name** | Stellar Platform |
| **Application ID** | APP-1042 |
| **Author(s)** | Tom Bloggs, Principal Platform Engineer |
| **Owner** | Tom Bloggs, Principal Platform Engineer |
| **Version** | 1.0 |
| **Status** | Approved |
| **Created Date** | 2026-01-14 |
| **Last Updated** | 2026-04-18 |
| **Classification** | Internal |

**Authors:**
- Tom Bloggs, Principal Platform Engineer

### Change History

| Version | Date | Author | Change Type | Description |
|------|------|------|------|------|
| 0.1 | 2026-01-14 | Tom Bloggs | [x] Initial Draft [ ] Minor Update [ ] Major Update [ ] Review Revision [ ] Approval | Initial draft following platform strategy workshop |
| 0.2 | 2026-02-05 | Claire Doe | [ ] Initial Draft [ ] Minor Update [x] Major Update [ ] Review Revision [ ] Approval | Added developer journey scenarios and DevEx metrics |
| 0.3 | 2026-02-27 | Amir Bloggs | [ ] Initial Draft [ ] Minor Update [x] Major Update [ ] Review Revision [ ] Approval | Added SRE-facing sections: observability, reliability, on-call model |
| 0.4 | 2026-03-20 | Tom Bloggs | [ ] Initial Draft [ ] Minor Update [ ] Major Update [x] Review Revision [ ] Approval | Incorporated feedback from Platform Advisory Group; added ADR-003 (multi-cloud) |
| 1.0 | 2026-04-18 | Tom Bloggs | [ ] Initial Draft [ ] Minor Update [ ] Major Update [ ] Review Revision [x] Approval | Approved by Architecture Review Board |

### Contributors & Approvals

| Name | Role | Contribution Type |
|------|------|------|
| Tom Bloggs | Principal Platform Engineer (Platform Lead) | [x] Author [ ] Reviewer [ ] Approver |
| Claire Doe | Developer Experience Lead | [x] Author [ ] Reviewer [ ] Approver |
| Amir Bloggs | Site Reliability Engineering Lead | [x] Author [ ] Reviewer [ ] Approver |
| Jane Doe | Product Manager (Stellar Platform) | [ ] Author [x] Reviewer [ ] Approver |
| Priya Bloggs | Head of Engineering | [ ] Author [x] Reviewer [ ] Approver |
| Joe Bloggs | Security Architect | [ ] Author [x] Reviewer [ ] Approver |
| Sam Doe | FinOps Lead | [ ] Author [x] Reviewer [ ] Approver |
| Architecture Review Board | Governance | [ ] Author [ ] Reviewer [x] Approver |

### Document Purpose & Scope

This SAD describes the architecture of Stellar Platform -- a self-service Internal Developer Platform (IDP) that provides Stellar Engineering Ltd's 60 stream-aligned product teams with golden paths for service creation, deployment, observability, and day-2 operations.

- **Scope boundary:** The Backstage developer portal, platform control plane (Crossplane, Terraform), delivery plane (ArgoCD, Tekton), observability stack (Prometheus, Grafana, Datadog), and the golden-path templates they expose. Includes the GKE (primary) and EKS (secondary) Kubernetes fleets.
- **Out of scope:** Individual product services that run on the platform (owned by their teams), the corporate identity provider (Okta, APP-0008), and the customer-facing Stellar SaaS product (APP-0100).
- **Related documents:** Stellar Engineering Platform Strategy 2026-2028 (STRAT-0004), Platform-as-a-Product Operating Model (POL-0031), Stellar Cloud Landing Zone Standards (STD-0012), Information Security Policy (POL-0001).

---

## 1. Executive Summary

### Solution Overview

Stellar Platform is an Internal Developer Platform (IDP) built on Backstage that offers Stellar Engineering Ltd's 400 engineers a curated, self-service experience for the entire software delivery lifecycle. It exposes a small number of well-paved golden paths -- opinionated templates and automation -- that reduce the cognitive load on stream-aligned product teams and let them ship independently without reasoning about Kubernetes manifests, Terraform modules, IAM boundaries, or observability wiring.

The platform is architected as three loosely-coupled planes: a Portal plane (Backstage portal, stellar CLI, TechDocs), a Control plane (Crossplane, Terraform modules, Dagger pipelines, GitHub as source of truth), and a Runtime plane (federated GKE and EKS clusters, delivered via ArgoCD GitOps and Tekton). Observability is provided by Prometheus + Grafana and Datadog (for cross-cloud APM and incident workflow). The platform is treated as a product with a product manager, roadmap, user research cadence, and opt-in adoption.

### Business Context & Drivers

| Driver | Driver Type | Description | Priority |
|------|------|------|------|
| Developer productivity | [ ] Regulatory [ ] Cost Reduction [ ] Modernisation [x] New Capability [ ] Risk Mitigation [ ] Security [ ] Performance [ ] Scalability [ ] End Of Life [ ] Merger Acquisition [ ] Other | Lead time for changes stretched from 2 days to 9 days; new service bootstrapping takes 3-6 weeks | [x] Critical [ ] High [ ] Medium [ ] Low |
| Cognitive load | [ ] Regulatory [ ] Cost Reduction [x] Modernisation [ ] New Capability [ ] Risk Mitigation [ ] Security [ ] Performance [ ] Scalability [ ] End Of Life [ ] Merger Acquisition [ ] Other | Product teams carrying too many accidental responsibilities (clusters, pipelines, IAM, alerting) | [ ] Critical [x] High [ ] Medium [ ] Low |
| Fragmentation | [ ] Regulatory [ ] Cost Reduction [x] Modernisation [ ] New Capability [ ] Risk Mitigation [ ] Security [ ] Performance [ ] Scalability [ ] End Of Life [ ] Merger Acquisition [ ] Other | 14 CI patterns, 6 Terraform styles, 4 Kubernetes approaches, 3 observability stacks | [ ] Critical [x] High [ ] Medium [ ] Low |
| Reliability | [ ] Regulatory [ ] Cost Reduction [ ] Modernisation [ ] New Capability [x] Risk Mitigation [ ] Security [ ] Performance [ ] Scalability [ ] End Of Life [ ] Merger Acquisition [ ] Other | Change failure rate at 18% (DORA high-performer threshold is 15%); configuration drift rising | [ ] Critical [x] High [ ] Medium [ ] Low |
| Security | [ ] Regulatory [ ] Cost Reduction [ ] Modernisation [ ] New Capability [ ] Risk Mitigation [x] Security [ ] Performance [ ] Scalability [ ] End Of Life [ ] Merger Acquisition [ ] Other | Inconsistent supply-chain controls; audit findings in SOC 2 Type II report | [ ] Critical [x] High [ ] Medium [ ] Low |
| Cost | [ ] Regulatory [x] Cost Reduction [ ] Modernisation [ ] New Capability [ ] Risk Mitigation [ ] Security [ ] Performance [ ] Scalability [ ] End Of Life [ ] Merger Acquisition [ ] Other | Cloud spend grew 42% YoY against 18% revenue growth; no unified FinOps view | [ ] Critical [ ] High [x] Medium [ ] Low |

### Strategic Alignment

#### Organisational Strategy Alignment

| Question | Response |
|----------|----------|
| Which organisational strategy or initiative does this solution support? | Stellar Engineering Platform Strategy 2026-2028: pillar 2 ("reduce cognitive load on stream-aligned teams") and pillar 4 ("engineer productivity and DORA elite performance") |
| Has this solution been reviewed against the organisation's capability model? | Yes -- reviewed by Enterprise Architecture Council 2026-02-12 |
| Does this solution duplicate any existing capability? | No -- it consolidates and retires fragmented capabilities |

#### Shared Service Reuse

| Capability | Shared Service | Reused | Justification |
|------|------|------|------|
| Source control | GitHub Enterprise (corporate) | [x] Yes [ ] No | -- |
| Identity & Access | Okta (corporate IdP) | [x] Yes [ ] No | SCIM-provisioned groups drive Backstage and Kubernetes RBAC |
| APM & Incident Management | Datadog | [x] Yes [ ] No | Retained for APM, synthetics, on-call; avoids re-tooling cost |
| Metrics & Dashboards | Prometheus + Grafana (new standard) | [x] Yes [ ] No | Self-hosted, multi-tenant; integrates with Datadog |
| Secret Management | HashiCorp Vault | [x] Yes [ ] No | Workload Identity federated for short-lived credentials |
| CI/CD | GitHub Actions + Tekton | [x] Yes [ ] No | Actions for repo-level checks; Tekton for privileged build/sign |
| Data & Analytics | Snowflake | [x] Yes [ ] No | DORA and DevEx telemetry |

**In Scope:**
- Backstage developer portal and all first-party plugins
- Platform control plane: Crossplane, Terraform modules, Dagger pipeline libraries
- Delivery plane: ArgoCD, Tekton, supply-chain tooling (Sigstore, SLSA)
- Runtime plane: GKE (primary) and EKS (secondary) fleet
- Observability plane: Prometheus, Grafana, OpenTelemetry, Datadog integration
- Golden-path templates: Go service, TypeScript service, Python batch, frontend app, preview environment
- stellar CLI and enablement tooling

**Out of Scope:**
- Individual product services running on the platform
- Customer-facing Stellar SaaS product (APP-0100)
- Corporate identity (Okta) and networking platform
- Snowflake warehouse workloads (APP-0070)

### Current State

Stellar Engineering reached its current scale (400 engineers, 60 teams, ~850 services) without a deliberate platform strategy. Symptoms: manual service bootstrapping takes 3-6 weeks; a single 12-year-old Jenkins instance runs 2,400 jobs with an absent maintainer; six competing Terraform patterns; four Kubernetes deployment approaches; three competing observability stacks; Confluence decay. DORA baseline (Q4 2025, manual sampling) sits in the medium-performer band: deployment frequency weekly, lead time 9 days, change failure rate 18%, MTTR 8 hours. Net DevEx score -18.

### Key Decisions & Constraints

| Decision | Constraint Type | Rationale | Reversibility |
|------|------|------|------|
| Backstage as the portal foundation | [x] Technical | Industry standard; CNCF project; plugin ecosystem; hiring signal | [ ] Easily Reversible [ ] Reversible With Effort [x] Difficult To Reverse [ ] Irreversible |
| Multi-cloud from day one (GKE + EKS) | [ ] Technical [x] Commercial | Customer commitments require regional presence in both GCP and AWS | [ ] Easily Reversible [ ] Reversible With Effort [x] Difficult To Reverse [ ] Irreversible |
| GitOps via ArgoCD | [x] Technical | Declarative, auditable, dominant pattern for Kubernetes at this scale | [ ] Easily Reversible [x] Reversible With Effort [ ] Difficult To Reverse [ ] Irreversible |
| Platform-as-a-product operating model | [x] Organisational | Voluntary adoption; measured on adoption, DORA, DevEx survey | [ ] Easily Reversible [x] Reversible With Effort [ ] Difficult To Reverse [ ] Irreversible |
| Paved road with opt-out allowed | [x] Organisational | Shortest path, but does not forbid teams from leaving the road | [x] Easily Reversible [ ] Reversible With Effort [ ] Difficult To Reverse [ ] Irreversible |

### Project Details

| Field | Value |
|-------|-------|
| **Project Name** | Stellar Platform Programme |
| **Project Code** | PRJ-2026-004 |
| **Project Manager** | Jane Doe (Product Manager, Platform) |
| **Estimated Capex** | 1,200,000 |
| **Estimated Opex** | 350,000 |
| **Currency** | GBP |
| **Target Go Live** | 2026-07-01 |

### Business Criticality

**Tier 3: Medium Impact** -- Internal productivity tool with no direct customer-facing revenue impact. Platform outage halts self-service but does not block customer-facing services (they continue running; emergency paths remain).

---

## 2. Stakeholders & Concerns

### Stakeholder Register

| Stakeholder | Role Type | Concerns | Relevant Views |
|------|------|------|------|
| Priya Bloggs | [x] Business Owner | Engineer productivity, DORA metrics, cost, predictable delivery | Executive Summary, Scenarios |
| Jane Doe | [x] Project Manager | Adoption, DevEx survey scores, paved-road-first narrative | All views |
| Tom Bloggs | [x] Solution Architect | Design integrity, platform reliability, long-term maintainability | All views |
| Claire Doe | [x] Other (DevEx Lead) | Onboarding time, cognitive load, documentation quality | Logical, Scenarios, Lifecycle |
| Amir Bloggs | [x] Operations Sre | Reliability of the platform itself, on-call burden, observability | Physical, Operational Excellence, Reliability |
| Joe Bloggs | [x] Security Architect | Supply chain, secrets, Kubernetes RBAC, audit | Security, Data |
| Sam Doe | [x] Other (FinOps Lead) | Multi-cloud cost attribution, showback, waste reduction | Cost Optimisation |
| Product Team Tech Leads (c.60) | [x] End User | Autonomy, not being blocked, escape hatches | Logical, Scenarios |

### Compliance & Regulatory Context

#### Regulatory Requirements

| Regulation | Regulation Type | Applicability | Design Impact |
|------|------|------|------|
| UK GDPR & Data Protection Act 2018 | [x] Data Protection | Engineer identity data; indirect customer data via product logs | Access controls, audit logging, engineer telemetry consent |
| SOC 2 Type II | [x] Security | Stellar is SOC 2 Type II certified; platform affects control environment | Platform controls in scope; evidence automation required |
| SLSA Supply-chain Levels (target L3) | [x] Security | CI/CD supply chain | Signed images, provenance attestations, admission control |
| CIS Kubernetes Benchmark v1.9 | [x] Security | Cluster hardening baseline | Automated compliance checks |

---

## 3. Architectural Views

### 3.1 Logical View

**Diagrams:**
- Portal plane (Backstage, stellar CLI, TechDocs) above Control plane (Crossplane, Terraform, Dagger, GitHub) above Runtime plane (ArgoCD, Tekton, GKE, EKS) with Observability plane (Prometheus, Grafana, OpenTelemetry, Datadog) alongside.

#### Components

| Name | Component Type | Description | Technology | Owner | Status |
|------|------|------|------|------|------|
| Backstage Portal | [x] Web Application | Single pane of glass: catalogue, Scaffolder, TechDocs, scorecards, cost insights | Backstage (Node.js, React, TypeScript) | Platform Team (Portal squad) | [x] New |
| stellar CLI | [x] Other | Thin CLI wrapping Backstage APIs for terminal-first engineers | Go | Platform Team (DevEx squad) | [x] New |
| Scaffolder Templates | [x] Other | Golden-path templates for new services, jobs, frontends, preview envs | Backstage Scaffolder, YAML | Platform Team (Portal squad) | [x] New |
| Software Catalogue | [x] Api Service | Authoritative registry of services, APIs, resources, teams, ownership | Backstage catalog-backend, PostgreSQL | Platform Team (Portal squad) | [x] New |
| Crossplane Control Plane | [x] Api Service | Kubernetes-native API for cloud resource provisioning | Crossplane v1.15 | Platform Team (Control squad) | [x] New |
| Terraform Module Library | [x] Other | Audited modules for resources Crossplane does not yet model | Terraform 1.7, Terragrunt, Atlantis | Platform Team (Control squad) | [x] New |
| Dagger Pipeline Library | [x] Other | Reusable typed CI pipelines (build, test, SBOM, sign, publish) | Dagger (Go SDK) | Platform Team (Delivery squad) | [x] New |
| Tekton Pipelines | [x] Backend Service | Heavy privileged pipeline work (signing, image promotion) | Tekton v0.56 on GKE | Platform Team (Delivery squad) | [x] New |
| ArgoCD Control Plane | [x] Backend Service | GitOps engine; reconciles target state for all tenant namespaces | ArgoCD v2.11 HA | Platform Team (Runtime squad) | [x] New |
| GKE Fleet | [x] Other | Primary Kubernetes fleet (3 regions) | GKE Autopilot | Platform Team (Runtime squad) | [x] New |
| EKS Fleet | [x] Other | Secondary Kubernetes fleet (2 regions) | EKS + Karpenter | Platform Team (Runtime squad) | [x] New |
| Prometheus + Grafana | [x] Backend Service | Platform and tenant metrics | Prometheus + Thanos, Grafana | Platform Team (Obs squad) | [x] New |
| Datadog integration | [x] Other | APM, RUM, synthetics, on-call paging | Datadog SaaS | Platform Team (Obs squad) | [x] Existing Modified |
| DORA Telemetry Pipeline | [x] Batch Job | Extracts DORA metrics per team to Snowflake | Dagger + Snowflake | Platform Team (DevEx squad) | [x] New |

#### Design Patterns

| Pattern | Where Applied | Rationale |
|------|------|------|
| [x] Other (Platform-as-a-Product) | Overall operating model | Voluntary adoption; treat internal customers as customers |
| [x] Other (Golden Paths / Paved Road) | Scaffolder, CI libraries, runtime conventions | Make the right thing the easy thing |
| [x] Other (GitOps) | ArgoCD, Crossplane | Declarative, auditable, self-healing |
| [x] Sidecar | OpenTelemetry Collector | Non-invasive telemetry |
| [x] Api Gateway | Backstage BFF | Single authenticated entry point |
| [x] Strangler Fig | Jenkins to Tekton migration | Gradual retirement without a big-bang cutover |

### 3.2 Integration & Data Flow View

#### Internal Component Connectivity

| Source | Destination | Protocol | Encrypted | Authentication Method | Direction | Synchronicity | Purpose |
|------|------|------|------|------|------|------|------|
| Engineer browser | Backstage Portal | [x] Https | [x] Yes | [x] Oidc | [x] Bidirectional | [x] Synchronous | Portal access |
| stellar CLI | Backstage backend | [x] Https | [x] Yes | [x] Oidc | [x] Bidirectional | [x] Synchronous | CLI self-service |
| Backstage | GitHub Enterprise | [x] Https | [x] Yes | [x] Other (GitHub App) | [x] Bidirectional | [x] Synchronous | Scaffolder, catalogue sync |
| Backstage | PostgreSQL | [x] Tcp Tls | [x] Yes | [x] Mtls | [x] Bidirectional | [x] Synchronous | Catalogue persistence |
| Tekton | Artifact Registry / GHCR | [x] Https | [x] Yes | [x] Iam Role | [x] Unidirectional | [x] Synchronous | Push container images |
| ArgoCD | GKE / EKS API servers | [x] Https | [x] Yes | [x] Certificate | [x] Bidirectional | [x] Synchronous | Reconcile desired state |
| Crossplane | GCP / AWS APIs | [x] Https | [x] Yes | [x] Iam Role | [x] Unidirectional | [x] Synchronous | Provision cloud resources |
| OpenTelemetry Collector | Prometheus | [x] Https | [x] Yes | [x] Mtls | [x] Unidirectional | [x] Asynchronous | Metrics ingestion |
| OpenTelemetry Collector | Datadog | [x] Https | [x] Yes | [x] Api Key | [x] Unidirectional | [x] Asynchronous | APM and trace ingestion |
| Platform workloads | Vault | [x] Https | [x] Yes | [x] Jwt | [x] Bidirectional | [x] Synchronous | Dynamic secrets |

#### External Integrations

| Source App | Destination App | Integration Type | Protocol | Encrypted | Authentication Method | Purpose |
|------|------|------|------|------|------|------|
| Stellar Platform | Okta | [x] Saas | [x] Https | [x] Yes | [x] Oidc | Authentication, SCIM group sync |
| Stellar Platform | GitHub Enterprise Cloud | [x] Saas | [x] Https | [x] Yes | [x] Other (GitHub App) | Source of truth |
| Stellar Platform | Datadog | [x] Saas | [x] Https | [x] Yes | [x] Api Key | APM, paging |
| Stellar Platform | Snowflake | [x] Saas | [x] Https | [x] Yes | [x] Certificate | DORA telemetry landing |

#### APIs & Interfaces

| Name | Api Type | Direction | Data Format | Version | Authenticated | Rate Limited |
|------|------|------|------|------|------|------|
| Backstage Backend API | [x] Rest | [x] Exposed | [x] Json | v1 | [x] Yes | [x] Yes |
| Scaffolder Templates Catalogue | [x] Rest | [x] Exposed | [x] Json | v1 | [x] Yes | [x] Yes |
| DORA Metrics API | [x] Rest | [x] Exposed | [x] Json | v1 | [x] Yes | [x] Yes |
| Crossplane API | [x] Other (K8s CRD) | [x] Exposed | [x] Json | Crossplane v1 | [x] Yes | [x] Yes |

### 3.3 Physical View

#### Hosting & Infrastructure

**Venue Types:**
- Public Cloud (multi-cloud)

**Regions:**
- GCP: europe-west2, us-east4, asia-southeast1
- AWS: eu-west-2, us-east-1

**Service Models:**
- [x] PaaS
- [x] CaaS

**Cloud Providers:**
- [x] GCP (primary)
- [x] AWS (secondary)

#### Compute

**Compute Types:**
- [x] Container (GKE Autopilot, EKS + Karpenter)
- [x] Serverless Function (occasional Cloud Run utilities)

##### Containers

**Platform:** Multi (GKE Autopilot primary, EKS secondary)

**Base Images:**
- Chainguard Wolfi (distroless); Google distroless; cgr.dev/chainguard for static binaries

**Cluster Size:** 51-100 nodes in production (across fleet)

#### Network Connectivity

| Field | Value |
|-------|-------|
| **Internet Facing** | [x] Yes (portal only) |
| **Outbound Internet** | [x] Yes |
| **Cloud To On Prem** | [x] Yes (ExpressRoute to London colo for Vault HSM root) |
| **Third Party Connectivity** | [x] Yes (Datadog, Snowflake over PrivateLink) |
| **Cloud Peering** | [x] Yes (GCP-AWS via Megaport) |
| **Wireless Required** | [ ] Yes [x] No |
| **Traffic Pattern** | [x] Variable Predictable (engineer working hours) |
| **Latency Requirement** | [x] Standard Sub 1s |
| **Ddos Protection** | [x] Yes |
| **Ddos Provider** | [x] GCP Cloud Armor + Cloudflare |
| **Waf Enabled** | [x] Yes |
| **Waf Provider** | [x] GCP Cloud Armor + AWS WAF |
| **Rate Limiting** | [x] Yes |

#### Environments

| Environment Type | Count | Venue | Auto Scale Down |
|------|------|------|------|
| [x] Development (ephemeral preview) | up to 200 concurrent | GKE (europe-west2) | [x] Yes |
| [x] Integration Test | 1 | GKE (europe-west2) | [x] Yes |
| [x] Staging | 1 (multi-cloud) | GKE + EKS | [ ] No |
| [x] Production | 3 GCP regions + 2 AWS regions | GKE + EKS | [ ] No |

**Security Agents:**
- GKE Security Posture / GuardDuty (all clusters)
- Falco (eBPF runtime anomaly detection)
- Trivy Operator (continuous image and config scanning)

### 3.4 Data View

#### Data Stores

| Name | Store Type | Technology | Authoritative | Retention Period | Size | Classification | Personal Data | Sensitive | Encryption Level | Key Management |
|------|------|------|------|------|------|------|------|------|------|------|
| Software catalogue | [x] Relational Db | Cloud SQL (PostgreSQL) | [x] Yes | [x] Indefinite | [x] 1-100gb | [x] Internal | [x] Yes (engineer email) | [ ] No | [x] Field Level | [x] Customer Managed Kms |
| TechDocs (built) | [x] Object Storage | GCS / S3 | [ ] No | [x] Indefinite | [x] 100gb-1tb | [x] Internal | [ ] No | [ ] No | [x] Storage Level | [x] Customer Managed Kms |
| Metrics (hot) | [x] Time Series Db | Prometheus + Thanos | [x] Yes | [x] Weeks | [x] 1-10tb | [x] Internal | [ ] No | [ ] No | [x] Storage Level | [x] Customer Managed Kms |
| Logs | [x] Search Index | Datadog | [ ] No | [x] Months | [x] 10-100tb | [x] Internal | [ ] No | [ ] No | [x] Storage Level | [x] Provider Managed |
| DORA metrics | [x] Data Warehouse | Snowflake | [x] Yes | [x] 5-10 Years | [x] 1-100gb | [x] Internal | [x] Yes (team-linked) | [ ] No | [x] Storage Level | [x] Customer Managed Kms |
| Tekton artefacts | [x] Object Storage | GCS / S3 | [x] Yes | [x] Months | [x] 100gb-1tb | [x] Internal | [ ] No | [ ] No | [x] Storage Level | [x] Customer Managed Kms |
| Secrets | [x] Other (Vault KV + dynamic) | HashiCorp Vault | [x] Yes | [x] Transient | [x] Under 1gb | [x] Restricted | [ ] No | [ ] No | [x] Application Level | [x] Hsm |
| Platform configuration | [x] Other (Git) | GitHub Enterprise | [x] Yes | [x] Indefinite | [x] 1-100gb | [x] Internal | [ ] No | [ ] No | [x] Storage Level | [x] Provider Managed |

#### Data Transfers

| Destination | Destination Type | Classification | Transfer Method | Encrypted |
|------|------|------|------|------|
| Datadog | [x] Third Party | [x] Internal | [x] Api | [x] Yes |
| Snowflake | [x] Third Party | [x] Internal | [x] Api | [x] Yes |
| GitHub Enterprise Cloud | [x] Third Party | [x] Internal | [x] Api | [x] Yes |

**Data Sovereignty:** UK customer-facing tenants' metadata remains in europe-west2 / eu-west-2. Datadog data is routed to the EU site. Snowflake uses an EU deployment.

### 3.5 Security View

#### Business Impact Assessment

| Field | Value |
|-------|-------|
| **Confidentiality** | [x] High |
| **Integrity** | [x] High |
| **Availability** | [x] Medium |
| **Non Repudiation** | [x] Medium |

#### Authentication

| Access Type | Method | Uses Group Wide Auth |
|------|------|------|
| [x] End User Internal | [x] Sso Oidc + [x] Mfa | [x] Yes |
| [x] It Operations | [x] Sso Oidc + hardware key + PIM | [x] Yes |
| [x] Service Account | [x] Passwordless (Workload Identity) | [x] Yes |
| [x] Api Consumer (CI runners) | [x] Certificate (SPIFFE SVID) | [x] Yes |

#### Authorisation

| Field | Value |
|-------|-------|
| **Model** | [x] Rbac (with ABAC attributes for team ownership) |
| **Entitlement Store** | Okta groups synced via SCIM to Backstage and Kubernetes RBAC |
| **Provisioning Process** | [x] Automated Idm |
| **Recertification Enabled** | [x] Yes (quarterly) |
| **Segregation Of Duties Enforced** | [x] Yes |

#### Privileged Access

| Field | Value |
|-------|-------|
| **Pam Solution** | Okta PIM with JIT 1-2h TTLs |
| **Just In Time Access** | [x] Yes |
| **Session Recording** | [x] Yes (IAP-tunnelled, recorded) |
| **Break Glass Process** | [x] Yes (dual-approval) |

#### Encryption at Rest

| Field | Value |
|-------|-------|
| **Implemented** | [x] Yes |
| **Level** | [x] Logical Container |
| **Key Type** | [x] Symmetric |
| **Algorithm** | AES-256-GCM |
| **Key Generation** | [x] Hsm Fips140 L3 |
| **Key Storage** | [x] Kms |
| **Key Rotation Days** | 90 |

#### Secret Management

| Field | Value |
|-------|-------|
| **Secret Store** | [x] Hashicorp Vault |
| **Distribution** | [x] Mounted Volume (CSI Secrets Store -> tmpfs) |
| **Rotation** | [x] Automatic (dynamic secrets with TTL) |

#### Security Monitoring

| Field | Value |
|-------|-------|
| **Siem Integration** | [x] Yes |
| **Siem Tool** | Splunk Enterprise |
| **Security Event Logging** | [x] Yes |
| **Intrusion Detection** | [x] Yes (Falco + GuardDuty + Security Command Center) |

### 3.6 Scenarios

#### Key Use Cases

**UC-01: Engineer bootstraps a new service from a golden-path template**

Actors: Engineer on a stream-aligned product team. Trigger: New service needed for a product increment. Main flow: Open Backstage, choose "Create new Go service", fill 6 fields (name, team, tier, region, classification), Scaffolder creates repos, Tekton runs build + SBOM + cosign, Crossplane provisions namespace + bucket + SA, ArgoCD deploys to staging, Datadog dashboard auto-created. Target < 30 minutes end-to-end.

**UC-02: Engineer deploys to production via GitOps**

Actors: Engineer with repo write access. Trigger: Feature or fix ready. Main flow: PR merged -> Tekton builds + signs image -> bot PR raised against infra repo bumping image tag -> approved and merged -> ArgoCD detects drift and syncs -> Argo Rollouts canary 10/50/100 with SLO gating -> automatic rollback if burn rate exceeds threshold.

**UC-03: SRE responds to a platform incident (break-glass)**

Actors: SRE on-call. Trigger: Datadog pages on ArgoCD cluster-wide sync failure. Main flow: Ack page, open incident bridge, request PIM elevation (dual-approval), kubectl via IAP tunnel with session recording, diagnose, revert offending commit, ArgoCD recovers, PIM role auto-expires at T+1h, audit trail exports to SIEM.

#### Architecture Decision Records

**ADR-001 -- Adopt Backstage rather than build an in-house portal**
Status: Accepted. Date: 2026-01-22. Context: Need unified front-door; considered build, Backstage, or commercial IDP (Port.io / Cortex / OpsLevel). Decision: Adopt Backstage. Alternatives: build bespoke (4-6 engineer-years; weaker hiring signal), commercial IDP (fast but ~GBP 200k/yr at 400 engineers; less core-model customisation). Consequences: strong hiring signal and community velocity; commits us to tracking upstream; no per-seat cost.

**ADR-002 -- ArgoCD for GitOps rather than Flux**
Status: Accepted. Date: 2026-02-09. Context: GitOps engine for GKE + EKS. Decision: ArgoCD HA. Alternatives: Flux (lighter footprint but weaker UX at 850+ applications). Consequences: excellent developer UX; first-class progressive delivery (Argo Rollouts); heavier resource footprint mitigated by sharding.

**ADR-003 -- Multi-cloud (GKE primary, EKS secondary) from day one**
Status: Accepted. Date: 2026-03-11. Context: Two of five largest customers require AWS regions; a third regulated customer requires GCP. Decision: Design multi-cloud from inception; Crossplane provides uniform abstraction. Alternatives: single-cloud GCP or AWS (simpler, cheaper) rejected due to customer contractual requirements. Consequences: ~25% higher platform engineering cost; strategic flexibility and reduced vendor lock-in.

---

## 4. Quality Attributes

### 4.1 Operational Excellence

| Field | Value |
|-------|-------|
| **Logging Centralised** | [x] Yes |
| **Logging Tool** | Datadog (application + pipeline) + Splunk (audit) |
| **Monitoring Tool** | Prometheus + Grafana + Datadog |
| **Tracing Enabled** | [x] Yes (OpenTelemetry + Datadog APM) |
| **Alerting Configured** | [x] Yes (PagerDuty + Slack) |
| **Runbooks Documented** | [x] Yes (every platform SLO has a linked TechDocs runbook) |

### 4.2 Reliability & Resilience

| Field | Value |
|-------|-------|
| **Dr Strategy** | [x] Warm Standby |
| **Multi Venue Deployment** | [x] Yes (multi-region GCP + multi-cloud) |
| **Rto Target** | PT30M (portal); PT4H (Vault restore) |
| **Rpo Target** | PT5M (PostgreSQL); PT24H (Vault) |
| **Scalability** | [x] Full Auto Scaling |
| **Fault Tolerance Designed** | [x] Yes |
| **Chaos Testing Practised** | [x] Yes (Litmus, monthly) |
| **Backup Enabled** | [x] Yes |
| **Backup Type** | [x] Snapshot |
| **Backup Frequency** | [x] Daily (PostgreSQL, Vault); continuous (Git) |
| **Backup Immutable** | [x] Yes (GCS / S3 Object Lock) |
| **Backup Encrypted** | [x] Yes (CMEK AES-256) |

### 4.3 Performance Efficiency

#### Capacity & Growth Projections

| Field | Value |
|-------|-------|
| **Current Users (engineers)** | 400 |
| **Year1 Users** | 550 |
| **Year3 Users** | 800 |
| **Year5 Users** | 1000 |
| **Current Services in Catalogue** | 850 |
| **Year1 Services** | 1100 |
| **Year3 Services** | 1600 |
| **Year5 Services** | 2200 |
| **Design Scales To Projected Growth** | [x] Yes (revisit Thanos retention and Datadog contract at year 3) |
| **Seasonal Demand Patterns** | [x] Yes |
| **Seasonal Details** | Quarterly OKR planning drives deployment spikes in weeks 2-4 of each quarter |

**DORA targets:** lead time < 2 days (40% reduction from 9-day baseline); CFR < 10%; deployment frequency daily per team; MTTR < 1h.

### 4.4 Cost Optimisation

| Field | Value |
|-------|-------|
| **Cost Analysis Performed** | [x] Yes (Cloudability modelling; payback 11 months) |
| **Design Constrained By Cost** | [x] Yes (partial -- multi-cloud premium explicitly accepted) |
| **Reserved Capacity** | [x] Yes (committed-use discounts on baseline GKE/EKS nodes) |
| **Cost Monitoring Enabled** | [x] Yes (per-team showback in Backstage) |
| **Tagging Strategy** | [x] Yes (`team`, `service`, `tier`, `environment` propagated by Crossplane + Scaffolder) |

### 4.5 Sustainability

| Field | Value |
|-------|-------|
| **Hosting Location Optimised For Carbon** | [x] Yes (partial -- regions chosen for customer proximity; all on carbon-neutral / renewable commitments) |
| **Non Prod Auto Shutdown** | [x] Yes (ephemeral previews auto-expire; non-prod clusters scale to minimal nodes off-hours) |
| **Resources Rightsized** | [x] Yes |
| **Workload Pattern** | [x] Variable Predictable |
| **Continuous Availability Required** | [x] Yes (portal; engineers across time zones) |

### Quality Attribute Tradeoffs

| Attributes Involved | Description | Chosen Priority | Rationale |
|------|------|------|------|
| Reliability, Cost Optimisation | Multi-cloud (GKE + EKS) increases platform engineering cost | [x] Reliability | Strategic customer commitments and reduced cloud-provider lock-in outweigh ~25% cost premium |
| Performance, Operational Excellence | GKE Autopilot has higher per-pod cost but lower operational burden | [x] Operational Excellence | Platform team of 12 is the binding constraint; SRE toil reduction compounds |
| Flexibility, Operational Excellence | Golden paths reduce flexibility but lower cognitive load | [x] Operational Excellence | Paved road with opt-out preserves autonomy while making the right path easy |

---

## 5. Lifecycle Management

### Migration (6 R's applied to the Jenkins estate)

| Field | Value |
|-------|-------|
| **Classification (mixed)** | [x] Replace (manual bootstrapping workflows) [x] Rehost (~1,600 Jenkins jobs) [x] Replatform (~500 jobs to Dagger) [x] Refactor (~300 jobs to typed Dagger) [x] Retire (~200 jobs found redundant) |
| **Deployment Strategy** | [x] Strangler Fig |
| **Data Migration Mode** | [x] Not Applicable (platform processes no customer data; catalogue populated by GitHub scan) |
| **Data Migration Method** | N/A |
| **Data Volume** | N/A |
| **End User Cutover** | [x] Phased (by team, opt-in via Engineering Directors) |
| **External System Cutover** | [x] Phased (Jenkins retired per directorate) |
| **Max Acceptable Downtime** | [x] Hours (migration windows); [x] Zero (steady state) |
| **Rollback Plan** | Teams may revert to prior CI / deployment pattern during Wave 2; platform monitors adoption and DORA and escalates if rollback trend emerges |
| **Transient Infrastructure Needed** | [ ] Yes [x] No |

### Resourcing & Skills

| Field | Value |
|-------|-------|
| **Cloud Platform (GCP)** | [x] High |
| **Cloud Platform (AWS)** | [x] Medium (hiring plan + cross-training Q2) |
| **Infrastructure As Code** | [x] Medium (Crossplane training Q2) |
| **Cicd Management** | [x] High |
| **Application Stack (Backstage TS/React)** | [x] Medium (mentoring in progress) |
| **Database Administration** | [x] Medium |
| **Security Compliance** | [x] Medium (embedded security engineer 50%) |
| **Operational Readiness** | [x] B Partially Capable (core runtime in-hand; AWS depth and Backstage plugin velocity are the known gaps with mitigations) |

### Release & Support

| Field | Value |
|-------|-------|
| **Release Frequency** | [x] Continuous (platform deploys multiple times daily) |
| **Support Model** | [x] Internal Team (platform-as-a-product; #stellar-platform Slack, weekly office hours) |
| **Support Hours** | [x] 24x7 on-call for SLO-violating platform incidents; business-hours primary |
| **Intended Lifespan** | [x] 5-10 Years |
| **Exit Plan Documented** | [x] Yes |
| **Vendor Lock-in Level** | [x] Moderate |

---

## 6. Decision Making & Governance

### 6.1 Constraints

| Id | Constraint | Category | Impact On Design | Last Assessed |
|------|------|------|------|------|
| C-001 | Must integrate with existing Okta, GitHub Enterprise, Datadog, Snowflake | [x] Organisational | Reuse mandated; no parallel IdP or APM | 2026-01-14 |
| C-002 | Multi-cloud required (GCP + AWS) | [x] Commercial | Adds ~25% platform engineering cost | 2026-03-11 |
| C-003 | SOC 2 Type II controls must not regress | [x] Regulatory | Change management, access control, monitoring in scope | 2026-02-05 |
| C-004 | Platform team headcount capped at 12 for FY26 | [x] Organisational | Forces ruthless prioritisation | 2026-01-14 |
| C-005 | Budget cap GBP 1.2M capex + GBP 350k/yr opex | [x] Commercial | Commercial IDPs out-of-scope due to per-seat pricing at 400 engineers | 2026-01-14 |

### 6.2 Assumptions

| Id | Assumption | Impact If False | Certainty | Status | Owner | Evidence |
|------|------|------|------|------|------|------|
| A-001 | Adoption will grow organically given a high-quality paved road | Platform becomes a white elephant; adoption stalls | [x] Medium | [x] Open | Jane Doe | 2025 DevEx survey demand; tracked via quarterly adoption KPI |
| A-002 | Stream-aligned teams can absorb GitOps learning curve with Scaffolder support | Higher-than-expected support burden | [x] High | [x] Closed | Claire Doe | Wave 0/1 feedback positive |
| A-003 | Datadog contract can scale to 3x current ingest | Cost surprise mid-year | [x] High | [x] Closed | Sam Doe | Signed addendum with Datadog |
| A-004 | GKE Autopilot pricing remains stable for 3 years | Run cost surprise | [x] Medium | [x] Open | Sam Doe | GCP price-hold provisions in EA |

### 6.3 Risks

| Id | Risk Event | Risk Category | Severity | Likelihood | Mitigation Strategy | Mitigation Plan | Residual Risk | Owner | Last Assessed |
|------|------|------|------|------|------|------|------|------|------|
| R-001 | Platform team becomes a bottleneck for 60 teams' feature requests | [x] Operational | [x] High | [x] High | [x] Mitigate | Platform-as-a-product model; PM-owned roadmap; quarterly prioritisation with top-20 product teams; explicit escape hatches; community-of-practice contributions | [x] Medium | Jane Doe | 2026-04-10 |
| R-002 | Golden paths become too restrictive; paved-road fatigue sets in | [x] Operational | [x] High | [x] Medium | [x] Mitigate | Paved-road-with-opt-out philosophy baked in; quarterly DevEx surveys test fit; template versioning so teams can pin and diverge | [x] Medium | Claire Doe | 2026-04-10 |
| R-003 | Shadow platforms emerge -- teams route around Stellar Platform | [x] Operational | [x] High | [x] Medium | [x] Mitigate | Catalogue visibility; Engineering Director sponsorship; quarterly adoption review at senior leadership | [x] Medium | Tom Bloggs | 2026-04-10 |
| R-004 | Backstage upstream velocity outpaces our tracking; plugins break on bumps | [x] Technical | [x] Medium | [x] High | [x] Mitigate | Track upstream actively; contribute upstream; plugin acceptance tests in CI; monthly upgrade cadence | [x] Medium | Tom Bloggs | 2026-04-10 |
| R-005 | Multi-cloud abstractions leak, producing unpredictable behaviour between clouds | [x] Technical | [x] High | [x] Medium | [x] Mitigate | Clear composition contract per Crossplane resource; contract tests on both clouds; ADR required before a new cloud-specific primitive is exposed | [x] Medium | Tom Bloggs | 2026-04-10 |
| R-006 | Compromise of the platform (ArgoCD, Crossplane) amplifies blast radius across all tenant workloads | [x] Security | [x] Critical | [x] Low | [x] Mitigate | Defence in depth: Sigstore admission, Falco runtime, signed Git, no shared credentials, Workload Identity, annual red-team, zero-standing-privilege | [x] Low | Joe Bloggs | 2026-04-10 |
| R-007 | Jenkins migration drags beyond 18 months; carrying cost of two systems becomes unsustainable | [x] Delivery | [x] Medium | [x] Medium | [x] Mitigate | Quarterly go/no-go with published Jenkins EOL date; rehost-first, refactor-later policy; dedicated migration squad | [x] Medium | Tom Bloggs | 2026-04-10 |
| R-008 | Datadog vendor lock-in hardens as custom monitors proliferate | [x] Commercial | [x] Medium | [x] Medium | [x] Mitigate | OpenTelemetry Collector abstraction; dashboards-as-code (Terraform provider); quarterly review of Datadog-specific usage | [x] Medium | Amir Bloggs | 2026-04-10 |
| R-009 | DORA metrics misinterpreted as individual performance rather than system health | [x] Operational | [x] Medium | [x] Medium | [x] Mitigate | DORA shown at team level only; engineering handbook explicitly describes DORA as system-health signals; director-level coaching | [x] Low | Jane Doe | 2026-04-10 |

### 6.4 Dependencies

| Id | Dependency | Direction | Status | Owner | Evidence | Last Assessed |
|------|------|------|------|------|------|------|
| D-001 | Okta SCIM connectors stable | [x] Inbound | [x] Committed | Identity team | Existing | 2026-02-15 |
| D-002 | GitHub Enterprise Cloud API rate limits adequate | [x] Inbound | [x] Committed | GitHub vendor | Enterprise contract | 2026-02-15 |
| D-003 | Datadog multi-cloud PrivateLink | [x] Inbound | [x] Committed | Datadog | PrivateLink enabled | 2026-03-01 |
| D-004 | Megaport interconnect between GCP and AWS | [x] Inbound | [x] Resolved | Network team | Live since 2026-02 | 2026-02-20 |
| D-005 | Product teams adopt golden paths (Wave 1) | [x] Inbound | [x] Committed | Engineering Directors | MoU signed 2026-03 | 2026-03-20 |

### 6.5 Issues

| Id | Issue | Category | Impact | Owner | Resolution Plan | Status | Last Assessed |
|------|------|------|------|------|------|------|------|
| I-001 | Backstage `software-templates` plugin has a known memory leak at > 2,000 catalogue entities | [x] Technical | [x] Medium | Tom Bloggs | Upstream fix in v1.26; pinned our instance to v1.25 with workaround | [x] In Progress | 2026-04-05 |

### 6.8 Compliance Traceability

| Standard | Requirement | How Satisfied | Evidence Section | Compliance Status |
|------|------|------|------|------|
| SOC 2 Type II | Change management | GitOps via ArgoCD; all changes via PR | 3.2, 5.1 | [x] Compliant |
| SOC 2 Type II | Access control | Okta + PIM + Workload Identity | 3.5 | [x] Compliant |
| SLSA v1.0 | Build integrity (L3 target) | Tekton + Sigstore + in-toto provenance | 3.5, 5.1 | [x] Partially Compliant |
| CIS Kubernetes Benchmark v1.9 | Cluster hardening | GKE Autopilot baseline + Trivy Operator | 3.3, 3.5 | [x] Compliant |
| UK GDPR | Employee telemetry lawful basis | DPIA-2026-007 completed; legitimate interests | 3.4 | [x] Compliant |

---

## 7. Appendices

### Glossary

| Term | Definition |
|------|------|
| Backstage | CNCF-incubating developer portal framework originated by Spotify |
| Cognitive Load | The total mental effort required of a team to do its work (Team Topologies) |
| Crossplane | Kubernetes-native control plane for provisioning cloud resources |
| Dagger | Programmable, portable CI engine with typed SDK |
| DevEx | Developer Experience |
| DORA | DevOps Research and Assessment metrics |
| Enabling Team | A Team Topologies team that coaches stream-aligned teams |
| Golden Path | Pre-baked, opinionated route through the software lifecycle |
| IDP | Internal Developer Platform |
| Paved Road | Synonym for golden path; emphasises opt-out remains possible |
| Platform-as-a-Product | Operating model where the platform is treated with product discipline |
| PIM | Privileged Identity Management (JIT elevation of access) |
| Scaffolder | Backstage plugin turning templates into working repositories |
| SLSA | Supply-chain Levels for Software Artefacts |
| Stream-aligned Team | A product team that delivers value to customers (Team Topologies) |
| TechDocs | Backstage plugin for docs-as-code engineering documentation |
| Workload Identity | Kubernetes-to-cloud identity federation avoiding long-lived credentials |

### References

| Title | Version | Url | Description |
|------|------|------|------|
| Stellar Engineering Platform Strategy 2026-2028 | 1.0 | (internal) | Strategic context |
| Platform-as-a-Product Operating Model | 1.0 | (internal) | Operating model |
| Stellar Cloud Landing Zone Standards | 3.1 | (internal) | Account/project layout |
| Information Security Policy | 4.2 | (internal) | Security baseline |
| DPIA -- Engineer Telemetry | 1.0 | (internal) | DPIA for DevEx telemetry |
| Team Topologies | -- | https://teamtopologies.com | External reference |

### Approvals

| Role | Name | Date | Decision |
|------|------|------|------|
| Principal Platform Engineer | Tom Bloggs | 2026-04-15 | [x] Approved |
| Head of Engineering | Priya Bloggs | 2026-04-16 | [x] Approved |
| Security Architect | Joe Bloggs | 2026-04-17 | [x] Approved |
| Architecture Review Board | ARB Panel | 2026-04-18 | [x] Approved |

---

## 7.3 Compliance Scoring

| Section | Score (0-5) | Assessor | Date | Notes |
|---------|:-----------:|----------|------|-------|
| 1. Executive Summary | 4 | ARB Panel | 2026-04-18 | Strong business context; drivers, DORA baseline, and platform-as-a-product framing clear |
| 3.1 Logical View | 4 | ARB Panel | 2026-04-18 | Three-plane decomposition, ownership, design patterns, lock-in all documented |
| 3.2 Integration & Data Flow | 3 | ARB Panel | 2026-04-18 | Interfaces described; formal API contracts for DORA endpoint not yet published |
| 3.3 Physical View | 3 | ARB Panel | 2026-04-18 | Multi-cloud topology complete; cross-cloud failover drill scheduled but not yet executed |
| 3.4 Data View | 3 | ARB Panel | 2026-04-18 | Stores classified, retention and encryption defined, DPIA complete; sovereignty addressed |
| 3.5 Security View | 4 | ARB Panel | 2026-04-18 | Zero-standing-privilege, workload identity, Sigstore, Vault covered; threat model produced |
| 3.6 Scenarios | 4 | ARB Panel | 2026-04-18 | Three strong use cases; three ADRs with genuine alternatives and trade-offs |
| 4.1 Operational Excellence | 4 | ARB Panel | 2026-04-18 | SLIs/SLOs, centralised logging, alert runbooks, DORA telemetry pipeline |
| 4.2 Reliability | 3 | ARB Panel | 2026-04-18 | HA, multi-region warm standby, chaos monthly; cross-cloud DR rehearsal outstanding |
| 4.3 Performance | 3 | ARB Panel | 2026-04-18 | Targets explicit including DORA deltas; growth modelled to year 5 |
| 4.4 Cost Optimisation | 3 | ARB Panel | 2026-04-18 | Showback per team, FinOps review; multi-cloud premium explicitly accepted |
| 4.5 Sustainability | 3 | ARB Panel | 2026-04-18 | Non-prod scale-to-zero; renewable-commitment regions |
| 5. Lifecycle | 4 | ARB Panel | 2026-04-18 | Mature CI/CD and supply-chain posture; 6 Rs applied to Jenkins estate |
| 6. Decision Making | 4 | ARB Panel | 2026-04-18 | Constraints, assumptions, risks well grounded in platform-engineering reality |
| **Overall** | **3** | ARB Panel | 2026-04-18 | Solid Tier 3 platform SAD at Recommended depth. Lowest-scoring sections have owners and plans. |

*Scoring: 0=Not Addressed, 1=Acknowledged, 2=Partial, 3=Mostly Addressed, 4=Fully Addressed, 5=Exemplary. Overall = lowest individual score.*

---

## 7.4 Approval Sign-Off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Solution Architect | Tom Bloggs (Principal Platform Engineer) | 2026-04-15 | [x] Approved |
| Security Architect | Joe Bloggs | 2026-04-17 | [x] Approved |
| ARB / Design Authority | ARB Panel | 2026-04-18 | [x] Approved |
