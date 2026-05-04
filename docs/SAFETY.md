# Safety Notes

Tapline's MVP safety promise is simple: inspect locally, explain clearly, and never publish.

## Defaults

- No telemetry.
- No background network calls.
- No credential discovery.
- No Git push, tag, release, or package publish behavior.

## Explicit execution

Users must pass `--run-checks` before Tapline executes validation commands. Homebrew audit commands require `--include-brew` because Homebrew may consult local or configured state outside this repository.
