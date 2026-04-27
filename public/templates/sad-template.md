# Solution Architecture Document

> **Standard:** ADS v1.3.1 (Architecture Description Standard)
>
> **Standard published by:** ArchStandard (archstandard.org)
>
> **Standard licence:** CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
>
> **Generated from:** schema/ads.schema.json
>
> *Document author and owner: complete in Section 0 (Document Control) below.*

---

> **Note:** This template was auto-generated from the ADS JSON Schema.
> For guidance on completing each section, see [archstandard.org](https://archstandard.org).

## 0. Document Control

### Document Metadata

**Authors:**
- 

### Change History

| Version | Date | Author | Change Type | Description |
|------|------|------|------|------|
|  |  |  | [ ] Initial Draft [ ] Minor Update [ ] Major Update [ ] Review Revision [ ] Approval |  |

### Contributors & Approvals

| Name | Role | Contribution Type |
|------|------|------|
|  |  | [ ] Author [ ] Reviewer [ ] Approver |

---

## 1. Executive Summary

### Business Context & Drivers

| Driver | Driver Type | Description | Priority |
|------|------|------|------|
|  | [ ] Regulatory [ ] Cost Reduction [ ] Modernisation [ ] New Capability [ ] Risk Mitigation [ ] Security [ ] Performance [ ] Scalability [ ] End Of Life [ ] Merger Acquisition [ ] Other |  | [ ] Critical [ ] High [ ] Medium [ ] Low |

### Strategic Alignment

#### Shared Service Reuse

| Capability | Shared Service | Reused | Justification |
|------|------|------|------|
|  |  | [ ] Yes [ ] No |  |

**In Scope:**
- 

**Out Of Scope:**
- 

### Key Decisions & Constraints

| Decision | Constraint Type | Rationale | Reversibility |
|------|------|------|------|
|  | [ ] Technical [ ] Organisational [ ] Financial [ ] Regulatory [ ] Time [ ] Vendor [ ] Other |  | [ ] Easily Reversible [ ] Reversible With Effort [ ] Difficult To Reverse [ ] Irreversible |

### Project Details

| Field | Value |
|-------|-------|
| **Project Name** | |
| **Project Code** | |
| **Project Manager** | |
| **Estimated CapEx** | |
| **Estimated OpEx** | |
| **Currency** | |
| **Target Go Live** | |

---

## 2. Stakeholders & Concerns

### Stakeholder Register

| Stakeholder | Role Type | Concerns | Relevant Views |
|------|------|------|------|
|  | [ ] Business Owner [ ] Solution Architect [ ] Enterprise Architect [ ] Security Architect [ ] Data Architect [ ] Infrastructure Engineer [ ] Developer [ ] Operations SRE [ ] Compliance [ ] Project Manager [ ] Vendor [ ] End User [ ] External Customer [ ] Other |  |  |

### Compliance & Regulatory Context

#### Regulatory Requirements

| Regulation | Regulation Type | Applicability | Design Impact |
|------|------|------|------|
|  | [ ] Data Protection [ ] Financial Services [ ] Healthcare [ ] Security [ ] Industry Specific [ ] Internal Policy [ ] Other |  |  |

---

## 3. Architectural Views

### 3.1 Logical View

**Diagrams:**
- 

#### Components

*Repeat the table below for each component.*

| Field | Value |
|-------|-------|
| **Name** | |
| **Component Type** | [ ] Web Application [ ] API Service [ ] Backend Service [ ] Batch Job [ ] Message Broker [ ] Database [ ] Cache [ ] File Storage [ ] Search Engine [ ] CDN [ ] Gateway [ ] Load Balancer [ ] Queue [ ] Stream [ ] ML Model [ ] Other |
| **Description** | |
| **Technology** | |
| **Owner** | |
| **Status** | [ ] New [ ] Existing Unchanged [ ] Existing Modified [ ] To Be Decommissioned |

#### Design Patterns

| Pattern | Where Applied | Rationale |
|------|------|------|
| [ ] Microservices [ ] Monolith [ ] Modular Monolith [ ] Event Driven [ ] CQRS [ ] Saga [ ] Strangler Fig [ ] Sidecar [ ] API Gateway [ ] BFF [ ] Circuit Breaker [ ] Pub Sub [ ] Request Response [ ] Batch Processing [ ] Stream Processing [ ] Data Lake [ ] Data Mesh [ ] Other |  |  |

**Quality Attribute References:**
- 

### 3.2 Integration & Data Flow View

**Diagrams:**
- 

#### Internal Component Connectivity

*Repeat the table below for each internal component connectivity.*

| Field | Value |
|-------|-------|
| **Source** | |
| **Destination** | |
| **Protocol** | [ ] HTTPS [ ] HTTP [ ] gRPC [ ] gRPC TLS [ ] TCP [ ] TCP TLS [ ] AMQP [ ] AMQPS [ ] MQTT [ ] MQTTS [ ] Kafka [ ] WebSocket [ ] WSS [ ] JDBC [ ] ODBC [ ] SFTP [ ] FTPS [ ] SMTP [ ] SMTPS [ ] LDAPS [ ] SSH [ ] Other |
| **Encrypted** | [ ] Yes [ ] No |
| **Authentication Method** | [ ] mTLS [ ] OAuth2 [ ] API Key [ ] JWT [ ] SAML [ ] OIDC [ ] Basic Auth [ ] Certificate [ ] IAM Role [ ] Kerberos [ ] None [ ] Other |
| **Direction** | [ ] Unidirectional [ ] Bidirectional |
| **Synchronicity** | [ ] Synchronous [ ] Asynchronous [ ] Event Driven |
| **Purpose** | |

#### External Integrations

*Repeat the table below for each external integration.*

| Field | Value |
|-------|-------|
| **Source App** | |
| **Destination App** | |
| **Integration Type** | [ ] Internal App [ ] External Service [ ] SaaS [ ] Partner [ ] Customer Facing |
| **Protocol** | [ ] HTTPS [ ] HTTP [ ] gRPC [ ] gRPC TLS [ ] TCP [ ] TCP TLS [ ] AMQP [ ] AMQPS [ ] MQTT [ ] Kafka [ ] SFTP [ ] FTPS [ ] SMTP [ ] SMTPS [ ] Other |
| **Encrypted** | [ ] Yes [ ] No |
| **Authentication Method** | [ ] mTLS [ ] OAuth2 [ ] API Key [ ] JWT [ ] SAML [ ] OIDC [ ] Basic Auth [ ] Certificate [ ] IAM Role [ ] None [ ] Other |
| **Purpose** | |

#### APIs & Interfaces

*Repeat the table below for each API or interface.*

| Field | Value |
|-------|-------|
| **Name** | |
| **API Type** | [ ] REST [ ] GraphQL [ ] gRPC [ ] SOAP [ ] WebSocket [ ] Event Stream [ ] File Transfer [ ] Other |
| **Direction** | [ ] Exposed [ ] Consumed |
| **Data Format** | [ ] JSON [ ] XML [ ] Protobuf [ ] Avro [ ] CSV [ ] Parquet [ ] Binary [ ] Other |
| **Version** | |
| **Authenticated** | [ ] Yes [ ] No |
| **Rate Limited** | [ ] Yes [ ] No |

**Quality Attribute References:**
- 

### 3.3 Physical View

**Diagrams:**
- 

#### Hosting & Infrastructure

**Venue Types:**
- 

**Regions:**
- 

**Service Models:**
- 

**Cloud Providers:**
- 

#### Compute

**Compute Types:**
- 

##### Servers

*Repeat the table below for each server.*

| Field | Value |
|-------|-------|
| **Name** | |
| **Instance Type** | |
| **V CPU** | |
| **Memory Gb** | |
| **Storage Tb** | |
| **Quantity** | |
| **OS** | [ ] RHEL [ ] Amazon Linux [ ] Ubuntu [ ] Debian [ ] CentOS [ ] Windows Server [ ] SUSE [ ] Other |

##### Containers

**Base Images:**
- 

##### Serverless

**Services:**
- 

#### Network Connectivity

| Field | Value |
|-------|-------|
| **Internet Facing** | [ ] Yes [ ] No |
| **Outbound Internet** | [ ] Yes [ ] No |
| **Cloud-to-On-Premises Connectivity** | [ ] Yes [ ] No |
| **Third-Party Connectivity** | [ ] Yes [ ] No |
| **Cloud Peering** | [ ] Yes [ ] No |
| **Wireless Required** | [ ] Yes [ ] No |
| **Peak Egress (Mbps)** | |
| **Peak Ingress (Mbps)** | |
| **Traffic Pattern** | [ ] Constant [ ] Periodic [ ] Burst [ ] Seasonal [ ] Unpredictable |
| **Latency Requirement** | [ ] Ultra Low Sub 1ms [ ] Low Sub 10ms [ ] Moderate Sub 100ms [ ] Standard Sub 1s [ ] Tolerant Above 1s [ ] Not Applicable |
| **DDoS Protection** | [ ] Yes [ ] No [ ] Not Applicable |
| **DDoS Provider** | [ ] AWS Shield [ ] Azure DDoS [ ] Cloudflare [ ] Akamai [ ] GCP Cloud Armor [ ] Arbor [ ] Other [ ] None |
| **WAF Enabled** | [ ] Yes [ ] No [ ] Not Applicable |
| **WAF Provider** | [ ] AWS WAF [ ] Azure WAF [ ] Cloudflare WAF [ ] GCP Cloud Armor [ ] F5 [ ] Imperva [ ] Other [ ] None |
| **Rate Limiting** | [ ] Yes [ ] No |

#### Environments

| Environment Type | Count | Venue | Auto Scale Down |
|------|------|------|------|
| [ ] Development [ ] Test [ ] QA [ ] Integration Test [ ] Staging [ ] Pre Production [ ] Production [ ] DR [ ] Sandbox [ ] Demo [ ] Performance Test |  |  | [ ] Yes [ ] No |

**Security Agents:**
- 

**Quality Attribute References:**
- 

### 3.4 Data View

#### Data Stores

*Repeat the table below for each data store.*

| Field | Value |
|-------|-------|
| **Name** | |
| **Store Type** | [ ] Relational DB [ ] NoSQL Document [ ] NoSQL Key Value [ ] NoSQL Graph [ ] NoSQL Columnar [ ] Object Storage [ ] Block Storage [ ] File Storage [ ] Data Warehouse [ ] Data Lake [ ] Cache [ ] Message Queue [ ] Search Index [ ] Time Series DB [ ] In Memory [ ] Other |
| **Technology** | |
| **Authoritative** | [ ] Yes [ ] No |
| **Retention Period** | [ ] Transient [ ] Hours [ ] Days [ ] Weeks [ ] Months [ ] 1 Year [ ] 2 5 Years [ ] 5 10 Years [ ] 10 Plus Years [ ] Indefinite |
| **Data Size Category** | [ ] Under 1 GB [ ] 1 100 GB [ ] 100 GB 1 TB [ ] 1 10 TB [ ] 10 100 TB [ ] 100 TB 1 PB [ ] Over 1 PB |
| **Classification** | [ ] Public [ ] Internal [ ] Restricted [ ] Highly Restricted |
| **Contains Personal Data** | [ ] Yes [ ] No |
| **Contains Sensitive Personal Data** | [ ] Yes [ ] No |
| **Encryption Level** | [ ] None [ ] Storage Level [ ] Logical Container [ ] Application Level [ ] Field Level |
| **Key Management** | [ ] Provider Managed [ ] Customer Managed KMS [ ] HSM [ ] BYOK [ ] Custom [ ] None |

#### Data Transfers

| Destination | Destination Type | Classification | Transfer Method | Encrypted |
|------|------|------|------|------|
|  | [ ] Internal [ ] Third Party [ ] Regulator [ ] Customer [ ] Partner | [ ] Public [ ] Internal [ ] Restricted [ ] Highly Restricted | [ ] API [ ] SFTP [ ] Email [ ] Message Queue [ ] Database Replication [ ] File Share [ ] Manual [ ] Other | [ ] Yes [ ] No |

**Quality Attribute References:**
- 

### 3.5 Security View

#### Business Impact Assessment

| Field | Value |
|-------|-------|
| **Confidentiality** | [ ] Critical [ ] High [ ] Medium [ ] Low [ ] Negligible |
| **Integrity** | [ ] Critical [ ] High [ ] Medium [ ] Low [ ] Negligible |
| **Availability** | [ ] Critical [ ] High [ ] Medium [ ] Low [ ] Negligible |
| **Non Repudiation** | [ ] Critical [ ] High [ ] Medium [ ] Low [ ] Negligible |

#### Authentication

| Access Type | Method | Uses Group Wide Auth |
|------|------|------|
| [ ] End User Internal [ ] End User External [ ] IT Operations [ ] Service Account [ ] API Consumer | [ ] SSO SAML [ ] SSO OIDC [ ] MFA [ ] Certificate [ ] API Key [ ] OAuth2 [ ] Basic Auth [ ] Kerberos [ ] Passwordless [ ] Custom | [ ] Yes [ ] No |

#### Authorisation

| Field | Value |
|-------|-------|
| **Model** | [ ] RBAC [ ] ABAC [ ] PBAC [ ] ACL [ ] Custom |
| **Entitlement Store** | |
| **Provisioning Process** | [ ] Automated IDM [ ] Manual Request [ ] Self Service [ ] API Driven [ ] Other |
| **Recertification Enabled** | [ ] Yes [ ] No |
| **Segregation Of Duties Enforced** | [ ] Yes [ ] No |

#### Privileged Access

| Field | Value |
|-------|-------|
| **PAM Solution** | |
| **Just In Time Access** | [ ] Yes [ ] No |
| **Session Recording** | [ ] Yes [ ] No |
| **Break Glass Process** | [ ] Yes [ ] No |

#### Encryption at Rest

| Field | Value |
|-------|-------|
| **Implemented** | [ ] Yes [ ] No |
| **Level** | [ ] Storage Level [ ] Logical Container [ ] Application Level [ ] Field Level |
| **Key Type** | [ ] Symmetric [ ] Asymmetric |
| **Algorithm** | |
| **Key Generation** | [ ] HSM FIPS 140 L3 [ ] HSM FIPS 140 L2 [ ] KMS [ ] Software [ ] Other |
| **Key Storage** | [ ] HSM [ ] KMS [ ] Software Keystore [ ] Other |
| **Key Rotation (Days)** | |

#### Secret Management

| Field | Value |
|-------|-------|
| **Secret Store** | [ ] Hashicorp Vault [ ] AWS Secrets Manager [ ] Azure Key Vault [ ] GCP Secret Manager [ ] CyberArk [ ] Custom [ ] None |
| **Distribution** | [ ] Runtime Retrieval [ ] Deployment Time [ ] Environment Variable [ ] Mounted Volume [ ] Other |
| **Rotation** | [ ] Automatic [ ] Manual Scheduled [ ] Manual Ad Hoc [ ] Not Rotated |

#### Security Monitoring

| Field | Value |
|-------|-------|
| **SIEM Integration** | [ ] Yes [ ] No |
| **SIEM Tool** | |
| **Security Event Logging** | [ ] Yes [ ] No |
| **Intrusion Detection** | [ ] Yes [ ] No |

**Quality Attribute References:**
- 

### 3.6 Scenarios

#### Key Use Cases

*Repeat the table below for each key use case.*

| Field | Value |
|-------|-------|
| **Id** | |
| **Name** | |
| **Actors** | |
| **Trigger** | |
| **Main Flow** | |
| **Views Involved** | |

#### Architecture Decision Records

*Repeat the table below for each architecture decision record.*

| Field | Value |
|-------|-------|
| **Id** | |
| **Title** | |
| **Status** | [ ] Proposed [ ] Accepted [ ] Superseded [ ] Deprecated |
| **Date** | |
| **Context** | |
| **Decision** | |
| **Alternatives** | |
| **Consequences** | |
| **Affected Attributes** | |

---

## 4. Quality Attributes

### 4.1 Operational Excellence

| Field | Value |
|-------|-------|
| **Logging Centralised** | [ ] Yes [ ] No |
| **Logging Tool** | |
| **Monitoring Tool** | |
| **Tracing Enabled** | [ ] Yes [ ] No |
| **Alerting Configured** | [ ] Yes [ ] No |
| **Runbooks Documented** | [ ] Yes [ ] No |

### 4.2 Reliability & Resilience

| Field | Value |
|-------|-------|
| **DR Strategy** | [ ] Active Active [ ] Active Passive [ ] Pilot Light [ ] Warm Standby [ ] Backup Restore [ ] None |
| **Multi Venue Deployment** | [ ] Yes [ ] No |
| **RTO Target** | |
| **RPO Target** | |
| **Scalability** | [ ] No Dynamic Scaling [ ] Manual Scaling [ ] Partial Auto Scaling [ ] Full Auto Scaling |
| **Fault Tolerance Designed** | [ ] Yes [ ] No |
| **Chaos Testing Practised** | [ ] Yes [ ] No |
| **Backup Enabled** | [ ] Yes [ ] No |
| **Backup Type** | [ ] Full [ ] Incremental [ ] Differential [ ] Continuous [ ] Snapshot |
| **Backup Frequency** | [ ] Real Time [ ] Hourly [ ] Daily [ ] Weekly [ ] Monthly |
| **Backup Immutable** | [ ] Yes [ ] No |
| **Backup Encrypted** | [ ] Yes [ ] No |

### 4.3 Performance Efficiency

#### Capacity & Growth Projections

| Field | Value |
|-------|-------|
| **Current Users** | |
| **Year1 Users** | |
| **Year3 Users** | |
| **Year5 Users** | |
| **Current Data Volume** | |
| **Year1 Data Volume** | |
| **Year3 Data Volume** | |
| **Year5 Data Volume** | |
| **Design Scales To Projected Growth** | [ ] Yes [ ] No |
| **Seasonal Demand Patterns** | [ ] Yes [ ] No |
| **Seasonal Details** | |

### 4.4 Cost Optimisation

| Field | Value |
|-------|-------|
| **Cost Analysis Performed** | [ ] Yes [ ] No |
| **Design Constrained By Cost** | [ ] Yes [ ] No |
| **Reserved Capacity** | [ ] Yes [ ] No |
| **Cost Monitoring Enabled** | [ ] Yes [ ] No |
| **Tagging Strategy** | [ ] Yes [ ] No |

### 4.5 Sustainability

| Field | Value |
|-------|-------|
| **Hosting Location Optimised for Carbon** | [ ] Yes [ ] No |
| **Non-Production Auto-Shutdown** | [ ] Yes [ ] No |
| **Resources Right-Sized** | [ ] Yes [ ] No |
| **Workload Pattern** | [ ] Constant [ ] Variable Predictable [ ] Variable Unpredictable |
| **Continuous Availability Required** | [ ] Yes [ ] No |

### Quality Attribute Trade-offs

| Attributes Involved | Description | Chosen Priority | Rationale |
|------|------|------|------|
|  |  | [ ] Operational Excellence [ ] Reliability [ ] Performance [ ] Cost Optimisation [ ] Sustainability |  |

---

## 5. Lifecycle Management

### Migration

| Field | Value |
|-------|-------|
| **Classification** | [ ] Retain [ ] Retire [ ] Rehost [ ] Replatform [ ] Refactor [ ] Replace [ ] Not Applicable |
| **Deployment Strategy** | [ ] Big Bang [ ] Blue Green [ ] Canary [ ] Rolling [ ] Strangler Fig [ ] Parallel Run [ ] Phased |
| **Data Migration Mode** | [ ] One Off [ ] Phased [ ] Continuous Sync [ ] Not Applicable |
| **Data Migration Method** | |
| **Data Volume** | |
| **End User Cutover** | [ ] One Off [ ] Phased [ ] Not Applicable |
| **External System Cutover** | [ ] One Off [ ] Phased [ ] Not Applicable |
| **Max Acceptable Downtime** | [ ] Zero [ ] Seconds [ ] Minutes [ ] Hours [ ] Days |
| **Rollback Plan** | |
| **Transient Infrastructure Needed** | [ ] Yes [ ] No |

### Resourcing & Skills

| Field | Value |
|-------|-------|
| **Cloud Platform** | [ ] High [ ] Medium [ ] Low [ ] Not Applicable |
| **Infrastructure As Code** | [ ] High [ ] Medium [ ] Low [ ] Not Applicable |
| **CI/CD Management** | [ ] High [ ] Medium [ ] Low [ ] Not Applicable |
| **Application Stack** | [ ] High [ ] Medium [ ] Low [ ] Not Applicable |
| **Database Administration** | [ ] High [ ] Medium [ ] Low [ ] Not Applicable |
| **Security Compliance** | [ ] High [ ] Medium [ ] Low [ ] Not Applicable |
| **Operational Readiness** | [ ] A Fully Capable [ ] B Partially Capable [ ] C Learning [ ] D Not Capable |

---

## 6. Decision Making & Governance

### 6.1 Constraints

| Id | Constraint | Category | Impact On Design | Last Assessed |
|------|------|------|------|------|
|  |  | [ ] Regulatory [ ] Technical [ ] Commercial [ ] Organisational [ ] Time |  |  |

### 6.2 Assumptions

*Repeat the table below for each assumption.*

| Field | Value |
|-------|-------|
| **Id** | |
| **Assumption** | |
| **Impact If False** | |
| **Certainty** | [ ] High [ ] Medium [ ] Low |
| **Status** | [ ] Open [ ] Closed |
| **Owner** | |
| **Evidence** | |

### 6.3 Risks

*Repeat the table below for each risk.*

| Field | Value |
|-------|-------|
| **Id** | |
| **Risk Event** | |
| **Risk Category** | [ ] Technical [ ] Security [ ] Operational [ ] Delivery [ ] Commercial [ ] Compliance [ ] Other |
| **Severity** | [ ] Critical [ ] High [ ] Medium [ ] Low [ ] Negligible |
| **Likelihood** | [ ] Critical [ ] High [ ] Medium [ ] Low [ ] Negligible |
| **Mitigation Strategy** | [ ] Accept [ ] Mitigate [ ] Transfer [ ] Avoid |
| **Mitigation Plan** | |
| **Residual Risk** | [ ] Critical [ ] High [ ] Medium [ ] Low [ ] Negligible |
| **Owner** | |
| **Last Assessed** | |

### 6.4 Dependencies

*Repeat the table below for each dependency.*

| Field | Value |
|-------|-------|
| **Id** | |
| **Dependency** | |
| **Direction** | [ ] Inbound [ ] Outbound |
| **Status** | [ ] Committed [ ] Not Committed [ ] Resolved |
| **Owner** | |
| **Evidence** | |
| **Last Assessed** | |

### 6.5 Issues

*Repeat the table below for each issue.*

| Field | Value |
|-------|-------|
| **Id** | |
| **Issue** | |
| **Category** | [ ] Technical [ ] Security [ ] Operational [ ] Delivery [ ] Commercial |
| **Impact** | [ ] Critical [ ] High [ ] Medium [ ] Low [ ] Negligible |
| **Owner** | |
| **Resolution Plan** | |
| **Status** | [ ] Open [ ] In Progress [ ] Resolved |
| **Last Assessed** | |

### 6.8 Compliance Traceability

| Standard | Requirement | How Satisfied | Evidence Section | Compliance Status |
|------|------|------|------|------|
|  |  |  |  | [ ] Compliant [ ] Partially Compliant [ ] Non Compliant [ ] Not Applicable |

---

## 7. Appendices

### Glossary

| Term | Definition |
|------|------|
|  |  |

### References

| Title | Version | URL | Description |
|------|------|------|------|
|  |  |  |  |

### Approvals

| Role | Name | Date | Decision |
|------|------|------|------|
|  |  |  | [ ] Approved [ ] Approved With Conditions [ ] Rejected [ ] Deferred |

---

## 7.3 Compliance Scoring

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

---

## 7.4 Approval Sign-Off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Solution Architect | | | [ ] Approved [ ] Approved with Conditions [ ] Rejected [ ] Deferred |
| Security Architect | | | [ ] Approved [ ] Approved with Conditions [ ] Rejected [ ] Deferred |
| ARB / Design Authority | | | [ ] Approved [ ] Approved with Conditions [ ] Rejected [ ] Deferred |
