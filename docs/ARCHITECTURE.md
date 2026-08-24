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

## Formula parsing boundary

Formula inspection is intentionally static analysis, not Ruby evaluation. Metadata extraction supports the common line-oriented Homebrew DSL form with matching single- or double-quoted values. Metadata, dependency, and block inspection removes Ruby heredoc bodies first, including quoted or unquoted terminators, indented `<<-` and `<<~` forms, and multiple heredocs opened on one line. Block detection recognizes `bottle do`, `livecheck do`, and `test do` when they begin a code line after optional whitespace; text inside `#` line comments or single- and double-quoted strings is ignored.

Tapline does not attempt to parse every Ruby construct. Dynamically generated DSL calls, interpolated heredoc results, percent literals, and unusual metaprogramming may require maintainer review. Reports and dry-run checks are release-review aids, not a substitute for Homebrew's own Ruby evaluation and audit commands.
