# Athelgard Multi-Agent Integration Directive & Merge Standard

## 1. Single Architecture Hierarchy
1. **athelgard.io (`athelgard-site`)** is the ONLY Front Door & Control Plane.
   - Handles GitHub OAuth -> Repo Read/Write permissions -> Session dispatch.
   - Hosts the Eve Vercel Serverless Agent Execution loop.
2. **Athelgard Engine (`api/` & Eve)** is the ONE Central Brain.
   - Enforces ethical scope-first bounds (simulated vs explicit permission).
   - Performs tool-use loop: Fetch Repo -> Draft Diff -> Audit/Test -> Commit/PR.
3. **Bountywarz (`bountywarz`)** is the Cyber Range & World Surface.
   - Gamified missions, cards, glyphs, London Palimpsest world.
   - Connects to Athelgard via standard API (`/api/v1/agent`), does not maintain a parallel agent runtime.
4. **CLI & Mobile (`athelgard-cli`, voice phone)** are Lightweight Surfaces.
   - Terminal and phone stream audio/text directly to `athelgard.io` endpoints.

## 2. Hard Merge Standard (No Unverifiable Commits)
- **Rule 1:** No code is merged to `master` without passing `node run-full-audit.js`.
- **Rule 2:** Every agent must test their component against the live vertical slice:
  `GitHub OAuth -> Select Repo -> Dispatch Mission -> Tool-Use Diff/Audit -> Verified Commit/PR`.
- **Rule 3:** No duplicate wrappers. All surfaces call `athelgard-site` API endpoints.

## 3. Agent Lane Assignments
- **Lane 1 (Front Door & Auth):** `athelgard-site` frontend & OAuth flow (`/api/auth/github`).
- **Lane 2 (Core Agent Runtime):** `athelgard-site/api/agent.js` (Eve tool loop, repo inspection, patch generation, verification).
- **Lane 3 (Cyber Range & Mentor):** `bountywarz` world integration & skill cards calling Athelgard mentor API.
- **Lane 4 (Surface Wrappers):** `athelgard-cli` & Twilio phone bridge forwarding to Athelgard API.

## 4. Immediate Target: Live Vertical Slice Verification
- Step 1: User authenticates via GitHub OAuth at `athelgard.io`.
- Step 2: User selects repository `NyxSpecter4/athelgard-site`.
- Step 3: User issues mission: "Add route GET /api/v1/health with test".
- Step 4: Agent reads repo, generates diff, runs test, creates PR on GitHub.
- Step 5: Return verified execution log and PR link.
