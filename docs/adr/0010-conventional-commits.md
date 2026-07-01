# ADR-0010: Conventional Commits Specification

**Status:** Accepted  
**Date:** 2026-07-01  
**Standard:** Conventional Commits v1.0.0  
**Area:** 15 — Version Control Conventions

## Context

The CP3 Legacy repository has accumulated commits with inconsistent message formats, making history hard to scan and preventing automated changelog generation.

## Decision

Adopt Conventional Commits v1.0.0 with automated enforcement.

Format: `type(scope): description`

7 core types:
- `feat` — new feature
- `fix` — bug fix
- `chore` — maintenance, tooling, dependencies
- `docs` — documentation only
- `refactor` — code change with no behavior change
- `style` — formatting, linting (not CSS)
- `test` — adding or fixing tests

## Implementation

- `husky` + `@commitlint/cli` + `@commitlint/config-conventional` installed as devDependencies
- `.husky/commit-msg` — hook runs `commitlint --edit $1` before each commit
- `commitlint.config.mjs` — defaults to `@commitlint/config-conventional` rules
- Invalid messages are rejected with a clear error before the commit is created

## Alternatives Considered

- **No enforcement (manual convention)** — rejected because discipline fades without automation; the repo already had inconsistent messages before this ADR
- **`standard-version` / `semantic-release`** — deferred to future; requires versioned releases which don't exist for this demo site

## Consequences

- Every commit must follow `type(scope): description` format or be rejected
- History is uniformly scannable via `git log --oneline`
- Invalid commits are caught at commit time, not PR time
- The hook applies to all contributors locally (not enforced in CI yet)
