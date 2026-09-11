import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { planValidationCommands, runValidationCommands } from '../dist/index.js';

function fixtureTap(overrides = {}) {
  return {
    root: '/tmp/sample-tap',
    name: 'sample-tap',
    formulae: [
      {
        name: 'hello-tapline',
        path: '/tmp/sample-tap/Formula/hello-tapline.rb',
        relativePath: 'Formula/hello-tapline.rb',
        hasBottle: false,
        hasLivecheck: false,
        hasTest: false,
        dependencies: [],
        caveats: []
      }
    ],
    git: { isRepository: false, dirty: false, statusLines: [], remoteUrls: [] },
    warnings: [],
    ...overrides
  };
}

test('plans tap-qualified name-form brew audits when the tap is installed', async () => {
  const prefix = await mkdtemp(path.join(tmpdir(), 'tapline-brew-prefix-'));
  try {
    await mkdir(path.join(prefix, 'Library', 'Taps', 'acme', 'homebrew-demo'), { recursive: true });
    const tap = fixtureTap({
      git: { isRepository: true, dirty: false, statusLines: [], remoteUrls: ['git@github.com:acme/homebrew-demo.git'] }
    });
    const commands = planValidationCommands(tap, true, { homebrewPrefix: prefix });
    const audits = commands.filter((command) => command.label.startsWith('Homebrew audit'));
    assert.equal(audits.length, 1);
    assert.deepEqual(audits[0].args, ['audit', '--strict', '--formula', 'acme/demo/hello-tapline']);
    assert.equal(audits[0].skipReason, undefined);
    assert.match(audits[0].reason, /Name-based audits/);
  } finally {
    await rm(prefix, { recursive: true, force: true });
  }
});

test('skips brew audits with an actionable reason when the tap is not installed', async () => {
  const prefix = await mkdtemp(path.join(tmpdir(), 'tapline-brew-prefix-'));
  try {
    const tap = fixtureTap({
      git: { isRepository: true, dirty: false, statusLines: [], remoteUrls: ['https://github.com/acme/homebrew-demo.git'] }
    });
    const commands = planValidationCommands(tap, true, { homebrewPrefix: prefix });
    const audits = commands.filter((command) => command.label.startsWith('Homebrew audit'));
    assert.equal(audits.length, 1);
    assert.deepEqual(audits[0].args, ['audit', '--strict', '--formula', 'acme/demo/hello-tapline']);
    assert.match(audits[0].skipReason ?? '', /brew tap acme\/demo \/tmp\/sample-tap/);
  } finally {
    await rm(prefix, { recursive: true, force: true });
  }
});

test('skips brew audits with an actionable reason when no homebrew tap remote is derivable', async () => {
  const tap = fixtureTap({
    git: { isRepository: true, dirty: false, statusLines: [], remoteUrls: ['git@github.com:acme/tapline.git'] }
  });
  const commands = planValidationCommands(tap, true, { homebrewPrefix: '/tmp/unused-brew-prefix' });
  const audits = commands.filter((command) => command.label.startsWith('Homebrew audit'));
  assert.equal(audits.length, 1);
  assert.match(audits[0].skipReason ?? '', /disabled `brew audit \[path \.\.\.\]`/);
  assert.match(audits[0].skipReason ?? '', /brew tap/);
  assert.ok(!audits[0].args.includes('Formula/hello-tapline.rb'), 'must never plan the disabled path form');
});

test('runs skipped brew audit commands without spawning and with clean results', async () => {
  const commands = planValidationCommands(
    fixtureTap(),
    true,
    { homebrewPrefix: '/tmp/unused-brew-prefix' }
  );
  const audits = commands.filter((command) => command.label.startsWith('Homebrew audit'));
  assert.equal(audits.length, 1);
  const results = await runValidationCommands([
    {
      ...audits[0],
      command: 'definitely-not-a-real-brew-binary',
      args: ['audit', '--strict', '--formula', 'acme/demo/hello-tapline']
    }
  ]);
  assert.equal(results.length, 1);
  assert.equal(results[0].skipped, true, 'skipped commands must not spawn');
  assert.equal(results[0].exitCode, null);
  assert.equal(results[0].stderr, '');
});
