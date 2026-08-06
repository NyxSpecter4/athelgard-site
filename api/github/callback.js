const https = require('https');
const crypto = require('crypto');

const STATE_COOKIE = 'athelgard_oauth_state';
const SESSION_COOKIE = 'athelgard_github_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function parseCookies(header = '') {
  return header.split(';').reduce((cookies, pair) => {
    const index = pair.indexOf('=');
    if (index > -1) cookies[pair.slice(0, index).trim()] = decodeURIComponent(pair.slice(index + 1).trim());
    return cookies;
  }, {});
}

function cookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax'];
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') parts.push('Secure');
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  return parts.join('; ');
}

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEq(a, b) {
  if (!a || !b) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch { return false; }
}

function getSessionSecret() {
  return process.env.GITHUB_SESSION_SECRET || 
    (process.env.GITHUB_CLIENT_SECRET 
      ? crypto.createHmac('sha256', 'athelgard-salt').update(process.env.GITHUB_CLIENT_SECRET).digest('hex')
      : 'athelgard-dev-secret-change-me');
}

function createSession(token) {
  const payload = base64url(JSON.stringify({ token, expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000 }));
  return `${payload}.${sign(payload, getSessionSecret())}`;
}

function exchangeCode(code) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    });
    const request = https.request({
      hostname: 'github.com',
      path: '/login/oauth/access_token',
      method: 'P
OST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': 'Athelgard',
      },
    }, response => {
      let data = '';
      response.on('data', chunk => { data += chunk; });
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (!parsed.access_token) return reject(new Error(parsed.error_description || 'No token'));
          resolve(parsed.access_token);
        } catch { reject(new Error('Bad response')); }
      });
    });
    request.on('error', reject);
    request.write(payload);
    request.end();
  });
}

module.exports = async function handler(req, res) {
  // Set security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(204).end();
  
  const cookies = parseCookies(req.headers.cookie || '');
  const state = cookies[STATE_COOKIE];
  
  if (req.query.error) {
    res.setHeader('Set-Cookie', cookie(STATE_COOKIE, '', { maxAge: 0 }));
    return res.redirect(`/?github_error=${encodeURIComponent(String(req.query.error))}`);
  }
  
  if (!state || !safeEq(String(req.query.state), state) || !req.query.code) {
    res.setHeader('Set-Cookie', cookie(STATE_COOKIE, '', { maxAge: 0 }));
    return res.redirect('/?github_error=invalid_state');
  }
  
  try {
    const token = await exchangeCode(String(req.query.code));
    const userReq = https.request({
      hostname: 'api.github.com',
      path: '/user',
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Athelgard',
        Authorization: `Bearer ${token}`
      }
    }, userRes => {
      let data = '';
      userRes.on('data', chunk => { data += chunk; });
      userRes.on('e
nd', () => {
        try {
          const user = JSON.parse(data);
          const session = createSession(token);
          res.setHeader('Set-Cookie', [
            cookie(STATE_COOKIE, '', { maxAge: 0 }),
            cookie(SESSION_COOKIE, session, { maxAge: SESSION_TTL_SECONDS })
          ]);
          return res.redirect('/?github=connected');
        } catch (e) {
          res.setHeader('Set-Cookie', cookie(STATE_COOKIE, '', { maxAge: 0 }));
          return res.redirect(`/?github_error=${encodeURIComponent(e.message)}`);
        }
      });
    });
    userReq.on('error', e => {
      res.setHeader('Set-Cookie', cookie(STATE_COOKIE, '', { maxAge: 0 }));
      return res.redirect(`/?github_error=${encodeURIComponent(e.message)}`);
    });
    userReq.end();
  } catch (e) {
    res.setHeader('Set-Cookie', cookie(STATE_COOKIE, '', { maxAge: 0 }));
    return res.redirect(`/?github_error=${encodeURIComponent(e.message)}`);
  }
};