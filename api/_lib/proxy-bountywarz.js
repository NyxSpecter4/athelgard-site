// Proxy Twilio / voice / TTS traffic to the host that actually serves them.
//
// ROOT CAUSE (verified live 2026-08-07):
//   POST https://athelgard.io/api/ka-voice  -> 404 NOT_FOUND
//   POST https://bountywarz.com/api/ka-voice -> 200 valid TwiML
//   GET  https://athelgard.io/api/tts        -> 404
//   GET  https://bountywarz.com/api/tts      -> 200 audio/mpeg
//
// athelgard.io is the IDE project. The real phone agent lives on bountywarz.com.
// Twilio still webhooks athelgard.io for some numbers → "An application error
// has occurred. Goodbye." This proxy makes those webhooks succeed without
// requiring a Twilio Console change (though pointing Twilio at bountywarz.com
// directly is still the long-term correct config).
'use strict';

const UPSTREAM = (process.env.VOICE_UPSTREAM || 'https://bountywarz.com').replace(/\/$/, '');

function buildUpstreamUrl(req, upstreamPath, extraQuery) {
  const raw = String(upstreamPath || '/');
  const qIdx = raw.indexOf('?');
  const pathOnly = qIdx >= 0 ? raw.slice(0, qIdx) : raw;
  const path = pathOnly.startsWith('/') ? pathOnly : '/' + pathOnly;

  const url = new URL(UPSTREAM + path);

  // Query from the path argument (if any)
  if (qIdx >= 0) {
    new URLSearchParams(raw.slice(qIdx + 1)).forEach((v, k) => url.searchParams.set(k, v));
  }
  // Query from the incoming request
  const reqRaw = req.url || '';
  const reqQ = reqRaw.indexOf('?');
  if (reqQ >= 0) {
    new URLSearchParams(reqRaw.slice(reqQ + 1)).forEach((v, k) => url.searchParams.set(k, v));
  }
  // Extras fill gaps only (do not clobber Twilio / Console query params)
  if (extraQuery && typeof extraQuery === 'object') {
    for (const [k, v] of Object.entries(extraQuery)) {
      if (v != null && !url.searchParams.has(k)) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

function readBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') return Promise.resolve(null);
  if (typeof req.body === 'string') return Promise.resolve(req.body);
  if (Buffer.isBuffer(req.body)) return Promise.resolve(req.body);
  if (req.body && typeof req.body === 'object') {
    // Vercel may have already parsed application/x-www-form-urlencoded
    return Promise.resolve(new URLSearchParams(req.body).toString());
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/**
 * Forward the incoming request to bountywarz.com`upstreamPath`.
 * Preserves method, query string, and body.
 */
async function proxyToBountywarz(req, res, upstreamPath, extraQuery) {
  const url = buildUpstreamUrl(req, upstreamPath, extraQuery);

  const headers = {};
  const ct = req.headers['content-type'];
  if (ct) headers['content-type'] = ct;
  if (req.headers['x-twilio-signature']) {
    headers['x-twilio-signature'] = req.headers['x-twilio-signature'];
  }
  headers['x-forwarded-host'] = req.headers.host || 'athelgard.io';
  headers['x-athelgard-voice-proxy'] = '1';

  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    res.statusCode = 200;
    res.setHeader('content-type', 'text/xml');
    res.end(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Upstream read failed.</Say><Hangup/></Response>'
    );
    return;
  }

  let upstream;
  try {
    const method = req.method || 'POST';
    upstream = await fetch(url, {
      method,
      headers,
      body: body && method !== 'GET' && method !== 'HEAD' ? body : undefined,
      signal: AbortSignal.timeout(14000),
    });
  } catch (e) {
    console.error('[voice-proxy] upstream fetch failed', url, e && e.message);
    res.statusCode = 200;
    res.setHeader('content-type', 'text/xml');
    res.end(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Athelgard is briefly unavailable. Please try again in a moment.</Say><Hangup/></Response>'
    );
    return;
  }

  const buf = Buffer.from(await upstream.arrayBuffer());
  const pathHint = String(upstreamPath || '');
  const outType =
    upstream.headers.get('content-type') ||
    (pathHint.includes('/tts') ? 'audio/mpeg' : 'text/xml');
  res.statusCode = upstream.status;
  res.setHeader('content-type', outType);
  res.setHeader('cache-control', 'no-store');
  res.end(buf);
}

module.exports = { proxyToBountywarz, buildUpstreamUrl, UPSTREAM };
