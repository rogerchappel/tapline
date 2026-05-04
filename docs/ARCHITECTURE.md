# Architecture

Tapline is a small TypeScript CLI/library.

## Modules

- `inspect`: finds tap formulae and Git context.
- `formula-parser`: extracts common Homebrew formula metadata.
- `checklist`: converts tap facts into maintainer checklist items.
- `validation`: plans and optionally runs explicit dry-run commands.
- `release-notes`: creates copy-paste maintainer notes.
- `report`: renders Markdown or JSON.
- `cli`: parses user intent and connects the modules.

The library API is exported from `src/index.ts` so agents and scripts can use Tapline without shelling out.
