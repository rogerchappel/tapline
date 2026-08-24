# tapline

Tapline is a local-first Homebrew tap maintenance helper with a clipboard-friendly attitude: inspect a tap, get a checklist, see the exact dry-run validation commands, and copy release notes without spelunking through formula files by hand.

It is intentionally small, boring, and safe. No telemetry. No publishing. No secret hunting. No surprise network calls during report generation.

## Install

Tapline is **not published to the npm registry**. The unscoped
[`tapline`](https://www.npmjs.com/package/tapline) package belongs to an
unrelated Homebrewing project; do not use `npm install tapline` or
`npx tapline` for this project.

Install a `.tgz` asset downloaded from this repository's
[GitHub Releases](https://github.com/rogerchappel/tapline/releases):

```sh
npm install --global ./rogerchappel-tapline-<version>.tgz
tapline --version
```

For local development, clone the repository and install its dependencies:

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

For a self-checking walkthrough that prints the full fixture report:

```sh
bash examples/demo.sh
```

The demo verifies both the healthy formula and the deliberately incomplete
formula without running Homebrew or publishing anything. See
[examples/README.md](examples/README.md) for details.

Run explicit local dry-run checks:

```sh
node dist/cli.js inspect examples/fixtures/sample-tap --run-checks
```

Include Homebrew audit commands only when you ask for them:

```sh
node dist/cli.js inspect /path/to/homebrew-tap --run-checks --include-brew
```

The tap path must immediately follow `inspect`. Options may follow in any order;
`--format` and `--output` (or `-o`) each require a non-option value.

## What it reports

- Formula metadata (`desc`, `homepage`, `url`, `sha256`, inferred version, dependencies).
- Missing test or livecheck blocks.
- Git cleanliness when the tap is a Git repo.
- Explicit validation commands such as `git status --short` and `ruby -c Formula/name.rb`.
- Copy-paste release notes for maintainers.

Dependency inspection recognizes static quoted formula names, optional symbol
qualifiers (`depends_on "pkg-config" => :build` and symbol arrays such as
`[:build, :test]`), and platform constraints such as
`depends_on macos: :ventura`. Comments are ignored. Tapline deliberately does
not evaluate Ruby, so computed dependency names, conditional expressions, and
other dynamic declarations are not reported.

Ruby block comments are ignored when their `=begin` and `=end` markers start
at the beginning of a line, as Ruby requires. Indented markers and marker-like
text inside strings are not treated as block-comment delimiters.

Metadata, dependency, bottle, livecheck, and test inspection ignores Ruby
heredoc bodies, including quoted or unquoted terminators, indented `<<-` and
`<<~` forms, and multiple heredocs opened on one line. Genuine static
declarations immediately before or after a heredoc remain visible. This is
still line-oriented static analysis: Tapline does not execute Ruby to discover
computed metadata, dependencies, or generated blocks.

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
npm run package:smoke
bash scripts/validate.sh
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Small, reviewable, fixture-backed improvements are very welcome.

## Security

See [SECURITY.md](SECURITY.md). Please do not put vulnerability details or secrets in public issues.

## License

MIT
