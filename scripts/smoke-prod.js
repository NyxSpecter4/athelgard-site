#!/usr/bin/env node
/**
 * Real production gate — the vertical slice that false-green audits skipped.
 * Usage:
 *   node scripts/smoke-prod.js           # local static checks only
 *   node scripts/smoke-prod.js --live    # also curl https://athelgard.io
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const LIVE = process.argv.includes('--live');
const BASE = process.env.ATHELGARD_BASE || 'https://athelgard.io';

let failed = 0;
function pass(name, detail = '') {
  console.log(`  ✅ ${name}${detail ? ' — ' + detail : ''}`);
}
function fail(name, detail = '') {
  failed++;
  console.log(`  ❌ ${name}${detail ? ' — ' + detail : ''}`);
}

console.log('\n🦉 ATHELGARD PRODUCTION SMOKE GATE\n');

// 1) Syntax of every shipped JS handler / module
console.log('━━ Syntax ━━');
const jsRoots = ['api', 'lib', 'modules', 'frontend'].map((d) => path.join(ROOT, d));
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith('.js')) out.push(p);
  }
  return out;
}
const files = jsRoots.flatMap((d) => walk(d));
let syntaxOk = 0;
for (const f of files) {
  const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  if (r.status === 0) syntaxOk++;
  else fail(`syntax ${path.relative(ROOT, f)}`, (r.stderr || '').split('\n')[0]);
}
if (syntaxOk === files.length) pass(`JS syntax (${files.length} files)`);

// 2) cookie() must not throw (this was the live login 500)
console.log('\n━━ Auth cookie helper ━━');
try {
  const src = fs.readFileSync(path.join(ROOT, 'api/health/index.js'), 'utf8');
  const m = src.match(/function cookie\([\s\S]*?\n\}/);
  if (!m) throw new Error('cookie() not found');
  // eslint-disable-next-line no-eval
  eval(m[0]);
  process.env.VERCEL = '1';
  const withAge = cookie('athelgard_oauth_state', 'abc', { maxAge: 600 });
  const without = cookie('athelgard_session', 'xyz');
  if (!withAge.includes('Max-Age=600')) fail('cookie maxAge', withAge);
  else if (!withAge.includes('Secure')) fail('cookie Secure', withAge);
  else if (withAge.includes('par') || without.includes('ts.push')) fail('cookie still corrupted');
  else pass('cookie()', withAge);
} catch (e) {
  fail('cookie()', e.message);
}

// 2b) One health entrypoint only (duplicate .ts was crashing serverless selection)
console.log('\n━━ Health entrypoint ━━');
const healthJs = path.join(ROOT, 'api/health/index.js');
const healthTs = path.join(ROOT, 'api/health/index.ts');
if (!fs.existsSync(healthJs)) fail('api/health/index.js missing');
else if (fs.existsSync(healthTs)) fail('duplicate api/health/index.ts present — remove it');
else {
  const src = fs.readFileSync(healthJs, 'utf8');
  if (/^\s*import\s+/m.test(src)) fail('health handler is ESM/TS import in .js');
  else if (!/module\.exports\s*=/.test(src)) fail('health handler missing module.exports');
  else if (!/async function loadEveContract/.test(src)) fail('Eve bridge missing from health handler');
  else pass('single CommonJS health entrypoint + Eve bridge');
}

// 3) vercel.json must serve /modules before SPA catch-all
console.log('\n━━ vercel.json routing ━━');
try {
  const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
  const routes = vercel.routes || [];
  const modulesIdx = routes.findIndex((r) => /\/modules\//.test(r.src || ''));
  const catchIdx = routes.findIndex((r) => r.src === '/(.*)' || r.src === '/(.*)?');
  if (modulesIdx < 0) fail('modules route missing');
  else if (catchIdx < 0) fail('catch-all route missing');
  else if (modulesIdx > catchIdx) fail('modules route AFTER catch-all — static JS will be HTML');
  else pass('modules route before catch-all', `index ${modulesIdx} < ${catchIdx}`);

  const healthIdx = routes.findIndex((r) => (r.src || '').includes('/api/health'));
  if (healthIdx < 0) fail('/api/health route missing');
  else pass('/api/health routed', routes[healthIdx].dest);
} catch (e) {
  fail('vercel.json', e.message);
}

// 4) Live probes (optional — proves deploy, not just git)
async function fetchHead(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'GET', timeout: 15000 }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks).toString('utf8').slice(0, 200),
        });
      });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ error: 'timeout' });
    });
    req.end();
  });
}

(async () => {
  if (LIVE) {
    console.log(`\n━━ Live ${BASE} ━━`);
    const brain = await fetchHead(`${BASE}/modules/brain.js`);
    if (brain.error) fail('/modules/brain.js', brain.error);
    else {
      const ct = brain.headers['content-type'] || '';
      const disp = brain.headers['content-disposition'] || '';
      if (/javascript|ecmascript/.test(ct) && !/index\.html/.test(disp) && !brain.body.trimStart().startsWith('<!')) {
        pass('/modules/brain.js Content-Type', ct);
      } else {
        fail('/modules/brain.js served as JS', `ct=${ct} disp=${disp} body=${brain.body.slice(0, 40)}`);
      }
    }

    const login = await fetchHead(`${BASE}/api/health?path=github&action=login`);
    if (login.error) fail('login endpoint', login.error);
    else if (login.status === 302 || login.status === 307) {
      const loc = login.headers.location || '';
      if (loc.includes('github.com/login/oauth/authorize')) pass('login → GitHub OAuth', `HTTP ${login.status}`);
      else fail('login redirect target', loc || `HTTP ${login.status}`);
    } else if (login.status === 503) {
      fail('login env not configured', login.body);
    } else {
      fail('login endpoint', `HTTP ${login.status} ${login.body.slice(0, 80)}`);
    }

    const status = await fetchHead(`${BASE}/api/health?path=github&action=status`);
    if (status.error) fail('status endpoint', status.error);
    else if (status.status === 200 && status.body.includes('connected')) pass('status JSON', status.body.slice(0, 80));
    else fail('status endpoint', `HTTP ${status.status}`);
  } else {
    console.log('\n(skip live probes — pass --live after deploy)\n');
  }

  console.log(`\n${failed === 0 ? '✅ SMOKE GATE PASSED' : `❌ SMOKE GATE FAILED (${failed})`}\n`);
  process.exit(failed > 0 ? 1 : 0);
})();
