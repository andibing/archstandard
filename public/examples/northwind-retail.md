# Solution Architecture Document — NorthWind Online

> **Standard:** ADS v1.3.1 (Architecture Description Standard)
> **Author:** Priya Doe (Solution Architect)
> **Organisation:** NorthWind Retail Ltd
> **Status:** Approved
> **Version:** 1.2

---

## 0. Document Control

### Document Metadata

| Field | Value |
|-------|-------|
| **Document Title** | Solution Architecture Document -- NorthWind Online |
| **Application / Solution Name** | NorthWind Online |
| **Application ID** | APP-0821 |
| **Author(s)** | Priya Doe (Solution Architect) |
| **Owner** | Priya Doe |
| **Version** | 1.2 |
| **Status** | Approved |
| **Created Date** | 2025-07-14 |
| **Last Updated** | 2026-03-18 |
| **Classification** | Internal -- Restricted |

**Authors:**
- Priya Doe (Solution Architect)

### Change History

| Version | Date | Author | Change Type | Description |
|------|------|------|------|------|
| 0.1 | 2025-07-14 | Priya Doe | [x] Initial Draft | Initial draft covering executive summary and logical view |
| 0.2 | 2025-08-21 | Priya Doe | [x] Major Update | Added physical, data and security views following architecture workshops |
| 0.3 | 2025-09-30 | Priya Doe | [x] Review Revision | Security review incorporated; PCI-DSS scope narrowed via tokenisation decision |
| 1.0 | 2025-11-10 | Priya Doe | [x] Approval | First approved version following Design Authority review |
| 1.1 | 2026-01-22 | Priya Doe | [x] Minor Update | Updated cost model after Black Friday 2025 peak capacity validation |
| 1.2 | 2026-03-18 | Priya Doe | [x] Minor Update | Revised ADRs and risk register following mobile-app launch |

### Contributors & Approvals

| Name | Role | Contribution Type |
|------|------|------|
| Priya Doe | Solution Architect | [x] Author |
| Fred Bloggs | Head of Digital Engineering | [x] Reviewer |
| Jane Doe | Principal Security Architect | [x] Reviewer |
| Tom Bloggs | Data Protection Officer | [x] Reviewer |
| Sally Doe | SRE Lead | [x] Reviewer |
| Raj Bloggs | Head of Digital Commerce (Business Owner) | [x] Approver |
| Helen Doe | CTO | [x] Approver |
| Design Authority | Governance | [x] Approver |

### Document Purpose & Scope

This SAD describes the architecture of NorthWind Online, the customer-facing e-commerce platform for NorthWind Retail Ltd. It replaces the legacy `NW-Commerce` .NET monolith with a cloud-native microservices platform hosted on AWS, supporting peak sales of £30M/day during seasonal events.

- **Scope boundary:** Customer-facing web storefront (Next.js), mobile application back-end services, microservices domain (catalogue, basket, checkout, order, customer, search), data stores, payment integration, and supporting AWS infrastructure.
- **Out of scope:** Warehouse management system (APP-0214), in-store EPOS (APP-0088), marketing cloud platform (SaaS -- vendor-managed), and the corporate SAP ERP (APP-0001).
- **Related documents:** NorthWind Cloud Landing Zone SAD (APP-0750), PCI-DSS Scope Document (SEC-PCI-2025-03), Data Protection Impact Assessment (DPIA-2025-091), Digital Channels Strategy (STRAT-DGT-2025).

---

## 1. Executive Summary

### Solution Overview

NorthWind Online is the primary digital sales channel for NorthWind Retail Ltd, serving approximately 12 million active customers across the UK via responsive web (`www.northwind.co.uk`) and native mobile applications (iOS and Android). The new platform replaces the legacy `NW-Commerce` .NET monolith -- which has reached the limits of its scaling capacity and cannot reliably handle Black Friday and Boxing Day peaks -- with a cloud-native microservices architecture on AWS.

The platform is built on Amazon EKS running Node.js microservices, fronted by a Next.js storefront (server-side rendered), and backed by Amazon RDS Aurora PostgreSQL. Payments are processed via Stripe (tokenised at the browser via Stripe Elements), email via SendGrid, and customer behaviour events are captured via Segment CDP for downstream marketing analytics.

### Business Context & Drivers

| Driver | Driver Type | Description | Priority |
|------|------|------|------|
| Peak capacity failure | [x] Risk Mitigation | Legacy monolith failed in Black Friday 2024 peak, losing an estimated £8.2M; board directive to remediate before Black Friday 2026 | [x] Critical |
| PCI-DSS compliance | [x] Regulatory | Transition to PCI-DSS v4.0 required by 31 March 2026 with tokenised payment flow to reduce scope | [x] Critical |
| Digital growth strategy | [x] New Capability | Board target of 40% of group revenue online by 2028 (currently 22%) | [x] High |
| Legacy end-of-life | [x] End Of Life | .NET Framework 4.7.2 and Oracle Commerce 11 are unsupported; Windows Server 2016 end-of-life 2026 | [x] High |
| Mobile channel growth | [x] New Capability | Mobile traffic grew from 48% to 71% of sessions in 2 years | [x] High |
| Personalisation & CDP | [x] New Capability | Marketing team requires real-time customer event stream | [x] Medium |

### Strategic Alignment

#### Organisational Strategy Alignment

| Question | Response |
|----------|----------|
| Which organisational strategy or initiative does this solution support? | Digital Channels Strategy 2025-2028 (STRAT-DGT-2025), Workstream 1: Re-platforming NorthWind Online |
| Has this solution been reviewed against the organisation's capability model? | Yes -- mapped to Digital Storefront, Order Management, Customer Identity, Payment Processing |
| Does this solution duplicate any existing capability? | No -- replaces the legacy NW-Commerce monolith |

#### Shared Service Reuse

| Capability | Shared Service | Reused | Justification |
|------|------|------|------|
| Identity & Access (Customer) | AWS Cognito | [x] Yes | Corporate-approved customer IDP |
| Identity & Access (Colleague) | Okta | [x] Yes | Admin and operations access |
| Payment Processing | Stripe | [x] Yes | Existing group-wide contract; reduces PCI scope |
| Email / Transactional | SendGrid | [x] Yes | Corporate-approved email service |
| CDN | Amazon CloudFront | [x] Yes | Corporate landing zone standard |
| Customer Data Platform | Segment | [x] Yes | Existing enterprise contract |
| Monitoring & Logging | Datadog | [x] Yes | Corporate APM platform |
| CI/CD | GitHub Actions | [x] Yes | Corporate standard |
| Container Platform | Amazon EKS | [x] Yes | Corporate landing zone standard |

**In Scope:**
- Customer-facing web storefront (Next.js SSR) and native mobile applications (iOS, Android)
- Back-end microservices: catalogue, search, basket, checkout, order, customer, promotion
- Payment integration via Stripe (Stripe Elements tokenisation)
- Customer identity via AWS Cognito
- AWS infrastructure: EKS, RDS Aurora PostgreSQL, ElastiCache Redis, OpenSearch, S3, CloudFront, WAF, SQS
- Integration with SAP ERP, warehouse management (APP-0214), loyalty platform (APP-0417)
- All environments: development, test, staging, production, DR
- Event capture for Segment CDP

**Out Of Scope:**
- Warehouse management system modifications (APP-0214)
- In-store EPOS (APP-0088)
- Marketing cloud platform configuration (Salesforce Marketing Cloud, vendor-managed)
- Corporate finance reporting integrations
- Back-office merchandising tooling (Phase 2, planned 2027)

### Current State / As-Is Architecture

The legacy `NW-Commerce` platform was built in 2016 on Oracle Commerce 11 and .NET Framework 4.7.2, hosted on Windows Server 2016 virtual machines in NorthWind's private data centre in Basingstoke. It serves the current £620M/year online turnover.

**Key limitations:**

- **Peak capacity:** Vertical scaling limits reached at approximately 1,800 orders/minute; Black Friday 2024 demand peaked at 2,400 orders/minute and the platform failed for 3 hours 12 minutes, losing an estimated £8.2M in sales.
- **Release velocity:** Full-regression release cycle of 6 weeks.
- **Mobile experience:** No mobile-specific APIs; apps scrape the responsive website HTML.
- **Vendor support:** Oracle Commerce 11 unsupported since 2024.
- **Operational cost:** £4.1M/year including 11 FTEs.
- **PCI-DSS scope:** Full SAQ D scope because cardholder data enters application servers.

**What is being retained:** SAP ERP, warehouse management (APP-0214), loyalty (APP-0417).
**What is being replaced:** Oracle Commerce 11, .NET monolith, on-premises Windows Server hosting.
**What is being decommissioned:** `NW-Commerce` application servers after 3-month parallel run.

### Key Decisions & Constraints

| Decision | Constraint Type | Rationale | Reversibility |
|------|------|------|------|
| AWS as hosting platform | [x] Organisational | Corporate Cloud Landing Zone is AWS-only | [x] Difficult To Reverse |
| EKS for container orchestration | [x] Technical | Existing team skills; corporate standard; portability | [x] Reversible With Effort |
| Aurora PostgreSQL over MySQL | [x] Technical | Superior JSONB support, stronger consistency, observability | [x] Reversible With Effort |
| Next.js SSR over client-only SPA | [x] Technical | SEO is critical for e-commerce; SSR improves Core Web Vitals | [x] Reversible With Effort |
| Stripe for payments | [x] Vendor [x] Financial | Group-wide contract; Stripe Elements keeps cardholder data out of NorthWind systems | [x] Difficult To Reverse |
| Data residency: UK | [x] Regulatory | UK GDPR and corporate data policy | [x] Irreversible |
| Must deliver before Black Friday 2026 | [x] Time | Board directive following 2024 outage | [x] Irreversible |

### Project Details

| Field | Value |
|-------|-------|
| **Project Name** | NorthWind Online Re-platform |
| **Project Code** | PRJ-2025-112 |
| **Project Manager** | Fiona Bloggs |
| **Estimated Capex** | 2,000,000 |
| **Estimated Opex** | 800,000/year |
| **Currency** | GBP |
| **Target Go Live** | 2026-10-01 |

### Business Criticality

Selected criticality: **Tier 2: High Impact**

Justification: NorthWind Online is the primary digital sales channel, contributing £620M/year currently. Failure during peak trading would cause direct revenue loss of up to £30M per day, potential PCI-DSS and UK GDPR sanctions, and reputational damage. Not life-safety critical (Tier 1 reserved for in-store safety systems).

---

## 2. Stakeholders & Concerns

### Stakeholder Register

| Stakeholder | Role Type | Concerns | Relevant Views |
|------|------|------|------|
| Raj Bloggs | [x] Business Owner | Revenue, conversion rate, time-to-market, peak resilience | Executive Summary, Scenarios, Performance |
| Helen Doe | [x] Other (CTO) | Strategic alignment, technology direction, cost | Executive Summary, Cost, Lifecycle |
| Jane Doe | [x] Security Architect | PCI-DSS, threat model, customer PII | Security View, Data View |
| Tom Bloggs | [x] Compliance | UK GDPR, data sovereignty, DPIA, retention | Data View, Security View |
| Priya Doe | [x] Solution Architect | Design integrity, standards compliance | All views |
| Sally Doe | [x] Operations Sre | Observability, incident response, peak readiness | Operational Excellence, Reliability |
| Fred Bloggs | [x] Developer | Microservice design, developer experience, CI/CD | Logical View, Integration, Lifecycle |
| Fiona Bloggs | [x] Project Manager | Delivery, budget, risks, dependencies | Executive Summary, Governance |
| Harriet Doe | [x] Other (Marketing) | Personalisation, event capture, SEO | Integration View, Scenarios |
| Dave Bloggs | [x] Other (Customer Service) | Order visibility, account self-service, refunds | Scenarios |
| Customers (c.12M) | [x] External Customer | Speed, availability, security, trust | Executive Summary, Scenarios |
| Retail merchandisers (c.80) | [x] End User | Product-listing workflow, stock visibility | Scenarios, Logical View |

### Concerns Matrix

| Concern | Stakeholder(s) | Addressed In |
|---------|---------------|-------------|
| Peak trading availability and performance | Raj Bloggs, Sally Doe, Customers | 4.2 Reliability, 4.3 Performance, 3.3 Physical View |
| PCI-DSS compliance and card data protection | Jane Doe, Helen Doe | 3.5 Security View, 2.3 Compliance |
| UK GDPR and customer data protection | Tom Bloggs, Jane Doe | 3.4 Data View, 3.5 Security View |
| Revenue loss from downtime | Raj Bloggs, Helen Doe | 4.2 Reliability |
| Speed of feature delivery | Fred Bloggs, Harriet Doe | 5.1 CI/CD, 5.4 Release Management |
| Cost of AWS platform at peak | Helen Doe, Fiona Bloggs | 4.4 Cost Optimisation |
| Vendor lock-in to Stripe | Priya Doe, Helen Doe | 3.1.6, 6.3 Risks |
| Search quality and relevance | Harriet Doe, Raj Bloggs | 3.1 Logical View, 3.6 Scenarios |
| Mobile app parity with web | Raj Bloggs, Customers | 3.1 Logical View, 3.2 Integration |

### Compliance & Regulatory Context

#### Regulatory Requirements

| Regulation | Regulation Type | Applicability | Design Impact |
|------|------|------|------|
| PCI-DSS v4.0 | [x] Security | Mandatory -- platform accepts card payments | Scope reduced to SAQ A-EP via Stripe Elements; segmentation, encryption, audit logging retained |
| UK GDPR / DPA 2018 | [x] Data Protection | Mandatory -- processes customer PII at scale | DPIA, lawful basis, right-to-erasure, retention policies |
| PSD2 / SCA | [x] Financial Services | Card payments above £30 require 3-D Secure 2 | Stripe handles SCA challenge flow |
| Consumer Rights Act 2015 | [x] Industry Specific | Applies to digital B2C contracts | Cooling-off, refund handling, clear terms |
| WCAG 2.2 AA | [x] Internal Policy | Corporate accessibility policy | AA compliance; automated testing in CI |

#### Regulated Activities

No FCA-regulated activities. Payment regulation (PSD2 SCA) is satisfied by Stripe as the acquirer.

---

## 3. Architectural Views

### 3.1 Logical View

**Diagrams:**
- Application architecture: Customers access Next.js storefront and mobile apps via CloudFront. API Gateway routes to Node.js microservices on EKS (catalogue, basket, checkout, order, customer, search). Microservices use Aurora PostgreSQL, OpenSearch and Redis. Payments go to Stripe, emails via SendGrid, events to Segment CDP.

#### Components

| Name | Component Type | Description | Technology | Owner | Status |
|------|------|------|------|------|------|
| Storefront Web | [x] Web Application | Server-side rendered customer-facing storefront for SEO and performance | Next.js 14, React 18, TypeScript | Digital Commerce team | [x] New |
| Mobile App (iOS, Android) | [x] Web Application | Native customer apps consuming platform APIs | Swift (iOS), Kotlin (Android) | Mobile team | [x] New |
| API Gateway | [x] Gateway | Single ingress; validation, throttling, auth | AWS API Gateway (REST) | Platform team | [x] New |
| Catalogue Service | [x] API Service | Product data, categories, pricing, availability | Node.js 20, NestJS, EKS | Commerce team | [x] New |
| Search Service | [x] API Service | Faceted search, autocomplete, type-ahead, ranking | Node.js 20, NestJS, EKS | Commerce team | [x] New |
| Basket Service | [x] API Service | Basket state, promotion application | Node.js 20, NestJS, EKS | Commerce team | [x] New |
| Checkout Service | [x] API Service | Orchestration, Stripe integration, 3-D Secure flow | Node.js 20, NestJS, EKS | Commerce team | [x] New |
| Order Service | [x] API Service | Order creation, SAP hand-off, status tracking | Node.js 20, NestJS, EKS | Commerce team | [x] New |
| Customer Service | [x] API Service | Profile, address, consent, order history | Node.js 20, NestJS, EKS | Commerce team | [x] New |
| Promotion Service | [x] API Service | Promotion rules engine, voucher validation | Node.js 20, NestJS, EKS | Commerce team | [x] New |
| Transactional Database | [x] Database | Authoritative store for catalogue, orders, customer | Aurora PostgreSQL 15 (Multi-AZ) | DBA team | [x] New |
| Search Index | [x] Search Engine | Product search index | Amazon OpenSearch 2.x | Platform team | [x] New |
| Basket Cache | [x] Cache | Basket state and rate-limit counters | ElastiCache Redis 7.x | Platform team | [x] New |
| Order Queue | [x] Queue | Decouples SAP hand-off from checkout | Amazon SQS (standard + DLQ) | Platform team | [x] New |
| Static Asset Store | [x] File Storage | Product images, assets, app bundles | Amazon S3 + CloudFront | Platform team | [x] New |
| Customer Identity | [x] API Service | Sign-up, sign-in, MFA, password reset | AWS Cognito | Platform team | [x] New |

#### Service & Capability Mapping

| Service ID | Service Name | Capability ID | Capability Name |
|-----------|-------------|--------------|----------------|
| SVC-NWO-01 | Product Discovery | CAP-COMM-010 | Digital Storefront |
| SVC-NWO-02 | Basket & Checkout | CAP-COMM-011 | Online Order Capture |
| SVC-NWO-03 | Customer Account | CAP-CUS-004 | Customer Self-Service |
| SVC-NWO-04 | Order Fulfilment Hand-off | CAP-OPS-007 | Order Orchestration |
| SVC-NWO-05 | Payment Processing | CAP-FIN-003 | Card Payment Acceptance |

#### Application Impact

| Application Name | Application ID | Impact Type | Change Details | Comments |
|-----------------|---------------|-------------|----------------|----------|
| Legacy NW-Commerce | APP-0412 | Decommission | Retired after 3-month parallel run | 2016 Oracle Commerce monolith |
| SAP ERP | APP-0001 | Modify (consume) | New order hand-off queue integration | Existing APIs; no SAP-side changes |
| Warehouse Management | APP-0214 | Use | Order events consumed via existing topic | No changes |
| Loyalty Platform | APP-0417 | Use | Customer identity linkage via Cognito | Minor attribute mapping |
| Corporate Okta | APP-0099 | Use | Admin access | Existing federation |
| Salesforce Marketing Cloud | APP-0601 | Use (indirect) | Customer events via Segment CDP | No direct integration |

#### Design Patterns

| Pattern | Where Applied | Rationale |
|------|------|------|
| [x] Microservices [x] API Gateway [x] Strangler Fig [x] BFF [x] Event Driven [x] Pub Sub [x] Circuit Breaker [x] Request Response | Domain-aligned services; API Gateway at ingress; legacy migration; mobile BFF; order event flow to SAP and Segment; SaaS integrations (Stripe, SAP) with circuit breakers | Independent scaling and fault isolation; centralised traffic management; phased migration from legacy; mobile-optimised payload composition; decoupling from slow downstream systems; cache-aside for catalogue reads |

#### Technology & Vendor Lock-in Assessment

| Component / Service | Vendor / Technology | Lock-in Level | Mitigation | Portability Notes |
|---|---|---|---|---|
| AWS EKS | AWS (Kubernetes) | Low | Standard Kubernetes manifests; Helm charts | Portable to AKS, GKE, self-managed |
| RDS Aurora PostgreSQL | AWS | Moderate | Aurora-specific features avoided where possible | Migratable to standard PostgreSQL |
| CloudFront + WAF | AWS | Low | Cache behaviours declarative; rules documented | Replaceable with Cloudflare or Akamai |
| AWS Cognito | AWS | Moderate | Standard OIDC claims | Migration requires password reset cycle |
| Stripe | Stripe Inc. | High | Payment abstraction layer; documented migration plan | 6-9 month programme to alternative PSP |
| SendGrid | Twilio | Low | Standard SMTP / REST | Easily swapped (SES, Mailgun) |
| OpenSearch | AWS | Low | Elasticsearch query DSL | Fully compatible with Elasticsearch 7.10 |
| Segment CDP | Twilio | Moderate | Thin event layer; tracking plan documented | Migration requires event replay |

**Quality Attribute Refs:**
- 4.2 Reliability
- 4.3 Performance Efficiency

### 3.2 Integration & Data Flow View

**Diagrams:**
- Primary data flow -- Customer places an order (described below)

#### Primary Data Flow -- Customer Places an Order

1. Customer browses storefront; Next.js SSR calls Catalogue and Search services via API Gateway.
2. Customer adds items to basket; Basket Service persists state to Redis.
3. Customer proceeds to checkout; Checkout Service validates basket and applies promotions.
4. Browser loads Stripe Elements iframe; customer enters card details directly into Stripe-hosted fields. PAN never reaches NorthWind systems.
5. Stripe returns a payment method token to the browser; browser forwards the token to Checkout Service.
6. Checkout Service calls Stripe `PaymentIntent` with the token; Stripe performs 3-D Secure if required.
7. On authorisation, Order Service creates the order in Aurora and emits `OrderCreated` to SQS.
8. Order Service triggers transactional email via SendGrid and event to Segment CDP.
9. SAP integration Lambda consumes SQS and calls SAP to create the sales order.

#### Internal Component Connectivity

| Source | Destination | Protocol | Encrypted | Authentication Method | Direction | Synchronicity | Purpose |
|------|------|------|------|------|------|------|------|
| Next.js Storefront | API Gateway | [x] HTTPS | [x] Yes | [x] IAM Role | [x] Unidirectional | [x] Synchronous | SSR product and catalogue data |
| Mobile App | API Gateway | [x] HTTPS | [x] Yes | [x] OAuth2 | [x] Unidirectional | [x] Synchronous | Mobile client API access |
| API Gateway | Microservices (EKS) | [x] HTTPS | [x] Yes | [x] IAM Role | [x] Unidirectional | [x] Synchronous | Route requests |
| Microservices | Aurora PostgreSQL | [x] TCP TLS | [x] Yes | [x] IAM Role | [x] Bidirectional | [x] Synchronous | Authoritative data |
| Microservices | ElastiCache Redis | [x] TCP TLS | [x] Yes | [x] API Key | [x] Bidirectional | [x] Synchronous | Cache and basket state |
| Search Service | OpenSearch | [x] HTTPS | [x] Yes | [x] IAM Role | [x] Bidirectional | [x] Synchronous | Search queries, index updates |
| Order Service | SQS | [x] HTTPS | [x] Yes | [x] IAM Role | [x] Unidirectional | [x] Event Driven | Publish order events |
| SAP Integration Lambda | SQS | [x] HTTPS | [x] Yes | [x] IAM Role | [x] Unidirectional | [x] Event Driven | Consume order events |

#### External Integrations

| Source App | Destination App | Integration Type | Protocol | Encrypted | Authentication Method | Purpose |
|------|------|------|------|------|------|------|
| Customer browser / mobile | CloudFront | [x] Customer Facing | [x] HTTPS | [x] Yes | [x] None | Public storefront / API |
| Checkout Service | Stripe | [x] SaaS | [x] HTTPS | [x] Yes | [x] API Key | Payment authorisation / capture |
| Customer browser | Stripe (direct) | [x] SaaS | [x] HTTPS | [x] Yes | [x] API Key | Card tokenisation (Elements) |
| Order Service | SendGrid | [x] SaaS | [x] HTTPS | [x] Yes | [x] API Key | Transactional email |
| SAP Integration Lambda | SAP ERP | [x] Internal App | [x] HTTPS | [x] Yes | [x] OAuth2 | Sales order creation |
| API Gateway / Storefront | Segment CDP | [x] SaaS | [x] HTTPS | [x] Yes | [x] API Key | Customer event capture |
| Admin users | Admin portal | [x] Internal App | [x] HTTPS | [x] Yes | [x] OIDC | Merchandiser / operations access |

##### End User Access

| User Type | Access Method | Authentication | Protocol |
|-----------|-------------|---------------|----------|
| Retail customers (web) | Web browser, public Internet | AWS Cognito (email + password, optional MFA) | HTTPS / TLS 1.3 |
| Retail customers (mobile) | Native app (iOS / Android) | AWS Cognito (OAuth 2.0 + PKCE) | HTTPS / TLS 1.3 |
| Merchandisers | Admin web portal | Okta SSO + MFA | HTTPS / TLS 1.3 |
| SRE / Operations | kubectl, AWS Console, Datadog | Okta SSO via IAM Identity Centre | HTTPS / TLS 1.3 |

#### APIs & Interfaces

| Name | API Type | Direction | Data Format | Version | Authenticated | Rate Limited |
|------|------|------|------|------|------|------|
| Catalogue API | [x] REST | [x] Exposed | [x] JSON | v1 | [x] Yes | [x] Yes |
| Basket API | [x] REST | [x] Exposed | [x] JSON | v1 | [x] Yes | [x] Yes |
| Checkout API | [x] REST | [x] Exposed | [x] JSON | v1 | [x] Yes | [x] Yes |
| Order API | [x] REST | [x] Exposed | [x] JSON | v1 | [x] Yes | [x] Yes |
| Customer API | [x] REST | [x] Exposed | [x] JSON | v1 | [x] Yes | [x] Yes |
| Stripe PaymentIntents | [x] REST | [x] Consumed | [x] JSON | 2024-06-20 | [x] Yes | [x] Yes |
| SendGrid Mail | [x] REST | [x] Consumed | [x] JSON | v3 | [x] Yes | [x] Yes |
| SAP Sales Order API | [x] REST | [x] Consumed | [x] JSON | v2 | [x] Yes | [x] No |
| Segment Track | [x] REST | [x] Consumed | [x] JSON | v1 | [x] Yes | [x] No |

**Quality Attribute Refs:**
- 4.3 Performance Efficiency

### 3.3 Physical View

**Diagrams:**
- Deployment architecture: CloudFront fronts the platform with WAF and Shield. ALB distributes to EKS across two AZs in eu-west-2. Aurora PostgreSQL, ElastiCache, and OpenSearch are Multi-AZ. DR is pilot-light in eu-west-1.

#### Hosting & Infrastructure

**Venue Types:**
- Public Cloud

**Regions:**
- UK (eu-west-2 London -- primary)
- Ireland (eu-west-1 -- DR, non-PII only)

**Service Models:**
- PaaS (EKS, Aurora, ElastiCache, OpenSearch)
- SaaS (Stripe, SendGrid, Segment)

**Cloud Providers:**
- AWS

**Account / Subscription:** NorthWind AWS Organisation -- `nwo-prod` workload account

#### Compute

**Compute Types:**
- Container (Amazon EKS)
- Serverless Function (Lambda for SAP integration)

| Service | SKU / Tier | Details |
|---------|-----------|---------|
| EKS application nodes | c7g.xlarge (Graviton3, 4 vCPU, 8 GB) | 4-24 nodes, Karpenter-managed |
| EKS platform nodes | m7g.large | 3 nodes |
| Aurora PostgreSQL primary | r7g.xlarge | Multi-AZ, 2 read replicas |
| ElastiCache Redis | cache.r7g.large | 2 shards with replicas |
| OpenSearch | r7g.large x3 | 3 AZs |
| Lambda (SAP integration) | 1024 MB memory | Event-driven from SQS |

##### Security Agents

- Anti-Malware: Amazon GuardDuty
- EDR: CrowdStrike Falcon container sensor
- Vulnerability Management: Amazon Inspector

#### Network Connectivity

| Field | Value |
|-------|-------|
| **Internet Facing** | [x] Yes |
| **Outbound Internet** | [x] Yes |
| **Cloud To On Prem** | [x] Yes |
| **Third Party Connectivity** | [x] No |
| **Cloud Peering** | [x] Yes |
| **Wireless Required** | [x] No |
| **Peak Egress Mbps** | 1500 |
| **Peak Ingress Mbps** | 400 |
| **Traffic Pattern** | [x] Seasonal |
| **Latency Requirement** | [x] Moderate Sub 100ms |
| **DDoS Protection** | [x] Yes |
| **DDoS Provider** | [x] AWS Shield |
| **WAF Enabled** | [x] Yes |
| **WAF Provider** | [x] AWS WAF |
| **Rate Limiting** | [x] Yes |

##### User & Administrator Access

| Attribute | Selection |
|-----------|----------|
| **User access method** | Web (HTTPS), Mobile native apps |
| **User locations** | UK-predominant, Internet (global access permitted) |
| **Administrator access method** | AWS Console via IAM Identity Centre; kubectl via EKS OIDC; SSM Session Manager |
| **VPN required** | Yes (administrator access only) |
| **Direct Connect / ExpressRoute** | No (planned 2027); Site-to-Site VPN to Basingstoke for SAP |

##### Transport Protocols

| Protocol | Used? | Purpose |
|----------|-------|---------|
| HTTPS (TLS 1.2+) | Yes | All customer and API traffic (TLS 1.3 on CloudFront) |
| WebSocket | No | -- |
| SFTP | No | -- |
| ODBC / JDBC | No | PostgreSQL protocol used |
| TCP (other) | Yes | PostgreSQL, Redis within VPC |
| gRPC | No | -- |

#### Environments

| Environment Type | Count | Venue | Auto Scale Down |
|------|------|------|------|
| [x] Development | 1 | AWS eu-west-2 | [x] Yes |
| [x] Test | 1 | AWS eu-west-2 | [x] Yes |
| [x] Staging | 1 | AWS eu-west-2 | [x] Yes |
| [x] Production | 1 | AWS eu-west-2 (Multi-AZ) | [x] No |
| [x] Dr | 1 | AWS eu-west-1 (pilot-light) | [x] Yes |

**Quality Attribute Refs:**
- 4.2 Reliability & Resilience
- 4.4 Cost Optimisation

### 3.4 Data View

#### Data Stores

| Name | Store Type | Technology | Authoritative | Retention Period | Data Size | Classification | Personal Data | Sensitive | Encryption Level | Key Management |
|------|------|------|------|------|------|------|------|------|------|------|
| Product catalogue | [x] Relational DB | Aurora PostgreSQL 15 | [x] No | [x] 2 5 Years | [x] 1 100 GB | [x] Internal | [x] No | [x] No | [x] Storage Level | [x] Customer Managed KMS |
| Customer profile | [x] Relational DB | Aurora PostgreSQL 15 | [x] Yes | [x] 5 10 Years | [x] 1 100 GB | [x] Restricted | [x] Yes | [x] No | [x] Field Level | [x] Customer Managed KMS |
| Order history | [x] Relational DB | Aurora PostgreSQL 15 | [x] Yes | [x] 5 10 Years | [x] 100 GB 1 TB | [x] Restricted | [x] Yes | [x] No | [x] Field Level | [x] Customer Managed KMS |
| Basket state | [x] Cache | ElastiCache Redis 7.x | [x] Yes | [x] Days | [x] 1 100 GB | [x] Internal | [x] Yes | [x] No | [x] Storage Level | [x] Provider Managed |
| Search index | [x] Search Index | OpenSearch 2.x | [x] No | [x] Transient | [x] 1 100 GB | [x] Internal | [x] No | [x] No | [x] Storage Level | [x] Customer Managed KMS |
| Product images | [x] Object Storage | S3 | [x] Yes | [x] 2 5 Years | [x] 1 10 TB | [x] Public | [x] No | [x] No | [x] Storage Level | [x] Provider Managed |
| Stripe payment tokens | [x] Relational DB | Aurora PostgreSQL 15 | [x] No | [x] 5 10 Years | [x] 1 100 GB | [x] Restricted | [x] No | [x] No | [x] Field Level | [x] Customer Managed KMS |
| Application logs | [x] Other | Datadog + S3 archive | [x] No | [x] 5 10 Years | [x] 1 10 TB | [x] Internal | [x] No | [x] No | [x] Storage Level | [x] Customer Managed KMS |
| Customer events | [x] Other | Segment CDP (SaaS) | [x] Yes | [x] 1 Year | [x] 10 100 TB | [x] Internal | [x] Yes | [x] No | [x] Storage Level | [x] Provider Managed |

No cardholder primary account number (PAN) is stored. PAN is tokenised by Stripe Elements at the browser; NorthWind stores only opaque Stripe payment method tokens. This keeps the platform out of full PCI-DSS scope (SAQ A-EP applies).

#### Data Classification

| Classification | Data Types | Handling |
|---------------|------------|----------|
| Public | Product catalogue, images, merchandising copy | CDN-cacheable, versioning |
| Internal | Application logs (PII-redacted), metrics, search index | Internal access, encryption at rest, VPC-only |
| Restricted | Customer PII, order history, payment tokens, audit logs | Encryption at rest (storage + field-level), TLS in transit, audited, 7-year retention |

#### Data Transfers

| Destination | Destination Type | Classification | Transfer Method | Encrypted |
|------|------|------|------|------|
| Stripe | [x] Third Party | [x] Restricted | [x] API | [x] Yes |
| SendGrid | [x] Third Party | [x] Restricted | [x] API | [x] Yes |
| Segment CDP | [x] Third Party | [x] Internal | [x] API | [x] Yes |
| SAP ERP (internal) | [x] Internal | [x] Restricted | [x] API | [x] Yes |
| Datadog | [x] Third Party | [x] Internal | [x] API | [x] Yes |

#### Privacy Assessments

| Assessment Type | ID | Status | Link |
|----------------|-----|--------|------|
| DPIA | DPIA-2025-091 | Approved by DPO | Corporate Confluence / Compliance / DPIA |
| Legitimate Interest Assessment | LIA-2025-022 | Approved | Corporate Confluence / Compliance / LIA |

#### Use of Production Data for Testing

Masked -- production customer data is tokenised into a masked dataset via a scheduled AWS Glue job for staging use. Names, addresses, emails and phone numbers are replaced with synthetic values derived from Faker. Test and dev use entirely synthetic data.

#### Data Integrity

Yes -- Aurora provides ACID transactions; orders reconciled nightly against SAP; discrepancies alert Finance ops.

#### Data on End User Devices

Yes (limited) -- mobile apps cache catalogue and basket for offline browsing. No payment data; PII limited to display name. Mobile caches encrypted via platform keychain / keystore.

#### Data Sovereignty

Yes -- customer PII and order data must remain in UK (eu-west-2). DR region (eu-west-1) contains only operational telemetry. Aurora Global DB filtered replication excludes PII tables. Segment uses EU data plane; Stripe operates under UK / EU safeguards.

**Quality Attribute Refs:**
- 4.2 Reliability & Resilience

### 3.5 Security View

#### Business Impact Assessment

| Field | Value |
|-------|-------|
| **Confidentiality** | [x] High |
| **Integrity** | [x] High |
| **Availability** | [x] Critical |
| **Non Repudiation** | [x] Medium |

#### Threat Model Summary

A STRIDE-based threat model was produced (SEC-TM-2025-044). Headline threats:

| Threat | Attack Vector | Likelihood | Impact | Mitigation |
|--------|-------------|-----------|--------|------------|
| Credential stuffing on customer login | Bots replaying leaked credentials | High | High | WAF Bot Control, rate limits, HIBP check, optional MFA |
| Checkout parameter tampering | Manipulated basket / promotion data | Medium | High | Server-side price recalculation, signed basket IDs |
| Magecart (JavaScript injection) | Malicious third-party script | Medium | Critical | Stripe Elements iframe isolation, CSP, Subresource Integrity |
| DDoS on checkout | Volumetric or L7 attack | Medium | High | Shield Advanced, WAF rate-based rules, CloudFront edge |
| API abuse via mobile app | Reverse-engineered app | Medium | Medium | Cognito token binding, per-device limits, app attestation |
| Insider threat | Privileged user exfiltration | Low | Critical | JIT elevation, session recording, bulk-query alerts |

#### Authentication

| Access Type | Method | Uses Group Wide Auth |
|------|------|------|
| [x] End User External | [x] OAuth2 | [x] Yes |
| [x] End User Internal | [x] SSO OIDC | [x] Yes |
| [x] IT Operations | [x] SSO OIDC | [x] Yes |
| [x] Service Account | [x] Custom | [x] No |

#### Authorisation

| Field | Value |
|-------|-------|
| **Model** | [x] RBAC |
| **Entitlement Store** | Cognito groups (customers), Okta groups + IAM Identity Centre (internal), Kubernetes RBAC |
| **Provisioning Process** | [x] Automated IDM |
| **Recertification Enabled** | [x] Yes |
| **Segregation Of Duties Enforced** | [x] Yes |

#### Privileged Access

| Field | Value |
|-------|-------|
| **PAM Solution** | AWS IAM Identity Centre + corporate CyberArk |
| **Just In Time Access** | [x] Yes |
| **Session Recording** | [x] Yes |
| **Break Glass Process** | [x] Yes |

#### Encryption at REST

| Field | Value |
|-------|-------|
| **Implemented** | [x] Yes |
| **Level** | [x] Field Level |
| **Key Type** | [x] Symmetric |
| **Algorithm** | AES-256-GCM (field-level); AES-256 (storage) |
| **Key Generation** | [x] HSM Fips140 L3 |
| **Key Storage** | [x] KMS |
| **Key Rotation Days** | 365 |

#### Secret Management

| Field | Value |
|-------|-------|
| **Secret Store** | [x] AWS Secrets Manager |
| **Distribution** | [x] Runtime Retrieval |
| **Rotation** | [x] Automatic |

#### Security Monitoring

| Field | Value |
|-------|-------|
| **SIEM Integration** | [x] Yes |
| **SIEM Tool** | Datadog Cloud SIEM + Splunk (corporate) |
| **Security Event Logging** | [x] Yes |
| **Intrusion Detection** | [x] Yes |

**Quality Attribute Refs:**
- 4.2 Reliability & Resilience

### 3.6 Scenarios

#### Key Use Cases

| Id | Name | Actors | Trigger | Main Flow | Views Involved |
|------|------|------|------|------|------|
| UC-01 | Customer Places an Order (Card Payment) | Retail customer | Customer clicks Pay now | Stripe Elements tokenises card; Checkout validates basket server-side; PaymentIntent confirmed; 3-D Secure if needed; Order created in Aurora; OrderCreated published to SQS; email via SendGrid; event to Segment; SAP integration Lambda creates sales order | Logical, Integration, Physical, Data, Security |
| UC-02 | Black Friday Traffic Surge | Retail customers; SRE on-call | 18:00 Black Friday launch | CloudFront absorbs cacheable traffic; HPAs scale pods; Karpenter provisions nodes; Aurora read replicas auto-scale; WAF throttles abuse; P95 latency rises to 240ms within SLA | Logical, Physical, Performance |
| UC-03 | Customer Right-to-Erasure Request | Customer; DPO team | Customer submits privacy portal request | Erasure queued; Lambda anonymises PII in Aurora (statutory order data retained 7 years); Cognito account deleted; Segment purge called; SendGrid suppression updated; confirmation email; DPO audit trail | Logical, Data, Security |

#### Architecture Decision Records

| Id | Title | Status | Date | Context | Decision | Alternatives | Consequences | Affected Attributes |
|------|------|------|------|------|------|------|------|------|
| ADR-001 | PostgreSQL (Aurora) over MySQL for Transactional Store | [x] Accepted | 2025-08-05 | Relational database required for catalogue, customer, order. Aurora PostgreSQL and Aurora MySQL both approved | Use Amazon RDS Aurora PostgreSQL 15 | Aurora MySQL (weaker JSONB); DynamoDB (rejected -- relational + ACID hard requirement) | Positive: rich JSONB, CTEs, PostGIS optional, pg_stat_statements. Negative: less internal familiarity -- mitigated by training | Performance, Maintainability |
| ADR-002 | Next.js SSR over Client-Only SPA | [x] Accepted | 2025-08-12 | Storefront must be highly discoverable (42% organic traffic) and fast on mobile | Use Next.js 14 SSR; ISR for campaign pages; CSR only in account area | Client-only SPA (poor SEO, slower LCP); Static site (cannot handle dynamic personalisation) | Positive: strong SEO, LCP improved from 3.1s to 1.4s. Negative: extra compute; cache invalidation complexity | Performance, Cost |
| ADR-003 | Stripe Elements Tokenisation to Reduce PCI-DSS Scope | [x] Accepted | 2025-09-02 | Legacy platform in full SAQ D scope. Target SAQ A-EP via client-side tokenisation | Integrate Stripe Elements; store only opaque tokens | Direct card acceptance (expands scope); Stripe Checkout redirect (breaks custom UX); Adyen / Worldpay (evaluated, group contract favours Stripe) | Positive: SAQ A-EP (audit saving ~£240k/yr); reduced blast radius. Negative: Stripe vendor lock-in elevated | Security, Cost |

---

## 4. Quality Attributes

### 4.1 Operational Excellence

| Field | Value |
|-------|-------|
| **Logging Centralised** | [x] Yes |
| **Logging Tool** | Datadog Logs + S3 archive |
| **Monitoring Tool** | Datadog APM + CloudWatch |
| **Tracing Enabled** | [x] Yes |
| **Alerting Configured** | [x] Yes |
| **Runbooks Documented** | [x] Yes |

### 4.2 Reliability & Resilience

| Field | Value |
|-------|-------|
| **DR Strategy** | [x] Pilot Light |
| **Multi Venue Deployment** | [x] Yes |
| **RTO Target** | PT2H |
| **RPO Target** | PT1M |
| **Scalability** | [x] Full Auto Scaling |
| **Fault Tolerance Designed** | [x] Yes |
| **Chaos Testing Practised** | [x] Yes |
| **Backup Enabled** | [x] Yes |
| **Backup Type** | [x] Continuous |
| **Backup Frequency** | [x] Real Time |
| **Backup Immutable** | [x] Yes |
| **Backup Encrypted** | [x] Yes |

#### Recovery Scenarios

| Scenario | Recovery Approach | RTO | RPO |
|----------|------------------|-----|-----|
| Single AZ failure | Automatic: Karpenter + Aurora Multi-AZ failover | 5 minutes | 0 |
| Primary region failure | Manual DR activation: promote Aurora Global DB secondary, scale EKS, update Route 53 | 2 hours | 1 minute |
| Critical software defect | Automatic: Kubernetes rollback; Argo Rollouts canary analysis | 15 minutes | 0 |
| Ransomware attack | Isolate, restore from immutable backups (Vault Lock), forensics | 4 hours | 1 hour |
| Accidental data deletion | Aurora point-in-time recovery | 1 hour | 1 minute |

### 4.3 Performance Efficiency

| Field | Value |
|-------|-------|
| **Current Users** | 12,000,000 |
| **Year1 Users** | 13,500,000 |
| **Year3 Users** | 17,000,000 |
| **Year5 Users** | 21,000,000 |
| **Current Data Volume** | 300 GB (Aurora) |
| **Year1 Data Volume** | 420 GB |
| **Year3 Data Volume** | 750 GB |
| **Year5 Data Volume** | 1.2 TB |
| **Design Scales To Projected Growth** | [x] Yes (3-year confirmed; 5-year subject to Aurora Limitless review 2028) |
| **Seasonal Demand Patterns** | [x] Yes |
| **Seasonal Details** | Black Friday 8x baseline; Christmas 4x; January sale 3x; Easter 1.5x; payday +30%. Capacity plan aligns with retail calendar. |

#### Key Performance Indicators

| Metric | Target |
|--------|--------|
| Storefront LCP (75th percentile) | < 1.8s |
| API P95 (steady / peak) | < 200ms / < 400ms |
| Checkout success rate | > 99.5% |
| Throughput (peak validated) | 3,000 orders/min sustained, 4,500 burst |
| Error rate | < 0.1% steady; < 0.5% peak |
| Search P95 | < 150ms |
| Catalogue cache hit ratio | > 88% |

### 4.4 Cost Optimisation

| Field | Value |
|-------|-------|
| **Cost Analysis Performed** | [x] Yes |
| **Design Constrained By Cost** | [x] No |
| **Reserved Capacity** | [x] Yes |
| **Cost Monitoring Enabled** | [x] Yes |
| **Tagging Strategy** | [x] Yes |

Estimated annual opex is £800,000 including AWS, SaaS (Stripe, SendGrid, Segment, Datadog), and supporting services. Production baseline ~£71k/month; non-prod ~£5.5k/month (auto-shutdown outside business hours). Savings Plan + Reserved Instances yield ~22% saving versus on-demand.

### 4.5 Sustainability

| Field | Value |
|-------|-------|
| **Hosting Location Optimised For Carbon** | [x] No |
| **Non Prod Auto Shutdown** | [x] Yes |
| **Resources Rightsized** | [x] Yes |
| **Workload Pattern** | [x] Variable Predictable |
| **Continuous Availability Required** | [x] Yes |

AWS London operates under AWS's 100% renewable energy commitment. Graviton3 ARM instances used throughout (~60% better energy efficiency than x86). Carbon KPIs not yet baselined (improvement area).

### Quality Attribute Tradeoffs

| Attributes Involved | Description | Chosen Priority | Rationale |
|------|------|------|------|
| Reliability vs Cost | Multi-AZ Aurora + ElastiCache adds ~30% cost premium | [x] Reliability | Tier 2 criticality and £30M/day peak revenue justify the premium |
| Performance vs Cost | Next.js SSR increases compute cost vs static | [x] Performance | SEO and Core Web Vitals drive organic acquisition (42% of traffic) |
| Security vs Operational Excellence | Stripe Elements adds payment-flow vendor dependency | [x] Operational Excellence | PCI-DSS scope reduction outweighs additional SaaS dependency |

---

## 5. Lifecycle Management

The application is developed internally by the Digital Commerce team.

### Software Development & CI/CD

| Attribute | Detail |
|-----------|--------|
| Source control platform | GitHub Enterprise (NorthWind organisation) |
| CI/CD platform | GitHub Actions |
| Build automation | GitHub Actions on push/PR; npm + Docker multi-stage builds; signed images to ECR |
| Deployment automation | Argo CD (GitOps); Terraform for infrastructure; Helm |
| Test automation | Unit (Jest), integration (Testcontainers), contract (Pact), accessibility (axe), performance (k6) |

### Migration

| Field | Value |
|-------|-------|
| **Classification** | [x] Replace |
| **Deployment Strategy** | [x] Strangler Fig |
| **Data Migration Mode** | [x] Phased |
| **Data Migration Method** | AWS DMS (Oracle -> Aurora) for customer / order data; SAP IDoc stream for catalogue |
| **Data Volume** | 240 GB (customer + order history) |
| **End User Cutover** | [x] Phased |
| **External System Cutover** | [x] Phased |
| **Max Acceptable Downtime** | [x] Minutes |
| **Rollback Plan** | CloudFront routing rules revert cohort traffic to legacy within 5 minutes; legacy platform retained 3 months post-100% cut-over |
| **Transient Infrastructure Needed** | [x] Yes |

### Resourcing & Skills

| Field | Value |
|-------|-------|
| **Cloud Platform** | [x] Medium |
| **Infrastructure As Code** | [x] High |
| **Cicd Management** | [x] High |
| **Application Stack** | [x] High |
| **Database Administration** | [x] Medium |
| **Security Compliance** | [x] Medium |
| **Operational Readiness** | [x] A Fully Capable |

### Release Management

| Attribute | Detail |
|-----------|--------|
| Release frequency | Multiple daily (trunk-based + feature flags); freeze 1 November - 31 December |
| Release process | PR -> tests + 1 approval -> staging -> canary (5%/15 min) -> full production via Argo Rollouts |
| Feature flags | LaunchDarkly for progressive rollout, A/B, kill switches |

### Operations & Support

| Attribute | Detail |
|-----------|--------|
| Support model | L1 Service Desk; L2 SRE; L3 Commerce engineering; L4 Solution Architect / CTO |
| Support hours | 24x7 on-call; enhanced Nov-Jan |
| SLAs | 99.95% monthly availability (excl. freeze); P1 < 15 min response |
| Escalation paths | L1 -> L2 (15 min) -> L3 (30 min) -> L4 (1 hour); CISO immediate for security |

---

## 6. Decision Making & Governance

### 6.1 Constraints

| Id | Constraint | Category | Impact On Design | Last Assessed |
|------|------|------|------|------|
| C-001 | Must comply with PCI-DSS v4.0 by 31 March 2026 | [x] Regulatory | SAQ A-EP scope via Stripe Elements; segmentation, audit logging retained | 2026-03-01 |
| C-002 | All customer PII must remain in the UK | [x] Regulatory | Primary eu-west-2; DR non-PII; filtered Aurora Global DB | 2026-01-15 |
| C-003 | Must deliver before Black Friday 2026 | [x] Time | Fixed milestone 2026-10-01; scope prioritised | 2026-03-01 |
| C-004 | Must integrate with SAP ERP | [x] Technical | SQS-buffered async integration via existing SAP APIs | 2025-09-30 |
| C-005 | Corporate Cloud Landing Zone mandates AWS | [x] Organisational | All hosting on AWS | 2025-07-14 |

### 6.2 Assumptions

| Id | Assumption | Impact If False | Certainty | Status | Owner | Evidence |
|------|------|------|------|------|------|------|
| A-001 | Stripe will maintain UK PSD2 SCA compliance and pricing through 2028 | Commercial model re-negotiation | [x] High | [x] Open | Priya Doe | Stripe contract with 3-year fixed pricing |
| A-002 | SAP order API handles 5,000 orders/min peak | SQS backlog; customer confusion | [x] Medium | [x] Closed | Fred Bloggs | SAP load test 2025-10-18 at 6,000 orders/min |
| A-003 | Mobile app adoption reaches 55% of sessions by 2027 | Over-investment in mobile BFF | [x] Medium | [x] Open | Raj Bloggs | Current 47%; +2pp/quarter |

### 6.3 Risks

| Id | Risk Event | Category | Severity | Likelihood | Mitigation Strategy | Mitigation Plan | Residual Risk | Owner | Last Assessed |
|------|------|------|------|------|------|------|------|------|------|
| R-001 | Peak trading capacity insufficient during Black Friday | [x] Operational | [x] Critical | [x] Low | [x] Mitigate | Monthly 2x peak load tests; quarterly 3x; game-day 4 weeks before; enhanced on-call rota | [x] Low | Sally Doe | 2026-03-01 |
| R-002 | Vendor lock-in to Stripe creates commercial leverage | [x] Commercial | [x] High | [x] Medium | [x] Mitigate | Payment abstraction layer; documented 6-9 month migration plan; Adyen dual-acquirer evaluation for 2027 | [x] Medium | Priya Doe | 2026-03-01 |
| R-003 | Customer PII data-residency breach via Aurora Global DB | [x] Compliance | [x] High | [x] Low | [x] Mitigate | Filtered logical replication (PII excluded); monthly audit; Terraform guardrails; quarterly DPO sign-off | [x] Low | Tom Bloggs | 2026-02-15 |
| R-004 | Third-party JavaScript compromises storefront (Magecart) | [x] Security | [x] Critical | [x] Medium | [x] Mitigate | Strict CSP; SRI on third-party scripts; Stripe Elements isolation; quarterly client-side audit | [x] Medium | Jane Doe | 2026-03-01 |
| R-005 | Mobile app store review delays or rejection | [x] Delivery | [x] Medium | [x] Medium | [x] Mitigate | Early submission 4 weeks ahead; in-flight review with stores; PWA fallback | [x] Low | Fred Bloggs | 2026-03-01 |
| R-006 | AWS eu-west-2 regional outage during peak trading | [x] Operational | [x] Critical | [x] Low | [x] Accept | Pilot-light DR in eu-west-1; RTO 2h validated; status page; accept 1-min RPO | [x] Medium | Sally Doe | 2026-03-01 |

### 6.4 Dependencies

| Id | Dependency | Direction | Status | Owner | Evidence | Last Assessed |
|------|------|------|------|------|------|------|
| D-001 | SAP ERP provisioned for cloud-origin traffic | [x] Inbound | [x] Resolved | SAP team | Load test 2025-10-18 | 2025-10-31 |
| D-002 | Corporate Cognito customer user pool live | [x] Inbound | [x] Resolved | Platform team | Live 2025-08-15; DPIA approved | 2025-09-30 |
| D-003 | Stripe contract signed with UK acquiring | [x] Inbound | [x] Resolved | Procurement | NW-PROC-2025-118 signed 2025-05-01 | 2025-05-01 |
| D-004 | Loyalty platform supports Cognito attribute mapping | [x] Inbound | [x] Committed | Loyalty team | In test; completion 2026-05-01 | 2026-03-01 |

### 6.5 Issues

| Id | Issue | Category | Impact | Owner | Resolution Plan | Status | Last Assessed |
|------|------|------|------|------|------|------|------|
| I-001 | OpenSearch index rebuild time 42 min blocks catalogue cadence | [x] Operational | [x] Low | Sally Doe | Rolling reindex with dual-index alias swap; 2026-05-01 | [x] In Progress | 2026-03-18 |
| I-002 | iOS notification permissions prompt depresses opt-in | [x] Delivery | [x] Low | Fred Bloggs | Reorder onboarding; A/B test via LaunchDarkly | [x] In Progress | 2026-03-10 |

### 6.8 Compliance Traceability

| Standard | Requirement | How Satisfied | Evidence Section | Compliance Status |
|------|------|------|------|------|
| PCI-DSS v4.0 Req 1 | Install and maintain network security controls | VPC segmentation, security groups, NACLs, WAF, Shield | 3.3 Physical View, 3.5 Security View | [x] Compliant |
| PCI-DSS v4.0 Req 3 | Protect stored account data | No PAN stored; opaque tokens only; AES-256 at rest | 3.4 Data View, 3.5 Security View | [x] Compliant |
| PCI-DSS v4.0 Req 4 | Strong cryptography in transmission | TLS 1.3 on CloudFront; TLS 1.2 minimum internally | 3.2 Integration, 3.5 Security View | [x] Compliant |
| UK GDPR Art 5(1)(f) | Integrity and confidentiality of personal data | Field-level encryption, IAM, audit trail, DPIA | 3.4 Data View, 3.5 Security View | [x] Compliant |
| UK GDPR Art 17 | Right to erasure | Erasure request flow; anonymisation job; audit | 3.6 Scenarios, 3.4 Data View | [x] Compliant |
| WCAG 2.2 AA | Accessibility | Automated axe + manual review in CI | 5.3 Test Strategy | [x] Compliant |
| Consumer Rights Act 2015 | Cooling-off, refund, clear terms | Storefront UX and refund flow | 3.6 Scenarios | [x] Compliant |

---

## 7. Appendices

### Glossary

| Term | Definition |
|------|------|
| Aurora | AWS managed PostgreSQL / MySQL-compatible database |
| BFF | Backend-for-Frontend -- a service tailored to a specific client |
| CDP | Customer Data Platform (Segment, in this context) |
| Cognito | AWS customer identity and access management service |
| Core Web Vitals | Google's user-experience metrics (LCP, INP, CLS) |
| HPA | Horizontal Pod Autoscaler -- Kubernetes autoscaling |
| IRSA | IAM Roles for Service Accounts -- pod-level IAM on EKS |
| LCP | Largest Contentful Paint -- page-load performance metric |
| Magecart | JavaScript-injection attack skimming payment data |
| NWO | NorthWind Online -- the subject of this SAD |
| PAN | Primary Account Number -- the card number |
| PCI-DSS | Payment Card Industry Data Security Standard |
| PSD2 | Payment Services Directive 2 |
| SAQ A-EP | PCI-DSS self-assessment questionnaire for merchants using third-party tokenisation iframe |
| SCA | Strong Customer Authentication |
| SSR | Server-Side Rendering |
| Strangler Fig | Migration pattern gradually replacing a legacy system |

### References

| Title | Version | URL | Description |
|------|------|------|------|
| NorthWind Information Security Standard | 3.4 | Corporate Confluence / Security | Corporate security standard |
| NorthWind Cloud Landing Zone Standard | 2.1 | Corporate Confluence / Cloud | AWS baseline controls |
| NorthWind Data Classification Standard | 1.2 | Corporate Confluence / Data | Classification and handling |
| PCI-DSS | 4.0 | https://www.pcisecuritystandards.org/ | Payment card standard |
| UK GDPR | 2021 | https://www.legislation.gov.uk/ | UK General Data Protection Regulation |
| OWASP ASVS | 4.0 | https://owasp.org/www-project-application-security-verification-standard/ | Application security standard |
| NWO Threat Model | SEC-TM-2025-044 | Corporate Confluence / Security | STRIDE threat model |
| DPIA - NorthWind Online | DPIA-2025-091 | Corporate Confluence / Compliance | Data Protection Impact Assessment |
| AWS Well-Architected Framework | 2025 | https://aws.amazon.com/architecture/well-architected/ | AWS best practice |

### Approvals

| Role | Name | Date | Decision |
|------|------|------|------|
| Solution Architect | Priya Doe | 2026-03-18 | [x] Approved |
| Head of Digital Engineering | Fred Bloggs | 2026-03-17 | [x] Approved |
| Principal Security Architect | Jane Doe | 2026-03-17 | [x] Approved |
| Data Protection Officer | Tom Bloggs | 2026-03-18 | [x] Approved |
| SRE Lead | Sally Doe | 2026-03-17 | [x] Approved |
| CTO | Helen Doe | 2026-03-18 | [x] Approved |
| Head of Digital Commerce | Raj Bloggs | 2026-03-18 | [x] Approved |

---

## 7.3 Compliance Scoring

| Section | Score (0-5) | Assessor | Date | Notes |
|---------|:-----------:|----------|------|-------|
| 1. Executive Summary | 5 | Design Authority | 2026-03-18 | Clear business drivers; strategic alignment documented; current state complete; revenue impact quantified |
| 3.1 Logical View | 4 | Design Authority | 2026-03-18 | Full component decomposition, design patterns with rationale, vendor lock-in assessed |
| 3.2 Integration & Data Flow | 4 | Design Authority | 2026-03-18 | All internal and external integrations documented with protocols and authentication |
| 3.3 Physical View | 4 | Design Authority | 2026-03-18 | Deployment, hosting, networking, environments fully documented |
| 3.4 Data View | 4 | Design Authority | 2026-03-18 | Data stores classified with retention and encryption; DPIA approved; sovereignty addressed |
| 3.5 Security View | 4 | Design Authority | 2026-03-18 | STRIDE threat model with mitigations; PCI-DSS scope reduction documented |
| 3.6 Scenarios | 4 | Design Authority | 2026-03-18 | Three significant use cases; three ADRs with alternatives and tradeoffs |
| 4.1 Operational Excellence | 4 | Design Authority | 2026-03-18 | Datadog APM/Logs/RUM; PagerDuty; peak-readiness drills |
| 4.2 Reliability | 4 | Design Authority | 2026-03-18 | Multi-AZ; pilot-light DR; validated RTO/RPO; fault tolerance |
| 4.3 Performance | 4 | Design Authority | 2026-03-18 | KPIs defined; load testing cadence; 3-year capacity projection |
| 4.4 Cost Optimisation | 5 | Design Authority | 2026-03-18 | Detailed cost breakdown; Savings Plan/RI; FinOps; tagging |
| 4.5 Sustainability | 3 | Design Authority | 2026-03-18 | Graviton, non-prod shutdown, rightsizing. Carbon KPIs not baselined |
| 5. Lifecycle | 4 | Design Authority | 2026-03-18 | CI/CD with security scanning; Strangler Fig; LaunchDarkly; skills assessed; exit plan |
| 6. Decision Making | 4 | Design Authority | 2026-03-18 | 5 constraints, 3 assumptions, 6 risks, 4 dependencies, 2 issues |
| **Overall** | **4** | Design Authority | 2026-03-18 | Recommended depth achieved. Proportionate, well-evidenced documentation for a Tier 2 High Impact regulated e-commerce platform. |

*Scoring: 0=Not Addressed, 1=Acknowledged, 2=Partial, 3=Mostly Addressed, 4=Fully Addressed, 5=Exemplary. Overall = lowest individual score (or weighted average as appropriate).*

---

## 7.4 Approval Sign-Off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Solution Architect | Priya Doe | 2026-03-18 | [x] Approved |
| Security Architect | Jane Doe | 2026-03-17 | [x] Approved |
| ARB / Design Authority | Design Authority Panel | 2026-03-18 | [x] Approved |
