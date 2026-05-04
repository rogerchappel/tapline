# Security Policy

## Supported versions

Tapline has not published stable versioned releases yet. Until `1.0.0`, only the latest `main` branch and latest npm package, if published, are considered in scope for fixes.

## Reporting a vulnerability

Please do not report suspected vulnerabilities in public issues, pull requests, or discussions.

Use GitHub's private vulnerability reporting for `rogerchappel/tapline` if it is enabled. If it is not enabled, open a public issue asking for a private reporting path without including exploit details, secrets, personal data, or sensitive technical details.

## Scope

In scope:

- Tapline CLI/library behavior.
- Insecure defaults in generated reports or command execution.
- CI, package, or release configuration maintained in this repository.

Out of scope:

- Vulnerabilities in Homebrew itself.
- Third-party taps inspected by users.
- Social engineering, spam, or denial-of-service against maintainers.

## Safety expectations

Tapline should stay local-first, read-only by default, and explicit about every command it executes. Regressions against those promises are security-relevant.
