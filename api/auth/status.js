/**
 * Auth status endpoint
 * Returns which services are currently connected (reads httpOnly cookies).
 * Never returns tokens — only boolean connected flags and public user info.
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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = parseCookies(req);

  const status = {
    github: { connected: false },
    vercel: { connected: false },
    supabase: { connected: false },
  };

  // GitHub
  if (cookies.athelgard_github_token) {
    try {
      const r = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${cookies.athelgard_github_token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Athelgard-Agent',
        },
      });
      if (r.ok) {
        const u = await r.json();
        status.github = { connected: true, user: u.login, name: u.name };
      }
    } catch (_) { /* token invalid */ }
  }

  // Vercel
  if (cookies.athelgard_vercel_token) {
    try {
      const r = await fetch('https://api.vercel.com/v2/user', {
        headers: { Authorization: `****** },
      });
      if (r.ok) {
        const d = await r.json();
        const u = d?.user;
        status.vercel = { connected: true, user: u?.username || u?.name };
      }
    } catch (_) { /* token invalid */ }
  }

  // Supabase
  if (cookies.athelgard_supabase_creds) {
    try {
      const creds = JSON.parse(
        Buffer.from(cookies.athelgard_supabase_creds, 'base64').toString('utf8')
      );
      const r = await fetch(`${creds.url}/rest/v1/`, {
        headers: { apikey: creds.key, Authorization: `****** },
      });
      if (r.ok) {
        status.supabase = { connected: true, url: creds.url };
      }
    } catch (_) { /* invalid */ }
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(status);
}
