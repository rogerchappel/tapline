import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

function run(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['dist/cli.js', ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += String(chunk); });
    child.stderr.on('data', (chunk) => { stderr += String(chunk); });
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

test('CLI smoke renders fixture report as JSON', async () => {
  const result = await run(['inspect', 'examples/fixtures/sample-tap', '--format', 'json']);
  assert.equal(result.code, 0, result.stderr);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.tap.name, 'sample-tap');
  assert.equal(parsed.tap.formulae.length, 2);
});

test('CLI version matches the package manifest', async () => {
  const manifest = JSON.parse(await readFile('package.json', 'utf8'));
  const result = await run(['--version']);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(result.stdout.trim(), manifest.version);
});
