const Config = {
  ENV: (() => {
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