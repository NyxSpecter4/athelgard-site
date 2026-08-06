const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function serveFile(filePath, res) {
  const fullPath = path.join(__dirname, filePath);
  fs.exists(fullPath, (exists) => {
    if (!exists) { res.writeHead(404); return res.end('Not Found'); }
    fs.readFile(fullPath, (err, data) => {
      if (err) { res.writeHead(500); return res.end('Server Error'); }
      const ext = path.extname(fullPath);
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
      res.end(data);
    });
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  
  if (pathname.startsWith('/api/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', message: 'Athelgard API active', version: '2.0.0' }));
  }
  
  serveFile(pathname === '/' ? '/index.html' : pathname, res);
});

server.listen(PORT, () => {
  console.log('🦉 Athelgard Server v2.0 running on port', PORT);
  console.log('✅ Merge complete - All team contributions synthesized');
  console.log('🌐 Open http://localhost:' + PORT);
});

module.exports = server;