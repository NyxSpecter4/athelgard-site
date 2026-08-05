/**
 * GitHub API proxy
 * Forwards requests to api.github.com using the httpOnly-cookie token.
 * The token is never sent to or readable by client-side JS.
 *
 * Usage: POST /api/github/proxy
 * Body: { endpoint: '/user/repos', method: 'GET', data: null }
 */

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return Object.fromEntries(
    header.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=');
      return [k, decodeURIComponent(v.join('='))];
    })
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = parseCookies(req);
  const token = cookies.athelgard_github_token;

  if (!token) {
    return res.status(401).json({ error: 'Not connected to GitHub' });
  }

  const { endpoint, method = 'GET', data } = req.body || {};

  if (!endpoint || typeof endpoint !== 'string') {
    return res.status(400).json({ error: 'endpoint is required' });
  }

  // Only allow requests to the GitHub API
  if (!endpoint.startsWith('/')) {
    return res.status(400).json({ error: 'endpoint must start with /' });
  }

  const url = `https://api.github.com${endpoint}`;
  const fetchOptions = {
    method: method.toUpperCase(),
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Athelgard-Agent',
    },
  };

  if (data && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(fetchOptions.method)) {
    fetchOptions.headers['Content-Type'] = 'application/json';
    fetchOptions.body = JSON.stringify(data);
  }

  try {
    const ghRes = await fetch(url, fetchOptions);
    const body = ghRes.status === 204 ? { success: true } : await ghRes.json();
    return res.status(ghRes.status).json(body);
  } catch (err) {
    console.error('[github/proxy] error:', err);
    return res.status(500).json({ error: 'Proxy request failed' });
  }
}
