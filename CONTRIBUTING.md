# Contributing

Thanks for helping improve tapline.

## Development

```sh
npm install
npm test
npm run check
npm run build
npm run smoke
```

## Pull requests

Good tapline PRs are:

- Small and reviewable.
- Backed by fixtures or tests when behavior changes.
- Clear about safety implications.
- Free of secrets, private tap contents, and unrelated formatting churn.

## Commit style

Use Conventional Commits where practical:

- `feat:` user-visible behavior
- `fix:` bug fixes
- `test:` tests and fixtures
- `docs:` documentation
- `ci:` workflow changes
- `chore:` maintenance

## Fixtures

Prefer tiny synthetic Homebrew formulae in `examples/fixtures`. Do not commit private taps or proprietary formula content.

## Review checklist

Before asking for review, include:

- Summary of behavior/docs changed.
- Commands run and results.
- Any command execution, network, or privacy impact.
- Follow-up work you intentionally left out.
