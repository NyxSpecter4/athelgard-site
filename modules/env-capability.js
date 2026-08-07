/**
 * env-capability.js — THE ENVIRONMENT CAPABILITY CONTRACT
 *
 * Root-cause fix (2026-08-07): agents (Hermes, Cursor, Athelgard) have been
 * ASSUMING their environment instead of DISCOVERING it, then promising
 * capabilities the env doesn't grant. This module is the negotiation layer:
 * on entry to ANY environment, call detectCapabilities() and GATE every
 * feature claim against the returned contract. No contract -> no claim.
 *
 * Works in: browser, Node, Capacitor/mobile (AR-card), CLI. Zero deps.
 *
 * @returns {Capabilities}
 */
'use strict';

function detectCapabilities() {
  const isBrowser = (typeof window !== 'undefined');
  const isNode = !!(typeof process !== 'undefined' && process.versions && process.versions.node);
  const isCapacitor = !!(typeof window !== 'undefined' && (window.Capacitor || (window.cordova)));

  // --- Runtime feature probes (lazy, never throw) ---
  const has = (fn) => { try { return !!fn(); } catch (_) { return false; } };

  const browser = has(() => typeof window !== 'undefined' && typeof document !== 'undefined');
  const webAudio = has(() =>
    (typeof window !== 'undefined') && !!(window.AudioContext || window.webkitAudioContext));
  const camera = has(() => {
    const nav = (typeof window !== 'undefined' && window.navigator) ? window.navigator : (typeof navigator !== 'undefined' ? navigator : null);
    return !!(nav && nav.mediaDevices && nav.mediaDevices.getUserMedia);
  });
  const localStorageOk = has(() =>
    (typeof window !== 'undefined') && !!window.localStorage);
  const indexedDbOk = has(() =>
    (typeof window !== 'undefined') && !!window.indexedDB);
  const webWorker = has(() => typeof Worker !== 'undefined');

  // --- Secrets present? (env-side; NEVER read values, only existence) ---
  const env = (typeof process !== 'undefined' && process.env) ? process.env : {};
  const secrets = {
    openai: !!env.OPENAI_API_KEY,
    deepseek: !!env.DEEPSEEK_API_KEY,
    kimi: !!env.KIMI_API_KEY,
    github: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
    supabase: !!env.SUPABASE_SERVICE_ROLE_KEY || !!env.SUPABASE_URL,
    garden: !!env.GARDEN_SECRET,
    captain: !!env.CAPTAIN_KEY,
    vercel: !!env.VERCEL,
  };

  // --- Heavy runtime available? (browser automation / playwright class) ---
  // We can't require playwright here without a dep; signal intent by env hint.
  const browserAutomation = !!(env.PLAYWRIGHT_AVAILABLE || env.CI);

  // --- Latency budget (CLI/local = generous; web/voice = tight per SUB-1.2S law) ---
  const latencyBudgetMs = isBrowser ? 1200 : 5000;

  // --- Effective "self" summary: what this environment permits ---
  const can = {
    reason: true,                                  // core mentor logic is always portable
    persist: indexedDbOk || localStorageOk || isNode, // corpus/state can be saved
    voice: webAudio,                               // can synthesize/play audio
    camera: camera,                                // AR-card / vision face
    browser_automation: browserAutomation,         // can run full surface audits
    auth_agent_test: secrets.openai || secrets.deepseek || secrets.kimi, // can fire a REAL agent task
    github_ops: secrets.github,                    // can do repo work
    live_site_probe: true,                         // HTTP probe always possible
    crash_proxy: browser,                          // can grep served HTML for crash patterns
  };

  // Honest degradation notice: what we CANNOT do here, stated up front.
  const gaps = Object.keys(can).filter((k) => !can[k]);

  return {
    environment: isCapacitor ? 'capacitor' : isBrowser ? 'browser' : isNode ? 'node' : 'unknown',
    isBrowser, isNode, isCapacitor,
    features: { browser, webAudio, camera, localStorageOk, indexedDbOk, webWorker },
    secrets,
    latencyBudgetMs,
    can,
    gaps,
    /** Gate a feature claim. Returns true only if the env permits it. */
    allows(feature) { return !!this.can[feature]; },
    /** Human-readable self-description (what Athelgard announces on arrival). */
    describe() {
      const yes = Object.keys(can).filter((k) => can[k]);
      return `[env:${this.environment}] can: ${yes.join(', ')}` +
        (gaps.length ? ` | CANNOT: ${gaps.join(', ')}` : ' | full');
    },
  };
}

module.exports = { detectCapabilities };
