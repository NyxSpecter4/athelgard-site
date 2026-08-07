// api/twilio/speech.js — Handles speech input from Twilio calls
// Converts speech to text via Twilio's built-in ASR, then responds with AI

const https = require('https');

// ─── DeepSeek AI Caller ─────────────────────────────────────────────────
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
          content: 'You are Athelgard, an AI mentor for bounty hunting. Keep responses under 30 seconds spoken. Be encouraging and use game terminology like Functors, Genomes, and Glyph.' 
        },
        { role: 'user', content: message }
      ],
      max_tokens: 120,
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
          resolve("Can you say that again?");
        }
      });
    });

    r.on('error', () => resolve("Connection issue."));
    r.write(data);
    r.end();
  });
}

// ─── Main Handler ───────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/xml');

  const speechResult = req.body?.SpeechResult || '';
  const confidence = req.body?.Confidence || '0';
  const callerNumber = req.body?.From || 'unknown';

  console.log(`[Twilio Speech] From: ${callerNumber}, Speech: "${speechResult}", Confidence: ${confidence}`);

  try {
    let responseText;

    if (!speechResult || speechResult.trim().length === 0) {
      responseText = "I didn't catch that. Can you speak a bit louder?";
    } else {
      // Get AI response
      responseText = await askAthelgard(speechResult);
    }

    // Escape XML
    const escaped = responseText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-US">${escaped}</Say>
  <Pause length="1"/>
  <Say>Would you like to ask something else? Speak now.</Say>
  <Gather input="speech" timeout="5" action="/api/twilio/speech" method="POST">
    <Say>I'm listening.</Say>
  </Gather>
  <Say>Okay, I'll let you go. Happy hunting!</Say>
  <Hangup/>
</Response>`;

    return res.status(200).send(twiml);
  } catch (e) {
    console.error('[Twilio Speech] Error:', e.message);
    const errorTwiML = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>An error occurred. Please call back later.</Say>
  <Hangup/>
</Response>`;
    return res.status(200).send(errorTwiML);
  }
};
