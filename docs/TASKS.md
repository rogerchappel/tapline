# tapline Tasks

## MVP complete

- [x] Inspect local Homebrew tap repositories.
- [x] Parse formula metadata from `Formula/*.rb`.
- [x] Generate maintainer checklists for metadata, integrity, tests, livecheck, and Git state.
- [x] Plan explicit dry-run validation commands.
- [x] Optionally execute read-only local validation commands with `--run-checks`.
- [x] Emit copy-paste release notes.
- [x] Cover parser/report/CLI behavior with fixture-backed tests.
- [x] Provide a real CLI smoke command using local fixtures.

## Next

- [ ] Add richer formula style guidance from Homebrew docs.
- [ ] Support configurable checklist policies.
- [ ] Add SARIF or GitHub Markdown output for PR bots.
- [ ] Add snapshot fixtures for multiple tap layouts.
