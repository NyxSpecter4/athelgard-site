// api/twilio/voice.js — Twilio Voice Webhook Handler
// Handles incoming calls and responds with TwiML
// Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN in Vercel env

const https = require('https');

// ─── Simple JWT-style auth for KA_GATE ──────────────────────────────────
function verifyTwilioRequest(req) {
  // In production: validate X-Twilio-Signature using auth token
  // For now: basic check that it's a POST from Twilio
  return req.method === 'POST' || req.method === 'GET';
}

// ─── DeepSeek AI Caller ─────────────────────────────────────────────────
async function askAthelgard(message) {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_KEY;
  if (!apiKey) {
    return "Athelgard is temporarily unavailable. Please try again later.";
  }

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'system', 
          content: 'You are Athelgard, an AI mentor for bounty hunting training. Keep responses under 30 seconds when spoken. Be encouraging and concise.' 
        },
        { role: 'user', content: message }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    const r = https.request({
      hostname: 'api.deepseek.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(d);
          const text = parsed.choices?.[0]?.message?.content || "I'm thinking... please call back.";
          resolve(text);
        } catch {
          resolve("I didn't catch that. Can you say it again?");
        }
      });
    });

    r.on('error', () => resolve("Connection issue. Please try again."));
    r.write(data);
    r.end();
  });
}

// ─── TWiML Generator ────────────────────────────────────────────────────
function generateTwiML(message, options = {}) {
  const voice = options.voice || 'Polly.Joanna';
  const language = options.language || 'en-US';
  const escaped = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}" language="${language}">${escaped}</Say>
  <Pause length="1"/>
  <Say>Press 1 to speak to Athelgard, or hang up to end the call.</Say>
  <Gather numDigits="1" action="/api/twilio/gather" method="POST">
    <Say>Press 1 now.</Say>
  </Gather>
  <Say>We didn't receive a response. Goodbye!</Say>
  <Hangup/>
</Response>`;
}

// ─── Main Handler ───────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Get caller info from Twilio webhook
  const callerNumber = req.body?.From || req.query?.From || 'unknown';
  const callSid = req.body?.CallSid || req.query?.CallSid || 'unknown';

  console.log(`[Twilio Voice] Incoming call from ${callerNumber}, SID: ${callSid}`);

  try {
    // Greeting message
    const greeting = "Hello! You've reached Athelgard, your bounty hunting mentor. I'm here to help you train and improve your skills.";
    const twiml = generateTwiML(greeting);

    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml);
  } catch (e) {
    console.error('[Twilio Voice] Error:', e.message);
    const errorTwiML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>An application error has occurred. Please try again later.</Say>
  <Hangup/>
</Response>`;
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(errorTwiML);
  }
};
