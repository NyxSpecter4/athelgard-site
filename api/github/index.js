const crypto = require('crypto');

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

function json(res, status, body) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.status(status).json(body);
}

function appOrigin(req) {
  const protocol = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${protocol}://${host}`;
}

async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const action = req.query.action || 'status';
  const origin = appOrigin(req);
  const callbackUrl = `${origin}/auth/github/callback`;

  if (action === 'start') {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      return json(res, 503, { error: 'GitHub OAuth not configured' });
    }
    const state = crypto.randomBytes(32).toString('hex');
    const authorize = new URL('https://github.com/login/oauth/authorize');
    authorize.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID);
    authorize.searchParams.set('redirect_uri', callbackUrl);
    authorize.searchParams.set('scope', 'read:user repo');
    authorize.searchParams.set('state', state);
    return redirect(res, authorize.toString(), [cookie('athelgard_oauth_state', state, { maxAge: 600 })]);
  }

  if (req.url?.includes('/callback') || action === 'callback') {
    const cookies = req.headers.cookie || '';
    const stateCookie = cookies.split(';').find(c => c.includes('athelgard_oauth_state'))?.split('=')[1];
    if (req.query.error) {
      return redirect(res, `/?github_error=${encodeURIComponent(String(req.query.error))}`);
    }
    if (!stateCookie || req.query.state !== stateCookie || !req.query.code) {
      return redirect(res, '/?github_error=invalid_state');
    }
    return redirect(res, '/?github=connected');
  }

  return json(res, 200, { oauthConfigured: !!process.env.GITHUB_CLIENT_ID, connected: false });
}

module.exports = handler;