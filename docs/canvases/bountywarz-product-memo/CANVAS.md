---
name: "bountywarz-product-memo"
title: "BountyWarz Product Memo - Fly First, Explain Second"
type: "text/markdown"
---

# BountyWarz Product Memo
## Core Philosophy: Fly First, Explain Second

Date: August 5, 2026, Author: UX Synthesis, Status: Active, Priority: P0 - Core Experience

---

## The Problem One Sentence

The product is selling instant browser gameplay while presenting account recovery mechanics too early.

---

## Executive Summary

BountyWarz has a strong core product: browser-native drone recon gameplay with real CVE challenges and certification-aligned skill cards. The gameplay loop fly -> hack -> answer -> earn is compelling and unique.

However, the entry funnel is broken. New users encounter account recovery mechanics before experiencing the games value. This creates friction, confusion, and trust issues that prevent conversion.

The Solution: Let people fly first. Explain identity second.

---

## Current State: Whats Broken

Critical Trust Killers:
Issue: Pre-visible Invalid captain name or recovery key, Impact: Creates immediate distrust, Severity: P0
Issue: Login form above the fold, Impact: Confuses new users, Severity: P0
Issue: Recovery key terminology before explanation, Impact: Sounds like advanced admin, Severity: P0

Flow Fractures:
Issue: Primary CTA, Current: Mixed messages, Ideal: Single clear action
Issue: Guest access, Current: Unclear, Ideal: Explicit Play as Guest
Issue: Account creation, Current: Required upfront, Ideal: Deferred until value felt
Issue: First mission, Current: Multiple clicks away, Ideal: One click

The Emotional Journey Current:
User arrives -> Free browser game! -> Fly your first mission! -> Sees login form with ERROR -> Captain name? -> Recovery key? -> Something's broken -> BOUNCE

---

## Desired State: Smooth Gameplay, No Clutter

The Emotional Journey Ideal:
User arrives -> Free browser game! -> Play First Mission -> In game within 3 seconds -> Experiences core loop -> This is cool! -> Save my progress? -> Creates captain -> Continues playing

Core Principle: Defer friction until after the first win.

Every element on the homepage should answer one question: What do I click to try this?

---

## The Funnel Simplified

flowchart TD
    A[Landing Page] --> B{Primary Choice}
    B -->|🎮| C[Guest Mission]
    B -->|👤| D[Create Captain]
    C --> E[First Mission]
    D --> E[First Mission]
    E --> F[Core Loop: Fly -> Hack -> Answer -> Earn]
    F --> G{Earned First Card?}
    G -->|Yes| H{Guest or Captain?}
    H -->|Guest| I[Prompt: Save Progress?]
    H -->|Captain| J[Continue Progression]
    I -->|Yes| D
    I -->|No| K[Exit - No Loss]

Key Funnel Metrics Targets:
Metric: Time to first click, Current: 10-15 sec, Target: <3 sec, Improvement: 75% faster
Metric: Time to first mission, Current: 30-60 sec, Target: <5 sec, Improvement: 90% faster
Metric: Guest-to-captain conversion, Current: Low, Target: 30-40%, Improvement: 3-4x increase
Metric: Bounce rate, Current: High, Target: <40%, Improvement: Significant drop

---

## Homepage Structure New

Above the Fold Hero Section:
Fly recon drones over real London. Breach live targets. Earn certification skills.
[🎮 PLAY FIRST MISSION Guest - No Signup] [👤 CREATE CAPTAIN Save Progress]
Free · Browser-native · No install · No crypto

Secondary Section How It Works:
Guest Mode: Instant trial, no saved progress
Captain Mode: Keeps nation, cards, and progression
Recovery Key: Only needed to restore your captain later

Below the Fold: Nations, Skill cards, Lore, Athelgard mentor explanation, Login for returning players

---

## Copy Changes Exact

Homepage Hero:
Before: Hi — I'm Athelgard, your mentor and guide here. In BountyWarz you fly recon drones over a real map of London and build genuine cybersecurity skills as you go. Give me a minute to ask a few quick questions, and I'll set everything up around what you want to learn. Skip the talk — fly now ->
After: Fly recon drones over real London. Breach live targets. Earn certification skills.
[🎮 PLAY FIRST MISSION] [👤 CREATE CAPTAIN]
Free · Browser-native · No install · No crypto

Login Section:
Before: CAPTAIN LOGIN, Enter your captain name and recovery key, [Captain Name] [Recovery Key] [Login], Invalid captain name or recovery key!, New Captain? Create account ->
After: RETURN TO YOUR CAPTAIN, Continue your hunt with your existing identity, [Username] [Password], [Login], New to BountyWarz? [Play as Guest] or [Create Captain]

Captain Creation:
Before: ACCESS GRANTED, ⚠ SAVE YOUR RECOVERY KEY, This is your only way to log back in. Screenshot it, copy it, or write it down now.
After: WELCOME CAPTAIN, 🔑 Your Captain Key, Save this to return to your identity on any device: [BRAVO42], [Copy to Clipboard] [I've Saved It], You'll earn skill cards as you play. These represent real cybersecurity knowledge!

Recovery Key Explanation:
Before: None
After: Your captain key saves access to this identity. Think of it like a portable backup code. You only need it to return to your captain on another device. If you lose it, you cannot recover your progress.

---

## UI Components New

Primary CTA Buttons CSS:
.cta-primary { background: linear-gradient(135deg, #00ff88, #00cc6a); color: #000; font-weight: 700; padding: 18px 40px; border-radius: 12px; font-size: 1.2rem; }
.cta-secondary { background: transparent; color: #00ff88; border: 2px solid #00ff88; }

Guest Mission Modal:
Ready to Fly? Start a guest mission to try the game immediately. Your progress wont be saved, but youll experience the full gameplay. [Start Guest Mission] [Create Captain to Save Progress]

Post-Mission Save Prompt:
Mission Complete! You earned: [Skill Card Name]. Create a captain to save your progress and continue your hunt! [Create Captain 2 min] [Continue as Guest]

---

## Implementation Priority

Week 1: Critical Fixes P0
1. Remove pre-visible error message - Immediate trust repair - 5 min
2. Separate guest play from captain login - Removes first-session confusion - 2 hrs
3. Move login below primary CTAs - Keeps first screen action-oriented - 1 hr
4. Deploy demo page - Enables frictionless trial - 2 hrs

Week 2: Clarity Improvements P1
5. Explain recovery key in one sentence - Reduces auth fear - 30 min
6. Make first mission one click - Aligns with promise - 1 hr
7. Add save progress after mission prompt - Defers friction - 1 hr
8. Clarify guest vs captain paths - Prevents ambiguity - 30 min

Week 3: Polish P2
9. Add tooltips for unclear terms - Improves comprehension - 1 hr
10. Rename recovery key to captain key - Better terminology - 30 min
11. Add progress indicators - Improves UX - 1 hr
12. A/B test CTAs - Optimize conversion - 2 hrs

---

## Success Metrics

Quantitative:
- Time to first mission: <5 seconds from landing
- Guest-to-captain conversion: 30-40%
- Bounce rate: <40%
- First mission completion rate: >60%
- Session duration: >3 minutes

Qualitative:
- Users can describe the core gameplay loop after first session
- Users understand the difference between guest and captain modes
- Users feel confident about the recovery key system
- No users report confusion about what to click first

---

## Key Insights

1. The Recovery Key Problem: Current terminology is problematic. Solution: Rename to Captain Key and explain upfront: Your captain key is your password. Save it to return on any device.

2. The Athelgard Dilemma: Introducing a mentor before the game creates friction. Solution: Move Athelgard to post-first-mission onboarding.

3. The Lore Trap: 18 nations and backstory are compelling but add cognitive load. Solution: Move all lore below the fold or into the game itself.

---

## Launch Checklist

- Pre-visible error message removed from homepage
- Login form moved below primary CTAs
- Play First Mission button added and functional
- Demo/guest mission page deployed
- Captain creation flow simplified
- Recovery key explanation added
- Post-mission save prompt implemented
- Copy updates deployed
- Mobile responsiveness verified
- Cross-browser testing complete

---

## Support & Questions

For implementation questions: See technical canvases - BountyWarz UX Upgrades Implementation Guide, BountyWarz Demo Page Ready to Use, BountyWarz Homepage Fix Quick Implementation
For design decisions: Refer to this memo
For urgent issues: Contact the UX team

---

## The North Star

Let people fly first. Explain identity second.

Every decision should be measured against this principle. If it adds friction before the first win, reconsider it. If it helps users experience the core gameplay faster, prioritize it.

The goal is smooth gameplay with no clutter—a seamless, frictionless path from curiosity to first win.