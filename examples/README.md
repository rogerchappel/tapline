# Examples

`fixtures/sample-tap` is a synthetic Homebrew tap used by tests and smoke commands.

Run the end-to-end demo:

```sh
bash examples/demo.sh
```

The script builds Tapline, generates a temporary Markdown report, verifies the
fixture's healthy and caution cases, prints the report, and removes the
temporary file. It does not run Homebrew or publish anything.

Generate a report:

```sh
npm run build
node dist/cli.js inspect examples/fixtures/sample-tap --output examples/output/sample-report.md
```

The fixture deliberately includes one healthy formula and one formula that needs release-maintenance care.

Exercise version inference and explicit-version precedence:

```sh
node dist/cli.js inspect examples/fixtures/version-inference-tap --format json \
  | grep -E '"name"|"version"'
```

The output reports `archive-path` as `3.4.5`, the GitHub tag as `2.7.1`, and
the explicitly declared version as `4.2.0`. It omits a version for `no-version`
instead of selecting the unrelated `v1.2` API path segment.
