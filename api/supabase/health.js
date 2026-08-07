// api/supabase/health.js — Supabase Connection Health Check
// Tests if Supabase env vars are set and connection works

const { SupabaseClient } = require('../../lib/supabase');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const url = process.env.SUPABASE_URL || process.env.SUPABASE_REST_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

  const diagnostics = {
    configured: !!(url && key),
    url: url ? `${url.substring(0, 20)}...` : 'NOT SET',
    key: key ? `${key.substring(0, 10)}...` : 'NOT SET',
    tested: false,
    error: null,
    tables: null,
    timestamp: new Date().toISOString()
  };

  if (!url || !key) {
    return res.status(503).json({
      ...diagnostics,
      error: 'Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel dashboard.'
    });
  }

  try {
    const client = new SupabaseClient(url, key);
    const health = await client.health();
    
    diagnostics.tested = true;
    diagnostics.ok = health.ok;
    
    if (!health.ok) {
      diagnostics.error = health.error;
      return res.status(502).json(diagnostics);
    }

    // Try to get auth user (tests auth endpoint)
    try {
      const user = await client.authUser();
      diagnostics.auth = { ok: true, user: user?.email || 'anonymous' };
    } catch (authErr) {
      diagnostics.auth = { ok: false, error: authErr.message };
    }

    return res.status(200).json(diagnostics);
  } catch (e) {
    diagnostics.tested = true;
    diagnostics.error = e.message;
    return res.status(500).json(diagnostics);
  }
};
