const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

test('IDE agent route has one CommonJS Eve bridge path', () => {
  const file = path.join(__dirname, '..', 'api', 'health', 'index.js');
  const source = fs.readFileSync(file, 'utf8');
  const check = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  assert.equal(check.status, 0, check.stderr || 'health handler must be valid CommonJS');
  assert.equal((source.match(/async function loadEveContract/g) || []).length, 1);
  assert.match(source, /x-athelgard-signature/);
  assert.match(source, /BOUNTYWARZ_EVE_URL/);
  // Must not be the broken TS-in-.js rewrite from the original Eve PR
  assert.equal(/^\s*import\s+/m.test(source), false);
  assert.match(source, /module\.exports\s*=/);
});
