// /api/tts — proxy to bountywarz.com (ElevenLabs / phone TTS)
'use strict';
const { proxyToBountywarz } = require('./_lib/proxy-bountywarz');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  return proxyToBountywarz(req, res, '/api/tts');
};
