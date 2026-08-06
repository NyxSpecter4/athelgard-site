const crypto = require('crypto');
const Config = require('../modules/config');

function generateStateToken() { return crypto.randomBytes(16).toString('hex'); }
function signSession(data, secret) { const payload = JSON.stringify(data); const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex'); return Buffer.from(payload).toString('base64url') + '.' + sig; }

const sessions = new Map();

async function handleGitHub(req, res, query) {
  const { action } = query;
  if (action === 'authorize') {
    const state = generateStateToken();
    sessions.set(state, { createdAt: Date.now() });
    const callbackUrl = Config.ENV.protocol + '//' + Config.ENV.hostname + Config.GITHUB.callbackPath;
    const authUrl = Config.GITHUB.authorizationUrl + '?client_id=' + Config.GITHUB.clientId + '&redirect_uri=' + encodeURIComponent(callbackUrl) + '&scope=' + Config.GITHUB.scopes.join(',') + '&state=' + state;
    res.writeHead(302, { Location: authUrl, 'Set-Cookie': 'github_state=' + state + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=600' });
    res.end();
  } else if (action === 'callback') {
    const { code, state } = query;
    const cookies = parseCookies(req.headers.cookie || '');
    if (!state || state !== cookies.github_state) { res.writeHead(400); res.end('Invalid state'); return; }
    // Exchange code for token would go here
    res.writeHead(302, { Location: '/' });
    res.end();
  } else if (action === 'status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ connected: false, message: 'GitHub OAuth ready' }));
  }
}

function parseCookies(str) { const c = {}; if (!str) return c; str.split(';').forEach(cookie => { const p = cookie.split('='); if (p.length === 2) c[p[0].trim()] = p[1].trim(); }); return c; }

module.exports = { handleGitHub, Config };