#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
report_file="$(mktemp "${TMPDIR:-/tmp}/tapline-demo.XXXXXX.md")"
trap 'rm -f "$report_file"' EXIT

cd "$repo_root"

npm run build >/dev/null
node dist/cli.js inspect examples/fixtures/sample-tap \
  --format markdown \
  --output "$report_file"

grep -q 'hello-tapline' "$report_file"
grep -q 'needs-care: test block' "$report_file"
grep -q 'needs-care: livecheck' "$report_file"
grep -q 'No network calls, publishing, or credentials' "$report_file"

printf 'Tapline fixture demo passed.\n\n'
cat "$report_file"
