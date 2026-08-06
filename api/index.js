const http = require('http');
const url = require('url');

// Import our modules
const brain = require('../modules/brain');
const config = require('../modules/config');

// Create a simple HTTP server for API routes
const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  
  // Health check
  if (pathname === '/api/health' || pathname === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'ok',
      version: '2.0.0',
      timestamp: Date.now(),
      brain: brain.getStatus(),
      services: {
        github: config.GITHUB.clientId ? 'configured' : 'not_configured',
        deepseek: config.AI.DEEPSEEK.apiKey ? 'configured' : 'not_configured',
        kimi: config.AI.KIMI.apiKey ? 'configured' : 'not_configured'
      }
    }));
  }
  
  // GitHub OAuth endpoints
  if (pathname.startsWith('/api/github')) {
    const github = require('./github');
    return github.handleGitHub(req, res, parsed.query);
  }
  
  // BountyWarz endpoints  
  if (pathname.startsWith('/api/bountywarz')) {
    const bw = require('./bountywarz');
    return bw.handleRequest(req, res, pathname, parsed.query);
  }
  
  // Default API response
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', message: 'Athelgard API v2.0' }));
});

module.exports = server;