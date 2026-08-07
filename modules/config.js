// Environment Capability Contract (root-cause fix 2026-08-07): discover what
// the current environment PERMITS and gate every feature claim on it. No
// assumption — negotiation. Imported safely (no dep in browser-less envs).
let CAP = null;
try { CAP = require('./env-capability').detectCapabilities(); } catch (_) { CAP = null; }

const Config = {
  // Legacy 2-state flags kept for backward compat, now derived from the contract.
  ENV: (() => {
    if (CAP) {
      return {
        isBrowser: CAP.isBrowser, isNode: CAP.isNode,
        isDev: (typeof window !== 'undefined' ? window.location.hostname === 'localhost'
                : (process.env.NODE_ENV === 'development')),
        isProd: (typeof window !== 'undefined' ? window.location.hostname === 'athelgard.io'
                : (process.env.NODE_ENV === 'production')),
        capabilities: CAP,            // full negotiation result
        describe: () => CAP.describe(),
        allows: (f) => CAP.allows(f),
        gaps: CAP.gaps,
      };
    }
    if (typeof window !== 'undefined') return { isBrowser: true, isNode: false, isDev: window.location.hostname === 'localhost', isProd: window.location.hostname === 'athelgard.io' };
    return { isBrowser: false, isNode: true, isDev: process.env.NODE_ENV === 'development', isProd: process.env.NODE_ENV === 'production' };
  })(),
  AI: {
    DEEPSEEK: { endpoint: 'https://api.deepseek.com/chat/completions', model: 'deepseek-chat', get apiKey() { return process.env.DEEPSEEK_API_KEY; } },
    KIMI: { endpoint: 'https://api.moonshot.cn/v1/chat/completions', model: 'kimi-k2p6', get apiKey() { return process.env.KIMI_API_KEY; } }
  },
  GITHUB: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    sessionSecret: process.env.GITHUB_SESSION_SECRET,
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    apiBase: 'https://api.github.com',
    scopes: ['read:user','read:org','repo'],
    callbackPath: '/api/github?action=callback'
  },
  getStatus: function() { return { version: '1.0.0', timestamp: Date.now() }; }
};
module.exports = Config;
if (typeof window !== 'undefined') window.AthelgardConfig = Config;