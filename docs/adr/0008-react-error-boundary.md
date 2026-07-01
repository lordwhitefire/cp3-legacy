# ADR-0008: React Error Boundary Pattern

**Status:** Accepted  
**Date:** 2026-07-01  
**Standard:** React Error Boundary Pattern (React 16+, Next.js App Router)  
**Area:** 13 — Error Handling

## Context

The CP3 Legacy site uses the Alchemists template with 9 custom organisms (Header, MobileHeader, HeroUnit, FeaturedCarousel, FeaturedSlider, MainContent, Footer, PushyPanel, Modals) plus app-level files. Without error boundaries, a JavaScript error in any component unmounts the entire React tree — a blank white page.

## Decision

Adopt a two-tier error handling strategy:

1. **App-level (`error.tsx`, `not-found.tsx`, `loading.tsx`)** — catch unhandled errors and missing routes at the root level.
2. **Component-level (`ErrorBoundary.tsx`)** — wrap only interactive organisms with user-triggered state changes (FeaturedSlider, Modals). The remaining 7 organisms are static renders with no runtime failure mode.

## Implementation

- `src/app/error.tsx` — Root error boundary, logs to console, branded retry button
- `src/app/not-found.tsx` — Branded 404 page with navigation
- `src/app/loading.tsx` — Loading spinner during page transitions
- `src/components/ErrorBoundary.tsx` — Reusable class-based boundary with optional name and fallback props
- FeaturedSlider and Modals wrapped in `<ErrorBoundary name="...">`

## Alternatives Considered

- **Per-organism ErrorBoundary for all 9 organisms** — rejected as over-engineering for a static single-page site with no runtime data fetching. The other 7 organisms render fixed content from data.json with no async operations or user interaction that could produce runtime errors.

## Consequences

- A crash in any component is caught by root `error.tsx` — user sees branded error with retry
- A crash in FeaturedSlider or Modals is isolated locally — the rest of the page remains functional
- No additional dependencies beyond React's built-in error boundary API
- Static organisms (Header, Footer, HeroUnit, etc.) remain unwrapped — a crash there triggers root error.tsx, which is acceptable for a demo site
