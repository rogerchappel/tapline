# tapline PRD

Status: MVP shipped locally
Decision: build as a local-first TypeScript CLI/library

## Pitch

A tiny Homebrew tap maintenance helper that inspects local tap repositories, generates formula maintenance checklists, runs explicit dry-run validation commands only when requested, and emits copy-paste release notes.

## Users

- Maintainers with one or more Homebrew taps.
- Agents preparing release review packs.
- Developers who want a quick local audit before tagging or opening a PR.

## Goals

- Inspect local tap repositories without network access.
- Parse useful formula metadata from `Formula/*.rb`.
- Surface release blockers and cautions as a checklist.
- Show validation commands before execution.
- Execute only explicit local dry-run checks when requested.
- Generate release notes maintainers can paste into PRs or GitHub releases.

## Non-goals

- Publishing formulae or GitHub releases.
- Replacing Homebrew audit, style, or test commands.
- Scraping credentials or private tap data.
- Hidden telemetry or background network calls.
- Copying implementation from adjacent projects.

## CLI

```sh
tapline inspect <tap-path> [--format markdown|json] [--output file] [--run-checks] [--include-brew]
```

## Safety

`inspect` is read-only by default. `--run-checks` executes only commands represented in the report. `--include-brew` is required before Homebrew audit commands are planned or run.

## Attribution

Tapline was inspired by the maintenance workflow around Homebrew tap repositories and a backlog signal referencing `vincentkoc/tap`. Tapline is a fresh implementation with local-first reporting scope.

## Acceptance criteria

- Fixture-backed tests cover parsing, checklist/report generation, and CLI JSON smoke.
- A real CLI smoke writes a Markdown report from fixtures.
- README documents quickstart, safety model, and attribution.
- `scripts/validate.sh` passes.
