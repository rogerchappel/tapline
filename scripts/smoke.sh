#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
smoke_dir="$(mktemp -d "${TMPDIR:-/tmp}/tapline-smoke.XXXXXX")"
trap 'rm -rf "$smoke_dir"' EXIT

cd "$repo_root"
npm run build
node dist/cli.js inspect examples/fixtures/sample-tap --format markdown --output "$smoke_dir/report.md"
test -s "$smoke_dir/report.md"
