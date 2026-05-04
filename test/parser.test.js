import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectTap } from '../dist/index.js';

test('inspectTap parses formula metadata from fixtures', async () => {
  const tap = await inspectTap('examples/fixtures/sample-tap');
  assert.equal(tap.formulae.length, 2);
  const hello = tap.formulae.find((formula) => formula.name === 'hello-tapline');
  assert.equal(hello.desc, 'Tiny fixture formula for tapline reports');
  assert.equal(hello.version, '1.2.3');
  assert.equal(hello.hasLivecheck, true);
  assert.equal(hello.hasTest, true);
});
