import { VercelRequest, VercelResponse } from '@vercel/node';
import https from 'https';
import crypto from 'crypto';

const brain = require('../../modules/brain');
const Config = require('../../modules/config');

const SESSION_COOKIE = 'athelgard_github_session';
const STATE_COOKIE = 'athelgard_github_oauth_state';
const SESSION_TTL = 60 * 60 * 8;

function base64url(v: string | Buffer): string {
  return Buffer.from(v).toString('base64url');
}

function parseCookies(h = ''): Record<string, string> {
  return h.split(';').reduce((o, p) => {
    const i = p.indexOf('=');
    if (i > -1) o[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
    return o;
  }, {} as Record<string, string>);
}

function cookie(name: string, value: string, opts: { maxAge?: number } = {}): string {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax'];
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') parts.push('Secure');
  if (opts.maxAge !== undefined) parts.push(`Max-Age=${opts.maxAge}`);
  return parts.join('; ');
}

function sign(value: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEq(a: string, b: string): boolean {
  if (!a || !b) return false;
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

// mELI fix: derive session secret from existing secrets, don't hard-require GITHUB_SESSION_SECRET
function getSessionSecret(): string {
  return process.env.GITHUB_SESSION_SECRET || 
    (process.env.GITHUB_CLIENT_SECRET 
      ? crypto.createHash('sha256').update(process.env.GITHUB_CLIENT_SECRET).digest('hex') 
      : 'athelgard-dev-secret-change-me');
}

function createSession(token: string): string {
  const payload = base64url(JSON.stringify({ token, exp: Date.now() + SESSION_TTL * 1000 }));
  return `${payload}.${sign(payload, getSessionSecret())}`;
}

function readSession(req: VercelRequest): { token: string; exp: number } | null {
  const raw = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (!raw) return null;
  const [payload, sig] = raw.split('.');
  if (!payload || !safeEq(sig, sign(payload, getSessionSecret()))) return null;
  try {
    const sess = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return sess.exp > Date.now() && sess.token ? sess : null;
  } catch { return null; }
}

function requestGH(path: string, token?: string, method = 'GET', body?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com', path, method,
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Athelgard',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}),
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        let parsed: any = {};
        try { parsed = d ? JSON.parse(d) : {}; } catch { parsed = { message: 'Unexpected response' }; }
        if (res.statusCode! < 200 || res.statusCode! > 299) {
          const err = new Error(parsed.message || `GitHub ${res.statusCode}`) as any;
          err.status = res.statusCode;
          return reject(err);
        }
        resolve(parsed);
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function exchangeCode(code: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    });
    const req = https.request({
      hostname: 'github.com', path: '/login/oauth/access_token', method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload), 'User-Agent': 'Athelgard' }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const p = JSON.parse(d);
          if (!p.access_token) return reject(new Error(p.error_description || 'No token'));
          resolve(p.access_token);
        } catch { reject(new Error('Bad response')); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ─── AGENT: DeepSeek / Kimi bridge ───
async function handleAgent(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_KEY;
  if (!key) return res.status(503).json({ error: 'DeepSeek API key not configured' });

  const { message, model = 'deepseek-chat' } = req.body || {};
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    const result: any = await new Promise((resolve, reject) => {
      const data = JSON.stringify({
        model, messages: [{ role: 'system', content: 'You are Athelgard, an elite ethical hacking mentor.' }, { role: 'user', content: message }],
        temperature: 0.7, max_tokens: 2000
      });
      const r = https.request({
        hostname: 'api.deepseek.com', path: '/v1/chat/completions', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}`, 'Content-Length': Buffer.byteLength(data) }
      }, resp => {
        let d = '';
        resp.on('data', c => d += c);
        resp.on('end', () => { try { resolve(JSON.parse(d)); } catch { reject(new Error('Bad JSON')); } });
      });
      r.on('error', reject);
      r.write(data);
      r.end();
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({
      response: result.choices?.[0]?.message?.content || 'No response',
      model, usage: result.usage || {}
    });
  } catch (e: any) {
    return res.status(502).json({ error: e.message || 'DeepSeek failed' });
  }
}

// ─── GITHUB: OAuth + API proxy ───
async function handleGitHub(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action || 'status';
  const proto = (req.headers['x-forwarded-proto'] || 'https').toString().split(',')[0].trim();
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const origin = `${proto}://${host}`;
  const callback = `${origin}/api/health?path=github&action=callback`;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();

  if (action === 'start') {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      return res.status(503).json({ error: 'GitHub OAuth not configured' });
    }
    const state = crypto.randomBytes(32).toString('hex');
    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID);
    url.searchParams.set('redirect_uri', callback);
    url.searchParams.set('scope', 'read:user repo');
    url.searchParams.set('state', state);
    res.setHeader('Set-Cookie', cookie(STATE_COOKIE, state, { maxAge: 600 }));
    return res.redirect(url.toString());
  }

  if (action === 'callback') {
    const cookies = parseCookies(req.headers.cookie);
    const clear = cookie(STATE_COOKIE, '', { maxAge: 0 });
    if (req.query.error) {
      res.setHeader('Set-Cookie', clear);
      return res.redirect(`/?github_error=${encodeURIComponent(String(req.query.error))}`);
    }
    if (!safeEq(String(req.query.state), cookies[STATE_COOKIE]) || !req.query.code) {
      res.setHeader('Set-Cookie', clear);
      return res.redirect('/?github_error=invalid_state');
    }
    try {
      const token = await exchangeCode(String(req.query.code));
      await requestGH('/user', token);
      res.setHeader('Set-Cookie', [clear, cookie(SESSION_COOKIE, createSession(token), { maxAge: SESSION_TTL })]);
      return res.redirect('/?github=connected');
    } catch (e: any) {
      res.setHeader('Set-Cookie', clear);
      return res.redirect(`/?github_error=${encodeURIComponent(e.message)}`);
    }
  }

  if (action === 'logout') {
    return res.status(200).json({ connected: false }).setHeader('Set-Cookie', cookie(SESSION_COOKIE, '', { maxAge: 0 }));
  }

  const session = readSession(req);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  try {
    if (action === 'status') {
      const user = await requestGH('/user', session.token);
      return res.status(200).json({ connected: true, user: { login: user.login, avatar_url: user.avatar_url, name: user.name || user.login } });
    }
    if (action === 'repos') {
      const repos = await requestGH('/user/repos?sort=updated&per_page=30', session.token);
      return res.status(200).json({ repos: repos.map((r: any) => ({ full_name: r.full_name, private: r.private, updated_at: r.updated_at })) });
    }
    if (action === 'contents') {
      const { owner, repo, path = '' } = req.query;
      if (!owner || !repo) return res.status(400).json({ error: 'owner and repo required' });
      return res.status(200).json(await requestGH(`/repos/${owner}/${repo}/contents/${path}`, session.token));
    }
    return res.status(404).json({ error: 'Unknown action' });
  } catch (e: any) {
    return res.status(e.status || 502).json({ error: e.message || 'GitHub request failed' });
  }
}

// ─── BOUNTYWARZ: Session bridge ───
const bwSessions = new Map<string, any>();
async function handleBountyWarz(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'POST') {
    const { userId, mode = 'drone', difficulty = 'normal' } = req.body || {};
    const id = 'session_' + Date.now();
    const session = { id, userId, createdAt: Date.now(), mode, difficulty };
    bwSessions.set(id, session);
    return res.status(200).json({ status: 'ok', session });
  }
  return res.status(200).json({ status: 'ok', message: 'BountyWarz API active', sessions: bwSessions.size });
}

// ─── MAIN ROUTER ───
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = (req.query.path as string) || req.url?.split('?')[0].replace(/^\/api\//, '') || 'health';

  if (path === 'agent' || path.startsWith('agent')) return handleAgent(req, res);
  if (path === 'github' || path.startsWith('github')) return handleGitHub(req, res);
  if (path === 'bountywarz' || path.startsWith('bounty')) return handleBountyWarz(req, res);

  // Default: health check
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    status: 'healthy',
    service: 'athelgard-site',
    timestamp: new Date().toISOString(),
    version: '2.1.0',
    routes: ['/api/health?path=agent', '/api/health?path=github', '/api/health?path=bountywarz']
  });
}
