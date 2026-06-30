# ADR-0001: Record Architecture Decisions

## Status

Accepted

## Date

2026-06-28

## Context

This project (CP3 Legacy) has 41 active development areas requiring hundreds of technical decisions across the rebuild and ongoing maintenance. Without written records, decision rationale is lost to memory, Slack threads, or Jira tickets — invisible to new team members and future contributors.

The Twelve-Factor App methodology (Area 01) and every subsequent standard adopted from this pipeline need their rationale captured permanently alongside the code.

## Decision

We will use Architecture Decision Records (ADRs) as defined by Michael Nygard and maintained at `adr.github.io`.

- Each ADR is a single Markdown file in `docs/adr/`
- Numbered sequentially with leading zeros (0001, 0002, ...)
- Each ADR captures one decision: context, decision itself, alternatives considered, and consequences
- Statuses: Proposed → Accepted → Deprecated or Superseded by ADR-XXX
- ADRs are never deleted — superseded ones are marked as such

## Alternatives Considered

### Alternative 1: Wiki/Confluence
- Pros: Non-developers can edit
- Cons: Not version-controlled, decays faster, not co-located with code
- Why not chosen: ADRs in Git stay with the code, are reviewable in PRs, and survive tool migrations

### Alternative 2: Jira tickets
- Pros: Links to existing workflow
- Cons: Buried in issue tracker, not browsable as a coherent log, disappears when project moves tools
- Why not chosen: ADRs are persistent, ordered, and readable without authentication

## Consequences

### Positive
- Every major decision has a permanent, discoverable record
- PR reviews include decision context alongside code changes
- New team members can read ADR history to understand why the system is built this way
- Pipeline standards from all 41 areas will be documented as ADRs

### Negative
- Requires discipline to write ADRs at decision time, not retroactively
- Adds a small overhead to significant technical decisions

### Risks
- Risk: ADRs go stale if decisions change without updating. Mitigation: mark superseded ADRs when decisions change; include in code review checklist
- Risk: Over-documenting trivial choices. Mitigation: only write ADRs for significant, non-reversible decisions

## Related Decisions
- Area 01 (Project Setup): Twelve-Factor App — documented in active-areas.md
- Area 02 (Stack Decisions): This ADR itself

## References
- Michael Nygard, "Documenting Architecture Decisions" (2011) — https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions.html
- ADR GitHub Organization — https://adr.github.io/
- Martin Fowler, "Architecture Decision Record" (2026) — https://martinfowler.com/bliki/ArchitectureDecisionRecord.html
