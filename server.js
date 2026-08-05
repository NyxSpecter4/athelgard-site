// Athelgard API Server - Health Checks, Monitoring, Team Coordination
// Run: node server.js

const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;

// ===== HEALTH CHECK =====
async function checkDeepSeek(key) {
  if (!key) return { ok: false, error: 'No API key' };
  try {
    const https = require('https');
    return new Promise((resolve) => {
      const req = https.request({
        hostname: 'api.deepseek.com',
        path: '/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        timeout: 5000
      }, (res) => {
        if (res.statusCode === 401) resolve({ ok: false, error: 'Invalid API key' });
        else if (res.statusCode === 429) resolve({ ok: false, error: 'Rate limited' });
        else if (res.statusCode === 200) resolve({ ok: true, status: 'Connected' });
        else resolve({ ok: false, error: `HTTP ${res.statusCode}` });
      });
      req.on('error', (e) => resolve({ ok: false, error: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'Timeout' }); });
      req.write(JSON.stringify({ model: 'deepseek-chat', messages: [{role:'user', content:'hi'}], max_tokens: 5 }));
      req.end();
    });
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function checkKimi(key) {
  if (!key) return { ok: false, error: 'No API key' };
  try {
    const https = require('https');
    return new Promise((resolve) => {
      const req = https.request({
        hostname: 'api.moonshot.cn',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        timeout: 5000
      }, (res) => {
        if (res.statusCode === 401) resolve({ ok: false, error: 'Invalid API key' });
        else if (res.statusCode === 429) resolve({ ok: false, error: 'Rate limited' });
        else if (res.statusCode === 200) resolve({ ok: true, status: 'Connected' });
        else resolve({ ok: false, error: `HTTP ${res.statusCode}` });
      });
      req.on('error', (e) => resolve({ ok: false, error: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'Timeout' }); });
      req.write(JSON.stringify({ model: 'kimi-k2p6', messages: [{role:'user', content:'hi'}], max_tokens: 5 }));
      req.end();
    });
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function checkGitHub(token) {
  if (!token) return { ok: false, error: 'No token' };
  try {
    const https = require('https');
    return new Promise((resolve) => {
      const req = https.request({
        hostname: 'api.github.com',
        path: '/user',
        method: 'GET',
        headers: {
          'Authorization': `token ${token}`,
          'User-Agent': 'Athelgard/1.0'
        },
        timeout: 5000
      }, (res) => {
        if (res.statusCode === 401) resolve({ ok: false, error: 'Invalid token' });
        else if (res.statusCode === 200) {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try { const u = JSON.parse(data); resolve({ ok: true, status: `Connected (${u.login})` }); }
            catch (e) { resolve({ ok: true, status: 'Connected' }); }
          });
        }
        else resolve({ ok: false, error: `HTTP ${res.statusCode}` });
      });
      req.on('error', (e) => resolve({ ok: false, error: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'Timeout' }); });
      req.end();
    });
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ===== SERVER =====
const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Health check endpoint
  if (parsed.pathname === '/api/health') {
    const keys = {
      deepseek: parsed.query.ds_key || process.env.DEEPSEEK_KEY,
      kimi: parsed.query.kimi_key || process.env.KIMI_KEY,
      github: parsed.query.gh_token || process.env.GITHUB_TOKEN
    };
    
    const [ds, kimi, gh] = await Promise.all([
      checkDeepSeek(keys.deepseek),
      checkKimi(keys.kimi),
      checkGitHub(keys.github)
    ]);
    
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'healthy',
      version: '5.5',
      timestamp: new Date().toISOString(),
      services: {
        deepseek: ds,
        kimi: kimi,
        github: gh
      },
      all_ok: ds.ok && kimi.ok && gh.ok
    }, null, 2));
    return;
  }
  
  // Team status endpoint
  if (parsed.pathname === '/api/team') {
    res.writeHead(200);
    res.end(JSON.stringify({
      agents: [
        { name: 'MELI', status: 'active', role: 'Brain', task: 'Ethical hunt loop' },
        { name: 'MakoThoth', status: 'active', role: 'Builder', task: 'UI/CLI integration' },
        { name: 'Mistral', status: 'active', role: 'Reviewer', task: 'Code review' },
        { name: 'CodeRabbit', status: 'active', role: 'Reviewer', task: 'PR review' },
        { name: 'Qodo', status: 'active', role: 'Reviewer', task: 'Code analysis' },
        { name: 'Copilot', status: 'active', role: 'Fixer', task: 'Bug fixes' },
        { name: 'Devin', status: 'offline', role: 'Builder', reason: 'Out of tokens' },
        { name: 'Grok', status: 'offline', role: 'Research', reason: 'Rate limited' }
      ],
      last_updated: new Date().toISOString()
    }, null, 2));
    return;
  }
  
  // Benchmark endpoint
  if (parsed.pathname === '/api/benchmark') {
    // Return MELI's benchmark suite status
    res.writeHead(200);
    res.end(JSON.stringify({
      suites: [
        { name: 'repo-read', total: 20, passing: 0, status: 'not_run' },
        { name: 'repo-change', total: 15, passing: 0, status: 'not_run' },
        { name: 'tool-use', total: 20, passing: 0, status: 'not_run' },
        { name: 'security-boundary', total: 15, passing: 0, status: 'not_run' },
        { name: 'cost-routing', total: 10, passing: 0, status: 'not_run' },
        { name: 'knowledge', total: 25, passing: 0, status: 'not_run' }
      ],
      total: 105,
      passing: 0,
      status: 'ready_to_run'
    }, null, 2));
    return;
  }
  
  // Default: 404
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found', endpoints: ['/api/health', '/api/team', '/api/benchmark'] }));
});

server.listen(PORT, () => {
  console.log(`🦉 Athelgard API running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Team:   http://localhost:${PORT}/api/team`);
});
