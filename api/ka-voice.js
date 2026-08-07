// /api/ka-voice — proxy to bountywarz.com (real Athelgard phone agent)
'use strict';
const { proxyToBountywarz } = require('./_lib/proxy-bountywarz');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    return res.status(204).end();
  }
  return proxyToBountywarz(req, res, '/api/ka-voice');
};
