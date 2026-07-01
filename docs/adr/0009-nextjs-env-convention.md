# ADR-0009: Next.js Environment Variable Convention

**Status:** Accepted  
**Date:** 2026-07-01  
**Standard:** Next.js Environment Variable Convention  
**Area:** 14 — Environment & Configuration

## Context

CP3 Legacy uses environment variables for Sanity credentials, revalidation secrets, and scraper API keys. Without a formal convention, variables can be inconsistently named, accidentally exposed to clients, or undocumented.

## Decision

Adopt the Next.js Environment Variable Convention with a four-level file hierarchy:

1. `.env` — shared across all environments (not created, no universal defaults)
2. `.env.development` — shared dev defaults: `NEXT_PUBLIC_SANITY_DATASET`
3. `.env.local` — local overrides, gitignored, contains all real secrets
4. `.env.production` — not created, Vercel dashboard handles production vars

Prefix rules:
- `NEXT_PUBLIC_*` — safe for client-side code (inlined at build time)
- No prefix — server-only, never inlined into client bundle
- Secrets: `*_TOKEN` for API tokens, `*_KEY` for API keys, `*_SECRET` for shared secrets

## Implementation

- `.env.example` — documented placeholder file with all expected vars and comments
- `.env.development` — `NEXT_PUBLIC_SANITY_DATASET=production`
- `.env.local` — gitignored, all real values
- `.gitignore` — covers `.env` and `.env.local` (`.env.development` and `.env.example` are committed)

## Alternatives Considered

- **Single `.env` file with all environments** — rejected because it would leak defaults into version control and override Vercel's production env vars
- **No `.env.example`** — rejected because a new developer has no way to know what vars are required

## Consequences

- All Sanity scripts use `NEXT_PUBLIC_SANITY_PROJECT_ID` consistently — the non-prefixed `SANITY_PROJECT_ID` in `.env.local` is a duplicate and can be removed
- `.env.example` stays in sync with `.env.local` manually (documented in README)
- No `.env.production` needed — Vercel dashboard is the production source of truth
