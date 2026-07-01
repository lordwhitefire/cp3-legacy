# ADR-0011: Sonner Toast Notification Pattern

## Status

Accepted

## Date

2026-07-01

## Context

CP3 Legacy needs a lightweight notification system for user feedback — success/error/info messages triggered by interactions (data refresh, form submission, error recovery). The chosen approach must:

- Not block user interaction (non-modal)
- Auto-dismiss with configurable timing
- Support multiple types (success, error, info, loading)
- Be accessible (announced by screen readers)
- Stay within the existing shadcn/ui ecosystem
- Add minimal bundle weight

## Decision

Use Sonner — the shadcn/ui standard toast library. Sonner is already installed (`package.json`) and configured (`<Toaster />` in root layout).

Conventions:
- **Position:** `bottom-right`
- **Success/Info duration:** 4000ms (default)
- **Error duration:** 6000ms (extended for readability)
- **Loading:** Manual dismiss — persists until replaced by success/error
- **API:** `toast()`, `toast.success()`, `toast.error()`, `toast.info()`, `toast.loading()`, `toast.dismiss()`

## Alternatives Considered

### Alternative 1: react-hot-toast
- Pros: Lightweight, well-known
- Cons: Not the shadcn/ui standard; different API from Sonner
- Why not chosen: Sonner is the shadcn/ui ecosystem standard; react-hot-toast would add a separate dependency

### Alternative 2: Custom notification component
- Pros: Full control over appearance and behavior
- Cons: Implementation effort; no auto-dismiss, no stacking, no a11y out of the box
- Why not chosen: Re-inventing a solved problem when a standard library is available

### Alternative 3: No notifications (console only)
- Pros: Zero bundle cost
- Cons: No user feedback for actions; poor UX
- Why not chosen: Users need visual confirmation of actions

## Consequences

### Positive
- Zero additional setup — already installed and configured
- shadcn/ui standard — aligns with the existing UI library
- Accessible out of the box — announced by screen readers
- Swipe-to-dismiss on mobile
- Promise-based `toast.promise()` for clean async feedback

### Negative
- Limited customization without CSS variable overrides
- Corner-position only — no center/inline variant
- Auto-dismiss can be too fast for error messages (mitigated by 6000ms duration)

### Risks
- Low — Sonner is mature, well-maintained, and widely used

## Related Decisions
- Area 24 (Notifications & Feedback)
- Area 13 (Error Handling — toast as supplementary feedback)

## References
- https://sonner.emilkowal.ski/
