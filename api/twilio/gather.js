// api/twilio/gather.js — Handles DTMF input from Twilio calls
// Processes user keypad input and routes to appropriate action

const https = require('https');

// ─── DeepSeek AI Caller (shared with voice.js) ──────────────────────────
async function askAthelgard(message) {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_KEY;
  if (!apiKey) {
    return "Athelgard is temporarily unavailable.";
  }

  return new Promise((resolve) => {
    const data = JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'system', 
          content: 'You are Athelgard, an AI mentor. Keep responses under 20 seconds spoken. Be punchy and helpful.' 
        },
        { role: 'user', content: message }
      ],
      max_tokens: 100,
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
          resolve(parsed.choices?.[0]?.message?.content || "I'm thinking...");
        } catch {
          resolve("Can you repeat that?");
        }
      });
    });

    r.on('error', () => resolve("Connection issue."));
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
  <Gather input="speech" timeout="5" action="/api/twilio/speech" method="POST">
    <Say>What would you like to know?</Say>
  </Gather>
  <Say>We didn't hear anything. Goodbye!</Say>
  <Hangup/>
</Response>`;
}

// ─── Main Handler ───────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/xml');

  const digits = req.body?.Digits || req.query?.Digits || '';
  const callerNumber = req.body?.From || 'unknown';

  console.log(`[Twilio Gather] Digits: ${digits} from ${callerNumber}`);

  try {
    if (digits === '1') {
      // User wants to talk to Athelgard
      const greeting = "Great! I'm Athelgard, your mentor. What would you like to learn about? Say bounty hunting, ethical hacking, or ask me anything.";
      const twiml = generateTwiML(greeting);
      return res.status(200).send(twiml);
    }

    // Default: redirect to voice handler
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Redirect>/api/twilio/voice</Redirect>
</Response>`;
    return res.status(200).send(twiml);
  } catch (e) {
    console.error('[Twilio Gather] Error:', e.message);
    const errorTwiML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>An error occurred. Goodbye!</Say>
  <Hangup/>
</Response>`;
    return res.status(200).send(errorTwiML);
  }
};
