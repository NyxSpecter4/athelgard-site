// /api/twilio/speech — proxy to bountywarz.com ka-voice reply loop
// SELF-CONTAINED — no shared modules, zero dependencies.
'use strict';

const https = require('https');
const UPSTREAM = (process.env.VOICE_UPSTREAM || 'https://bountywarz.com').replace(/\/$/, '');

function twimlError(msg) {
  return '<?xml version="1.0" encoding="UTF-8"?>' +
    '<Response><Say>' + msg + '</Say><Hangup/></Response>';
}

function fetchUpstream(url, method, headers, body) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), 14000);
    const p = new URL(url);
    const r = https.request({
      hostname: p.hostname, port: p.port || 443,
      path: p.pathname + p.search, method: method || 'POST',
      headers: headers || {}
    }, (res) => {
      clearTimeout(t);
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(chunks)
      }));
    });
    r.on('error', (e) => { clearTimeout(t); reject(e); });
    if (body) r.write(body);
    r.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('content-type', 'text/xml');
  res.setHeader('cache-control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(204).end();
  }

  const url = UPSTREAM + '/api/ka-voice' + (req.url || '').replace('/api/twilio/speech', '') + '&step=reply&mode=default';

  const headers = {
    'content-type': req.headers['content-type'] || 'application/x-www-form-urlencoded',
    'x-forwarded-host': req.headers.host || 'athelgard.io',
    'x-athelgard-voice-proxy': '1',
    'user-agent': 'Athelgard-Voice-Proxy/2.0'
  };
  if (req.headers['x-twilio-signature']) {
    headers['x-twilio-signature'] = req.headers['x-twilio-signature'];
  }

  let body = null;
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    body = new URLSearchParams(req.body).toString();
  } else if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
    body = req.body;
  }

  try {
    const up = await fetchUpstream(url, req.method, headers, body);
    res.statusCode = up.status || 200;
    res.end(up.body);
  } catch (e) {
    console.error('[speech] upstream fail:', e.message);
    res.statusCode = 200;
    res.end(twimlError('Athelgard is briefly unavailable. Please try again.'));
  }
};
