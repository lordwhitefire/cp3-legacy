# ADR-0003: Adopt Semantic Color Token Architecture

## Status

Accepted

## Date

2026-06-28

## Context

CP3 Legacy's brand colors (Alchemists palette) are referenced across multiple locations — `tailwind.config.ts`, component inline styles, CSS files, and shadcn/ui theme variables. There is no single source of truth. Changing a brand color requires hunting through the entire codebase.

Without semantic tokens, colors are referenced by appearance (e.g., `#ffd66b`, `gray-600`) rather than by intent (e.g., `brand-primary`, `text-muted`). This makes systematic changes (dark mode, accessibility fixes, rebranding) fragile and error-prone.

## Decision

We will adopt Semantic Color Token Architecture as the standard for all brand color values in CP3 Legacy.

The architecture defines three tiers:

1. **Primitive tokens** — raw brand palette values (e.g., `--color-alchemists-gold: #ecb731`)
2. **Semantic tokens** — role-based names that reference primitives (e.g., `--color-brand-primary: var(--color-alchemists-gold)`)
3. **Component tokens** — component-specific overrides where needed (e.g., `--button-primary-bg: var(--color-brand-primary)`)

Semantic tokens follow a `category-property-state` naming convention:
- `color-brand-primary` — primary brand color
- `color-bg-surface` — default page background
- `color-text-body` — body text color
- `color-border-default` — default border

All tokens are defined in `tailwind.config.ts` using CSS custom properties and documented in `docs/brand/color-tokens.md`.

## Alternatives Considered

### Alternative 1: Continue using raw hex values directly
- Pros: No upfront work
- Cons: Brittle, no intent communication, dark mode impossible without full rewrite
- Why not chosen: Scale of 41 areas demands systematic approach

### Alternative 2: Use only primitive tokens (e.g., `--gold-500`)
- Pros: Simple, communicates the value
- Cons: Doesn't communicate intent — `--gold-500` could mean brand primary, accent, or background
- Why not chosen: Semantic tokens provide both value AND intent

### Alternative 3: Use a separate token management tool (Tokens Studio, etc.)
- Pros: Visual tooling, Figma sync
- Cons: Adds third-party dependency, not needed for single-codebase project
- Why not chosen: `tailwind.config.ts` + CSS custom properties is sufficient

## Consequences

### Positive
- Single source of truth for every brand color
- Changing a brand color updates everywhere
- Dark mode is a token swap (same roles, different primitive values)
- New developers understand color intent from token names alone
- Compatible with W3C DTCG format (Area 03) for future tooling

### Negative
- Requires one-time audit pass to find all hardcoded hex values
- Token naming must be consistent — naming disagreements waste time

### Risks
- Risk: Over-engineering if the brand never changes. Mitigation: still worth it for the clarity and dark mode capability
- Risk: shadcn/ui components may break if token names conflict with their internal theme. Mitigation: keep shadcn theme variables as a separate layer, map semantic tokens to them

## Related Decisions
- ADR-0001: Record Architecture Decisions (this ADR exists because of ADR-0001)
- ADR-0002: Atomic Design Methodology (component tokens reference semantic tokens)
- Area 03: Design Tokens (DTCG spec provides the underlying JSON format)

## References
- Salesforce Design Tokens (2014) — https://spectrum.adobe.com/page/design-tokens/
- W3C DTCG Specification 2025.10 — https://www.designtokens.org/tr/2025.10/
- Nathan Curtis, "Design Tokens for Dummies" — https://medium.com/eightshapes-llc/design-tokens-for-dummies-5b6d8a8b9c3e
