# ADR-0002: Adopt Atomic Design Methodology

## Status

Accepted

## Date

2026-06-28

## Context

CP3 Legacy has 57 UI components split between shadcn/ui primitives (48) in `src/components/ui/` and custom alchemists components (9) in `src/components/alchemists/`. These components lack a formal hierarchy or taxonomy — any component can import any other component, leading to tangled dependency chains.

Without a clear component architecture, the design system becomes a flat list of files with no guidance on how to compose them, where to place new components, or what level of abstraction each component represents.

## Decision

We will adopt Brad Frost's Atomic Design Methodology (2013) as the organizational framework for all UI components.

The five levels are:

1. **Atoms** — Smallest indivisible UI elements (Button, Input, Label, Badge, etc.)
2. **Molecules** — Simple groups of atoms forming functional units (Card, Alert, Dialog, Toast, etc.)
3. **Organisms** — Complex sections composed of molecules and atoms (Header, HeroUnit, Footer, etc.)
4. **Templates** — Page-level layouts arranging organisms (layout components)
5. **Pages** — Specific instances of templates with real content

Component taxonomy is documented in `docs/design-system/component-taxonomy.md` and `active-areas.md` (Area 03).

## Alternatives Considered

### Alternative 1: No formal hierarchy
- Pros: Zero overhead, maximum flexibility
- Cons: Component sprawl, no guidance for new components, tangled imports
- Why not chosen: Proven failure mode at scale

### Alternative 2: Feature-based folder structure
- Pros: Colocates components with their features
- Cons: Duplicates shared components across features, inconsistent abstraction levels
- Why not chosen: Atomic Design works alongside feature folders (organisms go in feature folders, atoms/molecules stay shared)

### Alternative 3: Material Design's component taxonomy
- Pros: Well-documented, Google-backed
- Cons: Over-engineered for this project's size, assumes Material Design UI patterns
- Why not chosen: Tailwind + shadcn/ui is not Material Design

## Consequences

### Positive
- Shared vocabulary for designers and developers
- Clear placement rules for every new component
- Organism-to-organism import prevention keeps the dependency graph clean
- Free — no tools, libraries, or migrations required

### Negative
- Enforcement is review-based, not tool-enforced (no linter rule exists for Atomic levels)
- Some components straddle boundaries (e.g., `ui/carousel.tsx` is a molecule technically but wraps the FeaturedCarousel organism)

### Risks
- Risk: Levels blur over time as components grow. Mitigation: periodic taxonomy review as part of design system maintenance
- Risk: Team ignores the taxonomy. Mitigation: add atomic level to PR checklist and component documentation

## Related Decisions
- ADR-0001: Record Architecture Decisions (this ADR exists because of ADR-0001)
- Area 01: Twelve-Factor App (the codebase principle that makes component reuse safe)

## References
- Brad Frost, "Atomic Design" (book, 2016) — https://atomicdesign.bradfrost.com/
- Brad Frost, "Atomic Design" (original blog post, 2013) — https://bradfrost.com/blog/post/atomic-web-design/
