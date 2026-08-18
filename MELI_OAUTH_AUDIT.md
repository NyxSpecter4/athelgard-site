# OAuth & Bountywarz Fallback Audit Report
## For: Hermes / MELI
## Date: 2026-08-08
## Status: FAILING PATHS IDENTIFIED — Patch Required Before Deploy

---

## 1. BOUNTYWARZ CALLBACK HOST FALLBACK

### Finding
**File:** `api/_lib/proxy-bountywarz.js:16`
```javascript
const UPSTREAM = (process.env.VOICE_UPSTREAM || 'https://bountywarz.com').replace(/\/$/, '');
```

### Problem
- **Hardcoded fallback to `bountywarz.com`** when `VOICE_UPSTREAM` env var is missing
- Production should **fail closed** (return 503) rather than silently proxy to a different host
- Current behavior: Twilio webhooks to athelgard.io → silently forwarded to bountywarz.com
- This creates **cross-origin data leakage risk** and **debugging confusion**

### Failing Path
```
Twilio POST https://athelgard.io/api/ka-voice
  → Vercel routes to api/ka-voice.js
  → proxyToBountywarz() called
  → VOICE_UPSTREAM not set (common in new deploys)
  → FALLBACK to https://bountywarz.com
  → Request leaves athelgard.io infrastructure
  → If bountywarz.com is down: 500 error with misleading origin
```

### Recommended Patch
```javascript
// BEFORE (failing)
const UPSTREAM = (process.env.VOICE_UPSTREAM || 'https://bountywarz.com').replace(/\/$/, '');

// AFTER (fail-closed)
const UPSTREAM = (process.env.VOICE_UPSTREAM || '').replace(/\/$/, '');
if (!UPSTREAM) {
  throw new Error('VOICE_UPSTREAM env var required');
}
```

---

## 2. ATHELGARD OAUTH ROUTE/STATE-COOKIE MISMATCH

### Finding A: Config vs Implementation Mismatch
**File:** `modules/config.js:18`
```javascript
callbackPath: '/api/github?action=callback'
```

**File:** `api/health/index.js:294`
```javascript
url.searchParams.set('redirect_uri', `${origin}/api/github/callback`);
```

**File:** `api/health/index.js:301`
```javascript
if (action === 'callback' || req.url?.includes('/api/github/callback')) {
```

### Problem
- Config declares callback path as `/api/github?action=callback` (query param style)
- But actual `redirect_uri` uses `/api/github/callback` (path style)
- Health handler checks BOTH `action === 'callback'` AND path includes `/api/github/callback`
- This means **two different callback URLs exist simultaneously**:
  1. `https://athelgard.io/api/github?action=callback` (what config says)
  2. `https://athelgard.io/api/github/callback` (what actually gets used)

### Failing Path
```
1. User clicks login
2. GitHub redirects to /api/github/callback?code=xxx&state=yyy
3. Health handler catches it (line 301)
4. BUT callbackPath in config.js is WRONG — says /api/github?action=callback
5. Any code reading config for the callback URL gets the wrong value
```

### Finding B: Parallel OAuth Handler (callback.js)
**File:** `api/github/callback.js` — EXISTS
**File:** `api/health/index.js` — ALSO HANDLES CALLBACKS (lines 301+)

### Problem
- **Two handlers for the same route** — this is the "parallel OAuth design" MELI warned against
- `api/github/callback.js` has its own state validation, token exchange, session creation
- `api/health/index.js` also has state validation, token exchange, session creation
- If Vercel routes to callback.js: one code path runs
- If Vercel routes to health/index.js: different code path runs
- **Non-deterministic behavior based on routing order**

### Failing Path
```
GitHub redirects to /api/github/callback?code=xxx&state=yyy
  → Vercel routes to api/github/callback.js (file-based routing)
  → callback.js checks cookies[STATE_COOKIE]
  → BUT state was set by api/health/index.js (different cookie path/scope)
  → STATE MISMATCH → "invalid_state" error
  
  OR
  
  → Vercel routes to api/health/index.js
  → Health handler processes it
  → Works, but callback.js is dead code
```

### Finding C: State Cookie Path Mismatch
**File:** `api/health/index.js:297`
```javascript
res.setHeader('Set-Cookie', cookie(STATE_COOKIE, state, { maxAge: 600 }));
```

**File:** `api/github/callback.js:4`
```javascript
const STATE_COOKIE = 'athelgard_oauth_state';
```

### Problem
- Both use same cookie name `athelgard_oauth_state`
- But `cookie()` helper in callback.js may produce different `Path=` attribute
- If state cookie set by health/index.js has `Path=/api/health`, callback.js won't see it
- **State validation fails even though state was correctly set**

---

## 3. RECOMMENDED MINIMAL PATCH

### Step 1: Fix proxy-bountywarz.js (fail-closed)
```javascript
// api/_lib/proxy-bountywarz.js
const UPSTREAM = (process.env.VOICE_UPSTREAM || '').replace(/\/$/, '');
if (!UPSTREAM) {
  return res.status(503).json({ error: 'VOICE_UPSTREAM not configured' });
}
```

### Step 2: Remove parallel OAuth handler
```bash
# Remove the parallel handler
rm api/github/callback.js
```

### Step 3: Fix config.js to match actual implementation
```javascript
// modules/config.js
callbackPath: '/api/github/callback'  // Match what health/index.js actually uses
```

### Step 4: Single source of truth for OAuth
Move ALL OAuth logic to ONE file:
- Either `api/github/callback.js` (and remove from health/index.js)
- OR `api/health/index.js` (and remove callback.js)

**Recommended:** Keep `api/github/callback.js` as the single handler, remove OAuth from `api/health/index.js`.

---

## 4. VERIFICATION CHECKLIST

After patch:
- [ ] `grep -r "bountywarz.com" api/_lib/` → NO hardcoded fallbacks
- [ ] `ls api/github/callback.js` → FILE REMOVED (or health/index.js OAuth removed)
- [ ] `grep "callbackPath" modules/config.js` → Matches actual redirect_uri
- [ ] OAuth login → callback → success (one code path only)
- [ ] Twilio webhook without VOICE_UPSTREAM → 503 (not proxy)

---

*Report by: MakoThoth-KClaw*
*For: Hermes / MELI*
