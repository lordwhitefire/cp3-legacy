# ADR-0005: Adopt Layout Hierarchy & Composition (App Router)

## Status

Accepted

## Date

2026-06-28

## Context

CP3 Legacy uses the Next.js App Router with a single root `layout.tsx` at `src/app/layout.tsx`. As the project grows (41 areas of development), additional routes will need their own layouts, loading states, error boundaries, and template variants.

Without a formalised layout hierarchy, developers may create inconsistent page structures, duplicate layout code, or miss the connection between App Router layouts and the Atomic Design Template level (Area 03).

## Decision

We adopt the App Router Layout Hierarchy & Composition as the standard for page-level structure.

Key rules:

1. **Root layout** (`src/app/layout.tsx`) — required, wraps entire app, contains `<html>` and `<body>`, global fonts, metadata defaults
2. **Nested layouts** — each route segment can have its own `layout.tsx` that wraps all child routes; layouts compose (child layout renders inside parent layout)
3. **Persistence** — layouts do not remount on navigation; React state and DOM are preserved within a layout segment
4. **template.tsx** — use instead of `layout.tsx` when the wrapper must remount on every navigation (page view tracking, animation triggers)
5. **Mapping** — App Router `layout.tsx` = Atomic Design Template level (Area 03)
6. **Boundaries** — each layout segment owns its `loading.tsx`, `error.tsx`, and `not-found.tsx`

## Alternatives Considered

### Alternative 1: Custom wrapper components (no layout.tsx)
- Pros: Explicit, no framework magic
- Cons: Manual composition, no persistence guarantees, inconsistent across routes
- Why not chosen: App Router layouts are the standard — custom wrappers duplicate framework functionality

### Alternative 2: All layouts in a single root layout
- Pros: Simple, single file
- Cons: No per-route customisation, defeats the purpose of nested layouts
- Why not chosen: Doesn't scale beyond the current single-page structure

## Consequences

### Positive
- Consistent page structure across all routes
- Layouts persist state across navigations
- Each route segment has its own loading/error isolation
- Atomic Design Template level (Area 03) maps directly to `layout.tsx` — no conceptual gap

### Negative
- Implicit composition can confuse developers unfamiliar with App Router
- Layout/template distinction requires documentation

### Risks
- Risk: Over-nesting layouts creates unnecessary abstraction. Mitigation: only create a layout when a route segment needs a distinct wrapper, loading state, or error boundary
- Risk: Developers use `layout.tsx` when `template.tsx` is needed (or vice versa). Mitigation: document the distinction at each decision point

## Related Decisions
- ADR-0004: Next.js App Router Convention (this is a sub-decision for routing within that architecture)
- ADR-0002: Atomic Design Methodology (layout.tsx = Template level — direct mapping)
- Area 05: Frontend Architecture (App Router is the parent decision)

## References
- Next.js App Router layouts docs — https://nextjs.org/docs/app/getting-started/layouts
- React Server Components — https://react.dev/reference/rsc/server-components
