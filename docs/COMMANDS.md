# Command Model

Tapline separates command planning from command execution.

- Report generation plans validation commands and prints them.
- `--run-checks` executes planned local commands.
- `--include-brew` opts into Homebrew audit commands.

Default planned commands are read-only:

- `git status --short`
- `ruby -c <formula>`

Homebrew audits are planned only in forms the current Homebrew CLI accepts.
Modern Homebrew disabled `brew audit [path ...]`, so Tapline plans
`brew audit --strict --formula <tap>/<formula>` when the tap can be resolved
from a GitHub `homebrew-*` remote and is installed locally. When it cannot,
the audit is planned as a skip with an actionable `brew tap` reason and is
never executed.
