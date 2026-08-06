// Vercel serverless GitHub OAuth bridge (TypeScript)
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
  return crypto.createHmac('sha256', secret).update(value).digest('base64url
');
}

function safeEqual(left: string, right: string): boolean {
  if (!left || !right) return false;
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function getSessionSecret(): string {
  // mELI fix: derive from existing secrets, don't hard-require GITHUB_SESSION_SECRET
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

function requestGitHub(path: string, token: string | null = null, method = 'GET', body?: any): Promise<any> {
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
      
  response.on('data', chunk => {
          data += chunk;
        });
        response.on('end', () => {
          let parsed: any = {};
          try {
            parsed = data ? JSON.parse(data) : {};
          } catch {
            parsed = { message: 'Unexpected GitHub response' };
          }
          if (response.statusCode! < 200 || response.statusCode! > 299) {
            const error = new Error(parsed.message || `GitHub ${response.statusCode}`);
            (error as any).status = response.statusCode;
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

function exchangeCode(code: string): Promise<string> {
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
        response.on('data', chunk => {
          data += chunk;
        });
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

function requireSession(req: any, res: any) {

  const session = readSession(req);
  if (!session) {
    json(res, 401, { error: 'GitHub is not connected' });
    return null;
  }
  return session;
}

function getMissingConfig(): string[] {
  // mELI fix: GITHUB_SESSION_SECRET is now derived from GITHUB_CLIENT_SECRET
  return ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'].filter(name => !process.env[name]);
}

async function buildStatus(req: any) {
  const missing = getMissingConfig();
  if (missing.length) {
    return {
      oauthConfigured: false,
      connected: false,
      missing,
    };
  }

  const session = readSession(req);
  if (!session) {
    return {
      oauthConfigured: true,
      connected: false,
      missing: [],
    };
  }

  const [user, repos] = await Promise.all([
    requestGitHub('/user', session.token),
    requestGitHub('/user/repos?sort=updated&per_page=5', session.token),
  ]);

  return {
    oauthConfigured: true,
    connected: true,
    missing: [],
    user: {
      login: user.login,
      avatar_url: user.avatar_url,
      name: user.name || user.login,
    },
    repos: repos.map((repo: any) => ({
      id: repo.id,
      full_name: repo.full_name,
      private: repo.private,
      default_branch: repo.default_branch,
      updated_at: repo.updated_at,
      html_url: repo.html_url,
    })),
  };
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
    try {
      return json(res, 200, await buildStatus(req));
    } catch (error: any) {
      return json(res, error.status || 502, {
        oauthConfigured: true,
  
      connected: false,
        error: error.message || 'GitHub request failed.',
      });
    }
  }

  if (action === 'start') {
    if (getMissingConfig().length) {
      return json(res, 503, { error: 'GitHub OAuth is not configured on this deployment yet.' });
    }
    const state = crypto.randomBytes(32).toString('hex');
    const authorize = new URL('https://github.com/login/oauth/authorize');
    authorize.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID!);
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
    } catch (error: any) {
      return redirect(res, `/?github_error=${encodeURIComponent(error.message)}`, [clearState]);
    }
  }

  if (action === 'logout') {
    return json(res, 200, { connected: false }, [cookie(SESSION_COOKIE, '', { maxAge: 0 })]);
  }

  const session = requireSession(req, res);
  if (!session) return;

  try {
    if (action === 'repos') {
      const repos = await requestGitHub('/user/repos?sort=updated&per_page=30', session.token);
      return json(res, 200, {
        repos: repos.map((repo: any) => ({
          id: repo.id,
        
  full_name: repo.full_name,
          private: repo.private,
          default_branch: repo.default_branch,
          updated_at: repo.updated_at,
          html_url: repo.html_url,
        })),
      });
    }
    if (action === 'contents') {
      const { owner, repo, path: filePath = '' } = req.query;
      if (!owner || !repo || !/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) {
        return json(res, 400, { error: 'A valid owner and repository are required.' });
      }
      const ref = req.query.ref ? `?ref=${encodeURIComponent(req.query.ref)}` : '';
      return json(
        res,
        200,
        await requestGitHub(
          `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${filePath
            .split('/')
            .map(encodeURIComponent)
            .join('/')}${ref}`,
          session.token
        )
      );
    }
    if (action === 'search') {
      const query = String(req.query.q || '').trim();
      if (!query || query.length > 200) return json(res, 400, { error: 'A short repository search query is required.' });
      return json(res, 200, await requestGitHub(`/search/repositories?q=${encodeURIComponent(query)}&per_page=5`, session.token));
    }
    return json(res, 404, { error: 'Unknown GitHub action.' });
  } catch (error: any) {
    return json(res, error.status || 502, { error: error.message || 'GitHub request failed.' });
  }
}
