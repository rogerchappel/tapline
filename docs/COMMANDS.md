# Command Model

Tapline separates command planning from command execution.

- Report generation plans validation commands and prints them.
- `--run-checks` executes planned local commands.
- `--include-brew` opts into Homebrew audit commands.

Default planned commands are read-only:

- `git status --short`
- `ruby -c <formula>`
