# Standards Pipeline Workflow — CP3 Legacy

## Purpose
Document 7 industry standards per active area (41 areas = 287 standards) into `active-areas.md`.

---

## Session Start Routine
Every session, before any work:

1. Read this file (`docs/workflow.md`)
2. Read `active-areas.md` — find the last documented standard
3. Read `AGENTS.md` for behavioral rules
4. Read `.opencode/opencode.json` for available commands
5. Report to user: currently on [Area XX], standard [Y] of 7
6. Wait for user instruction

---

## Per-Standard Workflow

1. **Search** — Research 7 industry standards for the current area online
   - FILTER each candidate: methodology/specification/process = yes; npm package/library/tool = no
   - If any candidate fails, replace before presenting (this rule exists because I made this error in Areas 02 and 03)
2. **Present** — Show all 7 with:
   - Standard name
   - Authority (who created/maintains it)
   - Why it applies to this project
   - Priority ranking (high → low)
   - Cost/effort estimate
3. **User chooses** — They pick which standard to adopt
4. **Conflict check** — Before writing, cross-reference proposed standard against ALL already-documented areas in `active-areas.md` and all ADRs in `docs/adr/`. If overlap found, classify as:
   - **Conflict** (contradicts existing decision) → report to user, propose nest/supersede/reject
   - **Redundancy** (already covered) → report to user, propose skip
   - **Dependency** (builds on existing decision) → add dependency note to the new ADR
5. **Explain adoption** — Show them how to implement it for CP3 Legacy
6. **User confirms** — They say yes
7. **Document** — Write into `active-areas.md` with:
   - Standard name
   - Authority
   - Origin
   - Application to this project
   - Pros and Cons
    - Status (Done ✅ / Remaining 🔲)
8. **STOP** — Do NOT proceed to next standard automatically
9. **Wait** for user to type the `continue` command

---

## Continue Command
When user types `continue`:
1. Re-read `docs/workflow.md`
2. Re-read `active-areas.md` to find current position
3. Report: "Currently on Area [XX], standard [Y] of 7. Last documented: [name]. Ready."
4. Wait for their next instruction

---

## Area Continuation
After the chosen standard is documented:
1. Move to the next area in `active-areas.md`
2. Start again from step 1 of the per-standard workflow
3. After area 33, continue with area 73
4. After area 80, report: "All 41 areas complete."

Note: 7 standards are presented per area, but only the ONE the user chooses gets documented in active-areas.md.

---

## Pipeline Trigger
After documenting ANY standard:
- You MUST stop and wait for `continue` command
- You MUST NOT advance to the next standard automatically
- The only exception is if the user explicitly says "proceed" or "next"
