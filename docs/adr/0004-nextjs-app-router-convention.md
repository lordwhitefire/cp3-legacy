# ADR-0004: Adopt Next.js App Router Convention

## Status

Accepted

## Date

2026-06-28

## Context

CP3 Legacy is built on Next.js and currently uses the App Router (`src/app/` directory). The App Router is the official recommended architecture since Next.js 14 (2023) and the only actively developed convention as of Next.js 16.

Without formal documentation of the conventions, different developers may approach layouts, data fetching, and component boundaries inconsistently. This ADR codifies the expected patterns so the project has a single architectural standard.

## Decision

We adopt the Next.js App Router Convention as the project's architectural standard. This includes:

1. **File conventions** — `layout.tsx` (shared layouts), `page.tsx` (route UI), `loading.tsx` (Suspense fallback), `error.tsx` (error boundaries), `not-found.tsx` (404)
2. **Server-first by default** — components are server components unless they need interactivity, browser APIs, or lifecycle hooks (marked `'use client'`)
3. **Route groups** — parentheses `(group)` for section-specific layouts without URL segments
4. **Dynamic segments** — brackets `[slug]` for dynamic routes
5. **Metadata API** — `export const metadata` for static metadata, `generateMetadata` for dynamic routes
6. **Caching strategy** — static generation by default (`fetch` cached), `next: { revalidate }` for ISR when Sanity CMS is added

## Alternatives Considered

### Alternative 1: Pages Router (`pages/` directory)
- Pros: Familiar, more resources and Stack Overflow answers
- Cons: Maintenance-only mode, no new features, no React Server Components without workarounds
- Why not chosen: App Router is the future — Pages Router is legacy

### Alternative 2: No documented convention (current state)
- Pros: No documentation overhead
- Cons: Inconsistent patterns across the codebase, no onboarding guide for new developers
- Why not chosen: The project has 41 areas — architecture must be explicit

## Consequences

### Positive
- Consistent patterns across all routes
- Future-proof — guaranteed Next.js compatibility
- Built-in performance optimizations (server components, streaming, automatic code splitting)
- Lower onboarding friction — the convention is well-documented by Vercel

### Negative
- Framework lock-in — migrating to another framework means rewriting the architecture
- Implicit conventions (loading.tsx, error.tsx) can confuse developers unfamiliar with App Router

### Risks
- Risk: Server/client component boundary gets blurry over time. Mitigation: document boundary rules and review in PRs
- Risk: Caching surprises with the Sanity CMS integration. Mitigation: document the caching strategy before integration

## Related Decisions
- ADR-0001: Record Architecture Decisions
- ADR-0002: Atomic Design Methodology (component hierarchy lives within the App Router structure)
- Area 06 (Routing & Navigation): This ADR reserves all routing concerns. Area 06's standards will be App Router-native route patterns covered by this decision — no separate routing library will be adopted.

## References
- Next.js App Router docs — https://nextjs.org/docs/app
- React Server Components docs — https://react.dev/reference/rsc/server-components
- Vercel, "App Router vs Pages Router" — https://nextjs.org/docs/app/getting-started/overview
