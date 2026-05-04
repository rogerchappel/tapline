# Examples

`fixtures/sample-tap` is a synthetic Homebrew tap used by tests and smoke commands.

Generate a report:

```sh
npm run build
node dist/cli.js inspect examples/fixtures/sample-tap --output examples/output/sample-report.md
```

The fixture deliberately includes one healthy formula and one formula that needs release-maintenance care.
