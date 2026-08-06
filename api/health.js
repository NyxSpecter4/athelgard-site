const brain = require('../modules/brain');
const config = require('../modules/config');

module.exports = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    version: '2.0.0',
    timestamp: Date.now(),
    uptime: process.uptime(),
    brain: brain.getStatus(),
    config: config.getStatus(),
    message: 'Athelgard - Merge Master Active'
  }));
};