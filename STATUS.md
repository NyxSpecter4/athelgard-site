# Athelgard Site — Current Status

## ✅ Working

| Component | Status | Notes |
|-----------|--------|-------|
| Main site | ✅ | https://athelgard.io loads correctly |
| PWA manifest | ✅ | Installable on mobile/desktop |
| Service worker | ✅ | Offline support enabled |
| GitHub OAuth | ✅ | Login flow fixed, redirect_uri correct |
| Favicon | ✅ | owl.svg deployed, dark circle + white owl |
| CLI | ✅ | `node cli/athelgard.js` works, v3 simplified |
| API health | ✅ | `/api/health` returns 200 |
| ka-voice proxy | ✅ | Proxies to bountywarz.com |
| Tests | ✅ | 23/23 passing |

## ⚠️ Needs Setup

| Component | Status | Action Needed |
|-----------|--------|---------------|
| DeepSeek API | ⚠️ | Add `DEEPSEEK_API_KEY` to Vercel env |
| Kimi API | ⚠️ | Add `KIMI_API_KEY` to Vercel env (optional fallback) |
| GitHub OAuth | ⚠️ | Verify GitHub App has `https://athelgard.io/api/github/callback` as callback URL |
| Supabase | ⚠️ | Add `SUPABASE_URL` + keys to Vercel env |

## 📦 CLI Install

```bash
cd athelgard-site
npm link          # Global install
athelgard --help  # Verify
```

## 🔧 Recent Fixes

1. **GitHub OAuth redirect_uri** — Fixed mismatch between code and GitHub App settings
2. **Vercel routing** — Added `/icons/` static route
3. **CLI v3** — Simplified commands, angular owl logo
4. **.env.example** — Documented all required env vars

## 🚀 Deployment

```bash
vercel --prod
```

Last deployed: 2026-08-08
