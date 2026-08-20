import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';

const cli = resolve('dist/cli.js');
const fixture = resolve('examples/fixtures/sample-tap');

function run(args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [cli, ...args], { ...options, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += String(chunk); });
    child.stderr.on('data', (chunk) => { stderr += String(chunk); });
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

test('CLI smoke renders fixture report as JSON', async () => {
  const result = await run(['inspect', fixture, '--format', 'json']);
  assert.equal(result.code, 0, result.stderr);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.tap.name, 'sample-tap');
  assert.equal(parsed.tap.formulae.length, 4);
  const commented = parsed.tap.formulae.find((formula) => formula.name === 'commented-blocks');
  assert.equal(commented.hasBottle, false);
  assert.equal(commented.hasLivecheck, false);
  assert.equal(commented.hasTest, false);
  assert.ok(commented.caveats.includes('missing test block'));
  assert.ok(parsed.checklist.some((item) => item.id === 'formula.commented-blocks.test' && item.status === 'warn'));
  assert.match(parsed.releaseNotes, /Review \d+ checklist caution\(s\)/);
  assert.doesNotMatch(parsed.releaseNotes, /found no required metadata blockers/);
});

test('CLI version matches the package manifest', async () => {
  const manifest = JSON.parse(await readFile('package.json', 'utf8'));
  const result = await run(['--version']);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(result.stdout.trim(), manifest.version);
});

test('CLI rejects a missing or option-shaped tap path', async () => {
  for (const args of [['inspect'], ['inspect', '--format', 'json']]) {
    const result = await run(args);
    assert.equal(result.code, 1);
    assert.match(result.stderr, /Expected: tapline inspect <tap-path>/);
  }
});

test('CLI rejects missing and option-shaped flag values without side effects', async () => {
  const directory = await mkdtemp(resolve(tmpdir(), 'tapline-cli-'));
  try {
    const cases = [
      [['inspect', fixture, '--output'], /--output requires a file path/],
      [['inspect', fixture, '-o', '--include-brew'], /-o requires a file path/],
      [['inspect', fixture, '--output', '--run-checks'], /--output requires a file path/],
      [['inspect', fixture, '--format'], /--format requires markdown or json/],
      [['inspect', fixture, '--format', '--run-checks'], /--format requires markdown or json/],
      [['inspect', fixture, '--format', '--include-brew'], /--format requires markdown or json/],
    ];
    for (const [args, diagnostic] of cases) {
      const result = await run(args, { cwd: directory });
      assert.equal(result.code, 1, args.join(' '));
      assert.match(result.stderr, diagnostic);
      assert.equal(result.stdout, '');
      assert.deepEqual(await readdir(directory), []);
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('CLI accepts value flags before boolean flags', async () => {
  const result = await run(['inspect', fixture, '--format', 'json', '--run-checks', '--include-brew']);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).tap.name, 'sample-tap');
});
