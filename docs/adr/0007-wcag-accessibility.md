# ADR-0007: Adopt WCAG 2.2 Level AA Accessibility

## Status

Accepted

## Date

2026-06-30

## Context

CP3 Legacy needs an accessibility target to ensure the site is usable by people with disabilities — keyboard-only users, screen reader users, low vision, and others. Without a defined standard, accessibility is ad-hoc and inconsistent.

WCAG 2.2 is the current legal baseline (ADA Title III, Section 508, EN 301 549) and Level AA is universally recognized as the minimum compliance level.

## Decision

Target WCAG 2.2 Level AA conformance.

## Implementation

- Skip-to-content link as first focusable element
- Global `:focus-visible` outline (amber 2px) for keyboard navigation
- `aria-label` attributes on navigation widgets (mobile toggle, pushy panel)
- Escape key handlers on dialog widgets (pushy panel, modal)
- `aria-level="2"` on all major section headings for correct heading hierarchy
- `@axe-core/react` installed for dev-time automated scanning

## Alternatives Considered

- **No accessibility target**: Would save time but excludes users and creates legal risk if the site gets commercial use.
- **WCAG 2.2 Level A only**: Fewer requirements but misses critical criteria (color contrast, error identification).
- **WCAG 2.2 Level AAA**: Impractical for most projects — 7:1 contrast ratio conflicts with the template's dark theme.

## Consequences

Positive:
- Legal compliance with global accessibility laws
- Keyboard and screen reader users can navigate the site
- `@axe-core/react` catches regressions during development

Negative:
- Some AA criteria remain unmet (color contrast would require altering the template's brand colors)
- Manual screen reader testing still needed — automated tools only catch ~30% of issues
