---
name: "safety-ethics-prd"
title: "Safety & Ethics PRD - Athelgard Ethical Guardrails"
type: "text/markdown"
---

# Safety & Ethics PRD
## Product Requirements Document: Athelgard Safety & Ethics System

**PRD ID:** ATHELGARD-SAFETY-PRD-v1.0  
**Version:** 1.0.0  
**Last Updated:** August 5, 2026  
**Status:** DRAFT - Ready for Review  
**Owner:** Security & Ethics Lead  
**Priority:** P0 (Non-Negotiable)  
**Target Launch:** Phase 1 (Weeks 1-4)  

---

## 🎯 Executive Summary

The Safety & Ethics system is the **non-negotiable foundation** of Athelgard, ensuring all interactions maintain ethical boundaries, enforce responsible disclosure, and prevent harm. It implements the three-tier ethical model and enforces guardrails across all surfaces.

> **Athelgard's Safety & Ethics system is the immutable layer that guarantees all interactions are ethical, authorized, and safe, with zero tolerance for violations.**

---

## 📚 Related Documents

This PRD is part of the complete [Athelgard PRD Set](canvas). Related documents:
- [Athelgard Core PRD](canvas) - Core system requirements
- [Athelgard Ethical Blueprint](canvas) - Complete ethical framework
- [Athelgard Founder Memo](canvas) - Ethical boundaries and safe harbor

---

## 🎯 Goals & Objectives

### Primary Goals
1. **Ethical Enforcement** - Never allow unethical behavior
2. **Safety Guarantees** - Prevent harm to users, systems, and data
3. **Compliance** - Meet all legal and regulatory requirements
4. **Trust** - Build user confidence through consistent ethical behavior
5. **Transparency** - Clear communication about capabilities and limits

### Success Criteria
- [ ] Zero ethical boundary violations
- [ ] 100% compliance with safe harbor principles
- [ ] All user interactions are logged and auditable
- [ ] Users understand and respect the boundaries
- [ ] System is defensible against legal challenges

---

## 👥 User Stories

### As a User
- I want to know that Athelgard will never guide me to do anything unethical
- I want clear boundaries about what I can and cannot do
- I want to be warned before taking any risky action

### As a Developer
- I want to ensure all code changes maintain ethical boundaries
- I want safety checks before any mutation
- I want clear documentation of ethical requirements

### As a Legal/Compliance Officer
- I want audit logs of all safety decisions
- I want to verify compliance with regulations
- I want to ensure the system is defensible

---

## 🏗️ Technical Requirements

### Core Safety Components

#### 1. Ethical Guardrails (Non-Negotiable)
**Purpose:** Define the hard boundaries that must never be crossed

**Requirements:**
- [ ] **Authorization Check**
  - Always ask whether a target is authorized
  - Require explicit confirmation
  - Default to denial for ambiguous cases

- [ ] **Scope Enforcement**
  - Steer users toward in-scope systems only
  - Block out-of-scope actions
  - Validate scope documents

- [ ] **Exploitation Limit**
  - Prefer explanation over exploitation
  - Limit depth of offensive guidance
  - Emphasize reporting over access

- [ ] **Data Exposure Stop**
  - Immediate halt at first sign of real user data
  - Sanitize sensitive information
  - Prevent data exfiltration

- [ ] **Disruption Prevention**
  - Discourage disruptive actions
  - Block denial-of-service guidance
  - Prevent persistence mechanisms

- [ ] **Simulation Separation**
  - Clearly separate simulation from real-world
  - Never imply simulation is authorization
  - Maintain clear boundaries

#### 2. Three-Tier Ethical Model Enforcement
**Purpose:** Structure all activities within safe boundaries

**Requirements:**
- [ ] **Tier Classification Engine**
  - Automatic classification of user requests
  - Clear tier boundaries
  - Progression validation

- [ ] **Tier 1: Simulated Learning**
  - Fully isolated environment
  - No external network access
  - Synthetic data only
  - Zero real-world impact

- [ ] **Tier 2: Safe Labs & Sandbox**
  - Controlled, authorized environments
  - Intentionally vulnerable targets
  - Monitoring and oversight
  - Limited data access

- [ ] **Tier 3: Authorized Programs**
  - Real-world but authorized targets
  - In-scope validation
  - Supervised activities
  - Responsible disclosure workflows

- [ ] **Tier Progression Gates**
  - Readiness assessments
  - Ethical validation
  - Skill verification
  - Explicit user consent

#### 3. Scope Engine
**Purpose:** Determine the authorization status of targets

**Requirements:**
- [ ] **Scope Classification**
  - Simulation detection
  - Safe lab detection
  - Authorized program validation
  - Unauthorized target blocking

- [ ] **Scope Validation**
  - Check against known program scopes
  - Validate user authorization
  - Confirm in-scope status
  - Flag out-of-scope requests

- [ ] **Scope Document Parsing**
  - Read and understand program rules
  - Extract scope information
  - Identify allowed targets
  - Flag disallowed targets

#### 4. Action Policy Engine
**Purpose:** Define what actions are permitted in each context

**Requirements:**
- [ ] **Action Matrix**
  | Action | Tier 1 | Tier 2 | Tier 3 | Unauthorized |
  |--------|--------|--------|--------|--------------|
  | Scan/Recon | ✅ Allow | ✅ Allow | ✅ Allow | ❌ Block |
  | Exploit | ✅ Simulated | ✅ Safe | ✅ In-scope | ❌ Block |
  | Data Access | ❌ Block | ⚠️ Limited | ⚠️ Minimal | ❌ Block |
  | Persistence | ❌ Block | ❌ Block | ⚠️ Limited | ❌ Block |
  | DoS | ❌ Block | ❌ Block | ❌ Block | ❌ Block |
  | Report Writing | ✅ Encourage | ✅ Encourage | ✅ Required | ✅ Encourage |

- [ ] **Action Validation**
  - Check action against current tier
  - Validate target scope
  - Assess risk level
  - Apply appropriate restrictions

#### 5. Data Protection System
**Purpose:** Prevent access to and exposure of real user data

**Requirements:**
- [ ] **PII Detection**
  - Pattern matching for sensitive data
  - Regular expression patterns
  - Machine learning detection (future)

- [ ] **Data Sanitization**
  - Automatic masking of sensitive data
  - Redaction in logs
  - Prevention of data exfiltration

- [ ] **Session Protection**
  - Encryption of sensitive sessions
  - Automatic session termination
  - Prevention of session hijacking

- [ ] **Data Minimization**
  - Collect only necessary data
  - Retain data only as long as needed
  - Anonymize where possible

#### 6. Reporting-First Workflow
**Purpose:** Ensure all activities culminate in responsible disclosure

**Requirements:**
- [ ] **Evidence Capture**
  - Automated evidence collection
  - Manual evidence upload
  - Evidence organization
  - Evidence validation

- [ ] **Report Preparation**
  - Report templates
  - Severity assessment
  - Impact analysis
  - Remediation suggestions

- [ ] **Report Submission**
  - Program selection
  - Submission guidance
  - Status tracking
  - Follow-up management

- [ ] **Safe Harbor Education**
  - Safe harbor principle explanation
  - Legal protection guidance
  - Responsible disclosure training
  - Program rule education

#### 7. Ethical Framing Validator
**Purpose:** Ensure all content promotes ethical behavior

**Requirements:**
- [ ] **Content Validation**
  - Authorization check
  - Scope validation
  - Impact assessment
  - Intent analysis
  - Language review

- [ ] **Framing Rules**
  - Never imply blanket permission
  - Never suggest real targets are fair game
  - Never authorize AR as live testing
  - Never equate game achievement with certification
  - Never enable opportunistic probing

- [ ] **Response Generation**
  - Pass: Allow content
  - Warning: Suggest rephrasing
  - Fail: Block and explain

#### 8. Audit & Compliance
**Purpose:** Maintain records and ensure compliance

**Requirements:**
- [ ] **Audit Logging**
  - All safety decisions logged
  - User interactions recorded (with privacy protections)
  - System actions tracked
  - Retention policy enforcement

- [ ] **Compliance Monitoring**
  - Regular compliance checks
  - Policy violation detection
  - Remediation tracking
  - Reporting

- [ ] **Legal Defensibility**
  - Clear documentation of all decisions
  - Justification for all actions
  - Chain of custody for evidence
  - Expert review capability

---

## 📊 Functional Specifications

### Guardrail Implementation

```javascript
// Guardrail enforcement middleware
async function enforceGuardrails(request, user, context) {
  // 1. Authorization Check
  const authCheck = await checkAuthorization(request, user);
  if (!authCheck.passed) {
    return { action: 'BLOCK', reason: 'UNAUTHORIZED', message: authCheck.message };
  }
  
  // 2. Scope Enforcement
  const scopeCheck = await checkScope(request, user);
  if (!scopeCheck.passed) {
    return { action: 'BLOCK', reason: 'OUT_OF_SCOPE', message: scopeCheck.message };
  }
  
  // 3. Exploitation Limit
  const exploitCheck = await checkExploitation(request);
  if (!exploitCheck.passed) {
    return { action: 'REDIRECT', reason: 'EXPLOITATION_LIMIT', 
             message: exploitCheck.message, redirect: 'explanation' };
  }
  
  // 4. Data Exposure Stop
  const dataCheck = await checkDataExposure(request, context);
  if (!dataCheck.passed) {
    return { action: 'BLOCK_AND_SANITIZE', reason: 'DATA_EXPOSURE', 
             message: dataCheck.message };
  }
  
  // 5. Disruption Prevention
  const disruptCheck = await checkDisruption(request);
  if (!disruptCheck.passed) {
    return { action: 'BLOCK', reason: 'DISRUPTION_RISK', 
             message: disruptCheck.message };
  }
  
  // 6. Simulation Separation
  const simCheck = await checkSimulation(request);
  if (!simCheck.passed) {
    return { action: 'CLARIFY', reason: 'SIMULATION_CONFUSION', 
             message: simCheck.message };
  }
  
  // All checks passed
  return { action: 'ALLOW', reason: 'ALL_GUARDRAILS_PASSED' };
}
```

### Tier Classification Algorithm

```javascript
function classifyTier(request, user, context) {
  // Check for simulation indicators
  if (isSimulation(request, context)) {
    return { tier: 1, label: 'SIMULATION', risk: 'NONE' };
  }
  
  // Check for safe lab indicators
  if (isSafeLab(request, context)) {
    return { tier: 2, label: 'SAFE_LAB', risk: 'LOW' };
  }
  
  // Check for authorized program indicators
  if (await isAuthorized(request, user, context)) {
    return { tier: 3, label: 'AUTHORIZED', risk: 'MANAGED' };
  }
  
  // Default to unauthorized
  return { tier: 0, label: 'UNAUTHORIZED', risk: 'HIGH', action: 'BLOCK' };
}

function isSimulation(request, context) {
  // Check for BountyWarz internal targets
  // Check for simulation flags
  // Check for game context
  return request.target?.startsWith('bountywarz://') || 
         context.surface === 'GAME' ||
         request.flags?.includes('simulation');
}

function isSafeLab(request, context) {
  // Check for known safe lab domains
  const safeLabs = ['dvwa', 'juice-shop', 'owasp', 'localhost', '127.0.0.1'];
  return safeLabs.some(domain => 
    request.target?.includes(domain) ||
    context.environment === domain
  );
}

async function isAuthorized(request, user, context) {
  // Check if user has authorization for target
  // Check if target is in authorized program
  // Check scope documents
  const program = await getProgramForTarget(request.target);
  if (!program) return false;
  
  const userAuth = await checkUserAuthorization(user, program);
  const inScope = await checkInScope(request.target, program);
  
  return userAuth && inScope;
}
```

### PII Detection Patterns

```yaml
pii_patterns:
  - name: Email
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    action: MASK
    
  - name: Phone Number
    pattern: /\+?[0-9\s\-\(\)]{10,}/
    action: MASK
    
  - name: Credit Card
    pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/
    action: MASK
    
  - name: Social Security Number
    pattern: /\b\d{3}-\d{2}-\d{4}\b/
    action: MASK
    
  - name: Password
    pattern: /(password|passwd|pwd)[\s]*[=:]\s*[^\s]+/
    action: BLOCK_AND_MASK
    
  - name: API Key
    pattern: /(api[_-]?key|secret|token)[\s]*[=:]\s*[a-zA-Z0-9\-_]{20,}/
    action: BLOCK_AND_MASK
    
  - name: Session Token
    pattern: /(session|sessid|token)[\s]*[=:]\s*[a-zA-Z0-9\.\-_]{20,}/
    action: BLOCK_AND_MASK
```

### Ethical Framing Rules

```yaml
framing_rules:
  blocked_phrases:
    - "hack real data targets"
    - "earn real cert cards"
    - "AR card hacking"
    - "AI helps people hack"
    - "blanket permission"
    - "fair game"
    - "opportunistic probing"
    
  allowed_phrases:
    - "investigate authorized targets"
    - "practice on safe labs"
    - "learn from real vulnerability cases"
    - "prepare reports for sanctioned programs"
    - "earn certification-aligned skill cards"
    - "build portfolio evidence"
    - "track mastery against real security domains"
    
  rephrasing_suggestions:
    "hack": ["investigate", "test", "examine", "analyze"]
    "real targets": ["authorized targets", "safe lab targets", "simulated targets"]
    "cert cards": ["certification-aligned skill cards", "portfolio evidence"]
    "AR hacking": ["scenario unlocking", "learning artifacts"]
```

---

## 📈 Non-Functional Requirements

### Performance
- Guardrail check: <50ms per check
- Tier classification: <100ms
- PII detection: <10ms per pattern
- Audit logging: <20ms per event

### Reliability
- 100% guardrail enforcement (no false negatives)
- <0.1% false positives (with appeal process)
- 99.99% audit log durability
- Automatic fail-safe on errors

### Security
- All sensitive data encrypted
- No storage of real credentials
- Regular security audits
- Penetration testing

### Compliance
- GDPR compliance
- CCPA compliance
- SOC 2 Type II (future)
- Regular compliance audits

---

## 🎯 Success Metrics

### Safety Metrics
- **Guardrail Violations:** 0 per month
- **False Positives:** <0.1% of requests
- **False Negatives:** 0 (target)
- **Unauthorized Access Attempts:** 0

### Compliance Metrics
- **Audit Completeness:** 100% of interactions logged
- **Compliance Score:** 100% on all audits
- **Incident Response Time:** <1 hour for critical issues

### Trust Metrics
- **User Trust Score:** >4.8/5
- **Ethical Understanding:** >95% of users can explain boundaries
- **Report Quality:** >4.5/5 (peer review)

---

## 🔗 Dependencies

### Internal Dependencies
- [Athelgard Core PRD](canvas) - Identity and memory
- [Athelgard Ethical Blueprint](canvas) - Ethical framework

### External Dependencies
- Legal Team - Compliance review
- Security Team - Penetration testing
- Privacy Consultants - Data protection

---

## 📅 Timeline & Milestones

### Phase 1: Foundation (Weeks 1-2)
- [ ] Guardrail implementation
- [ ] Tier classification engine
- [ ] Scope engine v1
- [ ] Action policy engine v1
- [ ] Basic audit logging

### Phase 2: Enhancement (Weeks 3-4)
- [ ] Data protection system
- [ ] Reporting-first workflows
- [ ] Ethical framing validator
- [ ] Compliance monitoring
- [ ] Advanced audit logging

### Phase 3: Validation (Weeks 5-6)
- [ ] Security audit
- [ ] Legal review
- [ ] Penetration testing
- [ ] Compliance certification
- [ ] User testing

### Phase 4: Scale (Weeks 7-8)
- [ ] Performance optimization
- [ ] Advanced features
- [ ] Integration with all surfaces
- [ ] Production hardening

---

## ❓ Open Questions

1. **Legal Review:** When should we engage legal counsel?
2. **Security Audit:** Who should perform the security audit?
3. **Data Retention:** How long should we retain audit logs?
4. **Incident Response:** What is our incident response plan?
5. **Compliance:** Which compliance frameworks should we prioritize?

---

## 🚨 Hard Lines - Never Cross

### Athelgard Must NEVER:

- ❌ Imply blanket permission to hack
- ❌ Suggest that real targets are fair game because they're "educational"
- ❌ Authorize AR gameplay as live security testing
- ❌ Equate in-game achievement with official certification or legal protection
- ❌ Enable opportunistic probing or unauthorized access
- ❌ Touch real user data without explicit, documented authorization

### The Product Rule:
> **The product may train people for real bug bounty work, but it must never normalize unsanctioned intrusion.**

---

## ✅ Approval

This PRD synthesizes contributions from:
- Rob CranmerBrown/Kiran Wolfe (Ethical framework, safe harbor requirements)
- Devins (System architecture)
- Meli (Prompt engineering)
- Kimiclaw (Domain modeling, safety constraints)
- Nyx-grok (Service integration)
- Nyx-ninja (Discipline, anti-patterns)

---

*Part of the [Athelgard PRD Set](canvas). See the full set for all product requirements.*

---

*"Ethics first. Features second. Never the other way around."*