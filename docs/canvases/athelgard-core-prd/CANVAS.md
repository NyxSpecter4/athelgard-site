---
name: "athelgard-core-prd"
title: "Athelgard Core PRD - Product Requirements Document"
type: "text/markdown"
---

# Athelgard Core PRD
## Product Requirements Document: Core System

**PRD ID:** ATHELGARD-CORE-PRD-v1.0  
**Version:** 1.0.0  
**Last Updated:** August 5, 2026  
**Status:** DRAFT - Ready for Review  
**Owner:** Engineering Lead  
**Priority:** P0 (Foundational)  
**Target Launch:** Phase 1 (Weeks 1-4)  

---

## 🎯 Executive Summary

Athelgard Core is the **persistent intelligence layer** that powers all Athelgard surfaces (Builder, World, Voice, Mobile). It provides shared identity, memory, mode system, domain knowledge, and safety guardrails that ensure cohesive behavior across all interactions.

> **Athelgard Core is the single mind that lives behind every Athelgard surface, ensuring consistent identity, memory, ethics, and domain understanding regardless of how users interact with the system.**

---

## 📚 Related Documents

This PRD is part of the complete [Athelgard PRD Set](canvas). Related documents:
- [Athelgard Master Synthesis](canvas) - Cohesive vision
- [Athelgard Ethical Blueprint](canvas) - Ethical framework
- [Athelgard System Architecture](canvas) - Four-layer model
- [Athelgard Master Spec](canvas) - Production-ready spec

---

## 🎯 Goals & Objectives

### Primary Goals
1. **Unified Intelligence** - One consistent Athelgard personality across all surfaces
2. **Cross-Surface Memory** - Remember user context, progress, and preferences
3. **Ethical Enforcement** - Always apply safety guardrails regardless of surface
4. **Domain Understanding** - Deep knowledge of BountyWarz and cybersecurity concepts
5. **Mode System** - Adapt behavior based on user intent and context

### Success Criteria
- [ ] Users experience Athelgard as "the same person" across CLI, web, phone, and mobile
- [ ] Context is preserved when switching between surfaces
- [ ] Ethical guardrails are never bypassed
- [ ] Mode switching is automatic and intuitive
- [ ] Domain knowledge is accurate and up-to-date

---

## 👥 User Stories

### As a Player
- I want Athelgard to remember my progress so I don't have to repeat myself
- I want Athelgard to adapt her teaching style to my skill level
- I want Athelgard to always reinforce ethical behavior

### As a Developer
- I want Athelgard to understand the codebase I'm working on
- I want Athelgard to maintain ethical boundaries when making changes
- I want Athelgard to remember my preferences and workflow

### As a Voice User
- I want Athelgard to recognize me when I call
- I want Athelgard to continue conversations from previous calls
- I want Athelgard to hand off to visual interfaces when needed

---

## 🏗️ Technical Requirements

### Core Components

#### 1. Identity Layer
**Purpose:** Define who Athelgard is and how she behaves

**Requirements:**
- [ ] **Persona Definition**
  - Name: Athelgard
  - Role: Ethical bounty-hunting guide
  - Values: Trust, clarity, ethics, coherence
  - Pedagogy: Socratic, patient, step-by-step
  - Voice: Adaptive (immersive for players, concise for developers)

- [ ] **Voice Invariants** (Meli's Contribution)
  - Always ethical
  - Always coherent
  - Always adaptive to context
  - Never glib or dismissive
  - Never encourages unethical behavior

- [ ] **Memory System**
  - User session memory (short-term)
  - User progression memory (long-term)
  - Cross-surface context continuity
  - Privacy-compliant storage

#### 2. World Model Layer
**Purpose:** Understand the BountyWarz domain and cybersecurity concepts

**Requirements:**
- [ ] **Domain Dictionary** (Kimiclaw's Contribution)
  - Complete BountyWarz terminology mapping
  - Cybersecurity vulnerability classes (CWE)
  - Threat models and remediation patterns
  - London history pedagogical framework

- [ ] **System Understanding**
  - BountyWarz game architecture
  - Mission structures and flows
  - Captain/Guest systems
  - Skill-card mechanics

- [ ] **External Knowledge**
  - OWASP Top 10
  - CWE/SANS Top 25
  - Bug bounty program structures
  - Safe harbor principles

#### 3. Mode System (Meli + Devins Contribution)
**Purpose:** Adapt behavior based on user intent and context

**Requirements:**
- [ ] **Five Primary Modes**
  | Mode | Purpose | Primary Users | Voice Style |
  |------|---------|---------------|-------------|
  | Guide | Teach gameplay concepts | Players | Warm, mentor-like, adaptive |
  | Gamemaster | Shape missions and world | Designers/Players | Deliberate, world-aware |
  | Builder | Code changes and development | Developers | Crisp, technical, precise |
  | Operator | Service inspection and management | Developers | Precise, cautious, service-aware |
  | Audit | Review UX and trust | Developers/Designers | Blunt, diagnostic, analytical |

- [ ] **Mode Detection**
  - Intent-based (not ceremonial)
  - Context-aware (current surface, user history)
  - Automatic switching
  - Explicit override capability

- [ ] **Mode Contracts** (Nyx-ninja's Contribution)
  - Each mode has defined input/output format
  - Each mode has specific capabilities and constraints
  - Mode transitions are smooth and logical

#### 4. Safety Layer (Non-Negotiable)
**Purpose:** Enforce ethical boundaries in all interactions

**Requirements:**
- [ ] **Guardrails** (From Ethical Blueprint)
  - Authorization Check
  - Scope Enforcement
  - Exploitation Limit
  - Data Exposure Stop
  - Disruption Prevention
  - Simulation Separation

- [ ] **Scope Classifier**
  - Identify simulation vs. safe lab vs. authorized vs. unauthorized
  - Default deny for ambiguous targets
  - Explicit authorization required for real targets

- [ ] **Action Policy Engine**
  - Define allowed/disallowed actions per tier
  - Block high-risk actions on unauthorized targets
  - Prefer explanation over exploitation

- [ ] **Real-Target Risk Detection**
  - Domain analysis
  - IP reputation checking
  - Data pattern detection
  - Behavior analysis

- [ ] **Data Exposure Stop Rules**
  - Immediate halt at first sign of real user data
  - PII detection and sanitization
  - Credential detection and masking
  - Session token detection and revocation

- [ ] **Ethical Framing Validator**
  - Validate all content for ethical framing
  - Suggest rephrasing for risky language
  - Block unethical requests

#### 5. Three-Tier Ethical Model (Rob's Framework)
**Purpose:** Structure all activities within ethical boundaries

**Requirements:**
- [ ] **Tier 1: Simulated Learning**
  - Fully simulated environment
  - No external targets
  - Zero risk
  - Educational focus

- [ ] **Tier 2: Safe Labs & Sandbox**
  - Isolated, controlled environments
  - Intentionally vulnerable targets
  - Low risk with monitoring
  - Proof-of-concept focus

- [ ] **Tier 3: Authorized Programs**
  - Real-world but authorized targets
  - In-scope validation
  - Managed risk
  - Responsible disclosure focus

- [ ] **Tier Classification**
  - Automatic classification of user requests
  - Clear boundaries between tiers
  - Progression gates between tiers

---

## 📊 Functional Specifications

### Identity Layer Spec

#### Persona Definition
```yaml
identity:
  name: Athelgard
  role: Ethical bounty-hunting guide
  values:
    - Trust
    - Clarity
    - Ethics
    - Coherence
  pedagogy: Socratic, patient, step-by-step
  voice:
    default: Warm, adaptive
    builder: Crisp, technical, precise
    gamemaster: Deliberate, world-aware
    operator: Precise, cautious
    audit: Blunt, diagnostic
```

#### Memory System
```yaml
memory:
  short_term:
    type: Session-based
    retention: 24 hours
    storage: Encrypted, in-memory
    scope: Current conversation context
  long_term:
    type: Persistent
    retention: Indefinite (user-controlled)
    storage: Supabase (encrypted)
    scope: User progress, preferences, history
  cross_surface:
    enabled: true
    sync: Real-time
    surfaces: [CLI, Web, Phone, Mobile]
```

### Mode System Spec

#### Mode Detection Algorithm
```
1. Analyze user intent from query
2. Check current surface (CLI, Web, Phone, Mobile)
3. Review user history and context
4. Determine primary task type
5. Select appropriate mode
6. Apply mode-specific behavior rules
```

#### Mode Transition Rules
- Guide → Gamemaster: When user asks about mission design
- Guide → Builder: When user asks about code changes
- Builder → Operator: When user asks about services
- Any → Audit: When user asks for review/critique
- Phone → Web/Mobile: When visuals or code are needed

### Safety Layer Spec

#### Scope Classification
```javascript
function classifyScope(target, user) {
  // 1. Check if BountyWarz simulation
  if (isBountyWarzTarget(target)) {
    return { tier: 1, status: 'SIMULATION', risk: 'NONE' };
  }
  
  // 2. Check if known safe lab
  if (isSafeLab(target)) {
    return { tier: 2, status: 'SAFE_LAB', risk: 'LOW' };
  }
  
  // 3. Check if authorized program target
  if (await isAuthorizedTarget(target, user)) {
    return { tier: 3, status: 'AUTHORIZED', risk: 'MANAGED' };
  }
  
  // 4. Default: BLOCKED
  return { tier: 0, status: 'UNAUTHORIZED', risk: 'HIGH', action: 'BLOCK' };
}
```

#### Action Policy Matrix

| Action | Tier 1 | Tier 2 | Tier 3 | Tier 0 |
|--------|--------|--------|--------|--------|
| Scan/Recon | ✅ Allow | ✅ Allow | ✅ Allow | ❌ Block |
| Exploit | ✅ Simulated | ✅ Safe | ✅ In-scope | ❌ Block |
| Data Access | ❌ Block | ⚠️ Limited | ⚠️ Minimal | ❌ Block |
| Persistence | ❌ Block | ❌ Block | ⚠️ Limited | ❌ Block |
| DoS | ❌ Block | ❌ Block | ❌ Block | ❌ Block |
| Report Writing | ✅ Encourage | ✅ Encourage | ✅ Required | ✅ Encourage |

---

## 📈 Non-Functional Requirements

### Performance
- Mode detection: <100ms
- Scope classification: <200ms
- Memory retrieval: <50ms
- Context synchronization: <100ms

### Security
- All user data encrypted at rest and in transit
- No storage of real user credentials
- Automatic sanitization of sensitive data
- Regular security audits

### Scalability
- Support 10,000+ concurrent users
- Horizontal scaling for memory system
- Cache frequently accessed domain knowledge
- Efficient mode detection algorithms

### Reliability
- 99.9% uptime for core services
- Graceful degradation on failures
- Automatic failover for memory system
- Comprehensive logging and monitoring

---

## 🎯 Success Metrics

### Core Metrics
- **Identity Consistency:** >95% of users rate Athelgard as "consistent" across surfaces
- **Memory Accuracy:** >99% accuracy in context retrieval
- **Mode Detection:** >90% accuracy in automatic mode selection
- **Safety Enforcement:** 0 ethical boundary violations
- **Response Time:** <500ms for 95% of requests

### User Metrics
- **Cross-Surface Usage:** >40% of users use 2+ surfaces
- **Context Continuity:** >80% of users report seamless transitions
- **Ethical Understanding:** >90% can explain safe harbor principles

---

## 🔗 Dependencies

### Internal Dependencies
- [Athelgard System Architecture](canvas) - Four-layer model
- [Athelgard Ethical Blueprint](canvas) - Safety layer definition
- [Athelgard Master Spec](canvas) - Production-ready spec

### External Dependencies
- Supabase - User memory storage
- GitHub API - Code repository access (for Builder surface)
- Twilio API - Phone integration (for Voice surface)

---

## 📅 Timeline & Milestones

### Phase 1: Foundation (Weeks 1-4)
- [ ] Identity Layer v1
- [ ] World Model v1
- [ ] Mode System v1
- [ ] Safety Layer v1
- [ ] Three-Tier Model Implementation

### Phase 2: Refinement (Weeks 5-8)
- [ ] Memory System v2 (persistent storage)
- [ ] Mode Detection Improvements
- [ ] Safety Layer Enhancements
- [ ] Performance Optimization

### Phase 3: Scale (Weeks 9-12)
- [ ] Horizontal Scaling
- [ ] Advanced Context Synchronization
- [ ] Enhanced Security

---

## ❓ Open Questions

1. **Memory Storage:** Should we use Supabase for all memory or separate short-term/long-term?
2. **Mode Override:** Should users be able to explicitly request a mode?
3. **Context Retention:** How long should we retain conversation context?
4. **Data Encryption:** What encryption standards should we use for user data?

---

## ✅ Approval

This PRD synthesizes contributions from:
- Rob CranmerBrown/Kiran Wolfe (Ethical framework, three-tier model)
- Devins (Three-stack architecture, mode contract)
- Meli (Prompt stack, voice rules, mode switching)
- Kimiclaw (Domain dictionary, safety constraints)
- Nyx-grok (Service integration specs)
- Nyx-ninja (Output contracts, discipline)

---

*Part of the [Athelgard PRD Set](canvas). See the full set for all product requirements.*