---
name: dependency-analysis
description: Work out the true dependency graph of a change from the code — which pieces are isolated, which are genuinely blocked by another, and which block others. Auto-triggers when breaking a feature into sub-tasks, deciding whether a `blockedBy` edge is real, sequencing work into waves, asking "can these run in parallel?", or judging what breaks if a signature/schema/contract changes. Owns the investigation and the real-vs-fake test; `writing-task-specs` captures the result in the ticket breakdown and `task-tracker` records the edge.
user-invocable: false
---

# Dependency Analysis

Every breakdown rests on one question: **what is safe to ship on its own?** Invent a blocker and you stall work for nothing; miss a real one and you deploy a break. This skill owns that question — answered **from the code, before the breakdown is written**, never from how a feature "feels" structured.

## Investigate first

Who actually depends on what is a fact you can find, not estimate — so find it before deciding any edge. Reach for CodeGraph (never grep) for the structural questions: who calls this, and what breaks if it changes. A signature consumed by six call sites cannot change alone — that falls out of one query, it is not a judgement call. Do this once, up front; every edge below follows from it.

## The test — is it safe to merge alone?

Merging is deploying (see `.claude/references/deployment-model.md`), so "isolated" is about **impact, not structure** — two files that import each other may ship separately just fine; two that never reference each other may not. The question is only:

> **If this merges right now, on its own — is that safe?**

Ask it three ways. **Any yes means it is not isolated:**

1. **Does it break at runtime?** It calls something not there yet, or something calls into it.
2. **Does it break the build?** A missing type, an unresolved import, a schema the codegen needs.
3. **Does it change anything for the end user?** A half-built feature reaching the UI is a broken deploy even with every test green — this is the one that gets missed.

When the answer is yes, **trace it to the exact call site, type, or rendered component.** If you cannot name it, you have not found a dependency yet.

## Two moves turn a "yes" back into isolated

A "yes" is not a verdict — check whether one of these dissolves it first.

- **A feature flag** (for question 3): behind a flag the user sees nothing, so it ships safely alone.
- **A behaviour-preserving default** (for questions 1 and 2): the move that most often flattens a cascade — a new required prop/param/return-shape rippling through many consumers. Design the *correct* final API first (if it should be required, make it required), then ask: **what default makes every current consumer behave exactly as today?** Name that value and you land the new API carrying it — every caller keeps compiling, consumers migrate in parallel, and a follow-up PR removes the default once they all pass it explicitly. Can't name it? You've now *proven* a real edge, and the investigation shows exactly which consumers form it. (An optional-by-design prop is isolated almost by construction.)

The trap both avoid: seeing "12 files must change" and inventing 12 sequenced sub-tasks when one safe default makes all 12 independent.

## Not blockers

- **Same file** — a merge conflict to resolve at review, not a dependency.
- **Same feature** — belonging together is not depending on each other.
- **"Makes more sense / would be easier afterwards"** — narrative order and convenience are not dependencies. Say so, and run them in parallel.

## Flat is the default; waves are earned

Most breakdowns are flat — every sub-task startable now — and that is the expected shape, not shallow analysis. A wave (everything in it lands before the next starts) costs real wall-clock time and coordination, so impose one only where the test above found a genuine edge. If everything is parallel, say so and skip waves and the graph entirely.

## Cross-layer edges are the ones that bite

The sharpest real edges run **between layers**, where nothing type-checks the seam — one repo does not remove them:

- A frontend query on a new table or column is blocked by the `apps/hasura` migration that adds it.
- A frontend call to a new Action is blocked by the `apps/backend` handler behind it.

Because a merge deploys, these are a live ordering constraint in production too: land the data layer first and let it deploy.

## Where the answer goes

Each piece of work is *isolated*, *blocked by X*, or *blocking Y* (the same edge, recorded once). From there:

- `writing-task-specs` — captures the result as child tickets, each with a `blocked-by` edge only where this analysis found a real one.
- `task-tracker` — records the `blockedBy` edge.
- `analyze` — audits an existing breakdown against this test and flags edges that were never earned.
