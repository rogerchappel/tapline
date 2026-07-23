#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
package_dir="$(mktemp -d "${TMPDIR:-/tmp}/tapline-package.XXXXXX")"
trap 'rm -rf "$package_dir"' EXIT

cd "$repo_root"
npm run build
package_file="$(npm pack --pack-destination "$package_dir" --json | node -e "
  let input = '';
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => {
    const result = JSON.parse(input);
    process.stdout.write(result[0].filename);
  });
")"

node - "$package_dir/$package_file" <<'NODE'
const { execFileSync } = require('node:child_process');
const { mkdtempSync, readFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

const tarball = process.argv[2];
const manifest = JSON.parse(
  execFileSync('tar', ['-xOf', tarball, 'package/package.json'], { encoding: 'utf8' })
);

if (manifest.name !== '@rogerchappel/tapline') {
  throw new Error(`unexpected packed package name: ${manifest.name}`);
}
if (manifest.private !== true) {
  throw new Error('packed package must remain private to prevent registry publication');
}

const installDir = mkdtempSync(join(tmpdir(), 'tapline-install.'));
execFileSync('npm', ['init', '--yes'], { cwd: installDir, stdio: 'ignore' });
execFileSync('npm', ['install', '--ignore-scripts', tarball], { cwd: installDir, stdio: 'ignore' });

const installedManifest = JSON.parse(
  readFileSync(join(installDir, 'node_modules/@rogerchappel/tapline/package.json'), 'utf8')
);
const output = execFileSync(
  process.execPath,
  [join(installDir, 'node_modules/@rogerchappel/tapline/dist/cli.js'), '--version'],
  { encoding: 'utf8' }
).trim();

if (installedManifest.version !== manifest.version || output !== manifest.version) {
  throw new Error(
    `version mismatch: packed=${manifest.version}, installed=${installedManifest.version}, cli=${output}`
  );
}
NODE

printf 'Packed and installed %s; CLI version matches package manifest.\n' "$package_file"
