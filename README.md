# tapline

Tapline is a local-first Homebrew tap maintenance helper with a clipboard-friendly attitude: inspect a tap, get a checklist, see the exact dry-run validation commands, and copy release notes without spelunking through formula files by hand.

It is intentionally small, boring, and safe. No telemetry. No publishing. No secret hunting. No surprise network calls during report generation.

## Install

```sh
npm install
npm run build
```

For local development you can run the built CLI directly:

```sh
node dist/cli.js --help
```

## Quickstart

```sh
npm run build
node dist/cli.js inspect examples/fixtures/sample-tap --format markdown --output tapline-report.md
```

Run explicit local dry-run checks:

```sh
node dist/cli.js inspect examples/fixtures/sample-tap --run-checks
```

Include Homebrew audit commands only when you ask for them:

```sh
node dist/cli.js inspect /path/to/homebrew-tap --run-checks --include-brew
```

## What it reports

- Formula metadata (`desc`, `homepage`, `url`, `sha256`, inferred version).
- Missing test or livecheck blocks.
- Git cleanliness when the tap is a Git repo.
- Explicit validation commands such as `git status --short` and `ruby -c Formula/name.rb`.
- Copy-paste release notes for maintainers.

## Safety model

- `tapline inspect` is read-only by default.
- `--run-checks` executes only the commands shown in the report.
- `--include-brew` is required before Homebrew audit commands are planned.
- Tapline does not publish formulae, push Git branches, read credentials, or phone home.

## Inspiration and attribution

Tapline was inspired by the practical maintenance shape of Homebrew tap repositories and a public OSS backlog signal referencing [`vincentkoc/tap`](https://github.com/vincentkoc/tap). This project is a fresh TypeScript implementation with different scope and behavior; it does not copy that repository's implementation.

## Verify

```sh
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Small, reviewable, fixture-backed improvements are very welcome.

## Security

See [SECURITY.md](SECURITY.md). Please do not put vulnerability details or secrets in public issues.

## License

MIT
