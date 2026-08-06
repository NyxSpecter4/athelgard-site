const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

test('IDE agent route has one parsable Eve bridge path', () => {
  const file = path.join(__dirname, '..', 'api', 'health', 'index.js');
  const source = fs.readFileSync(file, 'utf8');
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
  assert.equal(parsed.parseDiagnostics.length, 0, 'the active route must parse as TypeScript');
  assert.equal((source.match(/async function loadEveContract/g) || []).length, 1);
  assert.equal((source.match(/let eveContract: any = null/g) || []).length, 1);
  assert.match(source, /x-athelgard-signature/);
});
