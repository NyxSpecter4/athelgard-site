/**
 * Vercel OAuth callback handler
 * Exchanges the temporary `code` for an access token server-side.
 * The token is stored in an httpOnly, Secure, SameSite=Lax cookie.
 */
export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing OAuth code' });
  }

  const clientId = process.env.VERCEL_CLIENT_ID;
  const clientSecret = process.env.VERCEL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Vercel OAuth not configured' });
  }

  const redirectUri =
    process.env.VERCEL_REDIRECT_URI ||
    `https://${req.headers.host}/api/vercel/callback`;

  try {
    const tokenRes = await fetch('https://api.vercel.com/v2/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      return res.status(400).json({ error: tokenData.error || 'Token exchange failed' });
    }

    // Verify by fetching user info
    const userRes = await fetch('https://api.vercel.com/v2/user', {
      headers: { Authorization: `****** },
    });

    if (!userRes.ok) {
      return res.status(400).json({ error: 'Token verification failed' });
    }

    const userData = await userRes.json();
    const username = userData?.user?.username || userData?.user?.name || 'user';

    const cookieOptions = [
      `athelgard_vercel_token=${tokenData.access_token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Max-Age=31536000',
      process.env.NODE_ENV === 'production' ? 'Secure' : '',
    ]
      .filter(Boolean)
      .join('; ');

    res.setHeader('Set-Cookie', cookieOptions);
    res.redirect(302, `/?connected=vercel&user=${encodeURIComponent(username)}`);
  } catch (err) {
    console.error('[vercel/callback] error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
