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
