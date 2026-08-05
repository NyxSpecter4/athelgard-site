/**
 * Supabase API proxy
 * Proxies read-only (and limited write) queries to Supabase PostgREST
 * using the httpOnly-cookie credentials.
 * The service-role key is never exposed to client-side JS.
 *
 * Usage: POST /api/supabase/proxy
 * Body: { path: '/rest/v1/my_table?select=*&limit=10', method: 'GET' }
 *
 * Only GET requests are allowed through this proxy (read-only).
 * For introspection: path = '/rest/v1/'
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
  const credsCookie = cookies.athelgard_supabase_creds;

  if (!credsCookie) {
    return res.status(401).json({ error: 'Not connected to Supabase' });
  }

  let creds;
  try {
    creds = JSON.parse(Buffer.from(credsCookie, 'base64').toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Invalid credentials cookie' });
  }

  const { path, method = 'GET' } = req.body || {};

  if (!path || typeof path !== 'string') {
    return res.status(400).json({ error: 'path is required' });
  }

  // Enforce read-only: only GET requests allowed
  if (method.toUpperCase() !== 'GET') {
    return res.status(403).json({ error: 'Only GET (read-only) queries are allowed via this proxy' });
  }

  // Only allow paths into /rest/v1/ to prevent SSRF against other Supabase endpoints
  if (!path.startsWith('/rest/v1/')) {
    return res.status(400).json({ error: 'path must start with /rest/v1/' });
  }

  const url = `${creds.url}${path}`;

  try {
    const sbRes = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: creds.key,
        Authorization: `****** 'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    const body = await sbRes.json().catch(() => ({}));
    return res.status(sbRes.status).json(body);
  } catch (err) {
    console.error('[supabase/proxy] error:', err);
    return res.status(500).json({ error: 'Proxy request failed' });
  }
}
