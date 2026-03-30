# Solution Architecture Document

> **Standard:** ADS v1.0.0 (The Architecture Description Standard)
> **Template Version:** 1.0.0
> **Published by:** ArchStandard (archstandard.org)

---

## 0. Document Control

### 0.1 Document Metadata

| Field | Value |
|-------|-------|
| **Document Title** | |
| **Solution Name** | |
| **Application ID** | |
| **Author(s)** | |
| **Owner** | |
| **Version** | 0.1 |
| **Status** | ☐ Draft ☐ In Review ☐ Approved ☐ Superseded |
| **Created Date** | |
| **Last Updated** | |
| **Classification** | ☐ Public ☐ Internal ☐ Confidential ☐ Restricted |

### 0.2 Change History

| Version | Date | Author | Change Type | Description |
|---------|------|--------|-------------|-------------|
| 0.1 | | | ☐ Initial Draft ☐ Minor Update ☐ Major Update ☐ Review Revision | |

### 0.3 Contributors & Approvals

| Name | Role | Type |
|------|------|------|
| | | ☐ Author ☐ Reviewer ☐ Approver |

### 0.4 Purpose & Scope

**Purpose:**

**Scope:**

---

## 1. Executive Summary

### 1.1 Solution Overview

### 1.2 Business Context & Drivers

| Driver | Type | Description | Priority |
|--------|------|-------------|----------|
| | ☐ Regulatory ☐ Cost Reduction ☐ Modernisation ☐ New Capability ☐ Risk Mitigation ☐ Security ☐ Performance ☐ Scalability ☐ End-of-Life ☐ Other | | ☐ Critical ☐ High ☐ Medium ☐ Low |

### 1.3 Strategic Alignment

| Question | Response |
|----------|----------|
| Organisational strategy supported | |
| Reviewed against capability model? | ☐ Yes ☐ No ☐ N/A |
| Duplicates existing capability? | ☐ Yes ☐ No — Justification: |

#### Reuse of Shared Services

| Capability | Shared Service / Platform | Reused? | Justification (if not reused) |
|-----------|--------------------------|---------|------------------------------|
| Identity & Access | | ☐ Yes ☐ No | |
| Messaging / Notifications | | ☐ Yes ☐ No | |
| API Management | | ☐ Yes ☐ No | |
| Monitoring & Logging | | ☐ Yes ☐ No | |
| Data & Analytics | | ☐ Yes ☐ No | |
| CI/CD | | ☐ Yes ☐ No | |
| Other | | ☐ Yes ☐ No | |

### 1.4 Scope

**In Scope:**
-

**Out of Scope:**
-

### 1.6 Key Decisions & Constraints

| Decision | Constraint Type | Rationale | Reversibility |
|----------|----------------|-----------|---------------|
| | ☐ Technical ☐ Organisational ☐ Financial ☐ Regulatory ☐ Time ☐ Vendor ☐ Other | | ☐ Easily Reversible ☐ Reversible with Effort ☐ Difficult to Reverse ☐ Irreversible |

### 1.7 Project Details

| Field | Value |
|-------|-------|
| **Project Name** | |
| **Project Code** | |
| **Project Manager** | |
| **Est. Capex** | |
| **Est. Opex (annual)** | |
| **Currency** | |
| **Target Go-Live** | |

### 1.8 Business Criticality

☐ Tier 1: Critical ☐ Tier 2: High ☐ Tier 3: Medium ☐ Tier 4: Low ☐ Tier 5: Minimal

---

## 2. Stakeholders & Concerns

### 2.1 Stakeholder Register

| Stakeholder | Role Type | Key Concerns | Relevant Views |
|-------------|-----------|--------------|----------------|
| | ☐ Business Owner ☐ Solution Architect ☐ Enterprise Architect ☐ Security Architect ☐ Data Architect ☐ Infrastructure Engineer ☐ Developer ☐ Operations/SRE ☐ Compliance ☐ End User ☐ External Customer ☐ Other | | ☐ Logical ☐ Process ☐ Physical ☐ Data ☐ Security ☐ Scenarios |

### 2.2 Compliance & Regulatory Context

**Supports regulated activities?** ☐ Yes ☐ No ☐ N/A

| Regulation | Type | Applicability | Design Impact |
|-----------|------|--------------|--------------|
| | ☐ Data Protection ☐ Financial Services ☐ Healthcare ☐ Security ☐ Industry-Specific ☐ Internal Policy ☐ Other | | |

---

## 3. Architectural Views

### 3.1 Logical View

#### Application Architecture Diagram

*[Insert diagram]*

#### Component Decomposition

| Component | Type | Description | Technology | Owner | Status |
|-----------|------|-------------|------------|-------|--------|
| | ☐ Web App ☐ API Service ☐ Backend Service ☐ Batch Job ☐ Message Broker ☐ Database ☐ Cache ☐ File Storage ☐ Search Engine ☐ CDN ☐ Gateway ☐ Load Balancer ☐ Queue ☐ Stream ☐ ML Model ☐ Other | | | | ☐ New ☐ Existing Unchanged ☐ Existing Modified ☐ To Be Decommissioned |

#### Design Patterns

| Pattern | Where Applied | Rationale |
|---------|--------------|-----------|
| ☐ Microservices ☐ Monolith ☐ Modular Monolith ☐ Event-Driven ☐ CQRS ☐ Saga ☐ Strangler Fig ☐ API Gateway ☐ BFF ☐ Circuit Breaker ☐ Pub/Sub ☐ Batch Processing ☐ Stream Processing ☐ Data Lake ☐ Data Mesh ☐ Other | | |

---

### 3.2 Process View

#### Data Flow Diagrams

*[Insert diagram(s)]*

#### Internal Component Connectivity

| Source | Destination | Protocol | Encrypted? | Auth Method | Direction | Sync | Purpose |
|--------|-------------|----------|-----------|-------------|-----------|------|---------|
| | | ☐ HTTPS ☐ gRPC-TLS ☐ AMQPS ☐ Kafka ☐ WSS ☐ JDBC ☐ SFTP ☐ SSH ☐ Other | ☐ Yes ☐ No | ☐ mTLS ☐ OAuth2 ☐ API Key ☐ JWT ☐ OIDC ☐ Certificate ☐ IAM Role ☐ None ☐ Other | ☐ Uni ☐ Bi | ☐ Sync ☐ Async ☐ Event | |

#### External Integrations

| Source App | Dest App | Type | Protocol | Encrypted? | Auth | Purpose |
|-----------|---------|------|----------|-----------|------|---------|
| | | ☐ Internal App ☐ External Service ☐ SaaS ☐ Partner ☐ Customer-Facing | | ☐ Yes ☐ No | | |

#### APIs & Interfaces

| Name | Type | Direction | Format | Authenticated? | Rate Limited? |
|------|------|-----------|--------|---------------|--------------|
| | ☐ REST ☐ GraphQL ☐ gRPC ☐ SOAP ☐ WebSocket ☐ Event Stream ☐ File Transfer ☐ Other | ☐ Exposed ☐ Consumed | ☐ JSON ☐ XML ☐ Protobuf ☐ Avro ☐ CSV ☐ Other | ☐ Yes ☐ No | ☐ Yes ☐ No |

---

### 3.3 Physical View

#### Deployment Architecture Diagram

*[Insert diagram]*

#### Hosting

| Attribute | Selection |
|-----------|----------|
| **Venue Type(s)** | ☐ Public Cloud ☐ Private Cloud ☐ On-Premises ☐ SaaS ☐ Hybrid ☐ Co-location ☐ Edge |
| **Region(s)** | |
| **Service Model(s)** | ☐ IaaS ☐ PaaS ☐ SaaS ☐ FaaS ☐ CaaS ☐ DBaaS ☐ Other |
| **Cloud Provider(s)** | ☐ AWS ☐ Azure ☐ GCP ☐ Oracle Cloud ☐ IBM Cloud ☐ Other ☐ None |

#### Compute

**Compute Types:** ☐ Physical Server ☐ Virtual Machine ☐ Container ☐ Serverless Function ☐ Edge Compute ☐ HPC ☐ GPU ☐ None

**Servers:**

| Name | Instance Type | vCPU | Memory (GB) | Storage (TB) | Qty | OS |
|------|-------------|------|-------------|-------------|-----|-----|
| | | | | | | ☐ RHEL ☐ Amazon Linux ☐ Ubuntu ☐ Debian ☐ Windows Server ☐ Other |

**Containers:**

| Attribute | Selection |
|-----------|----------|
| **Platform** | ☐ EKS ☐ AKS ☐ GKE ☐ OpenShift ☐ ECS ☐ Fargate ☐ Cloud Run ☐ Other ☐ None |
| **Cluster Size** | ☐ 1–10 nodes ☐ 11–50 nodes ☐ 51–100 nodes ☐ 100+ nodes |

**Serverless:** ☐ Yes ☐ No — Services:

#### User & Administrator Access

| Attribute | Selection |
|-----------|----------|
| **User access method** | ☐ Web (HTTPS) ☐ VDI ☐ RDP ☐ Citrix ☐ Mobile App ☐ API ☐ Other |
| **User locations** | |
| **Admin access method** | ☐ VDI ☐ RDP ☐ SSH ☐ HTTPS ☐ Bastion Host ☐ Other |
| **VPN required?** | ☐ Yes ☐ No |
| **Direct Connect / ExpressRoute?** | ☐ Yes ☐ No |

#### Transport Protocols

| Protocol | Used? | Purpose |
|----------|-------|---------|
| HTTPS (TLS 1.2+) | ☐ Yes ☐ No | |
| SFTP | ☐ Yes ☐ No | |
| ODBC / JDBC | ☐ Yes ☐ No | |
| TCP (other) | ☐ Yes ☐ No | |
| gRPC | ☐ Yes ☐ No | |
| WebSocket | ☐ Yes ☐ No | |
| Other | ☐ Yes ☐ No | |

#### Networking

| Question | Response |
|----------|----------|
| Internet-facing? | ☐ Yes ☐ No |
| Outbound internet? | ☐ Yes ☐ No |
| Cloud-to-on-prem? | ☐ Yes ☐ No |
| Third-party connectivity? | ☐ Yes ☐ No |
| Cloud peering? | ☐ Yes ☐ No |
| Traffic pattern | ☐ Constant ☐ Periodic ☐ Burst ☐ Seasonal ☐ Unpredictable |
| Latency requirement | ☐ Ultra-low (<1ms) ☐ Low (<10ms) ☐ Moderate (<100ms) ☐ Standard (<1s) ☐ Tolerant (>1s) ☐ N/A |
| DDoS protection | ☐ Yes ☐ No — Provider: ☐ AWS Shield ☐ Azure DDoS ☐ Cloudflare ☐ Other |
| WAF enabled | ☐ Yes ☐ No — Provider: ☐ AWS WAF ☐ Azure WAF ☐ Cloudflare ☐ Other |
| Rate limiting | ☐ Yes ☐ No |

#### Environments

| Type | Count | Venue | Auto Scale Down? |
|------|-------|-------|-----------------|
| ☐ Development | | | ☐ Yes ☐ No |
| ☐ Test / QA | | | ☐ Yes ☐ No |
| ☐ Staging | | | ☐ Yes ☐ No |
| ☐ Production | | | ☐ Yes ☐ No |
| ☐ DR | | | ☐ Yes ☐ No |

**Security Agents:** ☐ Anti-Malware ☐ EDR ☐ Vulnerability Management ☐ DLP ☐ HIDS ☐ FIM ☐ Other

---

### 3.4 Data View

#### Data Stores

| Name | Store Type | Technology | Auth? | Retention | Size | Classification | PII? | SPI? | Encryption | Key Mgmt |
|------|-----------|-----------|-------|-----------|------|---------------|------|------|-----------|----------|
| | ☐ Relational DB ☐ NoSQL Document ☐ NoSQL Key-Value ☐ Object Storage ☐ Data Warehouse ☐ Data Lake ☐ Cache ☐ Queue ☐ Search Index ☐ Other | | ☐ Y ☐ N | ☐ Transient ☐ Hours ☐ Days ☐ Weeks ☐ Months ☐ 1yr ☐ 2–5yr ☐ 5–10yr ☐ 10+yr ☐ Indef | ☐ <1GB ☐ 1–100GB ☐ 100GB–1TB ☐ 1–10TB ☐ 10–100TB ☐ 100TB–1PB ☐ >1PB | ☐ Public ☐ Internal ☐ Restricted ☐ Highly Restricted | ☐ Y ☐ N | ☐ Y ☐ N | ☐ None ☐ Storage ☐ Container ☐ Application ☐ Field | ☐ Provider ☐ CMK/KMS ☐ HSM ☐ BYOK ☐ None |

**Production data for testing:** ☐ Not used ☐ Public only ☐ Sensitive deleted ☐ Masked ☐ Used with justification

**Data integrity controls?** ☐ Yes ☐ No ☐ N/A

**Data on end user devices?** ☐ Yes ☐ No ☐ N/A

**Data sovereignty required?** ☐ Yes ☐ No ☐ N/A — Details:

#### Data Transfers

| Destination | Type | Classification | Transfer Method | Encrypted? |
|------------|------|---------------|----------------|-----------|
| | ☐ Internal ☐ Third Party ☐ Regulator ☐ Customer ☐ Partner | ☐ Public ☐ Internal ☐ Restricted ☐ Highly Restricted | ☐ API ☐ SFTP ☐ Email ☐ Queue ☐ DB Replication ☐ File Share ☐ Manual ☐ Other | ☐ Yes ☐ No |

---

### 3.5 Security View

**Third-party hosted?** ☐ Yes ☐ No ☐ N/A

**Third-party risk assessed?** ☐ Yes ☐ No ☐ N/A

#### Business Impact Assessment

| Category | Impact Level |
|----------|-------------|
| **Confidentiality** | ☐ Critical ☐ High ☐ Medium ☐ Low ☐ Negligible |
| **Integrity** | ☐ Critical ☐ High ☐ Medium ☐ Low ☐ Negligible |
| **Availability** | ☐ Critical ☐ High ☐ Medium ☐ Low ☐ Negligible |
| **Non-Repudiation** | ☐ Critical ☐ High ☐ Medium ☐ Low ☐ Negligible |

#### Authentication

| Access Type | Method | Uses Group-Wide Auth? |
|------------|--------|----------------------|
| ☐ End User (Internal) | ☐ SSO-SAML ☐ SSO-OIDC ☐ MFA ☐ Certificate ☐ API Key ☐ OAuth2 ☐ Kerberos ☐ Passwordless ☐ Custom | ☐ Yes ☐ No |
| ☐ End User (External) | ☐ SSO-SAML ☐ SSO-OIDC ☐ MFA ☐ Certificate ☐ API Key ☐ OAuth2 ☐ Custom | ☐ Yes ☐ No |
| ☐ IT Operations | | ☐ Yes ☐ No |
| ☐ Service Account | | ☐ Yes ☐ No |
| ☐ API Consumer | | ☐ Yes ☐ No |

#### Authorisation

| Attribute | Selection |
|-----------|----------|
| **Model** | ☐ RBAC ☐ ABAC ☐ PBAC ☐ ACL ☐ Custom |
| **Provisioning** | ☐ Automated IDM ☐ Manual Request ☐ Self-Service ☐ API-Driven ☐ Other |
| **Recertification enabled?** | ☐ Yes ☐ No |
| **SoD enforced?** | ☐ Yes ☐ No |

#### Privileged Access

| Attribute | Selection |
|-----------|----------|
| **PAM solution** | |
| **Just-in-time access?** | ☐ Yes ☐ No |
| **Session recording?** | ☐ Yes ☐ No |
| **Break-glass process?** | ☐ Yes ☐ No |

#### Encryption at Rest

| Attribute | Selection |
|-----------|----------|
| **Implemented?** | ☐ Yes ☐ No |
| **Level** | ☐ Storage ☐ Logical Container ☐ Application ☐ Field |
| **Key type** | ☐ Symmetric ☐ Asymmetric |
| **Key generation** | ☐ HSM (FIPS 140 L3) ☐ HSM (FIPS 140 L2) ☐ KMS ☐ Software ☐ Other |
| **Key storage** | ☐ HSM ☐ KMS ☐ Software Keystore ☐ Other |
| **Key rotation (days)** | |

#### Secret Management

| Attribute | Selection |
|-----------|----------|
| **Secret store** | ☐ HashiCorp Vault ☐ AWS Secrets Manager ☐ Azure Key Vault ☐ GCP Secret Manager ☐ CyberArk ☐ Custom ☐ None |
| **Distribution** | ☐ Runtime Retrieval ☐ Deployment Time ☐ Environment Variable ☐ Mounted Volume ☐ Other |
| **Rotation** | ☐ Automatic ☐ Manual (Scheduled) ☐ Manual (Ad Hoc) ☐ Not Rotated |

#### Security Monitoring

| Attribute | Selection |
|-----------|----------|
| **SIEM integration?** | ☐ Yes ☐ No |
| **Security event logging?** | ☐ Yes ☐ No |
| **Intrusion detection?** | ☐ Yes ☐ No |

---

### 3.6 Scenarios

#### Key Use Cases

**UC-01:**

| Attribute | Detail |
|-----------|--------|
| **Actors** | |
| **Trigger** | |
| **Main Flow** | |
| **Views Involved** | ☐ Logical ☐ Process ☐ Physical ☐ Data ☐ Security |

#### Architecture Decision Records

**ADR-001:**

| Field | Content |
|-------|---------|
| **Status** | ☐ Proposed ☐ Accepted ☐ Superseded ☐ Deprecated |
| **Date** | |
| **Context** | |
| **Decision** | |
| **Alternatives** | |
| **Consequences** | |
| **Affected Pillars** | ☐ Ops Excellence ☐ Reliability ☐ Performance ☐ Cost ☐ Sustainability |

---

## 4. Quality Attributes

### 4.1 Operational Excellence

| Attribute | Selection |
|-----------|----------|
| Centralised logging? | ☐ Yes ☐ No |
| Logging tool | |
| Monitoring tool | |
| Distributed tracing? | ☐ Yes ☐ No |
| Alerting configured? | ☐ Yes ☐ No |
| Runbooks documented? | ☐ Yes ☐ No |

### 4.2 Reliability & Resilience

| Attribute | Selection |
|-----------|----------|
| DR strategy | ☐ Active-Active ☐ Active-Passive ☐ Pilot Light ☐ Warm Standby ☐ Backup & Restore ☐ None |
| Multi-venue deployment? | ☐ Yes ☐ No |
| RTO target | |
| RPO target | |
| Scalability | ☐ No Dynamic Scaling ☐ Manual Scaling ☐ Partial Auto-Scaling ☐ Full Auto-Scaling |
| Fault tolerance designed? | ☐ Yes ☐ No |
| Chaos testing practised? | ☐ Yes ☐ No |
| Backup enabled? | ☐ Yes ☐ No |
| Backup type | ☐ Full ☐ Incremental ☐ Differential ☐ Continuous ☐ Snapshot |
| Backup frequency | ☐ Real-Time ☐ Hourly ☐ Daily ☐ Weekly ☐ Monthly |
| Backup immutable? | ☐ Yes ☐ No |
| Backup encrypted? | ☐ Yes ☐ No |

### 4.3 Performance Efficiency

| Attribute | Value |
|-----------|-------|
| P95 response time (ms) | |
| Target throughput (req/s) | |
| Target concurrent users | |
| Performance testing | ☐ Load Testing ☐ Stress Testing ☐ Soak Testing ☐ Spike Testing ☐ None |
| Caching used? | ☐ Yes ☐ No |
| CDN used? | ☐ Yes ☐ No |

#### Capacity & Growth Projections

| Metric | Current | 1 Year | 3 Years | 5 Years |
|--------|---------|--------|---------|---------|
| Users (total) | | | | |
| Concurrent users (peak) | | | | |
| Data volume | | | | |
| Transaction volume (per day) | | | | |
| Storage requirement | | | | |

| Question | Response |
|----------|----------|
| Will current design scale to projected growth? | ☐ Yes ☐ No — Details: |
| Seasonal / cyclical demand patterns? | ☐ Yes ☐ No — Details: |

### 4.4 Cost Optimisation

| Attribute | Selection |
|-----------|----------|
| Cost analysis performed? | ☐ Yes ☐ No |
| Design constrained by cost? | ☐ Yes ☐ No |
| Reserved capacity? | ☐ Yes ☐ No |
| Cost monitoring enabled? | ☐ Yes ☐ No |
| Tagging strategy? | ☐ Yes ☐ No |

### 4.5 Sustainability

| Attribute | Selection |
|-----------|----------|
| Hosting location optimised for carbon? | ☐ Yes ☐ No |
| Non-prod auto-shutdown? | ☐ Yes ☐ No |
| Resources rightsized? | ☐ Yes ☐ No |
| Workload pattern | ☐ Constant ☐ Variable (Predictable) ☐ Variable (Unpredictable) |
| Continuous availability required? | ☐ Yes ☐ No |

### Pillar Tradeoffs

| Pillars Involved | Description | Chosen Priority | Rationale |
|-----------------|-------------|----------------|-----------|
| | | | |

---

## 5. Lifecycle Management

| Attribute | Selection |
|-----------|----------|
| Internally developed? | ☐ Yes ☐ No |
| Source control | ☐ GitHub ☐ GitLab ☐ Bitbucket ☐ Azure DevOps ☐ Other ☐ None |
| CI/CD platform | ☐ GitHub Actions ☐ GitLab CI ☐ Jenkins ☐ Azure Pipelines ☐ CircleCI ☐ Argo ☐ Other ☐ None |
| SAST | ☐ Semgrep ☐ SonarQube ☐ Coverity ☐ Checkmarx ☐ Veracode ☐ Snyk Code ☐ Other ☐ None |
| DAST | ☐ Yes ☐ No ☐ N/A |
| SCA | ☐ Snyk ☐ BlackDuck ☐ Dependabot ☐ Renovate ☐ Other ☐ None |
| Container scanning | ☐ Yes ☐ No ☐ N/A |
| Release frequency | ☐ Continuous ☐ Daily ☐ Weekly ☐ Fortnightly ☐ Monthly ☐ Quarterly ☐ Ad Hoc |
| Support model | ☐ Internal Team ☐ Vendor Managed ☐ Managed Service ☐ Community ☐ Hybrid |
| Support hours | ☐ 24x7 ☐ Business Hours ☐ Extended Hours ☐ Follow-the-Sun |
| Intended lifespan | ☐ <1 Year ☐ 1–3 Years ☐ 3–5 Years ☐ 5–10 Years ☐ 10+ Years ☐ Indefinite |
| Exit plan documented? | ☐ Yes ☐ No |
| Vendor lock-in level | ☐ None ☐ Low ☐ Moderate ☐ High ☐ Critical |

### Migration (if applicable)

**Migration Classification (6 R's):**

☐ Retain ☐ Retire ☐ Rehost ☐ Replatform ☐ Refactor ☐ Replace ☐ N/A (net-new)

| Attribute | Selection |
|-----------|----------|
| Deployment strategy | ☐ Big Bang ☐ Blue-Green ☐ Canary ☐ Rolling ☐ Strangler Fig ☐ Parallel Run ☐ Phased |
| Data migration mode | ☐ One-off ☐ Phased ☐ Continuous Sync ☐ N/A |
| Data migration method | |
| Data volume to migrate | |
| End-user cutover | ☐ One-off ☐ Phased ☐ N/A |
| External system cutover | ☐ One-off ☐ Phased ☐ N/A |
| Max acceptable downtime | ☐ Zero ☐ Seconds ☐ Minutes ☐ Hours ☐ Days |
| Rollback plan | |
| Transient infrastructure needed? | ☐ Yes ☐ No |

### Resourcing & Skills

| Skill Area | Current Level | Action Required |
|-----------|--------------|-----------------|
| Cloud platform | ☐ High ☐ Medium ☐ Low ☐ N/A | |
| Infrastructure as Code | ☐ High ☐ Medium ☐ Low ☐ N/A | |
| CI/CD pipeline management | ☐ High ☐ Medium ☐ Low ☐ N/A | |
| Application technology stack | ☐ High ☐ Medium ☐ Low ☐ N/A | |
| Database administration | ☐ High ☐ Medium ☐ Low ☐ N/A | |
| Security & compliance | ☐ High ☐ Medium ☐ Low ☐ N/A | |

**Operational readiness:** ☐ A: Fully capable ☐ B: Partially capable ☐ C: Learning ☐ D: Not capable

---

## 6. Decision Making & Governance

### 6.1.1 Constraints

| ID | Constraint | Category | Impact on Design | Last Assessed |
|----|-----------|----------|-----------------|---------------|
| C-001 | | ☐ Regulatory ☐ Technical ☐ Commercial ☐ Organisational ☐ Time | | |

### 6.1.2 Assumptions

| ID | Assumption | Impact if False | Certainty | Status | Owner | Evidence |
|----|-----------|----------------|-----------|--------|-------|----------|
| A-001 | | | ☐ High ☐ Medium ☐ Low | ☐ Open ☐ Closed | | |

### 6.1.3 Risks

| ID | Risk Event | Category | Severity | Likelihood | Mitigation Strategy | Mitigation Plan | Residual Risk | Owner | Last Assessed |
|----|-----------|----------|----------|-----------|-------------------|-----------------|--------------|-------|---------------|
| R-001 | | ☐ Technical ☐ Security ☐ Operational ☐ Delivery ☐ Commercial ☐ Compliance | ☐ High ☐ Medium ☐ Low | ☐ High ☐ Medium ☐ Low | ☐ Accept ☐ Mitigate ☐ Transfer ☐ Avoid | | ☐ High ☐ Medium ☐ Low | | |

### 6.1.4 Dependencies

| ID | Dependency | Direction | Status | Owner | Evidence | Last Assessed |
|----|-----------|-----------|--------|-------|----------|---------------|
| D-001 | | ☐ Inbound ☐ Outbound | ☐ Committed ☐ Not Committed ☐ Resolved | | | |

### 6.1.5 Issues

| ID | Issue | Category | Impact | Owner | Resolution Plan | Status | Last Assessed |
|----|-------|----------|--------|-------|----------------|--------|---------------|
| I-001 | | ☐ Technical ☐ Security ☐ Operational ☐ Delivery ☐ Commercial | ☐ High ☐ Medium ☐ Low | | | ☐ Open ☐ In Progress ☐ Resolved | |

### 6.2 Guardrail Exceptions

| Question | Response |
|----------|----------|
| Policy exceptions? | ☐ Yes ☐ No ☐ N/A |
| Exceptions accepted? | ☐ Yes ☐ No ☐ N/A |
| Process exceptions? | ☐ Yes ☐ No ☐ N/A |
| Risk profile impact? | ☐ Yes ☐ No ☐ N/A |

### 6.3 Compliance Traceability

| Standard | Requirement | How Satisfied | Evidence Section | Status |
|----------|-------------|--------------|-----------------|--------|
| | | | | ☐ Compliant ☐ Partially Compliant ☐ Non-Compliant ☐ N/A |

---

## 7. Appendices

### 7.1 Glossary

| Term | Definition |
|------|-----------|
| | |

### 7.2 References

| Title | Version | URL | Description |
|-------|---------|-----|-------------|
| | | | |

### 7.3 Compliance Scoring

| Section | Score (0–5) | Assessor | Date | Notes |
|---------|:-----------:|----------|------|-------|
| 1. Executive Summary | | | | |
| 3.1 Logical View | | | | |
| 3.2 Integration & Data Flow | | | | |
| 3.3 Physical View | | | | |
| 3.4 Data View | | | | |
| 3.5 Security View | | | | |
| 3.6 Scenarios | | | | |
| 4.1 Operational Excellence | | | | |
| 4.2 Reliability | | | | |
| 4.3 Performance | | | | |
| 4.4 Cost Optimisation | | | | |
| 4.5 Sustainability | | | | |
| 5. Lifecycle | | | | |
| 6. Decision Making | | | | |
| **Overall** | | | | |

*Scoring: 0=Not Addressed, 1=Acknowledged, 2=Partial, 3=Mostly Addressed, 4=Fully Addressed, 5=Exemplary. Overall = lowest individual score.*

### 7.4 Approval Sign-Off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Solution Architect | | | ☐ Approved ☐ Approved with Conditions ☐ Rejected ☐ Deferred |
| Security Architect | | | ☐ Approved ☐ Approved with Conditions ☐ Rejected ☐ Deferred |
| ARB / Design Authority | | | ☐ Approved ☐ Approved with Conditions ☐ Rejected ☐ Deferred |
