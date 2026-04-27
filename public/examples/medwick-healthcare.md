# Solution Architecture Document — Medwick Healthcare Trust -- MyMedwick Patient Portal

> **Standard:** ADS v1.3.1 (Architecture Description Standard)
> **Organisation:** Medwick Healthcare Trust
> **Depth:** Comprehensive

---
<div class="guidance-box">
<h4>About This Example</h4>

This is a **fictional but realistic** Solution Architecture Document for Medwick Healthcare Trust's MyMedwick Patient Portal. It demonstrates the Architecture Description Standard at **Comprehensive** depth for a Tier 1 Critical clinical system governed by MediCore clinical safety standards and UK data protection law. Every section is completed with realistic content showing what a mature, well-documented SAD looks like for a Trust-class solution where patient harm is a credible risk.

**Fictional organisation:** Medwick Healthcare Trust -- a mid-sized national-health-service-style hospital trust, approximately 12,000 staff, serving 800,000 patients across three acute sites and a network of community clinics.
**Fictional solution:** MyMedwick Patient Portal -- a web and mobile application providing outpatient appointment management, test results, letters, and prescription management to patients, integrated with the Trust's Electronic Patient Record (EPR), the MediCore Spine, and MediCore e-Referral Service.

---

## 0. Document Control

### 0.1 Document Metadata

| Field | Value |
|-------|-------|
| **Document Title** | Solution Architecture Document -- MyMedwick Patient Portal |
| **Application / Solution Name** | MyMedwick Patient Portal |
| **Application ID** | MHT-APP-0208 |
| **Author(s)** | Dr Raj Doe (Solution Architect, Digital Clinical Systems) |
| **Owner** | Dr Raj Doe |
| **Version** | 2.0 |
| **Status** | Approved |
| **Created Date** | 2025-02-10 |
| **Last Updated** | 2026-03-28 |
| **Classification** | Confidential -- Healthcare |

### 0.2 Change History

| Version | Date | Author / Editor | Description of Change |
|---------|------|-----------------|----------------------|
| 0.1 | 2025-02-10 | Dr Raj Doe | Initial draft with executive summary, scope, and logical view |
| 0.2 | 2025-03-04 | Dr Raj Doe | Added physical view, data view, integration with EPR and Spine |
| 0.3 | 2025-03-25 | Jane Bloggs | Information security review feedback incorporated |
| 0.4 | 2025-04-08 | Dr Amir Doe | Clinical safety review; Hazard Log reference added (CS-129/0160) |
| 0.5 | 2025-04-22 | Sally Bloggs | Information Governance review; DPIA and CS-160 status incorporated |
| 1.0 | 2025-05-14 | Dr Raj Doe | First approved version following Design Authority and CSG sign-off |
| 1.1 | 2025-09-02 | Dr Raj Doe | Added GP Connect integration (Phase 2 -- appointment availability) |
| 1.2 | 2025-11-19 | Dr Raj Doe | Updated following annual DSPT submission and MediCore Digital assurance review |
| 2.0 | 2026-03-28 | Dr Raj Doe | Major revision: Azure AD B2C for patient auth (ADR-003 superseded), SMS fallback redesign, updated clinical safety case v3 |

### 0.3 Contributors & Approvals

| Name | Role | Contribution Type |
|------|------|------------------|
| Dr Raj Doe | Solution Architect (clinical background -- former ICU consultant) | Author |
| Dr Amir Doe | Clinical Safety Officer (CSO) -- consultant haematologist | Author / Approver |
| Sally Bloggs | Information Governance (IG) Lead & Data Protection Officer | Author / Approver |
| Jane Bloggs | Chief Information Security Officer (CISO) | Reviewer / Approver |
| Mark Doe | Principal Infrastructure Engineer (Azure Landing Zones) | Reviewer |
| Priya Bloggs | Data Architect (MediCore healthcare data standards, FHIR R4) | Reviewer |
| Tom Doe | Head of Service Management (ITIL) | Reviewer |
| Helen Bloggs | Caldicott Guardian (Medical Director) | Approver |
| Dr Fiona Doe | Chief Clinical Information Officer (CCIO) | Approver |
| Robert Bloggs | Chief Digital Information Officer (CDIO) | Approver |
| Nisha Doe | Director of Patient Experience | Reviewer |
| Paul Bloggs | Senior Responsible Officer (SRO) / Deputy CEO | Approver |
| Design Authority (Medwick) | Architecture Review Board (chaired by Robert Bloggs) | Approver |

### 0.4 Document Purpose & Scope

This SAD describes the architecture of MyMedwick, Medwick Healthcare Trust's patient-facing digital service. The portal gives patients secure, self-service access to their outpatient appointments, clinic letters, test results, and repeat prescription requests. It reduces clinic DNA (Did Not Attend) rates, eases the administrative burden on outpatient booking teams, and supports the Trust's commitment to the MediCore National Digital Health Plan objective of digital-first patient access.

**In scope:**
- MyMedwick web application (React) and mobile applications (iOS, Android)
- Azure landing zone resources in UK South (primary) and UK West (DR)
- Integration with Trust EPR (Cerner Millennium), Pharmacy (JAC), Pathology (Clinisys WinPath), PACS (GE Centricity)
- Integration with MediCore Spine (PDS, SCR), MediCore e-Referral Service, GP Connect (appointment availability only)
- Patient identity (Azure AD B2C) and clinician identity (MediCore CIS)
- Azure Communication Services SMS and email (appointment reminders, OTP, notifications)
- Clinical safety case (CS-129) and deployment safety case (CS-160)
- Operational tooling: Microsoft Sentinel, Azure Monitor, App Insights

**Out of scope:**
- Trust EPR (Cerner Millennium) internals -- documented in SAD MHT-APP-0010
- Clinician-facing EPR workflows -- out of scope for patient portal
- Medicines prescribing decisions (handled by EPR and JAC; MyMedwick only surfaces prescriptions issued by clinicians)
- Video consultation platform (SAD MHT-APP-0157, Attend Anywhere)
- Staff SharePoint intranet and non-clinical systems

**Related documents:**
- Trust Digital & Data Strategy 2024-2029 (STRAT-DDS-2024)
- Medwick Information Security Policy (MHT-SEC-POL-001)
- Medwick Clinical Risk Management Policy (MHT-CRM-POL-003)
- CS-129 Hazard Log -- MyMedwick (MHT-HAZ-LOG-0208)
- CS-160 Deployment Safety Case -- MyMedwick (MHT-DSC-0208)
- MediCore Data Security & Protection Toolkit Submission 2025/26 (Organisation Code: RX9)

---

## 1. Executive Summary

### 1.1 Solution Overview

MyMedwick is a web and mobile patient portal that gives patients of Medwick Healthcare Trust secure, real-time access to their outpatient care. Patients can view and reschedule appointments, read clinic letters, see pathology and radiology results released by their clinical team, request repeat prescriptions, update contact preferences, and opt in or out of SMS reminders.

The solution is built on Microsoft Azure (UK South primary, UK West DR) using a layered architecture: React single-page application for the web front end; Ionic/Capacitor hybrid mobile apps; .NET 8 microservices behind Azure API Management; Azure SQL for portal-owned data; and an integration layer that exposes and consumes FHIR R4 APIs against the Trust EPR, the MediCore Spine, and the MediCore e-Referral Service. Patient identity is provided by Azure AD B2C with MediCore-compatible identity proofing; clinician identity (for staff administration functions) is provided by MediCore CIS.

Clinical safety has been assessed under CS-129 (manufacturer) and CS-160 (deployment). A Clinical Safety Officer (Dr Amir Doe) has signed off the clinical safety case; the Hazard Log is actively maintained. The service is included in Medwick's annual Data Security and Protection Toolkit (DSPT) submission.

### 1.2 Business Context & Drivers

| Driver | Description | Priority |
|--------|------------|----------|
| MediCore National Digital Health Plan -- digital-first patient access | National commitment for every patient to have digital access to their outpatient records, appointments and prescriptions | Critical |
| Reduce outpatient DNA rate | Trust DNA rate for outpatient appointments is 9.4% (national benchmark 6.7%); target reduction of 2 percentage points through self-service rescheduling and SMS reminders | High |
| Reduce call centre burden | Outpatient booking team handles approximately 3,200 calls/day, of which 62% are appointment enquiries resolvable via self-service | High |
| Improve patient experience and CQC Well-Led evidence | Patient survey satisfaction with appointment communications at 58%; target improvement to greater than 75% | High |
| Replace ageing patient portal (Patient Knows Best pilot) | Existing PKB pilot covers only 40,000 patients, lacks mobile app, and contract expires 2026-Q3 | High |
| Support ICS-wide digital front door objective | Align with Medwick Integrated Care System (MICS) digital strategy for a unified patient-facing channel | Medium |

### 1.3 Strategic Alignment

#### Organisational Strategy Alignment

| Question | Response |
|----------|----------|
| Which organisational strategy or initiative does this solution support? | Trust Digital & Data Strategy 2024-2029, Priority 2: Empowering Patients; Priority 4: Reducing Unwarranted Variation |
| Has this solution been reviewed against the organisation's capability model? | Yes -- mapped to Patient Digital Engagement, Identity & Access (Patient), Clinical Messaging, and Records Access capabilities |
| Does this solution duplicate any existing capability? | Partially -- supersedes the Patient Knows Best pilot (being decommissioned); complements (does not replace) Attend Anywhere video consultation platform |

#### Reuse of Shared Services & Platforms

| Capability | Shared Service / Platform | Reused? | Justification (if not reused) |
|-----------|--------------------------|---------|------------------------------|
| Patient Identity | MediCore login (national service) | No | Evaluated in ADR-003; rejected in favour of Azure AD B2C due to Trust control over identity proofing journey, faster enrolment, and ability to federate MediCore login as an external IdP later if required |
| Clinician Identity | MediCore CIS (Clinician Identity Service) | Yes | Mandatory for MediCore staff accessing patient-identifiable data; used for admin / service desk functions |
| Spine Integration | MediCore Spine (PDS, SCR) via TLS-MA | Yes | National service, mandatory for Patient Demographic Service lookups |
| e-Referral | MediCore e-Referral Service (e-RS) | Yes | National service, mandatory for outpatient referral lifecycle |
| SMS / Email | Azure Communication Services (ACS) | Yes | Trust has enterprise Azure agreement; ACS supports UK data residency |
| Secure Email | MediCoreMail | Yes | Used for clinical correspondence notifications where appropriate |
| SIEM | Microsoft Sentinel (Trust tenant) | Yes | Corporate SIEM |
| CI/CD | Azure DevOps | Yes | Trust standard |
| Secrets | Azure Key Vault | Yes | Trust standard |
| EPR | Cerner Millennium (Oracle Health) | Yes | Authoritative record of clinical care |

### 1.4 Scope

#### In Scope

- MyMedwick React web application (responsive) hosted on Azure App Service
- iOS and Android mobile applications (Ionic + Capacitor) published via Apple App Store and Google Play
- Backend-for-Frontend (BFF) and domain microservices on Azure App Service (Linux, .NET 8)
- Azure API Management (external and internal products) with WAF (Azure Front Door Premium)
- Azure SQL Database for portal-owned state (preferences, consent, sessions)
- Azure Service Bus for asynchronous notification and integration events
- FHIR R4 facade microservice integrating EPR (Cerner Millennium HL7v2 + FHIR), PACS, Pathology, and Pharmacy
- Integration with MediCore Spine via national healthcare secure network/Message Exchange for Social Care and Health (MESH) and TLS-MA
- Azure AD B2C for patient identity (custom policies, MFA, step-up for sensitive actions)
- MediCore CIS for clinician identity (service desk admin)
- Azure Communication Services for SMS and email (appointment reminders, OTP, notifications)
- Microsoft Sentinel SIEM integration and Azure Monitor/App Insights observability
- Clinical safety (CS-129/CS-160) artefacts and Hazard Log
- Annual DSPT submission content relating to this service

#### Out of Scope

- Trust EPR (Cerner Millennium) clinical workflows and configuration (SAD MHT-APP-0010)
- Prescribing decision logic (handled by JAC / EPR)
- Attend Anywhere video consultation platform (SAD MHT-APP-0157)
- Non-patient-facing data warehouse and BI reporting (SAD MHT-APP-0055)
- Direct GP system integration beyond GP Connect appointment availability (Phase 2 descope; Phase 3 candidate)

#### Related External Dependencies

- MediCore Spine PDS / SCR availability and interface versions
- MediCore CIS availability for clinician authentication
- MediCore e-Referral Service API availability and version
- Cerner Millennium HL7v2 and FHIR interface availability
- Azure UK South and UK West regional availability

### 1.5 Current State / As-Is Architecture

The Trust currently offers limited digital patient access:

- A **Patient Knows Best (PKB) pilot** covering ~40,000 patients across renal and diabetes services, providing records access only (no appointment management, no prescriptions). PKB is contracted until 2026-Q3.
- A **text reminder service** (commercial SMS gateway, Firetext) sending appointment reminders two days before appointment. This has no patient interaction -- patients cannot confirm, cancel, or reschedule from the SMS.
- An **online appointment cancellation form** (SharePoint-based) which posts to a shared mailbox and is manually processed by the booking office during working hours.

**Key limitations of the as-is:**
- No unified patient-facing portal; patients must telephone the booking office for all changes
- No mobile app; PKB web app is not usable on mobile
- DNA rate 9.4% (above national benchmark of 6.7%)
- Approximately 62% of booking office calls are resolvable by self-service
- No surfacing of test results to patients; results are conveyed by letter (typically 2-3 week delay) or phone call
- Patient Knows Best contract ends 2026-Q3 -- mandatory replacement

**What is being retained:** Cerner Millennium EPR (authoritative clinical record); MediCore Spine and e-RS integrations (reused via new FHIR facade); MediCoreMail; MediCore CIS.
**What is being replaced:** Patient Knows Best pilot (decommissioned 2026-Q3); Firetext SMS (replaced by Azure Communication Services); SharePoint cancellation form.
**What is being decommissioned:** PKB integration, Firetext contract, SharePoint appointment cancellation form -- all after 3-month parallel run.

### 1.6 Key Decisions & Constraints

| Decision / Constraint | Rationale | Impact |
|----------------------|-----------|--------|
| Microsoft Azure as hosting platform | Trust enterprise Azure agreement; Azure UK South/West provide sovereign UK data residency; ISO/IEC 27018 assurance for cloud PII; NCSC/MediCore Authority pattern alignment | All infrastructure on Azure; no AWS or GCP |
| All data (including PII and clinical data) in UK regions | UK GDPR, MediCore Data Security & Protection Toolkit, and Caldicott Principle 7 (data sharing) | UK South primary, UK West DR; no data replication outside UK |
| FHIR R4 as the canonical clinical data contract | MediCore Authority interoperability standards and forward compatibility with ICS-wide data sharing | FHIR facade microservice required; HL7v2 from EPR translated to FHIR |
| Azure AD B2C for patient identity (not MediCore login) | Trust control over identity proofing, enrolment UX, and MFA policy; MediCore login can be added as federated IdP in a later phase | Custom B2C policies to be maintained; explicit ADR (ADR-003) |
| CS-129 and CS-160 clinical safety compliance mandatory | MediCore Digital's mandatory clinical safety standards for any health IT system with clinical impact | Clinical Safety Officer required; Hazard Log maintained; deployment safety case signed before go-live |
| Two-factor authentication required for all patients | UK GDPR Article 32 and MediCore CIS assurance equivalence | SMS OTP (default), TOTP authenticator (advanced); step-up MFA for prescription requests |

### 1.7 Project Details

| Field | Value |
|-------|-------|
| **Project Name** | MyMedwick Patient Portal |
| **Project Code / ID** | PROJ-0208 |
| **Project Manager** | Claire Bloggs |
| **Senior Responsible Officer (SRO)** | Paul Bloggs (Deputy CEO) |
| **Estimated Solution Cost (Capex)** | GBP 1,450,000 over 2 years (discovery, alpha, beta, live) |
| **Estimated Solution Cost (Opex)** | GBP 420,000 per annum (hosting, licences, support, clinical safety maintenance) |
| **Target Go-Live Date** | Public beta: 2025-05-14 (achieved); general availability: 2025-11-04 (achieved); Phase 2 (GP Connect): 2025-09-02 (achieved); Phase 3 (results summary dashboards): 2026-Q3 |

### 1.8 Business Criticality

Selected criticality: **Tier 1: Critical**

Justification: MyMedwick is a Tier 1 Critical clinical system because failure modes include potential patient harm:

- **Clinical safety:** Incorrect results display, mis-identification of a patient's record, or silent failure of appointment reminders could contribute to patient harm (missed appointment for time-sensitive oncology follow-up; acting on wrong results). Clinical risk assessed and documented in the Hazard Log (MHT-HAZ-LOG-0208).
- **Service continuity:** At steady state, MyMedwick is the primary digital channel for ~280,000 enrolled patients. Extended outage would substantially increase call centre load (projected x3.5 call volume within 24 hours of outage).
- **Regulatory exposure:** A confidentiality breach of patient data would require ICO notification within 72 hours (UK GDPR Art 33) and trigger mandatory reporting under the MediCore DSPT.
- **Reputational:** Patient trust and Trust Board reputation sensitivity is high; CQC Well-Led and Responsive domains reference digital access.
- **Financial impact:** Not the primary driver, but DNA reduction target (2 pp) represents ~GBP 1.8m/year of recovered clinic capacity.

---

## 2. Stakeholders & Concerns

### 2.1 Stakeholder Register

| Stakeholder | Role / Group | Key Concerns | Relevant Views |
|-------------|-------------|--------------|----------------|
| Paul Bloggs | SRO / Deputy CEO | Strategic alignment, benefit realisation, political and regulatory risk | Executive Summary, Governance |
| Robert Bloggs | CDIO | Architecture alignment, Azure strategy, cost, assurance | All views |
| Dr Fiona Doe | CCIO | Clinical workflow alignment, clinical risk, clinician adoption (admin users) | Logical, Data, Security, Scenarios |
| Dr Amir Doe | Clinical Safety Officer | Clinical safety (CS-129/0160), Hazard Log, clinical risk controls | Security, Data, Scenarios, Lifecycle |
| Helen Bloggs | Caldicott Guardian | Information governance, Caldicott Principles, patient confidentiality | Security, Data, Governance |
| Sally Bloggs | IG Lead / DPO | UK GDPR, DPIA, DSPT, ROPA, consent, subject access | Data, Security, Governance |
| Jane Bloggs | CISO | Threat model, UK GDPR Art 32 controls, DSPT, Cyber Essentials Plus | Security, Physical |
| Dr Raj Doe | Solution Architect | Design integrity, clinical usability, standards compliance, interoperability | All views |
| Mark Doe | Principal Infrastructure Engineer | Azure landing zone, network, resilience, DR | Physical, Reliability |
| Priya Bloggs | Data Architect | FHIR conformance, data classification, sovereignty, retention | Data, Integration |
| Tom Doe | Head of Service Management | Operability, incident response, ITIL processes | Operational Excellence, Lifecycle |
| Nisha Doe | Director of Patient Experience | Accessibility (WCAG 2.2 AA), digital inclusion, patient usability | Scenarios, Quality Attributes |
| Clinical safety panel (CSG) | Multi-disciplinary panel chaired by Dr Fiona Doe | Clinical risk review, Hazard Log, deployment approvals | Security, Scenarios, Governance |
| Patient Participation Group (PPG) | Patient representatives | Usability, trust, transparency, accessibility | Scenarios |
| Booking office team (operational) | Outpatient booking team leader | Call volume reduction, admin exception handling | Scenarios, Operational Excellence |
| ICO (external) | Information Commissioner's Office | UK GDPR, ICO registration ZA123456 | Data, Security, Governance |
| MediCore Authority (external) | Digital policy and assurance | Interoperability, DSPT, CS-129/0160 conformance, DSCRO | Data, Security, Governance |
| MHRA (external, watching brief) | Medicines and Healthcare products Regulatory Agency | Whether the portal meets criteria for a medical device (assessed -- no, not a clinical decision-support tool) | Security, Governance |
| Patients (end users) | Registered enrolled patients | Usability, trust, accuracy, accessibility, privacy | Scenarios, Integration, Security |
| Clinical teams | Outpatient clinicians (secondary users via EPR) | Data accuracy, results release workflow, not introducing additional admin | Integration, Data, Scenarios |

### 2.2 Concerns Matrix

| Concern | Stakeholder(s) | Addressed In |
|---------|---------------|-------------|
| Clinical safety -- risk of patient harm from system failure or misuse | Dr Amir Doe, Dr Fiona Doe, Helen Bloggs, CSG | 1.8, 3.5, 3.6, 4.2, 5.1, 5.2, 6.3, 6.8 |
| Patient confidentiality and UK GDPR compliance | Sally Bloggs, Helen Bloggs, Jane Bloggs, ICO | 3.4, 3.5, 6.8 |
| MediCore Data Security & Protection Toolkit (DSPT) conformance | Sally Bloggs, Jane Bloggs, MediCore Authority | 3.5, 6.8 |
| Clinical data accuracy and interoperability (FHIR R4, HL7v2) | Priya Bloggs, Dr Fiona Doe, Dr Amir Doe | 3.2, 3.4, 3.6 |
| Patient identity assurance (preventing misidentification) | Sally Bloggs, Helen Bloggs, Dr Amir Doe | 3.5, 3.6 (UC-04) |
| Availability and DR (clinical continuity) | Tom Doe, Mark Doe, Dr Fiona Doe | 4.2 |
| SMS delivery failure for appointment reminders | Dr Amir Doe, Tom Doe | 3.2, 4.2, 6.3 |
| GP system integration failure (GP Connect) | Priya Bloggs, Tom Doe | 3.2, 4.2, 6.3 |
| Accessibility (WCAG 2.2 AA, digital inclusion) | Nisha Doe, PPG | 3.6, 4.3 |
| Cost and benefit realisation | Paul Bloggs, Robert Bloggs, Finance | 4.4 |
| Cyber security (ransomware, credential stuffing, denial of service) | Jane Bloggs | 3.5, 6.3 |
| Operational support model and ITIL alignment | Tom Doe | 5.5 |

### 2.3 Compliance & Regulatory Context

#### Regulatory Requirements

| Regulation / Standard | Applicability | Impact on Design |
|----------------------|--------------|-----------------|
| UK GDPR & Data Protection Act 2018 | Mandatory -- processes special category personal data (health) | Lawful basis (Art 6(1)(e), Art 9(2)(h)); DPIA completed; data minimisation; right of access/erasure/rectification; data residency UK |
| MediCore Data Security & Protection Toolkit (DSPT) 2025/26 | Mandatory -- annual submission; status Standards Met | 10 DSPT assertions applicable; evidence mapped; submitted 2025-06-30 |
| CS-129 -- Clinical Risk Management: Manufacturer | Mandatory for health IT systems with clinical impact | Clinical Safety Officer (Dr Amir Doe) appointed; Clinical Safety Case v3 approved; Hazard Log maintained |
| CS-160 -- Clinical Risk Management: Deployment | Mandatory for deploying health IT in health / social care settings | Deployment Safety Case signed off by Trust CSO before each major release |
| Common Law Duty of Confidentiality | Mandatory -- Caldicott Principles | Caldicott Guardian (Helen Bloggs) approval required for data uses; explicit patient consent for SMS |
| Human Medicines Regulations 2012 | Applicable -- prescription request surfacing | Portal does not prescribe; only surfaces prescriptions issued in EPR/JAC. No clinical decision support. |
| MHRA -- Medical Device assessment | Assessed -- not a medical device (no diagnosis/treatment/prevention function) | Assessment documented; reviewed annually |
| Accessibility Regulations 2018 (public sector body) | Mandatory | WCAG 2.2 Level AA conformance; annual accessibility statement published |
| MediCore Authority Interoperability Standards | Mandatory for new health IT | FHIR R4 for external clinical APIs; National Patient ID as primary identifier |
| ICO registration | Mandatory | Registered (ZA123456); Data Protection Officer: Sally Bloggs |
| Cyber Essentials Plus | Trust certified annually | Inherits Trust certification; additional controls evidenced |
| ISO/IEC 27001 | Trust-wide ISMS | Solution included in statement of applicability |

#### Regulated Activities

- Yes -- processes special category personal data (health) under UK GDPR Article 9. Not a regulated medical device (formally assessed). Subject to MediCore-specific clinical safety standards (CS-129 manufacturer, CS-160 deployment).

#### Compliance Standards

| Standard | Version | Applicability |
|----------|---------|--------------|
| MediCore Data Security & Protection Toolkit | 2025/26 | All sections -- security, IG, training, incident reporting |
| CS-129 Clinical Risk Management (Manufacturer) | 2018 | Security, Scenarios, Lifecycle -- Hazard Log, clinical safety case |
| CS-160 Clinical Risk Management (Deployment) | 2018 | Lifecycle, Governance -- deployment safety case |
| MediCore Authority Interoperability Standards | 2025 | Integration -- FHIR R4, HL7v2 transition path |
| WCAG 2.2 | Level AA | Scenarios, Performance -- accessibility |
| NCSC Cloud Security Principles | 14 principles | Physical, Security |
| MediCore Authority Data Protection Impact Assessment Framework | 2024 | Data, Security |
| ISO/IEC 27018 | 2019 | Data, Security -- Azure's assurance for cloud PII |

---

## 3. Architecture Views

### 3.1 Logical View

#### 3.1.1 Application Architecture Diagram

<Mermaid chart={`graph TD
    Patient[Patient - Web / iOS / Android] --> FD[Azure Front Door + WAF]
    Clinician[Service Desk Admin - MediCore CIS] --> FD
    FD --> APIM[Azure API Management]
    APIM --> BFF[Patient BFF]
    APIM --> AdminAPI[Admin API]
    BFF --> Apt[Appointments Service]
    BFF --> Results[Results Service]
    BFF --> Rx[Prescriptions Service]
    BFF --> Pref[Preferences Service]
    Apt --> SQL[Azure SQL - Portal DB]
    Results --> SQL
    Rx --> SQL
    Pref --> SQL
    Apt --> SB[Azure Service Bus]
    Results --> SB
    Rx --> SB
    SB --> Notif[Notification Service]
    Notif --> ACS[Azure Communication Services - SMS / Email]
    SB --> Audit[Audit Sink - ADLS Gen2]
    Apt --> FHIR[FHIR Facade]
    Results --> FHIR
    Rx --> FHIR
    FHIR --> EPR[Cerner EPR - HL7v2 / FHIR]
    FHIR --> Spine[MediCore Spine PDS / SCR]
    FHIR --> eRS[MediCore e-Referral]
    FHIR --> GPC[GP Connect - Appointments]
    FHIR --> Path[Pathology - WinPath]
    FHIR --> PACS[PACS - GE Centricity]
    BFF --> B2C[Azure AD B2C]
    AdminAPI --> CIS2[MediCore CIS]`} />

#### 3.1.2 Component Decomposition

| Component | Type | Description | Technology | Owner |
|-----------|------|-------------|------------|-------|
| Web App | Web Application | Responsive patient web front end | React 18 + TypeScript on Azure App Service (Linux) behind Front Door | Digital Product Team |
| iOS App | Mobile Application | Native-feel hybrid iOS app | Ionic 8 + Capacitor 6 (Swift plugins for biometric unlock) | Digital Product Team |
| Android App | Mobile Application | Native-feel hybrid Android app | Ionic 8 + Capacitor 6 (Kotlin plugins for biometric unlock) | Digital Product Team |
| Patient BFF | API Service | Backend-for-Frontend -- aggregates downstream services for each patient session | .NET 8 on Azure App Service (Linux, Premium v3) | Digital Product Team |
| Admin API | API Service | Service desk administrative endpoints (read-only patient enrolment lookups, suspend account) | .NET 8 on Azure App Service | Digital Product Team |
| Appointments Service | API Service | Reads appointment lists, enables reschedule/cancel; integrates with EPR and e-RS | .NET 8 on Azure App Service | Digital Product Team |
| Results Service | API Service | Reads pathology, radiology results released by clinical team; enforces results release rules | .NET 8 on Azure App Service | Digital Product Team |
| Prescriptions Service | API Service | Displays active prescriptions and repeat request workflow | .NET 8 on Azure App Service | Digital Product Team |
| Preferences Service | API Service | Patient contact preferences, consent, SMS opt-in, notification settings | .NET 8 on Azure App Service | Digital Product Team |
| FHIR Facade | Backend Service | Canonical FHIR R4 adapter in front of EPR (HL7v2), Pathology, PACS, Spine, e-RS, GP Connect | .NET 8 with Firely .NET SDK; HL7v2-to-FHIR mapping | Integration Team |
| Notification Service | Backend Service | Consumes Service Bus events; drives SMS/email via ACS with retry and delivery receipt tracking | .NET 8 Azure Functions (Premium plan) | Integration Team |
| Audit Sink | Batch Job | Persists structured audit events to immutable ADLS Gen2 (7-year retention) and forwards to Sentinel | Azure Functions + Azure Data Lake Storage Gen2 | Platform Team |
| Portal DB | Database | Patient preferences, consent, SMS opt-in, session and step-up MFA state, enrolment records | Azure SQL Database (Business Critical, Zone Redundant) | Platform Team |
| Azure Service Bus | Message Broker | Async events: appointment changes, new results available, prescription status, audit | Azure Service Bus Premium (Zone Redundant) | Platform Team |
| Azure API Management | Gateway | External API product (Front Door origin) and internal product for partner integration | APIM Premium (UK South + UK West regions) | Platform Team |
| Azure Front Door + WAF | Gateway / Load Balancer | Global edge entry, TLS 1.3 termination, WAF (OWASP Core Rule Set 3.2), DDoS Standard | Azure Front Door Premium | Platform Team |
| Patient IdP | Gateway (identity) | Azure AD B2C with custom policies; MFA (SMS OTP default, TOTP optional); step-up MFA | Azure AD B2C (UK tenant) | Security Team |
| Clinician IdP | Gateway (identity) | MediCore CIS OIDC for staff service desk admin functions | MediCore CIS (external national service) | Security Team |

#### 3.1.3 Service & Capability Mapping

| Service ID | Service Name | Capability ID | Capability Name |
|-----------|-------------|--------------|----------------|
| SVC-01 | Appointments Service | CAP-APPT | Patient Appointment Self-Service |
| SVC-02 | Results Service | CAP-RSLT | Patient Results Access |
| SVC-03 | Prescriptions Service | CAP-PRX | Repeat Prescription Request |
| SVC-04 | Preferences Service | CAP-PREF | Patient Contact Preferences |
| SVC-05 | FHIR Facade | CAP-INT | Clinical System Interoperability |
| SVC-06 | Notification Service | CAP-NTF | Patient Digital Notifications |

#### 3.1.4 Application Impact

| Application Name | Application ID | Impact Type | Change Details | Comments |
|-----------------|---------------|-------------|----------------|----------|
| Cerner Millennium EPR | MHT-APP-0010 | Use | Consume HL7v2 ADT/ORM/ORU feeds; consume Cerner FHIR R4 for patient and appointment read; no changes to EPR configuration | Read-only from portal perspective |
| JAC Pharmacy | MHT-APP-0012 | Use | Consume repeat prescription status; post request to JAC queue | Existing HL7v2 interface extended |
| Clinisys WinPath (Pathology) | MHT-APP-0045 | Use | Consume ORU results messages via FHIR facade | Existing feed |
| GE Centricity (PACS) | MHT-APP-0067 | Use | Consume imaging availability metadata (report text; images not shown to patients in this phase) | Phase 3 candidate for image thumbnails |
| Patient Knows Best (PKB) | MHT-APP-0180 | Decommission | Retire after 3-month parallel run; contract ends 2026-Q3 | Migration of 40,000 PKB enrolled patients |
| Firetext SMS | MHT-APP-0142 | Decommission | Replaced by Azure Communication Services | |
| MediCore Spine | External | Use | PDS for patient demographic verification; SCR not directly consumed | Via national healthcare secure network |
| MediCore e-Referral Service | External | Use | Read UBRN, appointment slots, worklists | |
| GP Connect (Appointments) | External | Use | Phase 2 -- read GP appointment availability for cross-care navigation | Limited to appointment availability in this phase |
| Microsoft Sentinel | MHT-APP-0099 | Use | Receive security events | Existing SIEM |

#### 3.1.5 Key Design Patterns

| Pattern | Where Applied | Rationale |
|---------|--------------|-----------|
| Backend-for-Frontend (BFF) | Patient BFF aggregates downstream services for the web/mobile clients | Limits data exposure; reduces client chattiness over mobile networks; simplifies front-end security |
| API Gateway | Azure API Management + Front Door | Centralised TLS termination, authentication enforcement, rate limiting, JWT validation, request shaping |
| Facade | FHIR Facade in front of legacy HL7v2 / proprietary interfaces | Presents a single, standards-aligned (FHIR R4) contract to downstream services; isolates legacy change |
| Event-Driven (pub/sub) | Service Bus topics for appointments, results, prescriptions, audit | Decouples notifications and audit from the synchronous request path; absorbs downstream variability |
| Circuit Breaker | FHIR Facade integration to EPR, Spine, GP Connect | Prevents cascade failure when downstream systems degrade (Polly library) |
| Retry with Exponential Back-off | Notification Service (SMS delivery), FHIR Facade outbound calls | Tolerates transient failures, especially for critical SMS reminders |
| Outbox | Appointments/Results/Prescriptions Services writing integration events | Ensures at-least-once delivery of integration events alongside SQL transactions |
| Idempotent Consumer | Notification and audit consumers | Handles duplicate delivery from Service Bus without double-notifying patients |
| Defence in Depth | Front Door WAF, APIM policies, pod-level input validation, field-level encryption | UK GDPR Art 32 and NCSC Cloud Security Principle 4 |
| Cache-Aside | Appointments read caching (short TTL, 60s) via Azure Cache for Redis | Reduces load on EPR for heavy read scenarios |

#### 3.1.6 Technology & Vendor Lock-in Assessment

| Component / Service | Vendor / Technology | Lock-in Level | Mitigation | Portability Notes |
|---|---|---|---|---|
| Azure App Service | Microsoft Azure | Moderate | Apps are standard .NET 8 containers; deployable to Kubernetes or any container host | Container image portable (ACR to any registry) |
| Azure SQL Database | Microsoft Azure (SQL Server) | Moderate | Standard T-SQL; no Always Encrypted-specific SKUs; bacpac export | Portable to managed SQL Server elsewhere |
| Azure API Management | Microsoft Azure | Moderate | OpenAPI specs portable; policies XML-based (specific to APIM) | Policies would need re-authoring for Kong/Apigee |
| Azure Front Door + WAF | Microsoft Azure | Moderate | Managed service; DNS-based switchover possible | WAF ruleset would need re-authoring |
| Azure AD B2C | Microsoft Azure | High | Custom policies deeply integrated | Exit to Keycloak/Auth0 would be substantial (6 months) |
| Azure Service Bus | Microsoft Azure | Low | AMQP 1.0 standard; portable to RabbitMQ, ActiveMQ, ASB on-prem | Low effort |
| Azure Functions | Microsoft Azure | Moderate | Isolated worker pattern portable as containers; HTTP triggers standard | Timer triggers would need replacement |
| Azure Monitor / App Insights | Microsoft Azure | Moderate | OpenTelemetry used in services; dashboards Azure-specific | Telemetry exportable |
| Microsoft Sentinel | Microsoft Azure | High | Analytics rules Sentinel-specific | High effort; mitigated by SIEM being a Trust-wide service |
| Azure Communication Services | Microsoft Azure | Moderate | Standard SMS/email APIs; portable to GOV.UK Notify or Twilio | Provider swap evaluated and tested as a fallback pattern (see 4.2.4) |
| Azure Data Lake Storage Gen2 | Microsoft Azure | Low | Standard HDFS-compatible object storage | Portable to any S3/ADLS-compatible store |

---

### 3.2 Integration & Data Flow View

#### 3.2.1 Data Flow Diagrams

<Mermaid chart={`graph LR
    Patient[Patient Device] -- TLS 1.3 --> FD[Front Door + WAF]
    FD --> APIM[APIM]
    APIM -- OAuth2 JWT --> BFF[Patient BFF]
    BFF --> Svc[Domain Services]
    Svc --> SQL[Azure SQL]
    Svc -- async --> SB[Service Bus]
    SB --> Notif[Notification Service]
    Notif --> ACS[ACS SMS / Email]
    Svc --> FHIR[FHIR Facade]
    FHIR -- HL7v2 over VPN --> EPR[Cerner EPR]
    FHIR -- TLS-MA over national healthcare secure network --> Spine[MediCore Spine]
    FHIR -- TLS over national healthcare secure network --> eRS[e-RS]
    FHIR -- TLS + MediCore CIS --> GPC[GP Connect]
    SB -- audit --> Audit[ADLS Gen2 Audit]
    Audit --> Sentinel[Microsoft Sentinel]`} />

#### 3.2.2 Internal Component Connectivity

| Source Component | Destination Component | Protocol / Encryption | Authentication Method | Purpose |
|-----------------|----------------------|----------------------|----------------------|---------|
| Web / Mobile App | Azure Front Door | HTTPS / TLS 1.3 | None (client) | Patient entry point |
| Front Door | Azure API Management | HTTPS / TLS 1.3 (Private Link) | mTLS (Front Door-managed cert) | Origin routing |
| API Management | Patient BFF | HTTPS / TLS 1.3 (VNet integration) | Managed Identity | Route BFF traffic |
| API Management | Admin API | HTTPS / TLS 1.3 (VNet integration) | Managed Identity | Route admin traffic |
| Patient BFF | Appointments/Results/Prescriptions/Preferences Services | HTTPS / TLS 1.3 (Private Endpoint) | Managed Identity (AAD tokens) | Service composition |
| Domain Services | Azure SQL | TDS / TLS 1.3 (Private Endpoint) | Managed Identity (AAD) | Portal data read/write |
| Domain Services | Azure Service Bus | AMQP 1.0 / TLS 1.3 (Private Endpoint) | Managed Identity | Event publication |
| Notification Service | Service Bus | AMQP 1.0 / TLS 1.3 | Managed Identity | Event consumption |
| Notification Service | Azure Communication Services | HTTPS / TLS 1.3 | Managed Identity (Entra ID) | Send SMS / Email |
| Notification Service | Azure Key Vault | HTTPS / TLS 1.3 (Private Endpoint) | Managed Identity | Retrieve ACS endpoint secrets / connection strings |
| Patient BFF | Azure AD B2C | HTTPS / TLS 1.3 | OIDC authorization code + PKCE | Patient authentication / token exchange |
| Admin API | MediCore CIS | HTTPS / TLS 1.3 | OIDC authorization code | Clinician authentication |
| FHIR Facade | Azure Cache for Redis | TLS 1.3 (Private Endpoint) | Managed Identity | Short-TTL read cache |
| Domain Services | App Insights | HTTPS / TLS 1.3 | Instrumentation key (Key Vault) | Telemetry |
| Audit Sink | ADLS Gen2 | HTTPS / TLS 1.3 (Private Endpoint) | Managed Identity | Append audit blobs (immutable, WORM) |
| Audit Sink | Microsoft Sentinel | HTTPS / TLS 1.3 | Managed Identity | Forward security events |

#### 3.2.3 External Integration Architecture

| Source Application | Destination Application | Protocol / Encryption | Authentication | Security Proxy | Purpose |
|-------------------|------------------------|----------------------|---------------|---------------|---------|
| Patient web/mobile app | Azure Front Door | HTTPS / TLS 1.3 | Azure AD B2C JWT (per request) | Front Door WAF, Azure DDoS Standard | All patient traffic |
| FHIR Facade | Cerner Millennium HL7v2 listener | MLLP over IPsec VPN | Network-layer auth + service account | Trust internal firewall | HL7v2 ADT/ORM/ORU (legacy interfaces) |
| FHIR Facade | Cerner Millennium FHIR R4 | HTTPS / TLS 1.3 | OAuth 2.0 client credentials | Trust internal firewall | Patient/Appointment FHIR reads |
| FHIR Facade | MediCore Spine (PDS) | HTTPS / TLS 1.2-MA | Mutual TLS with Spine certificate | Spine Core via national healthcare secure network | Patient demographic lookups |
| FHIR Facade | MediCore e-Referral Service | HTTPS / TLS 1.2 | OAuth 2.0 + MediCore Digital assurance key | national healthcare secure network | Outpatient referral reads |
| FHIR Facade | GP Connect (Appointments) | HTTPS / TLS 1.2 | JWT + MediCore CIS organisation certificate | national healthcare secure network | Cross-organisation appointment availability (Phase 2) |
| Notification Service | Azure Communication Services (SMS / Email) | HTTPS / TLS 1.3 | Managed Identity | Private Endpoint | Appointment reminders, OTP delivery, notifications |
| Service Desk Clinician | Admin Portal (Admin API) | HTTPS / TLS 1.3 | MediCore CIS OIDC + MFA (smart card or FIDO2) | Front Door WAF | Read-only enrolment lookups, account suspension |
| Microsoft Sentinel | Azure AD B2C / App Insights / ADLS Gen2 | Azure diagnostic settings | Managed Identity | Azure-internal | Security analytics and alerting |
| Patient web/mobile app | Microsoft Intune (for MDM-managed Trust devices only) | HTTPS / TLS 1.3 | Intune-managed | N/A | Managed device posture (corporate-issued devices only) |

##### End User Access

| User Type | Access Method | Authentication | Protocol |
|-----------|-------------|---------------|----------|
| Patient (web) | Responsive web app | Azure AD B2C (OIDC) + MFA (SMS OTP default / TOTP) | HTTPS / TLS 1.3 |
| Patient (mobile) | iOS / Android app | Azure AD B2C (OIDC, refresh token rotation) + biometric unlock | HTTPS / TLS 1.3 |
| Service desk admin (clinician) | Admin portal (responsive web) | MediCore CIS (OIDC) + smart card or FIDO2 | HTTPS / TLS 1.3 |
| Operations / SRE | Azure Portal + Bastion | Entra ID SSO + conditional access + PAM (Just-in-Time elevation) | HTTPS / TLS 1.3, SSH over Bastion |

#### 3.2.4 API & Interface Contracts

| API / Interface | Type | Direction | Format | Version | Documentation |
|----------------|------|-----------|--------|---------|--------------|
| MyMedwick Patient API | REST (FHIR-aligned where applicable) | Exposed | JSON | v1.2 | Internal developer portal (APIM) |
| MyMedwick Admin API | REST | Exposed | JSON | v1.0 | Internal developer portal |
| Cerner Millennium FHIR R4 | REST (FHIR R4) | Consumed | JSON (FHIR) | R4 | Cerner vendor docs |
| Cerner Millennium HL7v2 | MLLP | Consumed | HL7v2.5 pipe-delimited | 2.5 | Trust integration wiki |
| MediCore Spine PDS | REST / SOAP | Consumed | XML / JSON | 3.0 | MediCore Digital developer portal |
| MediCore e-Referral Service | REST | Consumed | JSON (FHIR R4) | v2 | MediCore Digital developer portal |
| GP Connect Appointments | REST (FHIR STU3) | Consumed | JSON (FHIR STU3) | STU3 v1.4 | MediCore Digital developer portal |
| WinPath Pathology | HL7v2 / MLLP | Consumed | HL7v2.5 | 2.5 | Clinisys docs |
| Azure Communication Services | REST | Consumed | JSON | 2023-08 | Microsoft docs |
| MediCore CIS OIDC | REST (OIDC) | Consumed | JSON | OIDC 1.0 | MediCore Digital developer portal |

---

### 3.3 Physical View

#### 3.3.1 Deployment Architecture Diagram

<Mermaid chart={`graph TD
    DNS[Trust DNS] --> FD[Azure Front Door Premium + WAF]
    FD --> APIM1[APIM - UK South]
    FD --> APIM2[APIM - UK West DR]
    subgraph UKS[Azure UK South - Primary]
        APIM1 --> AppSvc[App Service Environment v3]
        AppSvc --> SQL1[Azure SQL BC Zone Redundant]
        AppSvc --> SB1[Service Bus Premium ZR]
        AppSvc --> Redis1[Azure Cache for Redis Premium]
        AppSvc --> KV1[Key Vault - UK South]
        AppSvc --> ADLS1[ADLS Gen2 - UK South]
        AppSvc --> PE[Private Endpoints]
        AppSvc --> B2C[Azure AD B2C UK Tenant]
    end
    subgraph UKW[Azure UK West - DR]
        APIM2 --> AppSvc2[App Service - Warm Standby]
        AppSvc2 --> SQL2[Azure SQL - Failover Group]
        AppSvc2 --> SB2[Service Bus - Geo-DR]
        AppSvc2 --> KV2[Key Vault - UK West]
    end
    SQL1 -- Auto Failover Group --> SQL2
    SB1 -- Geo-DR Pairing --> SB2
    ADLS1 -- GRS / RA-GRS --> ADLS2[ADLS Gen2 - UK West]
    AppSvc -. HL7v2 over IPsec VPN .-> EPR[Cerner EPR - Trust Data Centre]
    AppSvc -. TLS-MA over national healthcare secure network .-> national healthcare secure network[National Healthcare Secure Network]
    national healthcare secure network --> Spine[MediCore Spine]
    national healthcare secure network --> eRS[MediCore e-Referral]`} />

#### 3.3.2 Hosting & Infrastructure

##### Hosting Venues

| Attribute | Selection |
|-----------|----------|
| **Hosting Venue Type** | Public cloud (Azure) with national healthcare secure network connectivity to MediCore national services |
| **Hosting Region(s)** | UK South (primary -- London), UK West (DR -- Cardiff) |
| **Service Model** | PaaS (App Service, Azure SQL, Service Bus, APIM, Functions) and SaaS (Azure Communication Services, Front Door, Sentinel) |
| **Cloud Provider** | Microsoft Azure |
| **Account / Subscription Type** | Medwick Healthcare Trust Enterprise Agreement -- dedicated "mymedwick-prod" subscription; separate subscriptions per environment |
| **Landing Zone Pattern** | Medwick ALZ (Azure Landing Zone) -- MediCore Authority-aligned, hub-and-spoke with platform hub (shared connectivity, shared services) and workload spoke |
| **Data residency** | All data (primary, DR, backups, logs) in UK regions only -- UK South and UK West. Enforced by Azure Policy "Allowed Locations". |

##### Compute

| Attribute | Detail |
|-----------|--------|
| **Compute Type** | PaaS -- Azure App Service (Linux, Premium v3) and Azure Functions (Premium plan) |
| **App Service Plan** | P2v3 (2 vCPU, 8 GB RAM) per service, 2 instances (scale-out to 10 via autoscale) in Production |
| **Functions Plan** | Premium EP2 for Notification Service and Audit Sink |
| **Runtime** | .NET 8 (LTS) |
| **Web Application Hosting** | Azure App Service (Linux) with per-service slots for blue/green deployment |
| **Mobile Build** | Ionic + Capacitor; iOS signed via Apple Developer Enterprise account; Android signed via Google Play console |
| **Isolation** | Dedicated App Service Environment v3 (ASEv3) for all production services; VNet-integrated; zone redundant |

##### Security Agents

- [x] Microsoft Defender for Cloud -- enabled across the subscription (Defender for App Service, SQL, Storage, Key Vault, Containers)
- [x] Microsoft Defender for Endpoint -- on all admin jump boxes (via Intune)
- [x] Microsoft Sentinel -- SIEM / SOAR
- [x] Azure Policy -- enforces NCSC / MediCore / Medwick baselines
- [x] Microsoft Purview -- data classification and sensitivity labels on Azure SQL
- [x] Vulnerability scanning (Defender for Cloud built-in + OWASP ZAP in CI)

#### 3.3.3 Network Topology & Connectivity

##### Connectivity Summary

| Question | Response |
|----------|----------|
| Is this an Internet-facing application? | Yes -- Front Door is the only public entry point; APIM is not public (Private Link only) |
| Outbound Internet connectivity required? | Limited -- only via Private Endpoints and Azure-managed egress. Outbound to ACS, B2C, Apple/Google push services via Managed Firewall allow-list |
| Cloud-to-on-premises connectivity required? | Yes -- IPsec VPN + ExpressRoute (1 Gbps) to Trust core data centre for Cerner EPR HL7v2 and ancillary systems |
| Wireless networking required? | No (within Azure); Trust-site wireless is used by Trust devices and is out of scope here |
| Third-party / co-location connectivity required? | No -- all MediCore national services via national healthcare secure network; no private co-location links |
| national healthcare secure network connectivity required? | Yes -- dedicated national healthcare secure network CN-SP link for MediCore Spine, e-Referral Service, and GP Connect |

##### User & Administrator Access

| Attribute | Selection |
|-----------|----------|
| **User access method** | Web (HTTPS), mobile app (HTTPS) |
| **User locations** | Patients -- Internet, primarily UK, occasional overseas |
| **Administrator access method** | Azure Bastion for VM/jump-box access (rare); Azure Portal via Entra ID + MFA + conditional access + PIM for privileged roles |
| **VPN required** | No for patients; administrators use conditional access (no VPN) |
| **ExpressRoute / VPN** | Yes -- ExpressRoute (UK South) + IPsec VPN backup to Trust on-premises for EPR |

##### Transport Protocols

| Protocol | Used? | Purpose |
|----------|-------|---------|
| HTTPS (TLS 1.2+) | Yes | All patient, clinician, and service traffic -- TLS 1.3 enforced where possible, TLS 1.2 minimum |
| MLLP over IPsec | Yes | HL7v2 from Cerner EPR (legacy, encrypted over private VPN) |
| AMQP 1.0 | Yes | Azure Service Bus |
| SFTP | No | N/A |
| TCP (other) | Yes | Redis protocol (6380, TLS) within VNet |
| WebSocket | No | N/A |

##### Network Bandwidth

| Metric | Value |
|--------|-------|
| Peak egress bandwidth to Internet | 400 Mb/s (projected Year 3) |
| Peak ingress bandwidth from Internet | 150 Mb/s |
| Peak bandwidth between on-prem and cloud (EPR) | 250 Mb/s (over 1 Gbps ExpressRoute) |
| Peak national healthcare secure network bandwidth | 50 Mb/s (Spine, e-RS, GP Connect combined) |
| Traffic characteristics | Daily peaks 07:30-09:00 (appointment reminder windows) and 18:00-20:00 (after-work access); weekend slow |
| Latency requirements | Patient-perceived TTFB < 300ms P95 |

##### Internet Perimeter Protection

| Control | Implemented | Detail |
|---------|------------|--------|
| DDoS Protection | Yes | Azure DDoS Standard on the VNet; Front Door absorbs volumetric attacks at edge |
| Rate Limiting | Yes | APIM rate limit policies (per subscription key and per user); Front Door WAF rate-based rules |
| Source IP Restrictions | Yes | Admin portal: geo-blocked outside UK + allow-list for Trust IPs; patient portal: no IP restriction (open) |
| Web Application Firewall (WAF) | Yes | Front Door Premium WAF with OWASP Core Rule Set 3.2, bot manager, custom rules (National Patient ID format, block common path traversal) |
| Client Verification Controls | Yes | Patient JWTs from Azure AD B2C bound to session, short-lived (30 min access token, 8h refresh with rotation) |
| File Upload Protection | Limited | Only repeat prescription note field accepts text (no file upload) |

#### 3.3.4 Environments

| Environment | Description | Count & Venue | Compute Solution |
|------------|-------------|--------------|-----------------|
| Development | Individual developer environments using shared dev subscription | 1 x Azure UK South | App Service Basic tier, Azure SQL General Purpose (small) |
| Test / QA | Automated integration and regression testing | 1 x Azure UK South | App Service Standard S2, SQL GP, synthetic data only |
| Staging / Pre-Production | Production-mirror for UAT, clinical safety testing, accessibility testing | 1 x Azure UK South | App Service P1v3, SQL Business Critical (smaller), masked production-like data |
| Training | Clinical training environment for service desk staff | 1 x Azure UK South | Shared with Staging compute, separate SQL (synthetic) |
| Production | Live service | 1 x Azure UK South (3 zones), DR in UK West | ASEv3, App Service P2v3, SQL BC Zone Redundant, Service Bus Premium |
| DR | Warm standby | 1 x Azure UK West | App Service P1v3 (scaled up during failover), SQL Auto-Failover Group secondary |

##### Connectivity Between Environments

- No -- production and non-production environments live in separate Azure subscriptions with no VNet peering. Promotion is via Azure DevOps pipelines only. Production data is never copied to non-production; masked synthetic data is used.

#### 3.3.5 End User Compute & IoT

##### End User Compute

Patients use their own devices (BYOD). Minimum supported platforms:
- Web: last two major versions of Chrome, Edge, Safari, Firefox; WCAG 2.2 AA conformance
- iOS: 16.0+ (aligned with Apple support lifecycle)
- Android: 11.0+ (API level 30)

Trust service desk staff use Intune-managed Windows laptops for administrative functions.

##### IoT Devices

Not applicable -- no IoT devices are part of this solution. Trust Internet-of-Things programmes (e.g., remote vital signs monitoring) are separate initiatives.

---

### 3.4 Data View

#### 3.4.1 Data Architecture & Storage

##### Data Footprint

| Data Name | Store Technology | Authoritative? | Retention Period | Data Size | Classification | Personal Data? | Special Category? | Encryption Level | Key Management |
|-----------|-----------------|---------------|-----------------|-----------|---------------|---------------|-------------------|-----------------|---------------|
| Patient enrolment records (National Patient ID, portal user ID mapping, verification evidence references) | Azure SQL | Yes | Life + 8 years (Records Management Code of Practice) | 5 GB | Restricted | Yes | Yes (health status inferred) | TDE + Always Encrypted (deterministic on National Patient ID) | Customer-managed key (HSM-backed) |
| Patient preferences (contact, consent, SMS opt-in) | Azure SQL | Yes | Life + 8 years | 1 GB | Restricted | Yes | Partial | TDE + Always Encrypted | Customer-managed key |
| Appointment cache (read-through cache from EPR) | Azure SQL + Redis | No (EPR authoritative) | 30 days rolling | 20 GB | Restricted | Yes | Yes | TDE (SQL); in-memory TLS (Redis) | Customer-managed key |
| Results metadata (result ID, released flag, view timestamps) | Azure SQL | Yes (for view tracking); No (result content in EPR) | 8 years | 15 GB | Restricted | Yes | Yes | TDE + Always Encrypted | Customer-managed key |
| Session state / MFA state | Azure SQL | Yes | 24 hours | less than 1 GB | Restricted | Yes | No | TDE | Customer-managed key |
| Audit log | ADLS Gen2 (WORM immutable) | Yes | 7 years (DSPT / MediCore Records Management) | 150 GB / year | Restricted | Yes | Yes | Azure Storage SSE + immutable blob policy | Customer-managed key |
| Application logs (PII-redacted) | Log Analytics (Sentinel workspace) | No | 2 years (hot) + 5 years (archive) | 80 GB / year | Internal | No (redaction enforced) | No | Azure Storage SSE | Microsoft-managed |
| Integration event store (Service Bus messages) | Azure Service Bus | Transient | 14 days max | less than 10 GB | Restricted | Yes | Yes | Service Bus encryption (TLS + at-rest) | Customer-managed key |

##### Storage Systems

| Attribute | Detail |
|-----------|--------|
| **Storage Product** | Azure SQL Database (Business Critical, Zone Redundant), Azure Data Lake Storage Gen2, Azure Cache for Redis (Premium) |
| **Storage Size** | SQL: 500 GB provisioned (Business Critical); ADLS Gen2: estimated 1.5 TB over 7 years; Redis: 6 GB |
| **Replication** | SQL: zone-redundant + geo-failover group to UK West; ADLS: RA-GRS to UK West; Redis: not replicated (cache only) |
| **Minimum RPO** | 5 minutes (SQL geo-failover group asynchronous) |

#### 3.4.2 Data Classification

| Classification Level | Data Types | Handling Requirements |
|---------------------|------------|----------------------|
| **Public** | Public-facing documentation, accessibility statement | Open access |
| **Internal** | Redacted application logs, infrastructure metrics, aggregated usage statistics | Trust access controls |
| **Restricted (Official-Sensitive)** | All patient-identifiable data, enrolment records, preferences, audit logs referencing patients, clinical messages | Encrypted at rest (TDE + Always Encrypted for PII fields) and in transit (TLS 1.3); access-controlled (RBAC + PIM); audited; 7-year audit retention |

MediCore healthcare data classification: All patient-identifiable data is "Official-Sensitive" with the MediCore handling caveat "PERSONAL". The Caldicott Principles are applied to every data use.

#### 3.4.3 Data Lifecycle

| Stage | Description | Controls |
|-------|-------------|----------|
| **Creation / Ingestion** | Patient enrolment (self-service with National Patient ID + PDS verification); clinical data read-through from EPR via FHIR facade; no primary clinical data created in portal | PDS demographics match; National Patient ID validation (Modulus 11); consent captured and logged |
| **Processing** | Domain services resolve each request against EPR / Spine in real time, applying results release rules and consent checks | Every patient data access logged with National Patient ID, user session, and purpose; Caldicott justification coded per access type |
| **Storage** | Portal-owned data in Azure SQL (TDE + Always Encrypted); immutable audit logs in ADLS Gen2 | Customer-managed keys in Azure Key Vault (HSM); automated daily backups; geo-redundant for audit |
| **Sharing / Transfer** | To MediCore Spine (TLS-MA), to e-RS, to GP Connect (Phase 2), to ACS (patient contact details for SMS/email delivery only); no third-country transfer | Data minimisation -- only send what is required; DPIA DPIA-2025-004 assesses each flow |
| **Archival** | Audit log transitions from hot (1 year) to cool (years 2-7) in ADLS lifecycle policy; SQL archival is application-level (mark as archived) | Lifecycle policies, WORM immutability on audit container (7-year legal hold) |
| **Deletion / Purging** | On patient request (UK GDPR Art 17 with MediCore records caveats) or at end of retention; pseudo-anonymised research aggregates may be retained | Data Retention Committee approves; tombstone records preserved for audit trail integrity |

#### 3.4.4 Data Privacy & Protection

##### Privacy Assessments

| Assessment Type | ID | Status | Link |
|----------------|-----|--------|------|
| DPIA | DPIA-2025-004 | Completed, approved by DPO (Sally Bloggs) and Caldicott Guardian (Helen Bloggs) | Trust IG Library: /ig/dpia-2025-004 |
| DPIA -- GP Connect extension (Phase 2) | DPIA-2025-018 | Completed | Trust IG Library: /ig/dpia-2025-018 |
| Transfer Risk Assessment | N/A | No data transferred outside UK | -- |

##### Use of Production Data for Testing

| Approach | Selected |
|----------|----------|
| Sensitive data is masked (describe method below) | [x] |

Production data is never copied into non-production environments. Staging uses a masked dataset derived from EPR test data where all National Patient IDs, names, addresses, dates of birth, and contact details are replaced by realistic synthetic values using a deterministic tokenisation approach. Referential integrity (appointment-to-patient, result-to-patient) is preserved using the tokens. Approved by IG Lead (2025-04-08).

##### Data Integrity

- Yes -- structural integrity enforced via Azure SQL constraints; clinical data integrity enforced by reading through to the EPR (the authoritative source) for any decision-relevant values; hash verification on audit log blobs (ADLS append-blob with content MD5).
- Patient identity integrity is an explicit Hazard Log hazard (HAZ-04 -- see 3.6) and is mitigated by PDS demographic verification on every enrolment and on any change to patient demographics.

##### Data on End User Devices

- Minimal -- no clinical data stored on patient devices. Mobile apps persist an encrypted refresh token in device secure storage (iOS Keychain / Android Keystore). Biometric unlock gates access. Apps enforce no-screenshot on sensitive screens (iOS only; Android best-effort via `FLAG_SECURE`).

#### 3.4.5 Data Transfers & Sovereignty

##### Data Transfers to Third Parties

| Destination | Data Type | Classification | Transfer Method | Protection |
|------------|-----------|---------------|----------------|------------|
| MediCore Spine (PDS) | National Patient ID, demographic query | Restricted | TLS-MA over national healthcare secure network | Mutual TLS with Spine-issued certificate; minimum data for lookup |
| MediCore e-Referral Service | Patient UBRN, appointment references | Restricted | HTTPS over national healthcare secure network | OAuth 2.0; MediCore Digital assurance key |
| GP Connect | Patient National Patient ID for appointment availability (Phase 2) | Restricted | HTTPS over national healthcare secure network | JWT + CIS2 organisation certificate |
| Microsoft Azure Communication Services (subprocessor) | Patient mobile number / email (ephemeral at time of send) | Restricted | HTTPS / TLS 1.3 | Microsoft is contracted subprocessor under Trust enterprise agreement; UK region only; subject to Microsoft Online Services DPA |
| Microsoft Sentinel (Trust internal SIEM) | Pseudonymised security events | Internal | Azure diagnostic settings | Internal Trust service |

##### Data Sovereignty

- Yes -- all customer data (PII and clinical data) remains within the United Kingdom. Primary in UK South (London); DR in UK West (Cardiff). Azure Policy "Allowed Locations" rejects any resource deployment outside UK. ACS SMS / email uses UK region endpoints. The Microsoft Online Services DPA, combined with Microsoft's UK data residency commitments for ACS and Azure SQL, is assessed as adequate for UK GDPR purposes. Any future third-country transfer would require a Transfer Risk Assessment (TRA) and Standard Contractual Clauses.

---

### 3.5 Security View

#### 3.5.1 Security Overview & Threat Model

##### Security Context

| Question | Response |
|----------|----------|
| Does the solution support regulated activities? | Yes -- processes special category personal data (health). Subject to CS-129/0160 clinical safety standards. Not a medical device (assessed). |
| Is the solution SaaS or third-party hosted? | No -- hosted on Azure (IaaS/PaaS) by the Trust; Microsoft is the cloud provider (subprocessor) |
| Has a third-party risk assessment been completed? | Yes -- Microsoft Azure: MHT-TRA-2024-001 (approved); Cerner (EPR vendor): MHT-TRA-2023-007 (approved); ACS: inherits Microsoft TRA |

##### Business Impact Assessment

| Impact Category | Business Impact if Compromised |
|----------------|-------------------------------|
| **Confidentiality** | Critical -- exposure of patient records would breach UK GDPR, require ICO notification within 72 hours, and cause lasting loss of patient trust; potential fines up to 4% of Trust turnover |
| **Integrity** | Critical -- incorrect display of results or appointments could contribute to patient harm (missed appointment, acting on wrong result) -- see Hazard Log HAZ-02, HAZ-03, HAZ-04 |
| **Availability** | High -- extended outage would increase booking office load ~3.5x and may delay access to clinical information; not life-critical because EPR and clinical services remain available |
| **Non-Repudiation** | High -- inability to prove a patient's consent or a specific action (cancellation, prescription request) would undermine clinical and legal accountability |

##### Threat Model

A STRIDE-based threat model was conducted (MHT-TM-2025-008). Healthcare-specific threats are highlighted.

| STRIDE | Threat | Attack Vector | Likelihood | Impact | Mitigation |
|--------|--------|-------------|-----------|--------|------------|
| **Spoofing** | Attacker impersonates patient to view records | Credential stuffing from other-site breaches; SIM-swap to intercept SMS OTP | Medium | Critical | Azure AD B2C + MFA (SMS OTP default; TOTP upgrade recommended); breached-password detection; step-up MFA for prescription actions; FIDO2 option |
| **Spoofing** | Attacker impersonates Trust clinician to service desk admin portal | Stolen smart card / coerced clinician | Low | Critical | MediCore CIS smart card + FIDO2; IP geo-restriction; session recording; behavioural analytics (Sentinel) |
| **Tampering** | Man-in-the-middle alters appointment details in transit | TLS downgrade | Low | High | TLS 1.3 enforced; HSTS + preload; certificate pinning on mobile apps |
| **Tampering** | Modification of audit log | Insider with storage access | Low | Critical | ADLS Gen2 WORM immutable policy (7-year legal hold); Key Vault access separated from audit writers; alerted on access |
| **Repudiation** | Patient denies an action (cancellation, Rx request) | Session hijack or dispute | Medium | High | Immutable audit trail including device, IP, session ID, MFA method; step-up MFA for sensitive actions |
| **Information Disclosure** | Data breach exposing patient records | SQL injection, misconfigured storage, stolen credentials | Low | Critical | Parameterised queries; Defender for SQL; Private Endpoints only; Always Encrypted on PII; Sentinel UEBA |
| **Information Disclosure** | Wrong patient's record shown to another patient (misidentification) -- clinical safety hazard HAZ-04 | Logic bug in session/context handling; identity merge error | Low | Critical | Strict session-to-MediCore-Number binding; automated clinical safety regression tests; manual clinical safety review per release (CS-160) |
| **Denial of Service** | Volumetric DDoS on public endpoint | Botnet attack | Medium | High | Azure DDoS Standard; Front Door absorbs edge; APIM rate limiting; graceful degradation |
| **Elevation of Privilege** | Standard user escalates to admin | Broken access control | Low | Critical | RBAC + ABAC (patient can only see own National Patient ID data, enforced at service layer and re-validated in FHIR facade); pen testing annually (NCC Group) |
| **Clinical safety** (cross-cutting) | Silent SMS delivery failure causing missed critical appointment -- hazard HAZ-02 | ACS outage, mobile number out of date | Medium | High | Delivery receipts tracked; fallback to email; booking office manual check for high-priority appointments; patient UI shows "last notified" timestamp |
| **Clinical safety** (cross-cutting) | Wrong results shown to patient -- hazard HAZ-03 | EPR interface defect, mapping error | Low | Critical | Results release only after clinician review and explicit release; FHIR conformance tests; contract tests; sample reconciliation with EPR nightly |

#### 3.5.2 Identity & Access Management

##### Authentication Model -- Patients

| Access Type | Role(s) | Destination(s) | Authentication Method | Credential Protection |
|------------|---------|----------------|----------------------|----------------------|
| Patient (web / mobile) | Patient | MyMedwick | Azure AD B2C (custom policy) -- username / password + MFA (SMS OTP default; TOTP or FIDO2 optional) | B2C password policies: 12 char min, complexity, breached-password check via Have-I-Been-Pwned-style service; PBKDF2 storage |

##### Authentication Model -- Internal Users

| Access Type | Role(s) | Destination(s) | Authentication Method | Credential Protection |
|------------|---------|----------------|----------------------|----------------------|
| Service desk admin (clinician / admin) | Service Desk Admin, Read-Only Admin | Admin portal | MediCore CIS OIDC -- smart card or FIDO2 (phishing-resistant) | CIS2-managed; Trust enforces smart card for clinical users |
| Operations / SRE | Platform Engineer, DBA, Security Engineer | Azure Portal, ADO, runbooks | Entra ID SSO + MFA (FIDO2 / Microsoft Authenticator) + Conditional Access + PIM (JIT) | Entra ID policies; PIM 8-hour max elevation |
| Service accounts | Internal services | Azure resources | Azure Managed Identity (system-assigned or user-assigned) | No passwords; tokens short-lived and Entra-managed |

##### Authentication Details

| Control | Response |
|---------|----------|
| Does the application use SSO? | Yes -- Azure AD B2C for patients; MediCore CIS for clinicians; Entra ID for staff/ops |
| What is the unique identifier for user accounts? | Patients: Azure AD B2C user objectId mapped to National Patient ID (verified via PDS during enrolment); clinicians: CIS2 UUID |
| What is the authentication flow? | Authorization code + PKCE for all web/mobile; token exchange at BFF |
| Credential issuance | Patient: self-service enrolment with PDS demographic match + email verification + SMS verification; service desk admin: CIS2 smart card issued by MediCore Registration Authority |
| Credential complexity | Patient: 12+ chars with complexity, breached-password check; clinician: CIS2 policy |
| Credential rotation | Patient: 180-day password rotation recommended (not enforced -- aligned to NCSC guidance); CIS2: MediCore CIS policy |
| Account lockout | Patient: 5 failed attempts -> 15 minute soft lockout; 10 attempts -> account locked, manual unlock via service desk after verification |
| Password reset | Patient: self-service with registered email + SMS OTP verification of National Patient ID + date of birth |

##### Session Management

| Control | Response |
|---------|----------|
| Session establishment | OIDC session cookie (HttpOnly, Secure, SameSite=Strict); access token 30 min; refresh token 8 hours (rotation on use) |
| Mobile sessions | Refresh token in iOS Keychain / Android Keystore with biometric unlock; device posture check on Trust-managed service desk devices |
| Session protection | JWTs signed (RS256); audience-bound to MyMedwick BFF; token binding to session; nonce and state on authorization code flow |
| Session timeout / concurrency | 30 min idle timeout (patient); 15 min (admin); no concurrency limit for patients, single-session for admin |

##### Authorisation Model

| Access Type | Role / Scope | Entitlement Store | Provisioning Process |
|------------|-------------|-------------------|---------------------|
| Patients | Fine-grained access bound to own National Patient ID only | Azure SQL (enrolment table) | Self-service enrolment + PDS verification |
| Service desk admin | Admin Read-Only, Account Suspend | MediCore CIS attributes + Trust role mapping | Via Trust RA process |
| Operations / SRE | Platform Operator, DBA, Security | Entra ID groups + PIM | Manager approval + PIM JIT elevation |
| Service accounts | Per-service Managed Identity (least privilege) | Azure RBAC | IaC-managed (Bicep) |

##### Authorisation Details

| Control | Response |
|---------|----------|
| Account re-certification | Quarterly for admin roles; annual for patient accounts (dormant > 18 months auto-suspended) |
| Segregation of duties | Developers cannot deploy to production (pipeline enforced); admins cannot modify clinical data in EPR from portal; ops cannot read patient clinical data (access to PII columns via Always Encrypted requires explicit Key Vault grant with break-glass logging) |
| Delegated authorisation | Proxy access (e.g., parent for child aged under 13) is NOT supported in v2.0 -- documented limitation; planned for v3.0 subject to IG assurance |

##### Privileged Access

| Account Type | Management Approach |
|-------------|-------------------|
| OS privileged accounts | PaaS -- no OS access for dev/ops; Azure Bastion + PIM for any VM access (jump boxes rare) |
| Infrastructure admin | Entra ID + PIM JIT (8-hour max); all actions logged in Entra ID Audit and Sentinel |
| SQL administration | DBA role via PIM; SQL ledger enabled; SQL Audit logs to Log Analytics |
| Break-glass | Two named emergency accounts stored in physical safe (CISO + CDIO); usage triggers high-priority Sentinel alert |

#### 3.5.3 Network Security & Perimeter Protection

| Control | Implementation |
|---------|---------------|
| Network segmentation | Azure Landing Zone hub-spoke; VNet per environment; subnets per tier (app, data, management); NSGs with deny-by-default; Azure Firewall at hub; Private Endpoints for all PaaS; no public network access to SQL, Key Vault, Storage, Service Bus |
| Ingress filtering | Azure Front Door Premium with WAF (OWASP CRS 3.2 + Microsoft managed rulesets), bot protection, rate-based rules, geo-rules; APIM policies (JWT validation, schema validation, rate limit) |
| Egress filtering | Azure Firewall; explicit allow-list (ACS, Microsoft Graph, Spine/national healthcare secure network targets, Apple/Google push); deny-all-else; NAT Gateway with fixed egress IPs |
| Encryption in transit | TLS 1.3 enforced for all external; TLS 1.2 minimum internally; private CA for service-to-service mTLS optional; Azure Key Vault + Managed HSM for certificate management |
| national healthcare secure network boundary | Dedicated national healthcare secure network CN-SP connection (2 links, diverse carriers) with MediCore-approved firewalling |

#### 3.5.4 Data Protection

##### Encryption at REST

| Attribute | Detail |
|-----------|--------|
| Encryption deployment level | Storage (all data stores) + Application (Always Encrypted on PII columns in Azure SQL) |
| Key type | Symmetric (AES-256) |
| Algorithm / cipher / key length | AES-256-GCM (Always Encrypted column enclave); AES-256 (TDE, Storage SSE, Service Bus) |
| Key generation | Azure Key Vault Managed HSM (FIPS 140-2 Level 3) |
| Key storage | Azure Key Vault Managed HSM (customer-managed keys); separate key per environment and per data class |
| Key rotation schedule | Annual automatic rotation for TDE CMKs; 180-day rotation for Always Encrypted column master keys; rotation orchestrated by IaC + Key Vault rotation policies |

##### Secret & Password Protection

| Attribute | Detail |
|-----------|--------|
| Secret store | Azure Key Vault (Premium, HSM-backed) + Managed HSM for CMKs |
| Secret distribution | Runtime retrieval via Managed Identity + Key Vault references; never written to disk or config files |
| Secret protection on host | Memory only; Key Vault access logged; Private Endpoint for Key Vault |
| Secret rotation | Automatic via Key Vault rotation policies (connection strings, APIM subscription keys, ACS access keys); certificate lifecycle managed by Key Vault + Azure Front Door |

#### 3.5.5 Security Monitoring & Threat Detection

| Capability | Implementation |
|-----------|---------------|
| Security event logging | All authn/authz events, patient data access (with National Patient ID, action, result), admin actions, privilege elevation, WAF blocks, configuration changes. Forwarded to Sentinel. |
| SIEM integration | Microsoft Sentinel (Trust tenant) -- all Azure diagnostic logs + App Insights security events. Custom analytics rules: patient-credential-stuffing (failed MFA > 10 in 15 min across unique patient IDs from one IP), impossible travel, admin after-hours access, mass-export pattern, prescription request anomaly |
| Infrastructure event detection | Microsoft Defender for Cloud (Defender for App Service, SQL, Storage, Key Vault, Containers); Microsoft Defender for Identity on Entra ID |
| Security alerting | Sentinel playbooks (SOAR): automatic account lockout on credential stuffing pattern, Teams notification to SOC, ServiceNow ticket creation; 24x7 SOC (outsourced to Trust MSSP) |
| Threat intelligence | MISP feed, MediCore Digital Data Security Centre (DSC) alerts ingested into Sentinel |
| Clinical safety monitoring | Dedicated Sentinel workbook with clinical-safety-relevant KPIs: SMS delivery failure rate, FHIR facade error rate against EPR, session-to-MediCore-Number binding anomaly count |

---

### 3.6 Scenarios

#### 3.6.1 Key Use Cases

**UC-01: Patient views upcoming appointments**

| Attribute | Detail |
|-----------|--------|
| **Actor(s)** | Enrolled patient |
| **Trigger** | Patient opens app and navigates to "My Appointments" |
| **Pre-conditions** | Patient is enrolled, authenticated (Azure AD B2C session valid), has given consent to SMS/email communications, has at least one scheduled outpatient appointment |
| **Main Flow** | 1. App calls GET /appointments on Patient BFF with Bearer JWT. 2. BFF validates token (JWT signature, audience, not expired). 3. BFF calls Appointments Service with patient context (National Patient ID from session). 4. Appointments Service checks Redis cache (60s TTL) for patient appointments. 5. Cache miss: Appointments Service calls FHIR Facade. 6. FHIR Facade calls Cerner FHIR R4 Appointment search by patient identifier. 7. FHIR Facade normalises to MyMedwick canonical model. 8. Appointments Service filters to outpatient-type only and applies results release rules. 9. Appointments Service caches and returns response. 10. BFF aggregates and returns to app. 11. Audit event emitted to Service Bus. |
| **Post-conditions** | Patient sees list of appointments; audit event recorded with National Patient ID, session ID, timestamp, purpose=view-appointments |
| **Views Involved** | Logical, Integration & Data Flow, Physical (App Service, SQL, Redis, ExpressRoute to EPR), Data (cache, audit), Security (JWT, RBAC, audit) |

**UC-02: Patient cancels or reschedules an appointment**

| Attribute | Detail |
|-----------|--------|
| **Actor(s)** | Enrolled patient |
| **Trigger** | Patient selects "Cancel" or "Reschedule" on an appointment |
| **Pre-conditions** | UC-01 pre-conditions; appointment is within the 24-hour-plus-before cut-off; the appointment type permits self-service (some oncology appointments are flagged "clinician-managed only") |
| **Main Flow** | 1. App calls POST /appointments/&#123;id&#125;/cancel with reason. 2. BFF validates JWT and business rules (cut-off, type). 3. Appointments Service writes intent (status=cancel-requested) to SQL and emits event to Service Bus (Outbox pattern). 4. FHIR Facade consumes event and issues Appointment.status=cancelled to Cerner via FHIR R4. 5. Cerner acknowledges; FHIR Facade records success. 6. Notification event emitted. Notification Service sends SMS + in-app notification: "Your appointment on DATE has been cancelled." 7. Booking office worklist updated (Cerner handles downstream). |
| **Post-conditions** | Appointment cancelled in EPR; patient notified; immutable audit event recorded |
| **Views Involved** | Logical, Integration & Data Flow, Security (authentication, step-up MFA not required for cancel; required for repeat Rx), Scenarios, Reliability (Outbox ensures durability) |

**UC-03: Appointment reminder SMS -- with delivery failure handling**

| Attribute | Detail |
|-----------|--------|
| **Actor(s)** | Notification Service, Azure Communication Services, Patient |
| **Trigger** | 48-hour-pre-appointment scheduler job runs |
| **Pre-conditions** | Patient has an active appointment; patient has opted in to SMS reminders; mobile number verified at enrolment |
| **Main Flow** | 1. Scheduler publishes "send-reminder" event for each qualifying appointment. 2. Notification Service retrieves patient's preferences. 3. Notification Service calls ACS SMS with message. 4. ACS returns delivery status within 60 seconds (typical). 5. If delivered: audit success. 6. If `failed` / `undelivered`: Notification Service schedules retry after 15 min (max 3 retries with exponential back-off). 7. If all retries fail OR patient has no valid mobile: fall back to email. 8. If email also fails OR patient has no valid email: add to booking office exception worklist for manual follow-up call (hazard mitigation for HAZ-02). 9. Patient app shows "reminder sent at TIME" on the appointment card for transparency. |
| **Post-conditions** | Patient reminded via one or more channels OR appointment added to manual-call worklist; audit trail complete |
| **Views Involved** | Logical (Notification Service), Integration (ACS), Reliability (retry, fallback, manual exception), Security (audit), Scenarios, Governance (HAZ-02 mitigation) |

**UC-04: Patient mis-identification prevention -- clinical safety hazard control HAZ-04**

| Attribute | Detail |
|-----------|--------|
| **Actor(s)** | Enrolled patient, FHIR Facade, Cerner EPR, MediCore Spine PDS |
| **Trigger** | Any patient data read or write |
| **Pre-conditions** | Patient authenticated and enrolled |
| **Main Flow** | 1. Session JWT contains patient_nhs_number (verified at enrolment via PDS). 2. Every call to FHIR Facade asserts patient_nhs_number as both HTTP header and query parameter. 3. FHIR Facade verifies patient_nhs_number exists in PDS cache (TTL 24h) and has not been merged/retired. 4. FHIR Facade calls Cerner FHIR with National Patient ID as identifier -- never with Cerner internal IDs. 5. Returned resources are verified to have matching patient identifier; mismatched responses raise MHT-HAZ-04 alert, block the request, and log to Sentinel. 6. If PDS returns "merged", Facade fetches new identifier, updates enrolment, logs clinical-safety event, and forces patient re-verification on next login. |
| **Post-conditions** | Patient receives only their own data; any mismatch is blocked and raises a clinical safety event |
| **Views Involved** | Security (identity binding), Data (identity controls), Scenarios, Governance (Hazard Log) |

**UC-05: Results release and view**

| Attribute | Detail |
|-----------|--------|
| **Actor(s)** | Patient; Clinician (via EPR, out of band) |
| **Trigger** | Clinician releases a pathology or radiology result via EPR workflow (not via MyMedwick) |
| **Pre-conditions** | Clinician has reviewed result and clicked "Release to Patient Portal" in Cerner; result is at least 24 hours old (safety delay per policy) |
| **Main Flow** | 1. Cerner emits ORU message with MyMedwick-release flag. 2. FHIR Facade ingests ORU, normalises to FHIR DiagnosticReport. 3. Results Service stores metadata and release flag in SQL. 4. Notification event published. 5. Notification Service sends SMS / push notification to patient. 6. Patient logs in and views result. 7. First view triggers a "patient-has-seen-result" audit event back to EPR (via outbound FHIR Facade call). |
| **Post-conditions** | Patient sees result; clinical team can see patient-viewed status in EPR; Caldicott-compliant audit trail maintained |
| **Views Involved** | Integration, Data, Security, Scenarios -- explicit safety delay per clinical policy |

#### 3.6.2 Architecture Decision Records (ADRs)

**ADR-001: Microsoft Azure over AWS as hosting platform**

| Field | Content |
|-------|---------|
| **Status** | Accepted |
| **Date** | 2025-02-05 |
| **Context** | The Trust has a sovereign UK cloud hosting requirement and operates an enterprise agreement with Microsoft. A technology choice was made between Microsoft Azure (UK South / UK West) and AWS (London / Ireland). Evaluation criteria: UK data residency assurance, alignment with MediCore Authority patterns, existing Trust skills, identity integration (Entra ID already Trust standard), regulatory attestations (ISO/IEC 27018), and cost. |
| **Decision** | Adopt Microsoft Azure with UK South (primary) and UK West (DR). |
| **Alternatives Considered** | **AWS:** Strong services and mature UK presence. Rejected because: (a) Trust existing Entra ID / Intune investment favoured Microsoft stack for identity; (b) Existing staff skills heavily Azure-weighted (migration from on-premises to Azure for non-clinical systems); (c) AWS UK regions do not yet have the same UK sovereignty contractual commitments as Azure's UK regions for Trust's specific workloads; (d) ISO/IEC 27018 certification and MediCore alignment patterns more mature on Azure. **Google Cloud:** insufficient UK coverage and Trust skills at decision time. **On-premises:** inconsistent with Trust "cloud-first-where-appropriate" policy for non-clinical-record workloads. |
| **Consequences** | Positive: unified identity stack (Entra ID, B2C, CIS2 federation pattern); mature MediCore landing zone patterns; Trust staff skills aligned; integrated Sentinel SIEM. Negative: Azure-specific skills required for deep ops; Moderate lock-in to Azure AD B2C and APIM (see 3.1.6). |
| **Quality Attribute Tradeoffs** | Operational Excellence: positive (tooling alignment). Security: positive (unified IAM). Cost: neutral (comparable to AWS). Portability: neutral-to-negative (B2C is high lock-in, mitigated by IdP facade pattern). |

**ADR-002: FHIR R4 over HL7v2 as the canonical clinical data contract**

| Field | Content |
|-------|---------|
| **Status** | Accepted |
| **Date** | 2025-02-20 |
| **Context** | Downstream clinical systems (Cerner, WinPath, JAC) historically integrate via HL7v2 messaging (MLLP). MediCore Authority's Interoperability Strategy mandates FHIR R4 for new clinical APIs. The FHIR Facade pattern allows both in parallel. The decision is whether MyMedwick's internal clinical data model should be HL7v2 (the data's native form) or FHIR R4. |
| **Decision** | Use FHIR R4 as the canonical internal model; the FHIR Facade performs HL7v2-to-FHIR mapping at the ingestion boundary. |
| **Alternatives Considered** | **HL7v2 as canonical:** Lower impedance with legacy systems but rejected: (a) Inconsistent with MediCore Authority standards for new systems; (b) HL7v2 is poorly suited to JSON/REST consumption by modern web clients; (c) Would lock MyMedwick out of the ICS-wide FHIR-based data sharing roadmap. **Bespoke domain model:** Rejected -- reinvents the wheel; FHIR R4 is a recognised MediCore standard and has mature .NET SDKs (Firely). |
| **Consequences** | Positive: standards-aligned; forward-compatible with ICS Shared Care Record; strong tooling (Firely SDK); easier external audit. Negative: HL7v2-to-FHIR mapping is non-trivial for edge cases (address types, telecom systems) and must be clinically validated; FHIR conformance testing added to CI. |
| **Quality Attribute Tradeoffs** | Operational Excellence: positive (single internal model). Performance: neutral (mapping overhead marginal). Reliability: positive (tested mapping layer isolates EPR changes). Cost: slight increase in initial development, net positive over 3-year life. |

**ADR-003: Azure AD B2C over MediCore login for patient authentication**

| Field | Content |
|-------|---------|
| **Status** | Accepted (revised 2026-03-28; supersedes v1 which had proposed MediCore login) |
| **Date** | 2026-03-28 |
| **Context** | Patient authentication choice. MediCore login is the national patient identity service; Azure AD B2C is Microsoft's customer identity. National policy encourages MediCore login adoption but does not mandate it for Trust patient portals. Evaluation criteria: control over enrolment UX, MFA options, verification journey speed, ability to step-up MFA for sensitive actions, future optionality. |
| **Decision** | Use Azure AD B2C as the primary patient IdP; design the architecture to allow MediCore login to be federated in as an additional IdP in a future phase (target 2026-Q4). |
| **Alternatives Considered** | **MediCore login as primary:** Recognised national identity; would avoid duplicate enrolment. Rejected for v2.0 because: (a) Trust requires explicit control over the enrolment UX to reach 800,000 patients quickly (including digitally-excluded patients who fail MediCore login's identity proofing); (b) MFA method flexibility (SMS + TOTP + FIDO2) is richer in B2C; (c) Patients who fail MediCore login verification would be blocked whereas Trust can provide an "in-person at the Trust" fallback verification through its service desk. A facade (AuthGateway) is in place so MediCore login can be federated without breaking downstream services. **Bespoke Trust IdP:** rejected -- reinventing identity is high-risk. |
| **Consequences** | Positive: faster enrolment path for patients; Trust controls verification journey (including in-person fallback); future-proofed for MediCore login federation. Negative: risk of fragmented identity between MediCore login and Trust portal (mitigated by later federation); Trust bears responsibility for identity proofing to MediCore-equivalent standard (documented in DPIA-2025-004). |
| **Quality Attribute Tradeoffs** | Operational Excellence: neutral (extra policies to maintain). Security: positive (step-up MFA richer in B2C). Cost: negligible difference. Patient experience: positive (faster, more forgiving enrolment journey). |

**ADR-004: Outbox pattern for EPR-affecting write operations**

| Field | Content |
|-------|---------|
| **Status** | Accepted |
| **Date** | 2025-03-12 |
| **Context** | Patient actions (cancel appointment, prescription request) must result in a reliable write to the EPR and a reliable notification to the patient. Naive implementation (call EPR then publish event) introduces a dual-write problem -- either can fail. |
| **Decision** | Write intent to SQL and to a local outbox table in the same transaction; a background dispatcher publishes events to Service Bus once committed. |
| **Alternatives Considered** | **Distributed transactions (MSDTC):** not supported with Azure SQL + Service Bus. **Saga (compensating actions):** feasible but over-engineered for these flows. **Event-first (publish before write):** risks publishing events without persistent state. |
| **Consequences** | Positive: at-least-once delivery guarantee; idempotent consumers handle duplicates; resilient to partial failures. Negative: outbox table requires cleanup; small latency added (typically less than 200ms). |
| **Quality Attribute Tradeoffs** | Reliability: strongly positive. Performance: marginal negative. Operational Excellence: positive (clear failure semantics). |

---

## 4. Quality Attributes

### 4.1 Operational Excellence

#### 4.1.1 Observability -- Logging

##### Log Architecture

| Log Type | Events Logged | Local Storage | Retention Period | Remote Services |
|----------|--------------|--------------|-----------------|----------------|
| Application logs | Request/response metadata (PII-redacted), service errors, business events | App Insights (immediate) | 2 years hot + 5 years archive | Log Analytics + Sentinel |
| Patient access audit | National Patient ID, session, action, purpose (Caldicott), outcome | ADLS Gen2 (WORM immutable) | 7 years | Sentinel |
| Clinical safety event log | Hazard trigger events (HAZ-01..HAZ-07), clinical-safety-relevant errors | ADLS Gen2 WORM + Sentinel workbook | 25 years (per MediCore clinical records) | Sentinel + Trust Clinical Safety portal |
| Security event log | Authn/authz, WAF, PIM activations, key vault access | Log Analytics | 2 years hot + 5 years archive | Sentinel |
| Infrastructure diagnostic | Azure diagnostic logs (App Service, SQL, APIM, Front Door) | Log Analytics | 90 days hot + 1 year archive | Sentinel subset |
| Access logs | Front Door, APIM, App Service HTTP logs | Log Analytics | 90 days | Sentinel |

#### 4.1.2 Observability -- Monitoring & Alerting

##### Operational Alerts

| Alert Category | Trigger Condition | Notification Method | Recipient |
|---------------|-------------------|-------------------|-----------|
| Portal availability (Front Door) | External probe failure > 2 min | PagerDuty P1 + Teams | SRE on-call |
| P95 latency | P95 > 800ms for 5 min | PagerDuty P2 | SRE on-call |
| FHIR Facade error rate (EPR) | > 2% errors over 5 min | PagerDuty P1 | SRE on-call + Integration Lead |
| MediCore Spine error rate | > 5% errors over 5 min | Teams + PagerDuty P2 | SRE on-call |
| SMS delivery failure rate | > 5% failures over 15 min | PagerDuty P2 + Teams + Email to Patient Experience | SRE on-call + Tom Doe |
| Clinical safety event raised | Any HAZ-* event | PagerDuty P1 + SMS to CSO | Dr Amir Doe (CSO) + CSG |
| Authentication failure spike | > 20 failures / 5 min from same IP | Sentinel alert + SOC | SOC on-call |
| Data export / mass read anomaly | UEBA high-severity event | Sentinel SOAR playbook + SOC + CISO | Jane Bloggs |
| SQL CPU / DTU | > 85% sustained for 10 min | Teams + PagerDuty P3 | SRE + DBA |
| Certificate expiry | Any cert < 30 days to expiry | Email | Platform team |
| Patient support backlog | > 20 unresolved support tickets | Email | Service Desk |

##### Monitoring Tools

| Capability | Tool | Coverage |
|-----------|------|----------|
| APM | Application Insights | All services (request, dependency, exception, custom clinical-safety events) |
| Infrastructure Monitoring | Azure Monitor | All Azure resources |
| Log Aggregation | Log Analytics (Sentinel workspace) | All logs |
| Distributed Tracing | OpenTelemetry into App Insights | All microservices |
| Dashboards | Azure Workbooks (6 workbooks: SLO, clinical safety, security, integrations, patient journey, cost) | All stakeholders |
| Alerting & Incident | PagerDuty + Microsoft Teams | All P1-P3 alerts |
| Synthetic Monitoring | Azure Monitor Availability Tests | Top 10 critical user journeys |

#### 4.1.3 Capacity Monitoring

| Question | Response |
|----------|----------|
| Metrics collected | App Service CPU/memory/instance count, SQL DTU/CPU/storage, Service Bus queue depth/active messages, APIM request count, FHIR Facade outbound latency, Redis hit ratio |
| Trend analysis | Weekly automated workbook export; monthly capacity review |
| Thresholds | Warning 70%, Critical 85% |
| Capacity planning | Annual plan; quarterly refresh aligned to enrolment projections |

#### 4.1.4 Operational Procedures

| Procedure | Description | Owner | Documentation |
|-----------|-------------|-------|--------------|
| Incident response (ITIL) | P1: 15-min response, resolve 4h; P2: 30-min, 8h; post-incident review within 5 working days | Tom Doe | Runbooks in ADO wiki |
| Clinical safety incident handling | Triggered on any HAZ-* event; CSO paged; 15-min engagement; CS-160 incident report within 48h; SI if actual harm (Datix) | Dr Amir Doe | Trust Clinical Safety Management System (CSMS) |
| Change management | Normal: ARB ticket + 2 technical approvals + CSO sign-off for clinical-impact changes; Emergency CAB for P1 fixes | Robert Bloggs | ServiceNow change module |
| On-call rotation | 24x7, 1-week, 6 engineers; clinical safety secondary rota (3 clinical safety officers) | Tom Doe | PagerDuty schedule |
| Patient support | Digital-support helpline 08:00-20:00 Mon-Sun; service desk L1 + portal L2 | Service Desk lead | Internal KB |
| DSPT annual maintenance | Evidence refresh and re-submission by 30 June annually | Sally Bloggs | DSPT portal |
| Clinical safety case review | Every major release and annually; CSG sign-off | Dr Amir Doe | CSMS |

---

### 4.2 Reliability & Resilience

#### 4.2.1 Geographic Footprint & Disaster Recovery

| Question | Response |
|----------|----------|
| Multi-venue deployment? | Yes -- UK South (primary) + UK West (DR) |
| DR strategy | Warm standby: App Services running (scaled down), SQL auto-failover group, Service Bus geo-DR, ADLS RA-GRS |
| Data sovereignty constraints | Yes -- all regions UK only; no cross-border replication |
| RTO | 1 hour (P1 regional failure) |
| RPO | 15 minutes (SQL async replication lag) |

#### 4.2.2 Scalability

| Attribute | Response |
|-----------|----------|
| Scaling capability | Full auto-scaling (App Service autoscale rules on CPU + queue depth; SQL vCore elastic; APIM unit scaling) |
| Scaling details | App Service: 2-10 instances per service, scale-out in 90 seconds. SQL Business Critical: vertical scale in minutes. Front Door: unlimited edge. ACS: managed throughput. |
| Dependencies adequately sized | Yes -- ExpressRoute 1 Gbps (25% utilised at peak); EPR interface tested at 3x projected peak. |
| Dependency details | MediCore Spine: national service, published SLA; EPR: tested to 5,000 concurrent sessions; GP Connect: limited per MediCore national throttles. |

#### 4.2.3 Fault Tolerance

- [x] **Yes**
  - **Component failures:** All services 2+ instances, zone-redundant within UK South.
  - **Graceful degradation:** If EPR is unavailable, portal shows cached appointments (read-only) with staleness warning; writes (cancel/reschedule) are queued and shown as "pending" to the patient. If Spine is unavailable, enrolment is blocked but existing users continue to function.
  - **Circuit breakers (Polly):** EPR (5 consecutive failures -> open 30s), Spine (3 -> 60s), GP Connect (3 -> 60s).
  - **Health checks:** Liveness + readiness endpoints; App Service built-in plus custom health that checks SQL and Redis connectivity and EPR smoke call.
  - **Testing practices:** Quarterly DR drill (failover to UK West and back); monthly chaos test (Azure Chaos Studio -- EPR outage simulation, Spine timeout, SMS provider outage); annual game day.

#### 4.2.4 Failure Modes & Recovery Behaviour

| Component / Dependency | Failure Mode | Detection | Recovery | User Impact |
|----------------------|-------------|-----------|----------|-------------|
| Single App Service instance | Instance crash | App Service health probe | Auto-restart; traffic rerouted | Transparent |
| Availability Zone (UK South) | Zone outage | Azure zone health | Zone-redundant instances absorb; SQL ZR automatically | Brief degradation (< 60s) |
| Primary region (UK South) | Regional outage | Azure region health + Front Door probes | Manual DR activation to UK West; DNS/Front Door failover; scale up App Service; promote SQL secondary | RTO 1h; patients see a branded maintenance page during failover |
| Azure SQL | Primary unavailable | SQL HA probe | Auto-failover group fails over; connection string unchanged | 30-60s interruption |
| Service Bus | Primary namespace unavailable | Delivery failures | Geo-DR pairing promotes secondary | Brief async latency |
| Cerner EPR | Interface down | FHIR Facade error spike | Circuit breaker opens; cached read data served; writes queued in Outbox; booking office notified for manual backfill | Degraded: read stale data; writes delayed (hazard HAZ-05 mitigation) |
| MediCore Spine | Outage | FHIR Facade timeout | Enrolment blocked; existing user impact limited (demographics verified at login daily) | New enrolment suspended; banner shown |
| GP Connect | Outage | Integration error spike | Feature hidden; banner shown: "GP appointment view temporarily unavailable" | Partial feature degradation |
| Azure Communication Services (SMS) | SMS delivery degraded/outage | ACS delivery receipts < threshold | Automatic retry; email fallback; booking office manual-call worklist if neither delivered (HAZ-02 mitigation); evaluated fallback to GOV.UK Notify (validated in staging quarterly) | Patient may receive email instead of SMS or receive a phone call from booking office |
| Azure AD B2C | Outage | Login failure rate | Cached refresh tokens allow existing sessions to continue up to 8h; new logins blocked; banner shown; incident P1 | New logins blocked during outage |
| ExpressRoute | Link failure | BGP / probe | Automatic failover to IPsec VPN (30-60s BGP convergence) | Brief EPR read degradation |

#### 4.2.5 Backup & Recovery

##### Backup Design

| Attribute | Detail |
|-----------|--------|
| Backup strategy | Azure SQL point-in-time (35 days) + LTR (10 weekly / 12 monthly / 10 yearly); ADLS audit WORM immutable (7 years); Key Vault soft-delete 90 days + purge protection |
| Backup type | Continuous (transaction log) + daily full (SQL); append-only WORM (audit) |
| Backup frequency | SQL: continuous + daily snapshot; ADLS: real-time append; LTR weekly/monthly/yearly |
| Retention | SQL: 35 days PITR + LTR schedule; ADLS: 7 years immutable |
| Immutability | SQL LTR cannot be deleted by service principals (management lock); ADLS Gen2 immutable blob policy (7-year legal hold) |
| Encryption | All backups CMK-encrypted; cross-region copies re-encrypted with UK-West CMK |

#### 4.2.6 Recovery Scenarios

| # | Scenario | Recovery Approach | RTO | RPO |
|---|----------|------------------|-----|-----|
| 1 | Zone failure (UK South) | Zone-redundant resources absorb automatically | 5 min | 0 |
| 2 | Region failure (UK South) | Manual DR activation to UK West | 1 hour | 15 min |
| 3 | Service component failure | App Service auto-restart; blue/green rollback via slot swap | 10 min | 0 |
| 4 | SQL corruption | Point-in-time restore to last known good | 2 hours | 1 min |
| 5 | Ransomware / cyber incident | Isolate via Sentinel playbook; restore from immutable backups (Key Vault purge protection; SQL LTR; ADLS WORM) | 4 hours | 1 hour |
| 6 | EPR interface outage | Cached reads + queued writes; manual reconciliation | Continuous (degraded) | 0 |
| 7 | Data sovereignty breach (e.g., log accidentally exported) | ICO notification within 72h; Sentinel investigation; isolate and purge export | 24 hours | N/A |

---

### 4.3 Performance Efficiency

#### 4.3.1 Performance Requirements

##### Key Performance Indicators

| Metric | Target | Measurement |
|--------|--------|-------------|
| P50 response time | < 200ms | App Insights |
| P95 response time | < 800ms | App Insights |
| P99 response time | < 2s | App Insights |
| Throughput | 3,000 req/s sustained, 6,000 peak | APIM metrics + load test |
| Error rate (5xx) | < 0.05% | APIM + Front Door |
| Patient sign-in time | < 5s P95 (web); < 3s P95 (mobile with biometric) | RUM via App Insights |
| SMS delivery within 90s | > 98% | ACS delivery receipts |
| EPR FHIR read P95 | < 1s | FHIR Facade dependency telemetry |
| Results release to patient-visible latency | < 10 min (excluding 24h safety delay) | End-to-end trace |
| Accessibility | WCAG 2.2 AA | Axe automated + manual audit (annually, external) |

##### Performance Testing

| Attribute | Detail |
|-----------|--------|
| Approach | Load (sustained 3,000 req/s for 1h); stress (ramp to 8,000); soak (1,500 req/s for 24h); spike (0-6,000 in 60s) |
| Tools | Azure Load Testing (k6-based) |
| Environment | Staging (production-mirror) |
| Frequency | Every release + quarterly full regression; accessibility re-test on every major release |

##### Capacity & Growth Projections

| Metric | Current (Mar 2026) | 1 Year | 3 Years | 5 Years |
|--------|-------------------|--------|---------|---------|
| Enrolled patients | 280,000 | 520,000 | 720,000 | 800,000 (ceiling) |
| MAU (monthly active) | 120,000 | 260,000 | 430,000 | 520,000 |
| Peak req/s | 1,800 | 3,000 | 4,500 | 6,000 |
| SMS messages/month | 340,000 | 650,000 | 950,000 | 1,200,000 |
| Data volume (SQL) | 40 GB | 80 GB | 150 GB | 250 GB |
| Audit volume (ADLS) | 120 GB/yr | 220 GB/yr | 350 GB/yr | 450 GB/yr |

Design scales to 5-year horizon. Seasonal demand pattern: +40% in January (New Year health engagement); +25% each Monday morning; lulls in August.

#### 4.3.2 Resource Optimisation

| Strategy | Implementation |
|----------|---------------|
| Right-sizing | Premium v3 App Service plans chosen for faster warm-up; reviewed quarterly against Azure Advisor |
| Caching | Redis for appointment reads (60s TTL); APIM response caching for static reference data (5 min) |
| Asynchronous processing | All notifications and audit writes async via Service Bus |
| Network | Private Endpoints avoid public egress fees; CDN (Front Door) for static web assets |
| Database optimisation | Indexed columns; pg-equivalent query tuning; read replicas for reporting if needed; Always Encrypted deterministic only where queryable |

#### 4.3.3 Network Performance

| Attribute | Detail |
|-----------|--------|
| Latency requirements | Patient-perceived TTFB < 300ms P95; EPR round-trip < 1s P95 |
| Bandwidth requirements | 400 Mb/s peak egress; 150 Mb/s peak ingress |
| CDN | Azure Front Door edge caching for static assets |
| Optimisation | HTTP/2; Brotli compression; connection keep-alive; ExpressRoute for EPR |

---

### 4.4 Cost Optimisation

#### 4.4.1 Cost Influence & Analysis

##### Design Cost Decisions

| Posture | Selected | Detail |
|---------|----------|--------|
| Some options more expensive chosen for non-cost reasons | [x] | SQL Business Critical Zone Redundant selected over General Purpose (approximately 2.8x cost) for zone redundancy and faster failover, justified by Tier 1 Critical rating; dedicated ASEv3 chosen over shared App Service plan for isolation; Premium Key Vault HSM chosen over standard for FIPS 140-2 Level 3. |

##### Cost Analysis

- Yes -- detailed cost modelling performed using Azure Pricing Calculator; TCO compared with maintaining PKB pilot + building new in-house solution shows 35% reduction over 5 years.

##### Monthly Cost Breakdown (Production)

| Component | Monthly Cost (GBP) | Notes |
|-----------|-------------------|-------|
| App Service Environment v3 + Premium v3 plans | 7,800 | ASEv3 isolation premium + 6 P2v3 instances average |
| Azure SQL Database (Business Critical Zone Redundant) | 5,400 | 8 vCore Business Critical + Auto Failover Group secondary |
| Azure API Management (Premium, 2 regions) | 4,200 | Premium unit UK South + UK West |
| Azure Front Door Premium + WAF | 1,900 | Premium tier + WAF policies |
| Azure Communication Services (SMS + Email) | 3,200 | ~650,000 SMS/month at UK rates |
| Azure Cache for Redis (Premium) | 700 | P1 tier |
| Azure Service Bus (Premium, Zone Redundant + Geo-DR) | 900 | Premium Messaging Unit |
| Azure AD B2C (P2) | 1,600 | Active users (MAU) pricing |
| Key Vault Managed HSM | 2,200 | Dedicated HSM + transactions |
| ADLS Gen2 + immutable blob + LTR | 400 | 150 GB/yr + long-term retention |
| Log Analytics + Sentinel | 1,800 | Data ingestion + retention |
| Azure Monitor + App Insights | 600 | Telemetry |
| ExpressRoute (UK South) | 900 | 1 Gbps port + data transfer |
| Azure Firewall + VNet + Private Endpoints | 1,100 | Hub firewall attribution |
| Azure Bastion + Defender for Cloud | 500 | |
| Other (DNS, Backup, miscellaneous) | 300 | |
| **Total monthly (production)** | **33,500** | |
| **Total annual (production)** | **402,000** | |
| Non-production environments | 3,500/month | Dev + Test + Staging + Training |
| **Total annual (all environments)** | **444,000** | Aligned to Opex estimate |

#### 4.4.2 Cost Implications

- No -- design meets all requirements within envelope. Reserved instances (1-year) reduce App Service and SQL spend by ~25%.

#### 4.4.3 FinOps Practices

| Practice | Implementation |
|----------|---------------|
| Cost monitoring | Azure Cost Management + custom workbook; weekly report to Robert Bloggs (CDIO) |
| Cost allocation | Tagging strategy: CostCentre=CC-4820, Service=MyMedwick, Environment=prod/staging/test/dev, Owner=Dr-Raj-Doe |
| Reserved capacity | 1-year reserved instances for App Service, SQL, APIM |
| Rightsizing | Azure Advisor monthly; formal quarterly review |
| Waste elimination | Non-prod auto-shutdown 19:00-07:00 weekdays, all weekend (via Azure Automation) |
| Budget governance | Azure Budget alerts at 80% and 100% forecast; change > GBP 500/month requires Platform Lead approval |

---

### 4.5 Sustainability

#### 4.5.1 Hosting Efficiency

##### Hosting Location

| Question | Response |
|----------|----------|
| Hosting location chosen to reduce environmental impact? | No -- chosen for data residency. Azure UK South's carbon intensity is moderate; Microsoft's 2025 commitment to 100% renewable matching will improve this further. |
| Workload demand pattern | Variable predictable -- daily peak 07:30-09:00 and 18:00-20:00; lulls overnight |

##### On-Demand Availability

| Question | Response |
|----------|----------|
| Continuous availability required? | Yes -- Tier 1 Critical |
| Scale down off-peak? | Partially -- minimum 2 instances always; scale out on demand |
| Non-prod auto-shutdown? | Yes -- saves approximately GBP 800/month |

##### Resource Efficiency

| Question | Response |
|----------|----------|
| Rightsized? | Yes -- monthly Azure Advisor review |
| CPU utilisation monitored? | Yes -- target 40-60% business hours |
| Highest performance-per-watt hardware? | Azure manages underlying hardware; workload placed on Premium v3 SKUs which use newer, more efficient silicon |

#### 4.5.2 Code Efficiency

| Question | Response |
|----------|----------|
| Language / framework efficiency | .NET 8 is highly optimised; AOT compilation evaluated for Notification Service (deferred due to ACS SDK incompatibility) |
| Optimised for platform and workload? | Yes -- connection pooling (Npgsql / SqlClient), efficient JSON serialisation (System.Text.JSON), source-generated serializers |
| Efficient algorithms / data structures? | Yes -- indexed lookups, pagination enforced |
| vCPU hours per request minimised? | Yes -- async offload reduces per-request compute |

#### 4.5.3 Data Efficiency

| Question | Response |
|----------|----------|
| Data close to compute? | Yes -- same region, Private Endpoints |
| Replicas minimised? | Only regulator-justified replicas (SQL ZR, DR, WORM audit) |
| Old / unused data removed? | Yes -- SQL archival, ADLS lifecycle to cool tier after 1 year |
| Efficient formats / compression? | Brotli compression on HTTP; gzip on audit blobs before upload |
| Jobs prioritised and distributed? | Yes -- nightly reconciliation jobs scheduled 02:00-04:00 local |
| Efficient networking? | Yes -- Private Endpoints; no NAT for internal traffic |

---

## 5. Lifecycle Management

### 5.1 Software Development & CI/CD

- [x] Internally developed by Trust Digital Product + Integration teams (12 FTE combined).

| Attribute | Detail |
|-----------|--------|
| Source control | Azure DevOps Git (Trust org) |
| CI/CD platform | Azure DevOps Pipelines |
| Build automation | Pipelines on PR and main; .NET build + test; npm build + test; container images to Azure Container Registry |
| Deployment | Bicep IaC; pipelines deploy to dev -> test -> staging -> prod with manual approvals; blue/green via App Service slots |
| Test automation | xUnit (.NET), Jest (web), integration tests (Testcontainers); FHIR conformance (Inferno); contract tests (Pact); Axe for accessibility |

#### Application Security in Development

| Control | Implementation |
|---------|---------------|
| Security requirements identification | Threat model MHT-TM-2025-008; clinical-safety stories in backlog; OWASP ASVS L2 baseline |
| SAST | SonarQube (Azure DevOps integration); quality gate blocks on Critical/High |
| DAST | OWASP ZAP nightly against staging |
| SCA | Mend (formerly WhiteSource); blocks on High/Critical CVEs |
| Container scanning | Microsoft Defender for Containers; ACR-native scanning |
| Secure coding | OWASP guidelines; annual training; security champion per squad |
| Patch management | Critical CVE: 24h mitigation plan, 7-day patch; High: 30 days; base images rebuilt weekly |
| Clinical safety testing | Dedicated clinical-safety regression suite run on every release; CSO sign-off on the suite quarterly |

### 5.2 Service Transition & Migration

#### Migration Classification (6 R's)

| Classification | Selected? | Description |
|---------------|-----------|-------------|
| **Replace** | [x] | PKB pilot replaced by in-house MyMedwick |

#### Transition Plan

| Attribute | Detail |
|-----------|--------|
| Deployment strategy | Phased rollout: Trust staff (dogfooding) -> invited cohort 5,000 patients -> public beta -> general availability. PKB decommissioned after 3-month parallel run. |
| Data migration mode | Continuous sync -- MyMedwick reads through to EPR; no bulk migration from PKB; PKB patient enrolment list used to invite PKB users to re-enrol in MyMedwick |
| Data migration method | Azure Data Factory one-time extract of PKB user list (National Patient IDs only) for invitation mailing |
| Data volume | Approximately 40,000 National Patient IDs |
| End-user cutover | Phased -- patients invited in cohorts over 3 months |
| External system cutover | Phased -- PKB interface disabled after final patient migrated |
| Max acceptable downtime | Zero (parallel run) |
| Rollback plan | PKB remained live throughout; any issue could route traffic back to PKB via Trust web-site banner and direct link |
| Acceptance criteria | ≥ 95% of active PKB users re-enrolled in MyMedwick or formally opted out; CSG sign-off on post-live clinical safety case |
| Transient infrastructure | Yes -- ADF pipeline for PKB extract (decommissioned post-migration) |

### 5.3 Test Strategy

| Test Type | Scope | Approach | Environment | Automated? |
|-----------|-------|----------|-------------|-----------|
| Unit | All code | xUnit, Jest | CI | Yes |
| Integration | Services + SQL + Service Bus | Testcontainers | CI + Test env | Yes |
| Contract | FHIR against Cerner, Spine mocks | Pact + Inferno FHIR test harness | CI + Staging | Yes |
| FHIR conformance | FHIR R4 resources conformance | Inferno (ONC) | CI + Staging | Yes |
| Accessibility | WCAG 2.2 AA | Axe + manual audit (annual external) | Staging + Prod | Partially |
| Clinical safety regression | All HAZ-* mitigations | Dedicated suite; CSO sign-off | Staging | Yes |
| Performance | Load / stress / soak / spike | Azure Load Testing | Staging | Yes |
| Penetration | Annual | NCC Group | Pre-prod | No |
| DR | Region failover | Quarterly drill | Prod + DR | Partial |

### 5.4 Release Management

| Attribute | Detail |
|-----------|--------|
| Release frequency | Fortnightly (every other Thursday) with ability for hotfix any day |
| Release process | Feature branch -> PR (2 approvals + CSO sign-off if clinical-safety-impacting) -> merge to main -> auto-deploy to staging -> clinical safety regression + accessibility + load -> manual approval -> blue/green slot swap in production |
| Release validation | Smoke tests + canary (5% traffic for 30 min) + auto-rollback if error rate > 0.1% |
| Feature flags | LaunchDarkly for phased rollout (per-patient-cohort, per-clinic) |
| Clinical-safety change control | Any change touching a HAZ-tagged component requires CSO review and CSG sign-off before promotion to production |

### 5.5 Operations & Support

| Attribute | Detail |
|-----------|--------|
| Support model | L1 Trust Service Desk (08:00-20:00); L2 SRE on-call (24x7); L3 Digital Product + Integration team (08:00-18:00 working days); L4 CSO + Solution Architect |
| Support hours | 24x7 on-call for Tier 1 |
| SLA | 99.9% monthly availability (external commitment); P1 acknowledge 15 min; P2 30 min; P3 4h; clinical safety P1 -> CSO within 15 min |
| Escalation | L1 -> L2 (15 min P1) -> L3 -> L4 + CSO + CISO as appropriate |
| Clinical safety escalation | Any HAZ-* event -> CSO (Dr Amir Doe) -> CSG if confirmed -> Datix + CQC if actual harm |

### 5.6 Resourcing & Skills

#### Team Capability Assessment

| Skill Area | Current Level | Action |
|-----------|--------------|--------|
| Azure (App Service, SQL, APIM, Front Door) | High | Ongoing -- 3 Azure Solutions Architect Expert certs in progress |
| Bicep / IaC | High | None |
| .NET 8 | High | None |
| FHIR R4 | Medium | Action -- Firely training for 2 integration engineers (Q2 2026) |
| MediCore interoperability (Spine, e-RS, GP Connect) | Medium | Action -- MediCore Digital partner programme training |
| Clinical safety (CS-129/0160) | Medium | Action -- second CSO designate in training (supports succession planning) |
| Information Governance | High | None |
| Security / Sentinel | Medium | Action -- SOC MSSP engaged to cover 24x7 |

#### Operational Readiness

- A: Fully capable -- established SRE team plus clinical safety officer succession plan.

### 5.7 Service Start

1. Azure PaaS resources are always running (App Service, SQL, APIM).
2. On deployment, App Service slot-swap is the activation step; health checks verify all dependencies.
3. After any DR failover, startup sequence: promote SQL secondary -> scale up App Service in UK West -> update Front Door origin -> verify EPR connectivity via ExpressRoute backup path -> enable external traffic. Full cold-start ~25 minutes.

### 5.8 Maintainability

| Concern | Approach |
|---------|----------|
| Software versions current | .NET: within 90 days of LTS release; SQL: minor patches in monthly maintenance window; mobile OS support: last 2 major versions per Apple/Google policy |
| Certificate management | Azure Key Vault + Front Door managed certificates; auto-renewal; alerts at 30/14/7 days |
| Dependency management | Mend + Dependabot; quarterly review |
| MediCore Spine / e-RS / GP Connect interface updates | MediCore Digital issues are tracked via the Digital Assurance Manager; change windows coordinated |

### 5.9 End-of-Life & Decommissioning

| Attribute | Detail |
|-----------|--------|
| Intended lifespan | 7-10 years; major review at 5 years |
| End-of-life triggers | ICS-wide patient portal adoption (possible 2028+); MediCore login mandated |
| Decommissioning blockers | 7-year audit retention; patient records retention under Records Management Code of Practice |
| Data disposal | Patient data: secure deletion (NIST 800-88 equivalent via Azure Storage secure delete + Key Vault key destruction); audit: retained to legal minimum then lifecycle-expired |
| Infrastructure disposal | Bicep `what-if` + Terraform destroy; Azure resources deleted; DNS removed; ADO project archived |

### 5.10 Exit Planning

| Attribute | Detail |
|-----------|--------|
| Exit strategy | Domain services are standard .NET 8 containers; SQL is standard SQL Server; FHIR facade and contract are portable; audit is object storage; identity (B2C) is highest lock-in |
| Data portability | SQL bacpac; ADLS standard object storage export; FHIR data re-exposable through another facade |
| Vendor lock-in | Overall Moderate. Primary lock-in: Azure AD B2C (High) and APIM policies (Moderate). Exit effort: approximately 4-6 months for a similar-sized team. |
| Exit timeline | 6-9 months |

---

## 6. Decision Making & Governance

### 6.1 Constraints

| ID | Constraint | Category | Impact on Design | Last Assessed |
|----|-----------|----------|-----------------|---------------|
| C-001 | All data must reside in the UK (UK GDPR, DSPT, Caldicott) | Regulatory | UK South primary, UK West DR; Azure Policy "Allowed Locations"; ACS UK region | 2026-03-01 |
| C-002 | CS-129 and CS-160 mandatory for any change with clinical impact | Regulatory | Clinical Safety Officer required; Hazard Log; Clinical Safety Case per release | 2026-03-01 |
| C-003 | Must integrate with Cerner Millennium EPR (legacy HL7v2) | Technical | FHIR Facade pattern required; no changes to EPR in scope | 2025-12-01 |
| C-004 | Must comply with MediCore DSPT (annual submission) | Regulatory | Extensive security and IG controls; evidence maintained continuously | 2025-06-30 (last submission) |
| C-005 | WCAG 2.2 Level AA accessibility required (public sector body regs) | Regulatory | Accessibility built in from alpha; external audit annually | 2026-01-15 |
| C-006 | 99.9% availability SLA committed in Trust Digital Strategy | Commercial | Zone-redundant SQL; multi-region DR; App Service Premium v3 | 2026-03-01 |

### 6.2 Assumptions

| ID | Assumption | Impact if False | Certainty | Status | Owner | Evidence |
|----|-----------|----------------|-----------|--------|-------|----------|
| A-001 | Cerner FHIR R4 interface will remain available and contractually supported for the life of MyMedwick | Would require re-engineering to HL7v2-only integration | High | Closed | Dr Raj Doe | Cerner contract extension to 2030; FHIR R4 on roadmap |
| A-002 | Azure AD B2C will remain a Microsoft strategic service | Would require migration to Entra External ID | Medium | Open | Jane Bloggs | Microsoft has announced B2C long-term support and Entra External ID convergence; migration path understood |
| A-003 | Patient enrolment growth 180k/year for 3 years | Capacity plan under- or over-sized | Medium | Open | Nisha Doe | Alpha + beta uptake consistent with trajectory |
| A-004 | MediCore login federation remains optional for Trust portals | Would require emergency MediCore login integration | Medium | Open | Sally Bloggs | Current MediCore Authority policy position; monitored |
| A-005 | Patients have reliable mobile signal for SMS OTP | MFA failure rate could increase; requires TOTP fallback adoption | High | Closed | Dr Raj Doe | Research shows ≥ 97% UK mobile coverage in Trust catchment |

### 6.3 Risks

#### Risk Identification

| ID | Risk Event | Category | Severity | Likelihood | Owner |
|----|-----------|----------|----------|-----------|-------|
| R-001 | Clinical safety incident: wrong results displayed to patient leading to patient harm | Compliance / Safety | Critical | Low | Dr Amir Doe |
| R-002 | GP Connect outage prevents Phase 2 cross-care appointment feature | Technical | High | Medium | Priya Bloggs |
| R-003 | SMS delivery failure causes missed critical appointment (e.g., oncology follow-up) | Operational / Safety | High | Medium | Tom Doe |
| R-004 | Patient mis-identification (wrong patient's record shown) | Compliance / Safety | Critical | Low | Dr Amir Doe |
| R-005 | Data breach requiring ICO notification within 72 hours | Security | Critical | Low | Jane Bloggs |
| R-006 | Cerner EPR upgrade breaks FHIR interface | Technical | High | Medium | Dr Raj Doe |
| R-007 | Azure AD B2C outage blocks patient logins | Technical | High | Low | Jane Bloggs |
| R-008 | DSPT submission failure / downgrade from Standards Met | Compliance | High | Low | Sally Bloggs |
| R-009 | Accessibility regression fails WCAG 2.2 AA | Compliance | Medium | Medium | Nisha Doe |
| R-010 | Clinical safety case lapses (annual review overdue) | Compliance / Safety | High | Low | Dr Amir Doe |
| R-011 | Credential-stuffing attack compromises patient accounts | Security | High | Medium | Jane Bloggs |
| R-012 | ACS (SMS provider) outage; no alternative contracted | Operational | High | Low | Mark Doe |

#### Risk Response

| ID | Mitigation | Plan | Residual Risk | Last Assessed |
|----|-----------|------|---------------|---------------|
| R-001 | Mitigate | Clinical safety regression suite; CSO sign-off per release; 24h release delay for first-time viewing; clinician release control in EPR; audit trail | Low | 2026-03-01 |
| R-002 | Mitigate | Feature flag allows instant disable; cached availability with banner; read-only fallback | Medium | 2026-03-01 |
| R-003 | Mitigate | Retry + email fallback + booking office manual exception worklist (HAZ-02); patient UI shows "last notified" timestamp; monthly reconciliation report | Low | 2026-03-01 |
| R-004 | Mitigate | Strict National Patient ID binding; PDS verification; clinical safety control HAZ-04; automated regression test; CSO sign-off | Low | 2026-03-01 |
| R-005 | Mitigate | Defender for Cloud + Sentinel + annual pen test; ICO breach process documented and rehearsed; DPO engaged; DSPT incident reporting | Low | 2026-03-01 |
| R-006 | Mitigate | Contract tests + FHIR conformance; Cerner change notice process (60 days); facade pattern isolates change | Medium | 2026-01-15 |
| R-007 | Accept (with mitigation) | Cached refresh tokens for existing sessions up to 8h; maintenance banner; P1 incident process | Low | 2026-03-01 |
| R-008 | Mitigate | Continuous evidence gathering; quarterly dry-run review with IG team; scores tracked | Low | 2025-12-01 |
| R-009 | Mitigate | Axe automated + manual audit + user testing with disabled-users panel; annual external audit | Low | 2026-02-10 |
| R-010 | Mitigate | CSMS ticket scheduler; dual CSO rota; automated reminders 30/14/7 days | Low | 2026-03-01 |
| R-011 | Mitigate | Breached-password detection; adaptive rate limits; MFA mandatory; Sentinel UEBA; SOC 24x7 | Medium | 2026-03-01 |
| R-012 | Mitigate | Email fallback; GOV.UK Notify fallback validated in staging; booking office manual call process | Medium | 2026-02-15 |

### 6.4 Dependencies

| ID | Dependency | Direction | Status | Owner | Evidence | Last Assessed |
|----|-----------|-----------|--------|-------|----------|---------------|
| D-001 | Cerner Millennium EPR HL7v2 + FHIR R4 interfaces available | Inbound | Resolved | EPR team | Operational since alpha | 2026-03-01 |
| D-002 | MediCore Spine PDS availability | Inbound | Committed | MediCore Digital | National service | 2026-03-01 |
| D-003 | MediCore CIS for clinician admin auth | Inbound | Committed | MediCore Digital | National service | 2026-03-01 |
| D-004 | MediCore e-Referral Service API | Inbound | Resolved | MediCore Digital | Integration live since 2025-09 | 2026-03-01 |
| D-005 | GP Connect Appointments | Inbound | Committed | MediCore Digital | Integration live since 2025-09 (Phase 2) | 2026-03-01 |
| D-006 | national healthcare secure network CN-SP connectivity | Inbound | Resolved | Trust Network | Dual-link live | 2026-01-10 |
| D-007 | Azure Communication Services UK region | Inbound | Resolved | Microsoft | Enterprise agreement; UK region available | 2025-11-15 |
| D-008 | DSPT 2025/26 submission | Outbound | Resolved | Sally Bloggs | Submitted 2025-06-30; Standards Met | 2025-06-30 |
| D-009 | CS-160 deployment safety case for each release | Outbound | In progress (continuous) | Dr Amir Doe | Approved for v2.0 | 2026-03-28 |

### 6.5 Issues

| ID | Issue | Category | Impact | Owner | Resolution | Status | Last Assessed |
|----|-------|----------|--------|-------|-----------|--------|---------------|
| I-001 | Cerner FHIR R4 interface intermittent 502 errors during overnight batch | Technical | Medium | Dr Raj Doe | Cerner aware; FHIR Facade retry with back-off implemented as interim mitigation; permanent fix expected in Cerner 2026.03 release | In progress | 2026-03-15 |
| I-002 | Two patients reported receiving SMS reminders at 03:00 due to scheduler timezone misconfiguration | Operational | Medium | Tom Doe | Scheduler corrected to Europe/London; affected patients contacted; CS-160 incident report filed | Resolved | 2025-12-08 |
| I-003 | Accessibility audit identified 3 AA-level issues (focus order on results page, colour contrast on notification chip, aria-label on cancel button) | Compliance | Low | Nisha Doe | Fixes in current sprint; external auditor re-test booked for 2026-04 | In progress | 2026-03-20 |

### 6.6 Guardrail Exceptions

#### Policy Exceptions

| Question | Response |
|----------|----------|
| Does this design create exceptions to current policies and standards? | No |
| Accepted through exceptions process? | N/A |

#### Process Exceptions

| Question | Response |
|----------|----------|
| Creates a process library issue? | No |
| Acknowledged by process owner? | N/A |

#### Risk Profile Impact

| Question | Response |
|----------|----------|
| Materially changes the Trust's risk profile? | Yes -- introduces a new patient-facing external surface and new data processing. Evaluated with Risk Committee; risk appetite confirmed. DPIA DPIA-2025-004 and Clinical Safety Case v3 signed. |
| Evaluated with Risk and Controls? | Yes |

### 6.7 Architectural Decisions Log

| ADR # | Title | Status | Date | Impact |
|-------|-------|--------|------|--------|
| ADR-001 | Azure over AWS as hosting platform | Accepted | 2025-02-05 | Platform direction |
| ADR-002 | FHIR R4 over HL7v2 as canonical clinical data contract | Accepted | 2025-02-20 | Integration model |
| ADR-003 | Azure AD B2C over MediCore login for patient identity | Accepted (revised 2026-03-28) | 2026-03-28 | Identity model; MediCore login federation planned |
| ADR-004 | Outbox pattern for EPR-affecting writes | Accepted | 2025-03-12 | Reliability pattern |

### 6.8 Compliance Traceability

| Standard / Principle | Requirement | How the Design Satisfies It | Evidence Section |
|---------------------|-------------|---------------------------|-----------------|
| UK GDPR Art 5(1)(c) | Data minimisation | FHIR facade requests only required fields; PII not logged; API responses tailored to purpose | 3.2, 3.4 |
| UK GDPR Art 5(1)(f) | Integrity and confidentiality | TLS 1.3; Always Encrypted on PII; CMK with HSM; audit; WAF | 3.4, 3.5 |
| UK GDPR Art 6(1)(e) + Art 9(2)(h) | Lawful basis for special category data | Lawful basis documented in DPIA-2025-004 | 2.3, 3.4 |
| UK GDPR Art 17 | Right to erasure | Patient-initiated erasure workflow, with records-retention overlay | 3.4, 3.6 |
| UK GDPR Art 32 | Security of processing | Full IAM, encryption, monitoring, threat model | 3.5 |
| UK GDPR Art 33 | Breach notification within 72h | Documented incident process with DPO engagement | 4.1, 6.3 |
| UK GDPR Art 35 | DPIA | DPIA-2025-004 and DPIA-2025-018 completed | 2.3, 3.4 |
| MediCore DSPT 2025/26 (10 assertions) | Standards Met | Evidence package submitted 2025-06-30; scored Standards Met | 2.3, 3.5, 6.8 |
| CS-129 (Manufacturer) | Clinical risk management (manufacturer) | CSO appointed; Clinical Safety Case v3 approved; Hazard Log MHT-HAZ-LOG-0208; regression suite | 2.3, 3.5, 3.6, 5.1 |
| CS-160 (Deployment) | Clinical risk management (deployment) | Deployment Safety Case signed by Trust CSO per release; CSG sign-off | 5.4, 6.4 |
| Caldicott Principles | Justifiable purpose, minimum necessary, need-to-know | Caldicott Guardian approval of data uses; access audit | 2.3, 3.4 |
| WCAG 2.2 AA | Public sector accessibility | Axe + manual + external audit; accessibility statement published | 4.3, 5.3, 6.3 |
| NCSC Cloud Security Principles | 14 principles | Private Endpoints; CMK in HSM; Sentinel; Defender for Cloud; Trust landing zone | 3.3, 3.5 |
| MediCore Authority Interop Standards | FHIR R4, National Patient ID as primary identifier | FHIR Facade; National Patient ID binding | 3.2, 3.5 |
| Cyber Essentials Plus | Trust certification | Inherited; evidenced | 3.3, 3.5 |

---

## 7. Appendices

### 7.1 Glossary

| Term | Definition |
|------|-----------|
| ACS | Azure Communication Services -- Microsoft's cloud communication platform |
| ALZ | Azure Landing Zone |
| ASEv3 | App Service Environment v3 -- dedicated, isolated App Service compute |
| Caldicott Guardian | Senior person in a MediCore organisation responsible for protecting the confidentiality of patient information |
| CCIO | Chief Clinical Information Officer |
| CIS2 | MediCore Care Identity Service 2 -- MediCore staff identity and authentication |
| CDIO | Chief Digital Information Officer |
| CQC | Care Quality Commission -- England's health and social care regulator |
| CSG | Clinical Safety Group (Medwick's multi-disciplinary clinical safety panel) |
| CSO | Clinical Safety Officer -- defined in CS-129 |
| CS-129 | MediCore Digital standard: Clinical Risk Management -- Manufacturer |
| CS-160 | MediCore Digital standard: Clinical Risk Management -- Deployment |
| DPIA | Data Protection Impact Assessment |
| DPO | Data Protection Officer |
| DSPT | MediCore Data Security & Protection Toolkit |
| EPR | Electronic Patient Record |
| e-RS | MediCore e-Referral Service |
| FHIR | Fast Healthcare Interoperability Resources (HL7 standard) |
| GP Connect | MediCore service providing GP information via FHIR |
| HAZ | Hazard (entry in Hazard Log) |
| national healthcare secure network | Health and Social Care Network -- private MediCore network |
| ICO | Information Commissioner's Office -- UK data protection regulator |
| ICS | Integrated Care System |
| MESH | MediCore Message Exchange for Social Care and Health |
| MHRA | Medicines and Healthcare products Regulatory Agency |
| MICS | Medwick Integrated Care System |
| MyMedwick | The solution described in this SAD |
| MediCore DSPT | MediCore Data Security & Protection Toolkit |
| PACS | Picture Archiving and Communication System |
| PDS | Personal Demographics Service (MediCore Spine) |
| PKB | Patient Knows Best (legacy portal being replaced) |
| RA | MediCore Registration Authority (manages MediCore identity cards) |
| RoPA | Record of Processing Activities (UK GDPR Art 30) |
| SCR | Summary Care Record (MediCore Spine) |
| SRO | Senior Responsible Officer |
| Spine | MediCore Spine -- national set of health services (PDS, SCR, etc.) |
| TLS-MA | TLS Mutual Authentication |
| UBRN | Unique Booking Reference Number (e-RS referrals) |
| WCAG | Web Content Accessibility Guidelines |
| WORM | Write Once, Read Many (immutable storage) |

### 7.2 Reference Documents

| Document | Version | Description | Location |
|----------|---------|-------------|----------|
| MediCore Data Security & Protection Toolkit | 2025/26 | Mandatory annual MediCore IG assessment | dsptoolkit.nhs.uk |
| CS-129 Clinical Risk Management: Manufacturer | 2018 | MediCore Digital clinical safety standard | MediCore Digital |
| CS-160 Clinical Risk Management: Deployment | 2018 | MediCore Digital clinical safety standard | MediCore Digital |
| MediCore Authority Interoperability Standards | 2025 | FHIR R4 profiles and guidance | MediCore Authority |
| Trust Information Security Policy | 4.1 | Medwick corporate security policy | Trust intranet |
| Trust Clinical Risk Management Policy | 3.2 | Medwick clinical risk governance | Trust intranet |
| DPIA -- MyMedwick | DPIA-2025-004 | Data Protection Impact Assessment | Trust IG library |
| Clinical Safety Case v3 -- MyMedwick | CSC-MHT-0208-v3 | Clinical safety case per CS-129 | Trust CSMS |
| Hazard Log -- MyMedwick | MHT-HAZ-LOG-0208 | Live hazard register | Trust CSMS |
| Deployment Safety Case v3 -- MyMedwick | MHT-DSC-0208-v3 | Per CS-160 | Trust CSMS |
| MyMedwick Threat Model | MHT-TM-2025-008 | STRIDE threat model | Trust Security Library |
| NCSC Cloud Security Principles | 2024 | 14 principles | ncsc.gov.uk |
| Accessibility Statement -- MyMedwick | 2026-01 | Public-facing accessibility statement | mymedwick.nhs.uk/accessibility |
| WCAG 2.2 | W3C Recommendation 2023 | Accessibility guidelines | w3.org/WAI/WCAG22 |

### 7.3 Standards & Patterns Referenced

| Standard / Pattern ID | Name | Version | Applicability |
|----------------------|------|---------|--------------|
| HL7-FHIR-R4 | HL7 FHIR | R4 | 3.2 Integration |
| HL7v2 | HL7 v2.5 | 2.5 | 3.2 Integration (legacy inbound) |
| OWASP-ASVS-4.0 | Application Security Verification Standard | 4.0 | 5.1 |
| OWASP-CRS | OWASP Core Rule Set | 3.2 | 3.3, 3.5 WAF |
| NIST-800-88 | Media Sanitisation | Rev 1 | 5.9 |
| WCAG | Web Content Accessibility Guidelines | 2.2 AA | 3.6, 4.3, 5.3 |
| CS-129 | Clinical Risk Management (Manufacturer) | 2018 | 3.5, 3.6, 5.1 |
| CS-160 | Clinical Risk Management (Deployment) | 2018 | 5.4, 6 |
| C4-Model | C4 Model for Software Architecture | N/A | 3.1 |
| 12-Factor | The Twelve-Factor App | N/A | 3.1 |

### 7.4 Approval Sign-Off

| Role | Name | Date | Signature / Approval Reference |
|------|------|------|-------------------------------|
| Solution Architect | Dr Raj Doe | 2026-03-28 | ADO: MYM-ARB-2026-008 (approved) |
| Clinical Safety Officer | Dr Amir Doe | 2026-03-26 | CSMS: CSC-MHT-0208-v3 (approved) |
| CCIO | Dr Fiona Doe | 2026-03-27 | ADO: MYM-CLIN-2026-004 (approved) |
| Caldicott Guardian | Helen Bloggs | 2026-03-25 | IG: CG-2026-011 (approved) |
| IG Lead / DPO | Sally Bloggs | 2026-03-25 | IG: IG-2026-018 (approved) |
| CISO | Jane Bloggs | 2026-03-26 | ADO: MYM-SEC-2026-015 (approved) |
| CDIO | Robert Bloggs | 2026-03-28 | ADO: MYM-ARB-2026-008 (approved) |
| SRO / Deputy CEO | Paul Bloggs | 2026-03-28 | Board: MHT-BOARD-2026-006 (approved) |
| ARB / Design Authority | Design Authority (chaired by Robert Bloggs) | 2026-03-28 | ADO: MYM-ARB-2026-008 (approved) |

---

## Compliance Scoring

<div class="guidance-box">
<h4>Assessment Summary</h4>

This SAD was assessed at **Comprehensive** depth. The scores below reflect a mature, well-documented architecture for a Tier 1 Critical clinical system under MediCore clinical safety and information governance standards.

| Section | Score | Justification |
|---------|:-----:|---------------|
| **0. Document Control** | 5 | Full version history, multiple clinical and IG contributors/approvers, clear scope, related documents referenced |
| **1. Executive Summary** | 5 | Business drivers with priority; strategic alignment; reuse assessment; current-state documented; Tier 1 Critical criticality justified by patient-harm analysis |
| **2. Stakeholders & Concerns** | 5 | Comprehensive register including Caldicott Guardian, CSO, CCIO and external regulators; concerns matrix fully mapped; twelve applicable regulations |
| **3.1 Logical View** | 5 | Full component decomposition; design patterns with rationale; lock-in assessment for all components; service-to-capability mapping |
| **3.2 Integration & Data Flow** | 5 | All internal and external integrations documented with protocol/auth; ten API contracts versioned; end user access patterns; national healthcare secure network and MediCore national services modelled |
| **3.3 Physical View** | 5 | Deployment diagram; compute fully specified (ASEv3); full networking including ExpressRoute, national healthcare secure network, Private Endpoints; six environments; security agents |
| **3.4 Data View** | 5 | All data stores classified with retention and encryption; Always Encrypted for PII; UK data sovereignty; two DPIAs; data integrity and patient identity controls |
| **3.5 Security View** | 5 | STRIDE threat model with eleven threats including two explicit clinical safety threats; comprehensive IAM (patient, clinician, service); HSM-backed CMK; Sentinel with clinical-safety analytics |
| **3.6 Scenarios** | 5 | Five architecturally significant use cases including a clinical-safety control scenario (UC-04); four ADRs with alternatives and tradeoffs |
| **4.1 Operational Excellence** | 5 | Centralised logging with Sentinel; Azure Monitor/App Insights; PagerDuty with clinical safety escalation; dedicated clinical-safety workbook |
| **4.2 Reliability** | 5 | Zone-redundant primary with warm-standby DR; RTO 1h / RPO 15min validated through quarterly drill; chaos testing; Outbox for durability |
| **4.3 Performance** | 5 | P50/P95/P99 targets; 3,000 req/s sustained; Azure Load Testing in pipeline; caching; 5-year growth projections |
| **4.4 Cost** | 5 | Monthly cost breakdown by component; reserved instances; FinOps; tagging; rightsizing cadence |
| **4.5 Sustainability** | 4 | Non-prod auto-shutdown; efficient SKUs; Brotli compression; rightsizing. Score reduced from 5: no carbon metrics baselined; formal sustainability KPIs still in development |
| **5. Lifecycle** | 5 | CI/CD with SAST/DAST/SCA and FHIR conformance; phased migration (PKB replacement); clinical safety regression; fortnightly release with CSO sign-off; exit plan |
| **6. Governance** | 5 | Six constraints; five assumptions with evidence; twelve risks with mitigations (incl. clinical safety); nine dependencies; three issues; fifteen-item compliance traceability |
| **7. Appendices** | 5 | Domain glossary (healthcare-specific); fourteen reference documents; ten standards; full approval sign-off with CSO and Caldicott Guardian |
| **Overall** | **4.9** | **Comprehensive depth achieved. Exemplary documentation for a Tier 1 Critical MediCore Trust clinical system.** |
