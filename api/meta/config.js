/**
 * Public metadata endpoint
 * Returns non-secret public config like OAuth client IDs.
 * Client secrets are NEVER returned here.
 */
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).json({
    githubClientId: process.env.GITHUB_CLIENT_ID || '',
    vercelClientId: process.env.VERCEL_CLIENT_ID || '',
  });
}
