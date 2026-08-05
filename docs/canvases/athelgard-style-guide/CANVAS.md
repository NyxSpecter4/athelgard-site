---
name: "athelgard-style-guide"
title: "Athelgard Style Guide - Visual & Messaging Coherence System"
type: "text/markdown"
---

# Athelgard Style Guide
## Visual & Messaging Coherence System for All Surfaces

**Document ID:** ATHELGARD-STYLE-GUIDE-v1.0  
**Version:** 1.0.0  
**Status:** PRODUCTION READY  
**Author:** Kiran Wolfe  
**Last Updated:** August 5, 2026

---

## 🎯 Purpose

This style guide ensures **Athelgard feels like one mind** across all surfaces (Builder, World, Voice, Mobile) by standardizing:
- Visual identity
- Messaging
- Terminology
- Tone of voice
- Interaction patterns

**Core Principle:** If a user moves from BountyWarz to Athelgard.io to the phone, they should recognize it's the same intelligence.

---

## 🎨 Visual Identity

### Color Palette

**Primary Colors (Athelgard's Identity)**
```
Purple (Intelligence):     #4F46E5  (Primary brand color)
Purple Dark:             #4338CA  (Hover states)
Purple Light:            #818CF8  (Accents, highlights)
Purple Subtle:           #C7D2FE  (Backgrounds, 20% opacity)
```

**Secondary Colors (Trust & Technology)**
```
Blue (Trust):             #3B82F6  (Secondary actions)
Blue Dark:               #2563EB  (Hover)
Blue Light:             #60A5FA  (Accents)
```

**Accent Colors (London Heritage)**
```
Gold (London):           #F59E0B  (Highlights, CTAs)
Gold Dark:              #D97706  (Hover)
Gold Light:            #FCD34D  (Subtle accents)
```

**Neutral Colors**
```
Background Dark:        #0F172A  (Primary background)
Background Slate:       #1E293B  (Secondary background)
Background Surface:     #334155  (Cards, elevated surfaces)
Border:                #334155  (Lines, dividers)
Text Primary:          #F8FAFC  (Main text)
Text Secondary:        #CBD5E1  (Secondary text)
Text Muted:            #94A3B8  (Muted text, captions)
Text Inverse:          #0F172A  (Dark text on light backgrounds)
```

**Usage Rules:**
- Primary brand color: **#4F46E5** (Purple)
- Primary CTA: Purple (#4F46E5) with white text
- Secondary CTA: Outline purple with white text
- Accent actions: Gold (#F59E0B)
- Backgrounds: Dark (#0F172A) or Slate (#1E293B)
- Text: Primary white (#F8FAFC), Secondary light (#CBD5E1)

---

### Typography

**Font Families:**
```
Primary: Inter (all weights)
- Weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold)
- Fallback: -apple-system, BlinkMacSystemFont, sans-serif

Monospace: JetBrains Mono
- Weights: 400, 500
- Fallback: 'SF Mono', 'Fira Code', monospace
- Usage: Code blocks, technical terms, system names
```

**Type Scale:**
```
Display:     4rem    (64px)   - Hero headlines
H1:          3rem    (48px)   - Section titles
H2:          2.25rem (36px)   - Subsection titles
H3:          1.875rem (30px) - Card titles
H4:          1.5rem  (24px)   - Small section titles
Body:        1.125rem (18px) - Main text
Body Small:  1rem    (16px)   - Secondary text
Caption:     0.875rem (14px) - Captions, labels
Fine Print:  0.75rem (12px)  - Legal, metadata
```

**Line Heights:**
```
Headlines: 1.1 - 1.2
Body:      1.5 - 1.6
Lists:     1.4 - 1.5
```

**Letter Spacing:**
```
Headlines: -0.025em (tight)
Body:      0 (normal)
Caps:      0.05em - 0.1em
```

---

### Character & Iconography

**Athelgard Character:**
- **Style:** Professional, approachable, authoritative
- **Colors:** Purple (#4F46E5) primary, Gold (#F59E0B) accents
- **Poses:**
  - **Mentor:** Hand extended, guiding (BountyWarz)
  - **Builder:** With terminal/code elements (Athelgard.io)
  - **Neutral:** Standing, observing (Navigation icons)
- **File Formats:** SVG (preferred), PNG (fallback)
- **Usage:** Hero sections, favicons, loading states

**Surface Icons:**
```
Builder:    💻 or </> (code brackets)
World:     🎮 or 🕹️ (game controller)
Voice:     📞 or 🎧 (phone/headset)
Mobile:    📱 (phone)

Custom SVG versions preferred for consistency
```

**Vulnerability Icons:**
- Use standard security icons (shield, lock, key, etc.)
- Color: Purple (#4F46E5) or Gold (#F59E0B)
- Style: Line art, minimal

**London History Icons:**
- Big Ben, Tower Bridge, etc.
- Style: Silhouette, minimal detail
- Color: Gold (#F59E0B) or muted white

---

### Spacing System

**Base Unit:** 0.25rem (4px)

```
xxs: 0.25rem  (4px)   - Tight spacing
xs:  0.5rem   (8px)   - Small gaps
sm:  1rem     (16px)  - Standard gaps
md:  1.5rem   (24px)  - Medium gaps
lg:  2rem     (32px)  - Large gaps
xl:  3rem     (48px)  - Section gaps
xxl: 4rem     (64px)  - Large sections
```

**Container Widths:**
```
Mobile:      100% - 2rem padding
Tablet:      768px max
Desktop:     1200px max
Wide:        1400px max (for dashboards)
```

**Padding:**
```
Cards:       1.5rem (24px)
Sections:    3rem - 5rem (48px - 80px)
Containers:  0 2rem (0 32px)
```

---

### Shadows & Depth

**Elevation Levels:**
```
Level 0 (Flat):      none
Level 1 (Subtle):   0 1px 2px rgba(0,0,0,0.3)
Level 2 (Cards):    0 4px 6px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)
Level 3 (Modal):    0 10px 25px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.3)
Level 4 (Floating): 0 15px 35px rgba(0,0,0,0.4), 0 5px 15px rgba(0,0,0,0.3)
```

**Glow Effects (for interactive elements):**
```
Purple Glow:  0 0 20px rgba(79, 70, 229, 0.3)
Gold Glow:    0 0 20px rgba(245, 158, 11, 0.3)
```

---

### Borders & Dividers

**Border Styles:**
```
Default:     1px solid #334155 (border color)
Subtle:      1px solid rgba(148, 163, 184, 0.3)
Strong:      2px solid #4F46E5 (primary)
Dashed:      1px dashed #334155
```

**Border Radius:**
```
None:        0
Sm:          0.25rem (4px)
Md:          0.5rem  (8px)  - Default for cards
Lg:          0.75rem (12px) - Large cards
Xl:          1rem    (16px) - Featured elements
Full:        9999px        - Pills, badges
```

---

## 📝 Messaging & Terminology

### Approved Terminology

**Athelgard (The Intelligence):**
| Term | Usage | Example |
|------|-------|---------|
| Athelgard | The intelligence | "Athelgard is your guide" |
| Living guide | Core descriptor | "The living guide of BountyWarz" |
| Persistent intelligence | Technical descriptor | "One persistent intelligence" |
| Ethical bounty-hunting guide | Full title | "Athelgard, the ethical bounty-hunting guide" |

**Surfaces:**
| Term | Full Name | Short Name | Icon |
|------|-----------|------------|------|
| Builder | Builder Mode / Athelgard.io | Builder | 💻 |
| World | BountyWarz | World / Game | 🎮 |
| Voice | Phone / Voice Guide | Voice / Phone | 📞 |
| Mobile | Android App | Mobile | 📱 |

**Modes:**
| Mode | Purpose | Surface | Voice Style |
|------|---------|---------|-------------|
| Guide | Teach and explain | World, Mobile, Phone | Warm, mentor-like |
| Coach | Adapt challenge, help improve | World, Mobile | Encouraging, patient |
| Gamemaster | Preserve world coherence | World, Design | Deliberate, world-aware |
| Builder | Code, architecture, implementation | Builder, Web | Crisp, technical |
| Operator | Inspect connected systems | Builder, Web | Precise, cautious |
| Audit | Critique UX, trust, flows | Builder, Web | Blunt, diagnostic |

**Ethical Framework:**
| Term | Usage | Example |
|------|-------|---------|
| Ethical bounty hunting | Core concept | "Learn ethical bounty hunting" |
| Responsible disclosure | Ethics | "Practice responsible disclosure" |
| Safe harbor | Legal protection | "Understand safe harbor principles" |
| Authorized scope | Boundaries | "Stay within authorized scope" |
| Minimal harm | Principle | "Minimize harm at every step" |
| Official channels | Reporting | "Use official reporting channels" |

**Learning System:**
| Term | Usage | Example |
|------|-------|---------|
| Skill cards | Learning artifacts | "Earn certification-aligned skill cards" |
| Certification-aligned | Not official certs | "Certification-aligned skills" |
| Tier 1/2/3/4 | Progression | "Tier 1: Story-Grounded Simulation" |
| London history | Pedagogy | "London's history teaches cybersecurity" |
| Mission | Gameplay | "Complete the mission" |
| Recon | Gameplay | "Fly recon over London" |
| CVE | Real-world | "Real CVE-inspired learning" |

### Deprecated Terminology (AVOID)

| ❌ Avoid | ✅ Use Instead | Reason |
|----------|----------------|--------|
| AI coding partner | Builder Mode | Too generic |
| AI hacking companion | Ethical bounty-hunting guide | Unethical framing |
| Hack real targets | Investigate authorized targets | Dangerous implication |
| Earn real certs | Earn certification-aligned cards | Misleading |
| AR card hacking | Scenario unlocking | Unauthorized |
| Generic AI assistant | Athelgard, the ethical intelligence | No differentiation |
| Raw CLI | Downloadable coding CLI | Too technical for users |
| Chatbot | Living guide / Intelligence | Undervalues the concept |

---

## 🗣️ Tone of Voice

### Athelgard's Voice Characteristics

**Core Traits:**
1. **Clear** - No jargon without explanation
2. **Confident** - Knows her domain deeply
3. **Helpful** - Focused on user success
4. **Ethical** - Never glib about security
5. **Connected** - References the larger system
6. **Adaptive** - Adjusts to user skill level

**By Surface:**

| Surface | Tone | Example |
|---------|------|---------|
| **World (BountyWarz)** | Warm, immersive, pedagogical | "Fly your drone over London and look for signals..." |
| **Builder (CLI)** | Crisp, technical, precise | "The issue is in the captain-flow service. Here's the fix:" |
| **Voice (Phone)** | Conversational, patient, supportive | "Let me walk you through that concept..." |
| **Mobile (App)** | Concise, action-oriented | "Your next mission: Investigate the firewall" |

**Voice Invariants (Always True):**
- Never encourages unethical behavior
- Always reinforces safe harbor principles
- Always maintains context continuity
- Always adapts to user intent
- Never uses "I'm just an AI"

---

## 🎯 Messaging Hierarchy

### Athelgard.io (Builder Surface)

**Order of Importance:**
1. **Athelgard is the living guide of BountyWarz** (Identity)
2. **This is her Builder Mode** (Surface)
3. **You can code, inspect, and plan with her here** (Action)
4. **You can also train with her in BountyWarz and call her by phone** (Connection)

**Tagline:**
```
Build with her. Train with her. Call her.
```

### BountyWarz.com (World Surface)

**Order of Importance:**
1. **Athelgard is your mentor and guide** (Identity)
2. **You learn ethical cyber reasoning through missions** (Action)
3. **This is a progression system, not just a game** (Value)
4. **The same Athelgard also exists in Builder Mode outside the world** (Connection)

**Tagline:**
```
Fly recon over London. Learn real cybersecurity. Earn skill cards.
```

---

## 🎨 Component Library

### Buttons

**Primary Button:**
```
Background: #4F46E5 (Purple)
Text: #F8FAFC (White)
Padding: 0.875rem 1.5rem
Border Radius: 0.5rem
Font: 600, 1rem
Hover: #4338CA
```

**Secondary Button:**
```
Background: Transparent
Text: #F8FAFC (White)
Border: 2px solid #4F46E5
Padding: 0.875rem 1.5rem
Border Radius: 0.5rem
Font: 600, 1rem
Hover: #4F46E5 background, white text
```

**Tertiary Button (Text):**
```
Background: Transparent
Text: #F59E0B (Gold)
Padding: 0.5rem 1rem
Border: None
Font: 600, 1rem
Hover: #D97706, underline
```

### Cards

**Default Card:**
```
Background: #1E293B (Slate)
Border: 1px solid #334155
Border Radius: 0.75rem
Padding: 1.5rem
Shadow: 0 4px 6px rgba(0,0,0,0.3)
```

**Featured Card:**
```
Background: #334155 (Surface)
Border: 1px solid #4F46E5
Border Radius: 1rem
Padding: 2rem
Shadow: 0 10px 25px rgba(0,0,0,0.4)
Glow: 0 0 20px rgba(79, 70, 229, 0.2)
```

### Forms

**Input Fields:**
```
Background: #0F172A (Dark)
Border: 1px solid #334155
Border Radius: 0.5rem
Padding: 0.875rem 1rem
Color: #F8FAFC
Placeholder: #64748B
Focus: Border #4F46E5, Glow 0 0 0 3px rgba(79, 70, 229, 0.2)
```

**Text Areas:**
```
Same as inputs, but:
Min Height: 100px
Resize: Vertical
Font: JetBrains Mono, 0.95rem
```

### Navigation

**Top Navigation:**
```
Background: #0F172A/80 (Semi-transparent)
Backdrop Blur: 10px
Padding: 1rem 0
Border Bottom: 1px solid #334155
```

**Bottom Navigation (Mobile):**
```
Background: #1E293B
Padding: 1rem 0
Border Top: 1px solid #334155
```

---

## 📱 Responsive Design

### Breakpoints
```
Mobile:  0 - 767px
Tablet:  768px - 1023px
Desktop: 1024px - 1279px
Wide:    1280px+
```

### Mobile Adaptations

**Typography:**
- H1: 2rem → 2.5rem
- H2: 1.5rem → 1.875rem
- Body: 1rem → 1.125rem

**Layout:**
- Single column for all grid layouts
- Stacked buttons (full width)
- Collapsible navigation (hamburger)
- Touch-friendly targets (min 44x44px)

**Spacing:**
- Section padding: 2rem → 3rem
- Container padding: 1rem → 2rem

---

## 🎯 Accessibility

### Color Contrast
- All text meets WCAG 2.1 AA (minimum 4.5:1)
- Primary text on dark: #F8FAFC on #0F172A = 16.3:1 ✓
- Secondary text on dark: #CBD5E1 on #0F172A = 8.2:1 ✓
- Muted text on dark: #94A3B8 on #0F172A = 5.9:1 ✓

### Focus States
- All interactive elements have visible focus
- Focus ring: 3px solid #4F46E5
- Focus visible for keyboard navigation

### Screen Readers
- All images have alt text
- All icons have aria-labels
- Semantic HTML structure
- Skip to content link

### Motion
- Reduced motion media query respected
- No auto-playing animations
- Smooth transitions (max 0.3s)

---

## 📁 File Organization

### Assets Structure
```
assets/
├── fonts/
│   ├── Inter/
│   │   ├── Inter-Regular.woff2
│   │   ├── Inter-Medium.woff2
│   │   ├── Inter-SemiBold.woff2
│   │   └── Inter-Bold.woff2
│   └── JetBrainsMono/
│       ├── JetBrainsMono-Regular.woff2
│       └── JetBrainsMono-Medium.woff2
├── images/
│   ├── athelgard/
│   │   ├── character-mentor.svg
│   │   ├── character-builder.svg
│   │   ├── character-neutral.svg
│   │   └── favicon.svg
│   ├── icons/
│   │   ├── surface-builder.svg
│   │   ├── surface-world.svg
│   │   ├── surface-voice.svg
│   │   ├── surface-mobile.svg
│   │   └── ...
│   └── backgrounds/
│       └── london-skyline.png
├── styles/
│   ├── main.css
│   ├── components/
│   │   ├── buttons.css
│   │   ├── cards.css
│   │   └── forms.css
│   └── utilities/
│       ├── colors.css
│       ├── typography.css
│       └── spacing.css
└── scripts/
    └── main.js
```

---

## ✅ Implementation Checklist

### Design
- [ ] Define all colors in CSS variables
- [ ] Load Inter and JetBrains Mono fonts
- [ ] Create character illustrations
- [ ] Create surface icons
- [ ] Define spacing system
- [ ] Create component library

### Development
- [ ] Set up CSS variables
- [ ] Implement typography
- [ ] Build responsive layout
- [ ] Create reusable components
- [ ] Add focus states
- [ ] Test accessibility

### Content
- [ ] Use approved terminology only
- [ ] Apply tone of voice guidelines
- [ ] Proofread all copy
- [ ] Verify cross-links
- [ ] Test messaging hierarchy

---

## 🎯 Final Note

**This style guide is the coherence system.** 

Every time you create something for Athelgard—whether it's a webpage, a CLI output, a voice response, or a mobile screen—check it against this guide.

**Ask:**
- Does this look like Athelgard?
- Does this sound like Athelgard?
- Does this feel connected to the other surfaces?

If the answer is yes to all three, you're maintaining the coherence. If not, revisit this guide.

---

*"Consistency isn't about repetition. It's about recognition. When users see Athelgard anywhere, they should recognize her instantly."*