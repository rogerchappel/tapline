# Orchestration

Owner: one isolated OpenClaw sub-agent for the 2026-05-05 OSS factory run.

## Waves

1. Repair StackForge placeholders into a real `tapline` product surface.
2. Implement deterministic TypeScript library modules.
3. Add a small CLI that defaults to read-only local inspection.
4. Add sample tap fixtures and smoke tests.
5. Publish to `rogerchappel/tapline` and protect `main` best-effort.

## Boundaries

- This agent owns only `tapline`.
- No secrets, telemetry, installs, publishing, or hidden network calls in the product.
- Report generation is read-only.
- Commands are executed only when the user passes `--run-checks`; Homebrew audit is included only with `--include-brew`.

## Verification contract

Run:

```sh
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
node dist/cli.js inspect examples/fixtures/sample-tap --format markdown --output /tmp/tapline-report.md
```
