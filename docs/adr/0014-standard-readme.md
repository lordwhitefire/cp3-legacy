# ADR-0014: Standard Readme Specification

**Status:** Accepted  
**Date:** 2026-07-01  
**Standard:** Standard Readme Specification (standard-readme.org)  
**Area:** 21 — Documentation

## Context

The CP3 Legacy project had a README with most of the required content but was missing several standard sections (License, Contributing, badge links) and was not referenced by an ADR.

## Decision

Adopt the Standard Readme Specification for the project README.

Required sections:
- Title & Description ✅
- Prerequisites / Install ✅
- Usage / Development ✅
- Build ✅
- Deployment ✅
- Frontend Architecture ✅
- Standards ✅
- Architecture Decisions (ADRs) — link to `docs/adr/`
- Privacy — link to `/privacy`
- Contributing — "not currently accepting contributions"
- License — MIT

## Implementation

- README.md updated with Architecture Decisions, Privacy, Contributing, and License sections
- Badges: not added (defer to future if project gains visibility)
- All links verified to resolve correctly

## Alternatives Considered

- **No standard** — rejected; README was functional but incomplete and would mislead contributors

## Consequences

- README now satisfies Standard Readme spec
- Any developer can quickly find installation, usage, and legal information
- Policy page is discoverable from footer navigation and README
