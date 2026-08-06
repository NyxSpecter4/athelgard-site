const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('health route has one CommonJS serverless entrypoint', () => {
  const dir = path.join(__dirname, '..', 'api', 'health');
  assert.equal(fs.existsSync(path.join(dir, 'index.js')), true);
  assert.equal(fs.existsSync(path.join(dir, 'index.ts')), false);
  const handler = require(path.join(dir, 'index.js'));
  assert.equal(typeof handler, 'function');
});

test('health route returns a response without requiring OAuth configuration', async () => {
  const handler = require('../api/health/index.js');
  let statusCode = 200; let payload;
  const res = {
    headers: {},
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { statusCode = code; return this; },
    json(value) { payload = value; return this; }
  };
  await handler({ method: 'GET', headers: {}, query: {}, url: '/api/health' }, res);
  assert.equal(statusCode, 200);
  assert.equal(payload.status, 'healthy');
});
