#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
snapshot="$(mktemp "${TMPDIR:-/tmp}/tapline-artifacts.XXXXXX")"
trap 'rm -f "$snapshot" "$snapshot.after"' EXIT

find "${TMPDIR:-/tmp}" -maxdepth 1 \( -name 'tapline-smoke.*' -o -name 'tapline-package.*' -o -name 'tapline-install.*' \) -print | sort > "$snapshot"

cd "$repo_root"
npm run smoke
npm run package:smoke

find "${TMPDIR:-/tmp}" -maxdepth 1 \( -name 'tapline-smoke.*' -o -name 'tapline-package.*' -o -name 'tapline-install.*' \) -print | sort > "$snapshot.after"
if ! cmp -s "$snapshot" "$snapshot.after"; then
  diff -u "$snapshot" "$snapshot.after" || true
  echo 'smoke checks left new tapline-owned temporary artifacts' >&2
  exit 1
fi
