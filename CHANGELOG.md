# Changelog

All notable changes to tapline will be documented in this file.

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and semantic versioning when releases are published.

## [Unreleased]

### Fixed

- Plan `--include-brew` audits only in forms the current Homebrew CLI accepts:
  fully qualified name-form audits for locally installed taps resolved from
  GitHub `homebrew-*` remotes, and explicit skips with actionable `brew tap`
  reasons otherwise. This replaces the disabled `brew audit [path ...]` form,
  which failed on every modern Homebrew installation.

### Changed

- Markdown reports now show skip reasons for skipped validation commands
  instead of a bare "command unavailable".

### Changed

- Infer missing formula versions only from defensible archive filenames or
  conventional tag URL segments, while keeping explicit `version` declarations
  authoritative.

- Adopt the non-colliding internal package identity `@rogerchappel/tapline`
  and explicitly disable npm registry publication. GitHub release tarballs
  are the supported distribution; the public unscoped `tapline` package is
  unrelated.
- Read the CLI version from `package.json` and verify the packed, installed
  CLI reports the same version during release checks.

### Added

- Local-first TypeScript CLI and library for Homebrew tap inspection.
- Formula metadata parser for `Formula/*.rb` files.
- Maintenance checklist generation for metadata, source integrity, tests, livecheck, and Git state.
- Explicit dry-run validation command planning and optional local execution.
- Copy-paste release note generation.
- Fixture-backed parser/report/CLI tests and smoke script.

[Unreleased]: https://github.com/rogerchappel/tapline/compare/HEAD...HEAD
