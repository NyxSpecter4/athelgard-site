import { VercelRequest, VercelResponse } from '@vercel/node';
import * as https from 'https';
import * as crypto from 'crypto';

// ─── IN-MEMORY STORES (use Redis/DB in production) ───
const userSessions = new Map<string, { token: string; login: string; avatar: string; createdAt: number }>();
const cliPairCodes = new Map<string, { userId: string; token: string; createdAt: number; used: boolean }>();

// ─── RATE LIMITING ───
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 60;
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(req: VercelRequest): { allowed: boolean; retryAfter?: number } {
  const key = String(req.headers['x-forwarded-for'] || 'unknown');
  const now = Date.now();
  const entry = requestCounts.get(key);
  
  if (!entry || now > entry.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true };
  }
  
  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetTime - now) / 1000) };
  }
  
  entry.count++;
  return { allowed: true };
}

// ─── SECURITY HEADERS ───
function setSecurityHeaders(res: VercelResponse) {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
}

function setCorsHeaders(res: VercelResponse) {
  const allowedOrigin = process.env.VERCEL || process.env.NODE_ENV === 'production' 
    ? 'https://athelgard.io' 
    : 'http://localhost:3000';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

const SESSION_COOKIE = 'athelgard_session';
const STATE_COOKIE = 'athelgard_oauth_state';
const SESSION_TTL = 1000 * 60 * 60 * 24 * 7;
const PAIR_CODE_TTL = 1000 * 60 * 5;
const MAX_BODY_SIZE = 1024 * 1024; // 1MB

// ─── UTILS ───
function base64url(v: string | Buffer): string {
  const input = typeof v === 'string' ? v : v.toString();
  return Buffer.from(input).toString('base64url');
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
  const x = Buffer.from(a, 'utf8');
  const y = Buffer.from(b, 'utf8');
  if (x.length !== y.length) return false;
  return crypto.timingSafeEqual(x as unknown as Uint8Array, y as unknown as Uint8Array);
}

function getSessionSecret(): string {
  if (!process.env.GITHUB_SESSION_SECRET) {
    throw new Error('GITHUB_SESSION_SECRET environment variable is required');
  }
  return process.env.GITHUB_SESSION_SECRET;
}

function createSession(userId: string, token: string): string {
  const payload = base64url(JSON.stringify({ userId, token, exp: Date.now() + SESSION_TTL }));
  return `${payload}.${sign(payload, getSessionSecret())}`;
}

function readSession(req: VercelRequest): { userId: string; token: string; exp: number } | null {
  const raw = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (!raw) return null;
  const [payload, sig] = raw.split('.');
  if (!payload || !safeEq(sig, sign(payload, getSessionSecret()))) return null;
  try {
    const sess = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return sess.exp > Date.now() && sess.userId ? sess : null;
  } catch { return null; }
}

function requireAuth(req: VercelRequest, res: VercelResponse): { userId: string; token: string; exp: number } | null {
  const session = readSession(req);
  if (!session) {
    res.status(401).json({ error: 'Not authenticated. Login with GitHub first.' });
    return null;
  }
  return session;
}

function checkBodySize(req: VercelRequest): boolean {
  const size = parseInt(req.headers['content-length'] || '0');
  return size <= MAX_BODY_SIZE;
}

function requestGH(path: string, token: string, method = 'GET', body?: any): Promise<any> {
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

// ─── AGENT: AI Bridge ───
async function handleAgent(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(res);
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  if (!checkBodySize(req)) {
    return res.status(413).json({ error: 'Request body too large' });
  }

  const session = requireAuth(req, res);
  if (!session) return;

  const key = process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_KEY;
  if (!key) return res.status(503).json({ error: 'AI service not configured' });

  const { message, model = 'deepseek-chat' } = req.body || {};
  if (!message || typeof message !== 'string' || message.length > 10000) {
    return res.status(400).json({ error: 'Message required (max 10000 chars)' });
  }

  try {
    const result: any = await new Promise((resolve, reject) => {
      const data = JSON.stringify({
        model, messages: [
          { role: 'system', content: 'You are Athelgard, an elite ethical hacking mentor. Help the user code, review security, and improve their projects.' },
          { role: 'user', content: `[User: ${session.userId}]

${message}` }
        ],
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

    return res.status(200).json({
      response: result.choices?.[0]?.message?.content || 'No response',
      model, usage: result.usage || {}
    });
  } catch (e: any) {
    console.error('Agent error:', e);
    return res.status(502).json({ error: 'AI service unavailable' });
  }
}

// ─── GITHUB: OAuth + API Proxy ───
async function handleGitHub(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(res);
  setCorsHeaders(res);
  
  const action = String(req.query.action || 'status');
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'athelgard.io');
  const origin = `${proto}://${host}`;

  if (req.method === 'OPTIONS') return res.status(204).end();

  // OAuth Start
  if (action === 'login') {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      return res.status(503).json({ error: 'GitHub OAuth not configured' });
    }
    const state = crypto.randomBytes(32).toString('hex');
    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID);
    url.searchParams.set('redirect_uri', `${origin}/api/health?path=github&action=callback`);
    url.searchParams.set('scope', 'read:user repo');
    url.searchParams.set('state', state);
    res.setHeader('Set-Cookie', cookie(STATE_COOKIE, state, { maxAge: 600 }));
    return res.redirect(url.toString());
  }

  // OAuth Callback
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
      const user = await requestGH('/user', token);
      const userId = String(user.id);
      userSessions.set(userId, { token, login: user.login, avatar: user.avatar_url, createdAt: Date.now() });
      res.setHeader('Set-Cookie', [clear, cookie(SESSION_COOKIE, createSession(userId, token), { maxAge: 604800 })]);
      return res.redirect('/?github=connected');
    } catch (e: any) {
      res.setHeader('Set-Cookie', clear);
      return res.redirect(`/?github_error=${encodeURIComponent(e.message)}`);
    }
  }

  // Logout
  if (action === 'logout') {
    const session = readSession(req);
    if (session) userSessions.delete(session.userId);
    res.setHeader('Set-Cookie', cookie(SESSION_COOKIE, '', { maxAge: 0 }));
    return res.status(200).json({ connected: false });
  }

  // Status
  if (action === 'status') {
    const session = readSession(req);
    if (!session) return res.status(200).json({ connected: false, message: 'Login with GitHub to start coding' });
    const user = userSessions.get(session.userId);
    if (!user) return res.status(200).json({ connected: false, message: 'Session expired' });
    return res.status(200).json({
      connected: true,
      user: { login: user.login, avatar_url: user.avatar },
      message: `Welcome back, ${user.login}! Ready to code.`
    });
  }

  // CLI Pair Code Generation
  if (action === 'cli-code') {
    const session = requireAuth(req, res);
    if (!session) return;
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    cliPairCodes.set(code, { userId: session.userId, token: session.token, createdAt: Date.now(), used: false });
    return res.status(200).json({
      code,
      expiresIn: '5 minutes',
      instruction: `Run: athelgard connect ${code}`
    });
  }

  // CLI Token Exchange
  if (action === 'cli-connect') {
    const { code } = req.body || {};
    if (!code || typeof code !== 'string') return res.status(400).json({ error: 'Pairing code required' });
    const pair = cliPairCodes.get(code.toUpperCase());
    if (!pair || pair.used || Date.now() - pair.createdAt > PAIR_CODE_TTL) {
      return res.status(401).json({ error: 'Invalid or expired code' });
    }
    pair.used = true;
    const user = userSessions.get(pair.userId);
    return res.status(200).json({
      token: pair.token,
      user: { login: user?.login, id: pair.userId },
      message: 'CLI connected! You can now code.'
    });
  }

  // API Proxy (repos, contents, etc) - all require auth
  if (['repos', 'contents', 'search'].includes(action)) {
    const session = requireAuth(req, res);
    if (!session) return;

    try {
      if (action === 'repos') {
        const repos = await requestGH('/user/repos?sort=updated&per_page=30', session.token);
        return res.status(200).json({ repos: repos.map((r: any) => ({ full_name: r.full_name, private: r.private, updated_at: r.updated_at })) });
      }
      if (action === 'contents') {
        try {
          const url = new URL(req.url || '', `https://${req.headers.host}`);
          const owner = url.searchParams.get('owner') || '';
          const repo = url.searchParams.get('repo') || '';
          const filePath = url.searchParams.get('path') || '';
          if (!owner || !repo) {
            return res.status(400).json({ error: 'owner and repo query params required' });
          }
          const apiPath = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(filePath)}`;
          const data = await requestGH(apiPath, session.token);
          return res.status(200).json(data);
        } catch (innerErr: any) {
          console.error('Contents error:', innerErr.message);
          return res.status(502).json({ error: 'Failed to load contents' });
        }
      }
      if (action === 'search') {
        const query = String(req.query.q || '').trim();
        if (!query || query.length > 200) return res.status(400).json({ error: 'Search query required' });
        return res.status(200).json(await requestGH(`/search/repositories?q=${encodeURIComponent(query)}&per_page=5`, session.token));
      }
      return res.status(404).json({ error: 'Unknown action' });
    } catch (e: any) {
      console.error('GitHub proxy error:', e.message);
      return res.status(502).json({ error: 'GitHub request failed' });
    }
  }

  return res.status(404).json({ error: 'Unknown action' });
}

// ─── BOUNTYWARZ: Session bridge ───
const bwSessions = new Map<string, any>();
async function handleBountyWarz(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(res);
  setCorsHeaders(res);
  
  if (!checkBodySize(req)) {
    return res.status(413).json({ error: 'Request body too large' });
  }
  
  if (req.method === 'POST') {
    const { userId, mode = 'drone', difficulty = 'normal' } = req.body || {};
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId required' });
    }
    const id = 'session_' + Date.now();
    const session = { id, userId, createdAt: Date.now(), mode, difficulty };
    bwSessions.set(id, session);
    return res.status(200).json({ status: 'ok', session });
  }
  return res.status(200).json({ status: 'ok', message: 'BountyWarz API active', sessions: bwSessions.size });
}

// ─── MAIN ROUTER ───
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Rate limiting
  const rateCheck = checkRateLimit(req);
  if (!rateCheck.allowed) {
    res.setHeader('Retry-After', String(rateCheck.retryAfter));
    return res.status(429).json({ error: 'Too many requests', retryAfter: rateCheck.retryAfter });
  }
  
  // Body size check for POST
  if (req.method === 'POST' && !checkBodySize(req)) {
    return res.status(413).json({ error: 'Request body too large' });
  }

  const path = String((req.query.path as string) || req.url?.split('?')[0].replace(/^\/api\//, '') || 'health');

  if (path === 'agent' || path.startsWith('agent')) return handleAgent(req, res);
  if (path === 'github' || path.startsWith('github')) return handleGitHub(req, res);
  if (path === 'bountywarz' || path.startsWith('bounty')) return handleBountyWarz(req, res);

  // Default: health + user info
  setSecurityHeaders(res);
  setCorsHeaders(res);
  
  const session = readSession(req);
  const user = session ? userSessions.get(session.userId) : null;
  
  return res.status(200).json({
    status: 'healthy',
    service: 'athelgard',
    version: '3.0.0',
    authenticated: !!user,
    user: user ? { login: user.login, avatar: user.avatar } : null,
    routes: [
      '/api/health?path=agent',
      '/api/health?path=github&action=login',
      '/api/health?path=github&action=status',
      '/api/health?path=github&action=cli-code',
      '/api/health?path=github&action=repos'
    ]
  });
}
