import { VercelRequest, VercelResponse } from '@vercel/node';
import * as https from 'https';
import * as crypto from 'crypto';

const SESSION_COOKIE = 'athelgard_github_session';
const STATE_COOKIE = 'athelgard_github_oauth_state';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function base64url(value: string | Buffer): string {
  return Buffer.from(value).toString('base64url');
}

function parseCookies(header = ''): Record<string, string> {
  return header.split(';').reduce((cookies, pair) => {
    const index = pair.indexOf('=');
    if (index > -1) cookies[pair.slice(0, index).trim()] = decodeURIComponent(pair.slice(index + 1).trim());
    return cookies;
  }, {} as Record<string, string>);
}

function cookie(name: string, value: string, options: { maxAge?: number } = {}): string {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax'];
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') parts.push('Secure');
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  return parts.join('; ');
}

function redirect(res: any, location: string, cookies: string[] = []) {
  if (cookies.length) res.setHeader('Set-Cookie', cookies);
  res.writeHead(302, { Location: location });
  res.end();
}

function json(res: any, status: number, body: any, cookies: string[] = []) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (cookies.length) res.setHeader('Set-Cookie', cookies);
  res.status(status).json(body);
}

function appOrigin(req: any): string {
  const protocol = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${protocol}://${host}`;
}

function sign(value: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(left: string, right: string): boolean {
  if (!left || !right) return false;
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function getSessionSecret(): string {
  return process.env.GITHUB_SESSION_SECRET || 
    (process.env.GITHUB_CLIENT_SECRET 
      ? crypto.createHmac('sha256', 'athelgard-salt').update(process.env.GITHUB_CLIENT_SECRET).digest('hex')
      : 'athelgard-dev-secret-change-me');
}

function createSession(token: string): string {
  const payload = base64url(JSON.stringify({ token, expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000 }));
  return `${payload}.${sign(payload, getSessionSecret())}`;
}

function readSession(req: any): { token: string; expiresAt: number } | null {
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

export default async function handler(req: any, res: any) {
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
    const session = readSession(req);
    if (!session) {
      return json(res, 200, { oauthConfigured: true, connected: false, missing: [] });
    }
    try {
      const user = await new Promise((resolve, reject) => {
        const request = https.request({
          hostname: 'api.github.com',
          path: '/user',
          method: 'GET',
          headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'Athelgard', Authorization: `Bearer ${session.token}` },
        }, response => {
          let data = '';
          response.on('data', chunk => { data += chunk; });
          response.on('end', () => {
            try { resolve(JSON.parse(data)); } catch { resolve({}); }
          });
        });
        request.on('error', reject);
        request.end();
      });
      return json(res, 200, { oauthConfigured: true, connected: true, user: { login: user.login, avatar_url: user.avatar_url, name: user.name || user.login } });
    } catch {
      return json(res, 200, { oauthConfigured: true, connected: false, error: 'GitHub request failed' });
    }
  }

  if (action === 'start') {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      return json(res, 503, { error: 'GitHub OAuth is not configured' });
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
    if (req.query.error) return redirect(res, `/?github_error=${encodeURIComponent(String(req.query.error))}`, [clearState]);
    if (!safeEqual(String(req.query.state), cookies[STATE_COOKIE]) || !req.query.code) {
      return redirect(res, '/?github_error=invalid_state', [clearState]);
    }
    try {
      const token = await new Promise<string>((resolve, reject) => {
        const payload = JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code: req.query.code });
        const request = https.request({
          hostname: 'github.com',
          path: '/login/oauth/access_token',
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload), 'User-Agent': 'Athelgard' },
        }, response => {
          let data = '';
          response.on('data', chunk => { data += chunk; });
          response.on('end', () => {
            try { const parsed = JSON.parse(data); resolve(parsed.access_token); } catch { reject(new Error('Invalid response')); }
          });
        });
        request.on('error', reject);
        request.write(payload);
        request.end();
      });
      await new Promise((resolve, reject) => {
        const request = https.request({
          hostname: 'api.github.com',
          path: '/user',
          method: 'GET',
          headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'Athelgard', Authorization: `Bearer ${token}` },
        }, response => {
          let data = '';
          response.on('data', chunk => { data += chunk; });
          response.on('end', () => { resolve(null); });
        });
        request.on('error', reject);
        request.end();
      });
      return redirect(res, '/?github=connected', [clearState, cookie(SESSION_COOKIE, createSession(token), { maxAge: SESSION_TTL_SECONDS })]);
    } catch (error: any) {
      return redirect(res, `/?github_error=${encodeURIComponent(error.message)}`, [clearState]);
    }
  }

  if (action === 'logout') {
    return json(res, 200, { connected: false }, [cookie(SESSION_COOKIE, '', { maxAge: 0 })]);
  }

  const session = readSession(req);
  if (!session) return json(res, 401, { error: 'Not authenticated' });

  if (action === 'repos') {
    try {
      const repos = await new Promise<any[]>((resolve, reject) => {
        const request = https.request({
          hostname: 'api.github.com',
          path: '/user/repos?sort=updated&per_page=30',
          method: 'GET',
          headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'Athelgard', Authorization: `Bearer ${session.token}` },
        }, response => {
          let data = '';
          response.on('data', chunk => { data += chunk; });
          response.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve([]); } });
        });
        request.on('error', reject);
        request.end();
      });
      return json(res, 200, { repos: repos.map(r => ({ id: r.id, full_name: r.full_name, private: r.private, default_branch: r.default_branch, html_url: r.html_url })) });
    } catch {
      return json(res, 502, { error: 'GitHub request failed' });
    }
  }

  return json(res, 404, { error: 'Unknown action' });
}