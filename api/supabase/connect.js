/**
 * Supabase connect handler
 * Accepts a project URL + service-role key (or anon key) from the user,
 * verifies the connection, then stores the credentials in an httpOnly cookie.
 * The service-role key is NEVER returned to client-side JS.
 *
 * Usage: POST /api/supabase/connect
 * Body: { url: 'https://xxx.supabase.co', key: '<service_role_or_anon_key>' }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, key } = req.body || {};

  if (!url || !key) {
    return res.status(400).json({ error: 'url and key are required' });
  }

  // Validate the URL looks like a Supabase project URL
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  if (!parsedUrl.hostname.endsWith('.supabase.co') && !parsedUrl.hostname.endsWith('.supabase.com')) {
    return res.status(400).json({ error: 'URL must be a Supabase project URL' });
  }

  const baseUrl = parsedUrl.origin;

  // Verify the key by hitting the PostgREST root (lightweight introspection call)
  try {
    const testRes = await fetch(`${baseUrl}/rest/v1/`, {
      headers: {
        apikey: key,
        Authorization: `****** },
    });

    if (!testRes.ok) {
      return res.status(400).json({ error: 'Supabase connection failed — check your URL and key' });
    }

    // Encode both url and key together in a single cookie value
    const payload = Buffer.from(JSON.stringify({ url: baseUrl, key })).toString('base64');

    const cookieOptions = [
      `athelgard_supabase_creds=${payload}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Max-Age=31536000',
      process.env.NODE_ENV === 'production' ? 'Secure' : '',
    ]
      .filter(Boolean)
      .join('; ');

    res.setHeader('Set-Cookie', cookieOptions);
    return res.status(200).json({ connected: true, url: baseUrl });
  } catch (err) {
    console.error('[supabase/connect] error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
