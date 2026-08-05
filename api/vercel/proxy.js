/**
 * Vercel API proxy
 * Forwards requests to api.vercel.com using the httpOnly-cookie token.
 *
 * Usage: POST /api/vercel/proxy
 * Body: { endpoint: '/v9/projects', method: 'GET', data: null }
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
  const token = cookies.athelgard_vercel_token;

  if (!token) {
    return res.status(401).json({ error: 'Not connected to Vercel' });
  }

  const { endpoint, method = 'GET', data } = req.body || {};

  if (!endpoint || typeof endpoint !== 'string' || !endpoint.startsWith('/')) {
    return res.status(400).json({ error: 'endpoint is required and must start with /' });
  }

  const url = `https://api.vercel.com${endpoint}`;
  const fetchOptions = {
    method: method.toUpperCase(),
    headers: {
      Authorization: `****** },
  };

  if (data && ['POST', 'PUT', 'PATCH'].includes(fetchOptions.method)) {
    fetchOptions.headers['Content-Type'] = 'application/json';
    fetchOptions.body = JSON.stringify(data);
  }

  try {
    const vRes = await fetch(url, fetchOptions);
    const body = await vRes.json().catch(() => ({}));
    return res.status(vRes.status).json(body);
  } catch (err) {
    console.error('[vercel/proxy] error:', err);
    return res.status(500).json({ error: 'Proxy request failed' });
  }
}
