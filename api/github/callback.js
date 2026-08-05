/**
 * GitHub OAuth callback handler
 * Exchanges the temporary `code` for an access token server-side.
 * The token is stored in an httpOnly, Secure, SameSite=Lax cookie —
 * it is never returned to the browser JS context.
 */
export default async function handler(req, res) {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing OAuth code' });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'GitHub OAuth not configured' });
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      return res.status(400).json({ error: tokenData.error_description || 'Token exchange failed' });
    }

    // Verify the token works by fetching the user
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${tokenData.access_token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Athelgard-Agent',
      },
    });

    if (!userRes.ok) {
      return res.status(400).json({ error: 'Token verification failed' });
    }

    const user = await userRes.json();

    // Store token in httpOnly cookie — never exposed to client JS
    const cookieOptions = [
      `athelgard_github_token=${tokenData.access_token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Max-Age=31536000', // 1 year
      process.env.NODE_ENV === 'production' ? 'Secure' : '',
    ]
      .filter(Boolean)
      .join('; ');

    res.setHeader('Set-Cookie', cookieOptions);

    // Redirect back to the app with a success flag (no token in URL)
    res.redirect(302, `/?connected=github&user=${encodeURIComponent(user.login)}`);
  } catch (err) {
    console.error('[github/callback] error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
