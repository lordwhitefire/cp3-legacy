# AGENTS.md — CP3 Legacy Standards Pipeline

## Session Start
At the start of every session:
1. Read `docs/workflow.md`
2. Read `active-areas.md`
3. Read this file (`AGENTS.md`)
4. Read `.opencode/opencode.json` for available commands
5. Report current position (Area XX, standard Y of 7)
6. Wait for user instruction

## Conflict Check Rule
Before documenting any chosen standard, I MUST:
1. Read ALL already-documented areas in `active-areas.md`
2. Read ALL ADRs in `docs/adr/`
3. Cross-reference the new standard against every existing entry
4. Report any conflict, redundancy, or dependency to the user BEFORE writing

This rule exists because I made this error in Areas 05/06 (App Router overlaps with upcoming Routing area).

## Standard vs Tool Filtering Rule
Before listing any item for any area, I MUST verify each candidate:
- Is it a methodology, specification, or process? (YES = standard)
- Is it an npm package, library, or tool I install? (NO = skip)
- Could another team adopt it without installing software? (YES = standard)

If any candidate fails these checks, I MUST replace it before presenting.
This rule exists because I made this error in Areas 02 and 03.

## Pipeline Rules
- After documenting each standard in `active-areas.md`, STOP
- Do NOT proceed to the next standard until user types `continue`
- When user types `continue`: re-read `docs/workflow.md` + `active-areas.md`, report current area/standard number, and wait
- Only exception: user explicitly says "proceed" or "next"

## General Rules
- All files live inside `/home/lordwhitefire/current-project/cp/cp-legacy-frontend/`
- Never read or write outside this folder
- Always report what you are about to do before doing it
- If you encounter anything unexpected, stop and describe what you found before proceeding
