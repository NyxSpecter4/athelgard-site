// /api/twilio/voice — if Twilio Console still points here, proxy to real ka-voice.
// Do NOT invent a second voice stack (DeepSeek/Polly). One brain: bountywarz ka-voice.
'use strict';
const { proxyToBountywarz } = require('../_lib/proxy-bountywarz');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  return proxyToBountywarz(req, res, '/api/ka-voice');
};
