// Local unit smoke for the voice proxy URL builder (no network).
'use strict';
const assert = require('assert');
const { buildUpstreamUrl, UPSTREAM } = require('../api/_lib/proxy-bountywarz');

assert.equal(UPSTREAM, 'https://bountywarz.com');

const u1 = buildUpstreamUrl({ url: '/api/ka-voice?mode=captain' }, '/api/ka-voice');
assert.equal(u1, 'https://bountywarz.com/api/ka-voice?mode=captain');

const u2 = buildUpstreamUrl(
  { url: '/api/twilio/gather?CallSid=CA1' },
  '/api/ka-voice',
  { step: 'reply', mode: 'default' }
);
assert.ok(u2.includes('step=reply'));
assert.ok(u2.includes('mode=default'));
assert.ok(u2.includes('CallSid=CA1'));
assert.ok(!u2.includes('??'));

const u3 = buildUpstreamUrl({ url: '/api/tts?text=hi' }, '/api/tts');
assert.equal(u3, 'https://bountywarz.com/api/tts?text=hi');

console.log('smoke-voice-proxy: OK');
