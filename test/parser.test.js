import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { inspectTap } from '../dist/index.js';

test('inspectTap parses formula metadata from fixtures', async () => {
  const tap = await inspectTap('examples/fixtures/sample-tap');
  assert.equal(tap.formulae.length, 4);
  const hello = tap.formulae.find((formula) => formula.name === 'hello-tapline');
  assert.equal(hello.desc, 'Bob\'s "tiny" fixture formula for tapline reports');
  assert.equal(hello.version, '1.2.3');
  assert.equal(hello.hasBottle, true);
  assert.equal(hello.hasLivecheck, true);
  assert.equal(hello.hasTest, true);
  assert.deepEqual(hello.dependencies, [
    { name: 'libyaml', qualifiers: [] },
    { name: 'pkg-config', qualifiers: ['build'] },
    { name: 'ruby', qualifiers: ['build', 'test'] },
    { platform: 'macos', qualifiers: ['ventura'] }
  ]);

  const commented = tap.formulae.find((formula) => formula.name === 'commented-blocks');
  assert.equal(commented.hasBottle, false);
  assert.equal(commented.hasLivecheck, false);
  assert.equal(commented.hasTest, false);
  assert.ok(commented.caveats.includes('missing test block'));
});

test('inspectTap ignores Ruby block-comment declarations', async () => {
  const tap = await inspectTap('examples/fixtures/sample-tap');
  const formula = tap.formulae.find((item) => item.name === 'ruby-block-comment');
  assert.equal(formula.desc, 'Declarations outside comments remain visible');
  assert.equal(formula.homepage, 'https://example.com/ruby-block-comment');
  assert.equal(formula.url, 'https://example.com/ruby-block-comment-1.2.3.tar.gz');
  assert.equal(formula.version, '1.2.3');
  assert.deepEqual(formula.dependencies, [
    { name: 'visible-before', qualifiers: [] },
    { name: 'visible-after', qualifiers: [] }
  ]);
  assert.equal(formula.hasBottle, false);
  assert.equal(formula.hasLivecheck, false);
  assert.equal(formula.hasTest, false);
  assert.ok(formula.caveats.includes('missing test block'));
});

test('inspectTap requires matching quote delimiters for string metadata', async (t) => {
  const tapRoot = await mkdtemp(path.join(tmpdir(), 'tapline-quotes-'));
  t.after(() => rm(tapRoot, { recursive: true, force: true }));
  await mkdir(path.join(tapRoot, 'Formula'));
  await writeFile(path.join(tapRoot, 'Formula', 'quoted.rb'), `class Quoted < Formula
  desc 'A "quoted" tool with an escaped \\'apostrophe\\''
  homepage "https://example.com/bob's-tool"
  url "https://example.com/quoted-2.0.0.tar.gz"
  sha256 "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789"
end
`);
  await writeFile(path.join(tapRoot, 'Formula', 'malformed.rb'), `class Malformed < Formula
  desc "This value never closes'
  homepage "https://example.com/malformed"
  url "https://example.com/malformed-1.0.0.tar.gz"
  sha256 "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789"
end
`);

  const tap = await inspectTap(tapRoot);
  const quoted = tap.formulae.find((formula) => formula.name === 'quoted');
  assert.equal(quoted.desc, 'A "quoted" tool with an escaped \'apostrophe\'');
  assert.equal(quoted.homepage, "https://example.com/bob's-tool");

  const malformed = tap.formulae.find((formula) => formula.name === 'malformed');
  assert.equal(malformed.desc, undefined);
  assert.ok(malformed.caveats.includes('missing desc'));
});
