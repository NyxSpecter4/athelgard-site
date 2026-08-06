const https = require('https');
const crypto = require('crypto');

const SESSION_COOKIE = 'athelgard_github_session';
const STATE_COOKIE = 'athelgard_github_oauth_state';
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

function redirect(res, location, cookies = []) {
  if (cookies.length) res.setHeader('Set-Cookie', cookies);
  res.writeHead(302, { Location: location });
  res.end();
}

function json(res, status, body, cookies = []) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (cookies.length) res.setHeader('Set-Cookie', cookies);
  res.status(status).json(body);
}

function appOrigin(req) {
  const protocol = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${protocol}://${host}`;
}

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(left, right) {
  if (!left || !right) return false;
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
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

function readSession(req) {
  const raw = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (!raw) return null;
  const [payload, signature] = raw.split('.');
  if (!payload || !safeEqual(sign(payload, getSessionSecret()), signature)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return session.expiresAt > Date.now() && session.token ? session : null;
  } catch {
    return null;
  }
}

function requestGitHub(path, token, method = 'GET', body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const request = https.request(
      {
        hostname: 'api.github.com',
        path,
        method,
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'Athelgard',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
        },
      },
      response => {
        let data = '';
        response.on('data', chunk => { data += chunk; });
        response.on('end', () => {
          let parsed = {};
          try { parsed = data ? JSON.parse(data) : {}; } catch { parsed = { message: 'Unexpected GitHub response' }; }
          if (response.statusCode < 200 || response.statusCode > 299) {
            const error = new Error(parsed.message || `GitHub ${response.statusCode}`);
            error.status = response.statusCode;
            return reject(error);
          }
          resolve(parsed);
        });
      }
    );
    request.on('error', reject);
    if (payload) request.write(payload);
    request.end();
  });
}

function exchangeCode(code) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    });
    const request = https.request(
      {
        hostname: 'github.com',
        path: '/login/oauth/access_token',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'User-Agent': 'Athelgard',
        },
      },
      response => {
        let data = '';
        response.on('data', chunk => { data += chunk; });
        response.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (!parsed.access_token) return reject(new Error(parsed.error_description || 'GitHub did not return an access token'));
            resolve(parsed.access_token);
          } catch {
            reject(new Error('Could not read GitHub authorization response'));
          }
        });
      }
    );
    request.on('error', reject);
    request.write(payload);
    request.end();
  });
}

function getMissingConfig() {
  return ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'].filter(name => !process.env[name]);
}

async function buildStatus(req) {
  const missing = getMissingConfig();
  if (missing.length) {
    return { oauthConfigured: false, connected: false, missing };
  }
  const session = readSession(req);
  if (!session) {
    return { oauthConfigured: true, connected: false, missing: [] };
  }
  try {
    const user = await requestGitHub('/user', session.token);
    return { oauthConfigured: true, connected: true, user: { login: user.login, avatar_url: user.avatar_url, name: user.name || user.login } };
  } catch {
    return { oauthConfigured: true, connected: false, error: 'GitHub request failed' };
  }
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  const action = req.query.action || 'status';
  const origin = appOrigin(req);
  const callbackUrl = `${origin}/auth/github/callback`;

  if (action === 'status') {
    try {
      return res.status(200).json(await buildStatus(req));
    } catch (error) {
      return res.status(error.status || 502).json({ oauthConfigured: true, connected: false, error: error.message || 'GitHub request failed.' });
    }
  }

  if (action === 'start') {
    if (getMissingConfig().length) {
      return res.status(503).json({ error: 'GitHub OAuth is not configured on this deployment yet.' });
    }
    const state = crypto.randomBytes(32).toString('hex');
    const authorize = new URL('https://github.com/login/oauth/authorize');
    authorize.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID);
    authorize.searchParams.set('redirect_uri', callbackUrl);
    authorize.searchParams.set('scope', 'read:user repo');
    authorize.searchParams.set('state', state);
    return redirect(res, authorize.toString(), [cookie(STATE_COOKIE, state, { maxAge: 600 })]);
  }

  if (req.url?.includes('/callback') || action === 'callback') {
    const cookies = parseCookies(req.headers.cookie);
    const clearState = cookie(STATE_COOKIE, '', { maxAge: 0 });
    if (req.query.error) return redirect(res, `/?github_error=${encodeURIComponent(req.query.error)}`, [clearState]);
    if (!safeEqual(req.query.state, cookies[STATE_COOKIE]) || !req.query.code) {
      return redirect(res, '/?github_error=invalid_state', [clearState]);
    }
    try {
      const token = await exchangeCode(req.query.code);
      await requestGitHub('/user', token);
      return redirect(res, '/?github=connected', [clearState, cookie(SESSION_COOKIE, createSession(token), { maxAge: SESSION_TTL_SECONDS })]);
    } catch (error) {
      return redirect(res, `/?github_error=${encodeURIComponent(error.message)}`, [clearState]);
    }
  }

  if (action === 'logout') {
    return res.status(200).json({ connected: false }, [cookie(SESSION_COOKIE, '', { maxAge: 0 })]);
  }

  const session = readSession(req);
  if (!session) return res.status(401).json({ error: 'GitHub is not connected' });

  if (action === 'repos') {
    try {
      const repos = await requestGitHub('/user/repos?sort=updated&per_page=30', session.token);
      return res.status(200).json({ repos: repos.map(r => ({ id: r.id, full_name: r.full_name, private: r.private, default_branch: r.default_branch, html_url: r.html_url })) });
    } catch {
      return res.status(502).json({ error: 'GitHub request failed.' });
    }
  }

  if (action === 'contents') {
    const { owner, repo, path: filePath = '' } = req.query;
    if (!owner || !repo || !/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) {
      return res.status(400).json({ error: 'A valid owner and repository are required.' });
    }
    const ref = req.query.ref ? `?ref=${encodeURIComponent(req.query.ref)}` : '';
    try {
      const result = await requestGitHub(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${filePath.split('/').map(encodeURIComponent).join('/')}${ref}`,
        session.token
      );
      return res.status(200).json(result);
    } catch {
      return res.status(502).json({ error: 'GitHub request failed.' });
    }
  }

  if (action === 'search') {
    const query = String(req.query.q || '').trim();
    if (!query || query.length > 200) return res.status(400).json({ error: 'A short repository search query is required.' });
    try {
      const result = await requestGitHub(`/search/repositories?q=${encodeURIComponent(query)}&per_page=5`, session.token);
      return res.status(200).json(result);
    } catch {
      return res.status(502).json({ error: 'GitHub request failed.' });
    }
  }

  return res.status(404).json({ error: 'Unknown GitHub action.' });
};

module.exports = handler;