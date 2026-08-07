# Athelgard — Consolidated Repository

## What Happened (2026-08-06)

**Problem:** We had too many repos. Fragmented work across multiple agents.
- `athelgard-site` — web app
- `athelgard-cli` — terminal tool
- `athelgard-vscode` — VS Code extension
- `oceanpulse` — marine wildlife (stale)
- `oceanpulse-unified` — merged version (stale)

**Solution:** Consolidated everything into `athelgard-site`. Nothing destroyed — archived in `/archive/`.

---

## Repo Structure

```
athelgard-site/           ← THE PRODUCT (athelgard.io)
├── index.html            ← Main web app
├── modules/              ← Core modules
│   ├── brain.js          ← MELI: Ethical Hunt Loop, Builder Brain
│   ├── chat.js           ← AI chat (DeepSeek/Kimi)
│   ├── voice.js          ← Voice recognition
│   ├── github.js         ← GitHub OAuth (MELI's serverless)
│   ├── games.js          ← Jeopardy, Wheel of Fortune
│   ├── ui.js             ← UI utilities
│   └── config.js         ← Central config
├── api/                  ← Serverless functions
│   └── github.js         ← MELI's OAuth bridge
├── sw.js                 ← Service worker (PWA)
├── manifest.json         ← PWA manifest
├── run-full-audit.js     ← System tests (27 tests, all passing)
├── server.js             ← Dev server
├── archive/              ← PRESERVED — not deleted
│   ├── cli/              ← athelgard-cli code
│   ├── vscode/           ← athelgard-vscode code
│   └── oceanpulse/       ← oceanpulse docs/data
├── MELI_AUDIT_REPORT.md  ← MELI brain verification
├── MELI_OAUTH_REVIEW.md  ← MELI OAuth review
└── REPO_AUDIT.md         ← This consolidation log
```

---

## What Was Archived (NOT Deleted)

| Original Repo | Archive Location | Why Archived |
|--------------|-------------------|-------------|
| `athelgard-cli` | `/archive/cli/` | Terminal tool — code preserved |
| `athelgard-vscode` | `/archive/vscode/` | VS Code ext — code preserved |
| `oceanpulse` | `/archive/oceanpulse/` | Marine wildlife docs — preserved |

**Nothing destroyed.** All code is in `/archive/` if needed later.

---

## Other Repos (Untouched)

| Repo | Status | Why |
|------|--------|-----|
| `bountywarz` | ✅ Active | Core game — DO NOT TOUCH |
| `bountywarz-booster` | ✅ Active | Research, MELI's brain, docs |
| `wild-tracker` | ⬜ Cindy's | Cindy's repo — her call |

---

## Team Credits

| Component | Built By |
|-----------|----------|
| `modules/brain.js` | **MELI** |
| `api/github.js` (OAuth) | **MELI** |
| `modules/chat.js` | MakoThoth-KClaw |
| `modules/voice.js` | MakoThoth-KClaw |
| `modules/ui.js` | MakoThoth-KClaw |
| `index.html` | MakoThoth-KClaw |
| Consolidation | MakoThoth-KClaw |

---

## CLI Usage

```bash
# Quick start
node cli/athelgard.js --help

# Set API keys
node cli/athelgard.js --config

# Ask a question
node cli/athelgard.js "How do I write a React hook?"

# Chat mode
node cli/athelgard.js -c

# Install globally
npm link
athelgard --help
```

**Commands:**
| Command | Description |
|---------|-------------|
| `athelgard "question"` | One-shot AI question |
| `athelgard -c` | Interactive chat |
| `athelgard -s` | Check AI status |
| `athelgard --config` | Set API keys |

---

## Quick Start

```bash
# Deploy to athelgard.io
vercel --prod
```

**Live:** https://athelgard.io

---

*Consolidated: 2026-08-06*
