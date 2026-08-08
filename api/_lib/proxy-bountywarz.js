// Proxy Twilio / voice / TTS traffic to the host that actually serves them.
// ROBUST VERSION — catches all errors, always returns TwiML on failure.

'use strict';

const https = require('https');

const UPSTREAM = (process.env.VOICE_UPSTREAM || '').replace(/\/$/, '');

function buildUpstreamUrl(req, upstreamPath, extraQuery) {
  const raw = String(upstreamPath || '/');
  const qIdx = raw.indexOf('?');
  const pathOnly = qIdx >= 0 ? raw.slice(0, qIdx) : raw;
  const path = pathOnly.startsWith('/') ? pathOnly : '/' + pathOnly;

  const baseUrl = UPSTREAM || 'https://bountywarz.com';
  const url = new URL(baseUrl + path);

  if (qIdx >= 0) {
    new URLSearchParams(raw.slice(qIdx + 1)).forEach((v, k) => url.searchParams.set(k, v));
  }
  const reqRaw = req.url || '';
  const reqQ = reqRaw.indexOf('?');
  if (reqQ >= 0) {
    new URLSearchParams(reqRaw.slice(reqQ + 1)).forEach((v, k) => url.searchParams.set(k, v));
  }
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
    return Promise.resolve(new URLSearchParams(req.body).toString());
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function twimlError(message) {
  return '<?xml version="1.0" encoding="UTF-8"?>' +
    '<Response>' +
    '<Say>' + message + '</Say>' +
    '<Hangup/>' +
    '</Response>';
}

// Node-native fetch with timeout fallback
function fetchWithTimeout(url, options, timeoutMs = 14000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Upstream timeout'));
    }, timeoutMs);

    const parsed = new URL(url);
    const requestOptions = {
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const request = https.request(requestOptions, (response) => {
      clearTimeout(timer);
      const chunks = [];
      response.on('data', (c) => chunks.push(c));
      response.on('end', () => {
        resolve({
          status: response.statusCode,
          headers: {
            get: (name) => response.headers[name.toLowerCase()],
          },
          arrayBuffer: () => Promise.resolve(Buffer.concat(chunks)),
        });
      });
    });

    request.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    if (options.body && options.method !== 'GET' && options.method !== 'HEAD') {
      request.write(options.body);
    }
    request.end();
  });
}

/**
 * Forward the incoming request to bountywarz.com/upstreamPath.
 * ALWAYS returns TwiML — even on complete failure.
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
  headers['user-agent'] = 'Athelgard-Voice-Proxy/1.0';

  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    console.error('[voice-proxy] body read failed:', e.message);
    res.statusCode = 200;
    res.setHeader('content-type', 'text/xml');
    res.end(twimlError('Request read failed. Goodbye.'));
    return;
  }

  // If no upstream configured, return TwiML immediately
  if (!UPSTREAM) {
    console.warn('[voice-proxy] VOICE_UPSTREAM not configured, using fallback TwiML');
    res.statusCode = 200;
    res.setHeader('content-type', 'text/xml');
    res.end(twimlError('Athelgard voice is not configured. Please contact support.'));
    return;
  }

  try {
    const method = req.method || 'POST';
    const upstream = await fetchWithTimeout(url, {
      method,
      headers,
      body: body && method !== 'GET' && method !== 'HEAD' ? body : undefined,
    }, 14000);

    // If upstream returns server error, log but still try to forward
    if (upstream.status >= 500) {
      console.error('[voice-proxy] upstream server error', upstream.status, url);
    }

    const buf = await upstream.arrayBuffer();
    const pathHint = String(upstreamPath || '');
    const outType = upstream.headers.get('content-type') ||
      (pathHint.includes('/tts') ? 'audio/mpeg' : 'text/xml');

    res.statusCode = upstream.status;
    res.setHeader('content-type', outType);
    res.setHeader('cache-control', 'no-store');
    res.end(Buffer.from(buf));
  } catch (e) {
    console.error('[voice-proxy] upstream unreachable:', url, e && e.message);
    res.statusCode = 200;
    res.setHeader('content-type', 'text/xml');
    res.setHeader('cache-control', 'no-store');
    res.end(twimlError('Athelgard is briefly unavailable. Please try again in a moment.'));
  }
}

module.exports = { proxyToBountywarz, buildUpstreamUrl, UPSTREAM };
