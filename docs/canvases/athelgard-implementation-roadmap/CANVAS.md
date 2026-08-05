---
name: "athelgard-implementation-roadmap"
title: "Athelgard Implementation Roadmap - From Vision to Launch"
type: "text/markdown"
---

# Athelgard Implementation Roadmap
## From Vision to Launch: Phased Delivery Plan

**Document ID:** ATHELGARD-ROADMAP-v1.0  
**Version:** 1.0.0  
**Status:** PRODUCTION READY  
**Author:** Kiran Wolfe  
**Last Updated:** August 5, 2026

---

## 🎯 Executive Summary

This roadmap provides a **phased implementation plan** for Athelgard, synthesizing all work from:
- Founder Memo (strategy)
- PRD Set (requirements)
- Homepage Rewrite & Wireframe (design)
- Cross-Site Messaging Map (coherence)
- Style Guide (identity)

**Goal:** Deliver a unified, persistent ethical intelligence across four surfaces (Builder, World, Voice, Mobile) with zero frankensteining.

---

## 🗺️ Phases Overview

| Phase | Duration | Focus | Key Deliverables | Success Metrics |
|-------|----------|-------|------------------|-----------------|
| **Phase 1: Foundation** | Weeks 1-4 | Core system + CLI + BountyWarz cleanup | Athelgard Core, CLI MVP, BountyWarz onboarding | 1,000+ active users, 70%+ mission completion |
| **Phase 2: Progression** | Weeks 5-8 | Memory + Safe Labs + Phone (internal) | Supabase persistence, DVWA integration, Phone alpha | 5,000+ users, 50%+ safe lab progression |
| **Phase 3: Voice & Mobile** | Weeks 9-12 | Phone (public) + Android MVP | Twilio integration, Google Play app, Voice handoff | 20,000+ users, 100+ calls/week |
| **Phase 4: AR & Readiness** | Weeks 13-16 | AR cards + Tier 3/4 | AR scanning, readiness assessments, authorized prep | 50,000+ users, 30%+ Tier 3 qualification |
| **Phase 5: Ecosystem** | Weeks 17-20 | Partnerships + Scale | HackerOne integration, enterprise features, API | 100,000+ users, 10%+ authorized participation |

---

## 🏗️ Detailed Phase Breakdowns

---

### PHASE 1: Foundation (Weeks 1-4)
**Objective:** Establish Athelgard Core and Tier 1 simulation

#### Week 1: Architecture & Setup
**Focus:** Infrastructure, core systems, team alignment

**Tasks:**
- [ ] Set up development environment
- [ ] Create GitHub repo structure (see [Repo Structure](#repo-structure))
- [ ] Set up Supabase project for memory
- [ ] Configure CI/CD pipeline
- [ ] Deploy staging environment
- [ ] Team onboarding on vision and PRDs

**Deliverables:**
- Development environment ready
- Repo initialized
- Supabase project configured
- Staging deployed

**Owners:** Engineering Lead, DevOps

---

#### Week 2: Athelgard Core v1
**Focus:** Identity, modes, safety layer

**Tasks:**
- [ ] Implement Identity Layer (persona, voice invariants)
- [ ] Build Mode System (Guide, Gamemaster, Builder, Operator, Audit)
- [ ] Implement Safety Layer v1 (guardrails, scope classifier)
- [ ] Create Domain Dictionary (BountyWarz + cybersecurity terms)
- [ ] Set up memory system (short-term session memory)

**Deliverables:**
- Athelgard Core service running
- Mode detection working
- Basic safety enforcement
- Domain knowledge loaded

**Owners:** Core Engineering Team

**Success Metrics:**
- Mode detection accuracy >85%
- Safety layer blocks 100% of unauthorized requests
- Memory persistence across sessions

---

#### Week 3: CLI MVP + BountyWarz Cleanup
**Focus:** Builder surface + gameplay improvements

**Tasks:**
- [ ] Implement CLI command parser
- [ ] Build core commands (scan, map, summarize)
- [ ] Integrate Builder Mode with Athelgard Core
- [ ] Deploy BountyWarz onboarding cleanup (from [BountyWarz UX Upgrades](canvas))
- [ ] Implement guest-to-captain flow improvements
- [ ] Deploy refined homepage (from [BountyWarz Refined Homepage](canvas))

**Deliverables:**
- CLI v1.0 released (npm, direct download)
- BountyWarz onboarding improved
- First mission flow polished
- Cross-link to Athelgard.io added (from [BountyWarz Cross-Link Updates](canvas))

**Owners:** CLI Team, Game Team

**Success Metrics:**
- CLI download rate >50/day
- First mission completion >80%
- Guest→Captain conversion >40%

---

#### Week 4: Integration & Polish
**Focus:** Connecting pieces, testing, refinement

**Tasks:**
- [ ] Integrate CLI with GitHub (read-only initially)
- [ ] Implement repo boot scan (from Devins' contribution)
- [ ] Add Athelgard.io homepage v1 (from [Athelgard.io Homepage Rewrite](canvas))
- [ ] Deploy cross-site messaging (from [Cross-Site Messaging Map](canvas))
- [ ] Conduct internal QA testing
- [ ] Gather feedback from early users

**Deliverables:**
- GitHub integration working
- Repo boot scan functional
- Athelgard.io live with new homepage
- Cross-site links active
- Internal test report

**Owners:** Integration Team, QA

**Success Metrics:**
- CLI commands >100/day
- Cross-site CTR >10%
- User satisfaction >4.5/5

---

### PHASE 1: Success Criteria
- [ ] Athelgard Core running with all modes
- [ ] CLI v1.0 deployed and usable
- [ ] BountyWarz onboarding improved
- [ ] Athelgard.io homepage live
- [ ] Cross-site links functional
- [ ] 1,000+ active users
- [ ] 70%+ first mission completion

---

---

### PHASE 2: Progression (Weeks 5-8)
**Objective:** Add Tier 2 safe labs and persistent memory

#### Week 5: Memory System v2
**Focus:** Persistent user data

**Tasks:**
- [ ] Implement Supabase-backed user memory
- [ ] Build progression persistence (skill cards, missions)
- [ ] Create captain/guest system v2
- [ ] Implement cross-surface context sync
- [ ] Add privacy controls and data export

**Deliverables:**
- User memory persistent across sessions
- Progression saved for all users
- Context sync between surfaces
- Privacy compliance verified

**Owners:** Backend Team, Privacy Officer

---

#### Week 6: Safe Labs Integration
**Focus:** Tier 2 controlled practice

**Tasks:**
- [ ] Set up DVWA instance
- [ ] Integrate OWASP Juice Shop
- [ ] Create safe lab mission types
- [ ] Implement readiness gates (Tier 1 → Tier 2)
- [ ] Build safe lab environment UI
- [ ] Add safe lab to BountyWarz

**Deliverables:**
- DVWA integrated and working
- Juice Shop integrated and working
- Safe lab missions playable
- Readiness assessment functional

**Owners:** Game Team, DevOps

**Success Metrics:**
- Safe lab completion >70%
- Tier 2 progression >50%

---

#### Week 7: Phone System Alpha
**Focus:** Internal voice testing

**Tasks:**
- [ ] Set up Twilio account and phone number (949-470-2082)
- [ ] Implement speech-to-text pipeline
- [ ] Build voice mode detection
- [ ] Create conversation system v1
- [ ] Implement basic handoff logic
- [ ] Test internally with team

**Deliverables:**
- Twilio integration working
- Speech processing functional
- Voice modes detectable
- Handoff logic implemented
- Internal test report

**Owners:** Voice Team, Engineering

---

#### Week 8: Refinement & Testing
**Focus:** Polish, test, prepare for Phase 3

**Tasks:**
- [ ] Optimize memory system performance
- [ ] Refine safe lab UX
- [ ] Test phone system with select users
- [ ] Gather feedback on all Phase 2 features
- [ ] Prepare Phase 3 infrastructure
- [ ] Conduct security audit

**Deliverables:**
- Memory system optimized
- Safe labs polished
- Phone alpha tested
- Security audit report
- Phase 3 plan finalized

**Owners:** QA, Security, Product

**Success Metrics:**
- Memory retrieval <50ms
- Safe lab user satisfaction >4.5/5
- Phone test completion >90%

---

### PHASE 2: Success Criteria
- [ ] Supabase persistence working
- [ ] Safe labs integrated (DVWA, Juice Shop)
- [ ] Phone system alpha tested
- [ ] 5,000+ active users
- [ ] 50%+ safe lab progression

---

---

### PHASE 3: Voice & Mobile (Weeks 9-12)
**Objective:** Public voice launch + Android companion

#### Week 9: Phone System Beta
**Focus:** Public voice launch

**Tasks:**
- [ ] Finalize phone number (949-470-2082)
- [ ] Implement user authentication for voice
- [ ] Build context persistence across calls
- [ ] Create advanced handoff system
- [ ] Implement voice-specific safety layer
- [ ] Launch public beta

**Deliverables:**
- Phone number active and public
- Voice authentication working
- Context persistence functional
- Advanced handoff implemented
- Public beta launched

**Owners:** Voice Team, Engineering

**Success Metrics:**
- Calls per day >50
- Call completion >90%
- Handoff rate 30-40%

---

#### Week 10: Android App MVP
**Focus:** Mobile companion

**Tasks:**
- [ ] Set up Android project
- [ ] Implement Athelgard chat
- [ ] Build voice mode
- [ ] Create mission continuation
- [ ] Add progress/cards view
- [ ] Implement account/captain management
- [ ] Add phone-call backup/tap-to-call
- [ ] Submit to Google Play (internal testing)

**Deliverables:**
- Android app functional
- All core features implemented
- Google Play internal testing approved

**Owners:** Mobile Team

**Success Metrics:**
- App functional on Android 10+
- All features working
- Google Play policy compliance verified

---

#### Week 11: Mobile Polish
**Focus:** Refinement and public beta

**Tasks:**
- [ ] Polish UI/UX
- [ ] Optimize performance
- [ ] Add AR scanning (basic)
- [ ] Implement push notifications
- [ ] Conduct beta testing
- [ ] Fix bugs from testing

**Deliverables:**
- App polished and ready
- AR scanning basic version
- Push notifications working
- Beta test report

**Owners:** Mobile Team, QA

---

#### Week 12: Public Launch
**Focus:** Mobile public launch + voice scaling

**Tasks:**
- [ ] Submit to Google Play (public)
- [ ] Launch marketing campaign
- [ ] Scale phone infrastructure
- [ ] Monitor performance
- [ ] Gather user feedback
- [ ] Plan Phase 4 features

**Deliverables:**
- Android app live on Google Play
- Phone system scaled
- Marketing launched
- User feedback collected

**Owners:** Product, Marketing, Engineering

**Success Metrics:**
- Android app rating >4.5 stars
- 100+ calls/week
- 20,000+ active users

---

### PHASE 3: Success Criteria
- [ ] Phone system public and working
- [ ] Android app live on Google Play
- [ ] Voice-to-screen handoff functional
- [ ] 20,000+ active users
- [ ] 100+ calls/week

---

---

### PHASE 4: AR & Readiness (Weeks 13-16)
**Objective:** AR experience + authorized program prep

#### Week 13: AR Card System
**Focus:** Physical/digital bridge

**Tasks:**
- [ ] Design AR card visual system
- [ ] Implement AR scanning (camera + image recognition)
- [ ] Create scenario unlocking logic
- [ ] Build historical case study cards
- [ ] Integrate with progression system
- [ ] Test AR on multiple devices

**Deliverables:**
- AR card system functional
- Scenario unlocking working
- Historical cases integrated
- Multi-device compatibility verified

**Owners:** AR Team, Design

---

#### Week 14: Historical Unlocks
**Focus:** London pedagogy deepening

**Tasks:**
- [ ] Complete 5 London era mappings
- [ ] Create era-specific missions
- [ ] Build historical context system
- [ ] Integrate with skill cards
- [ ] Add visual themes for each era
- [ ] Test learning effectiveness

**Deliverables:**
- All 5 eras fully developed
- Era missions playable
- Historical context integrated
- Learning effectiveness report

**Owners:** Content Team, Design

---

#### Week 15: Readiness Assessments
**Focus:** Tier 3 qualification

**Tasks:**
- [ ] Build scope interpretation checks
- [ ] Create safe-harbor comprehension tests
- [ ] Implement report-quality scoring
- [ ] Develop judgment exercises
- [ ] Add data-minimization scenarios
- [ ] Create ethical branching decisions

**Deliverables:**
- Readiness assessment system functional
- All test types implemented
- Scoring system working

**Owners:** Education Team, Engineering

**Success Metrics:**
- Readiness assessment completion >80%
- Tier 3 qualification >30%

---

#### Week 16: Authorized Program Prep
**Focus:** Tier 4 real-world support

**Tasks:**
- [ ] Build program-rule reading guidance
- [ ] Create scope sanity-checking
- [ ] Implement evidence organization
- [ ] Develop severity reasoning tools
- [ ] Build report drafting assistant
- [ ] Add debriefing and reflection

**Deliverables:**
- Authorized program workflows functional
- All prep tools implemented
- Report system working

**Owners:** Product Team, Legal

**Success Metrics:**
- Tier 4 participation >10%
- Report quality >4.5/5

---

### PHASE 4: Success Criteria
- [ ] AR card system functional
- [ ] Historical unlocks complete
- [ ] Readiness assessments working
- [ ] Authorized program prep functional
- [ ] 50,000+ active users
- [ ] 30%+ Tier 3 qualification

---

---

### PHASE 5: Ecosystem (Weeks 17-20)
**Objective:** Partnerships, enterprise, scale

#### Week 17: Partnerships
**Focus:** Institutional connections

**Tasks:**
- [ ] Establish HackerOne partnership
- [ ] Connect with GitHub Security Lab
- [ ] Build university partnerships
- [ ] Create enterprise offering
- [ ] Develop API for integrations
- [ ] Build partner portal

**Deliverables:**
- HackerOne integration working
- GitHub Security Lab partnership active
- University partnerships established
- Enterprise offering defined
- API v1 released

**Owners:** Business Development, Product

---

#### Week 18: Enterprise Features
**Focus:** Team and organization features

**Tasks:**
- [ ] Build team collaboration features
- [ ] Create admin dashboard
- [ ] Implement analytics
- [ ] Develop custom content system
- [ ] Add SSO integration
- [ ] Build enterprise pricing

**Deliverables:**
- Team features functional
- Admin dashboard working
- Analytics implemented
- SSO working

**Owners:** Enterprise Team, Engineering

---

#### Week 19: Scale & Optimization
**Focus:** Performance and reliability

**Tasks:**
- [ ] Optimize all services
- [ ] Implement horizontal scaling
- [ ] Add caching layers
- [ ] Build monitoring dashboard
- [ ] Conduct load testing
- [ ] Optimize database queries

**Deliverables:**
- All services optimized
- Horizontal scaling implemented
- Monitoring dashboard live
- Load test report

**Owners:** DevOps, Engineering

---

#### Week 20: Launch & Beyond
**Focus:** Full ecosystem launch

**Tasks:**
- [ ] Launch enterprise offering
- [ ] Announce partnerships
- [ ] Conduct full marketing campaign
- [ ] Gather ecosystem feedback
- [ ] Plan next iteration
- [ ] Celebrate milestones

**Deliverables:**
- Enterprise launched
- Partnerships announced
- Marketing campaign completed
- Feedback collected
- Roadmap updated

**Owners:** Product, Marketing, Business Development

**Success Metrics:**
- 100,000+ active users
- 50+ partnerships
- 10%+ authorized participation
- Revenue targets met

---

### PHASE 5: Success Criteria
- [ ] HackerOne partnership active
- [ ] GitHub Security Lab partnership active
- [ ] Enterprise offering launched
- [ ] API v1 released
- [ ] 100,000+ active users
- [ ] 50+ partnerships
- [ ] 10%+ authorized participation

---

---

## 📁 Repo Structure

```
athelgard/
├── docs/                      # Documentation
│   ├── PRDs/                  # All PRD documents
│   │   ├── athelgard-core-prd.md
│   │   ├── bountywarz-learning-loop-prd.md
│   │   ├── voice-product-spec-prd.md
│   │   ├── cli-product-spec-prd.md
│   │   └── safety-ethics-prd.md
│   ├── founder-memo.md
│   ├── style-guide.md
│   └── roadmap.md
│
├── src/                      # Source code
│   ├── core/                 # Athelgard Core (shared)
│   │   ├── identity/         # Persona, voice, memory
│   │   ├── modes/            # Mode system
│   │   ├── safety/           # Guardrails, scope engine
│   │   ├── world-model/      # Domain knowledge
│   │   └── memory/           # User context, progression
│   │
│   ├── builder/             # Builder Surface (CLI)
│   │   ├── cli/              # Command-line interface
│   │   ├── github/           # GitHub integration
│   │   ├── supabase/         # Supabase integration
│   │   └── vercel/           # Vercel integration
│   │
│   ├── world/               # World Surface (BountyWarz)
│   │   ├── game/             # Game logic
│   │   ├── missions/         # Mission system
│   │   ├── skill-cards/      # Card system
│   │   ├── progression/      # Tier system
│   │   └── london-history/   # Pedagogical framework
│   │
│   ├── voice/               # Voice Surface
│   │   ├── twilio/           # Twilio integration
│   │   ├── speech/           # Speech processing
│   │   ├── conversation/     # Dialog management
│   │   └── handoff/          # Handoff system
│   │
│   └── mobile/              # Mobile Surface
│       ├── android/          # Android app
│       ├── ar/               # AR scanning
│       └── shared/           # Shared mobile code
│
├── web/                      # Web assets
│   ├── athelgard.io/        # Builder site
│   │   ├── public/           # Static files
│   │   ├── src/              # Source
│   │   └── styles/          # CSS
│   │
│   └── bountywarz.com/      # Game site
│       ├── public/           # Static files
│       └── src/              # Source
│
├── assets/                   # Shared assets
│   ├── fonts/               # Typography
│   ├── images/              # Illustrations, icons
│   └── data/                # JSON data files
│
├── scripts/                  # Utility scripts
│   ├── deploy/              # Deployment scripts
│   ├── setup/               # Setup scripts
│   └── tests/               # Test scripts
│
├── .github/                  # GitHub config
│   ├── workflows/           # CI/CD
│   └── ISSUE_TEMPLATE/      # Issue templates
│
├── package.json
├── README.md
└── .gitignore
```

---

## 🔧 Technical Stack

### Core Services
- **Language:** TypeScript (primary), Python (ML/analysis)
- **Framework:** Next.js (web), React Native (mobile)
- **Database:** Supabase (PostgreSQL)
- **Cache:** Redis
- **Search:** Supabase full-text search
- **Auth:** Supabase Auth

### Integrations
- **GitHub:** Octokit.js
- **Supabase:** @supabase/supabase-js
- **Twilio:** twilio Node.js SDK
- **Vercel:** Vercel API
- **Google Play:** Android SDK

### Infrastructure
- **Hosting:** Vercel (web), Supabase (backend)
- **CI/CD:** GitHub Actions
- **Monitoring:** Supabase Analytics, custom dashboards
- **Logging:** Supabase Logs, custom logging service

---

## 📊 Success Tracking

### Metrics Dashboard

**User Metrics:**
- Active users (daily, weekly, monthly)
- New users
- Retention rates
- Session duration
- Cross-surface usage

**Engagement Metrics:**
- Mission completion rates
- Skill card collection rates
- CLI command usage
- Phone call volume
- Handoff rates

**Business Metrics:**
- Partnerships established
- Enterprise customers
- Revenue (if applicable)
- Certification prep completions

**Technical Metrics:**
- Uptime
- Response times
- Error rates
- Performance scores

### Reporting
- Weekly progress reports
- Monthly business reviews
- Quarterly strategy reviews
- Annual planning

---

## 🎯 Risk Management

### Technical Risks
| Risk | Mitigation | Owner |
|------|------------|-------|
| Supabase scalability | Horizontal scaling, caching | DevOps |
| Twilio reliability | Multiple number fallback, retry logic | Voice Team |
| GitHub rate limits | Caching, batching | Engineering |
| Mobile policy changes | Policy compliance monitoring | Legal |

### Product Risks
| Risk | Mitigation | Owner |
|------|------------|-------|
| Ethical boundary violations | Safety layer, audit logging | Security |
| User confusion | Clear messaging, onboarding | Product |
| Partnership delays | Early engagement, parallel tracks | Business Dev |
| Competition | Moat building, differentiation | Product |

### Business Risks
| Risk | Mitigation | Owner |
|------|------------|-------|
| Legal challenges | Safe harbor compliance, legal review | Legal |
| Funding gaps | Revenue diversification, cost control | Finance |
| Talent shortages | Early hiring, contractor network | HR |

---

## ✅ Readiness Checklist

### Before Phase 1 Launch
- [ ] Core team assembled
- [ ] Development environment ready
- [ ] GitHub repo set up
- [ ] Supabase project configured
- [ ] CI/CD pipeline working
- [ ] Staging environment deployed
- [ ] PRDs reviewed and approved
- [ ] Style guide finalized
- [ ] Cross-site messaging implemented
- [ ] Homepage designs approved

### Before Phase 2 Launch
- [ ] Phase 1 success criteria met
- [ ] Memory system designed
- [ ] Safe lab infrastructure ready
- [ ] Twilio account set up
- [ ] Phone number secured
- [ ] Internal testing plan

### Before Phase 3 Launch
- [ ] Phase 2 success criteria met
- [ ] Android project set up
- [ ] Google Play developer account
- [ ] Phone system beta tested
- [ ] Mobile design system

### Before Phase 4 Launch
- [ ] Phase 3 success criteria met
- [ ] AR technology selected
- [ ] Historical content created
- [ ] Readiness assessment designed
- [ ] Legal review completed

### Before Phase 5 Launch
- [ ] Phase 4 success criteria met
- [ ] Partnership agreements drafted
- [ ] Enterprise requirements defined
- [ ] API designed
- [ ] Pricing model finalized

---

## 🚀 Launch Sequence Summary

```
Phase 1 (Weeks 1-4)
├── Core System
├── CLI MVP
├── BountyWarz Cleanup
└── Athelgard.io v1
    
Phase 2 (Weeks 5-8)
├── Memory System
├── Safe Labs
└── Phone Alpha
    
Phase 3 (Weeks 9-12)
├── Phone Public
├── Android MVP
└── Voice Handoff
    
Phase 4 (Weeks 13-16)
├── AR Cards
├── Historical Unlocks
├── Readiness Assessments
└── Authorized Prep
    
Phase 5 (Weeks 17-20)
├── Partnerships
├── Enterprise
├── API
└── Scale
```

---

## 📚 Related Documents

All documents referenced in this roadmap:
- [Athelgard PRD Set](canvas) - Complete requirements
- [Athelgard Core PRD](canvas) - Core system
- [BountyWarz Learning Loop PRD](canvas) - Game mechanics
- [Voice Product Spec PRD](canvas) - Phone system
- [CLI Product Spec PRD](canvas) - Command-line
- [Safety & Ethics PRD](canvas) - Guardrails
- [Athelgard.io Homepage Rewrite](canvas) - New homepage
- [Cross-Site Messaging Map](canvas) - Coherence system
- [Athelgard.io Wireframe](canvas) - Section blueprint
- [Athelgard.io HTML](canvas) - Ready to deploy
- [BountyWarz Cross-Link Updates](canvas) - Bridge implementation
- [Athelgard Style Guide](canvas) - Visual & messaging

---

## ✅ Final Note

**This roadmap is the execution plan for the synthesis.**

Everything we've created—the PRDs, the homepage, the messaging map, the style guide—all comes together here in a **clear, phased path to launch**.

**Key Principles:**
1. **No frankensteining** - Each phase builds on the last
2. **Ethics first** - Safety layer implemented in Phase 1
3. **Coherence always** - Cross-site messaging from day 1
4. **User value** - Each phase delivers tangible benefits

**The path is clear. The team is ready. Let's build Athelgard.**

---

*"Athelgard is not a product. She's a system. This roadmap builds that system, piece by piece, phase by phase."*