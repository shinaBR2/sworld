---
name: dependency-analysis
description: Work out the true dependency graph of a change from the code — which pieces are isolated, which are genuinely blocked by another, and which block others. Auto-triggers when breaking a feature into sub-tasks, deciding whether a `blockedBy` edge is real, sequencing work into waves, asking "can these run in parallel?", or judging what breaks if a signature/schema/contract changes. Owns the investigation and the real-vs-fake test; `writing-task-specs` captures the result in the ticket breakdown and `task-tracker` records the edge.
user-invocable: false
---

* dependency-analysis: works out from the code which pieces of a change are safe to ship alone, which are genuinely blocked by another, and which block others.

* Rules
  * Answer the one question every breakdown rests on — what is safe to ship on its own? — from the code, before the breakdown is written, never from how a feature "feels" structured.
  * Find who actually depends on what with CodeGraph (never grep) for the structural questions — who calls this, and what breaks if it changes — once, up front, before deciding any edge, because a signature consumed by six call sites cannot change alone and that falls out of one query, not a judgement call.
  * "Isolated" is about impact, not structure, because merging is deploying (`.claude/references/deployment-model.md`) — two files that import each other may ship separately, and two that never reference each other may not.
  * A piece is not isolated if merging it right now on its own would break at runtime (it calls something not there yet, or something calls into it), break the build (a missing type, an unresolved import, a schema the codegen needs), or change anything for the end user (a half-built feature reaching the UI is a broken deploy even with every test green — the one that gets missed) — any one yes is enough.
  * When the answer is yes, trace it to the exact call site, type, or rendered component; if you cannot name it, you have not found a dependency yet.
  * A "yes" is not a verdict until you check whether a feature flag (for the end-user question — behind a flag the user sees nothing, so it ships safely alone) or a behaviour-preserving default (for the runtime and build questions) dissolves it first.
  * For a new required prop/param/return-shape rippling through many consumers, design the correct final API first (if it should be required, make it required), then land it carrying the default that makes every current consumer behave exactly as today so every caller keeps compiling and consumers migrate in parallel, with a follow-up PR removing the default once they all pass it explicitly — and an optional-by-design prop is isolated almost by construction.
  * If you cannot name that default you have proven a real edge, and the investigation shows exactly which consumers form it.
  * Don't see "12 files must change" and invent 12 sequenced sub-tasks when one safe default makes all 12 independent.
  * Same file (a merge conflict to resolve at review), same feature (belonging together is not depending), and "makes more sense / would be easier afterwards" (narrative order and convenience) are never blockers — say so and run them in parallel.
  * Flat — every sub-task startable now — is the default and the expected shape, so impose a wave (everything in it lands before the next starts) only where the test found a genuine edge, since a wave costs real wall-clock time and coordination; if everything is parallel, say so and skip waves and the graph entirely.
  * Cross-layer edges are the ones that bite because nothing type-checks the seam — a frontend query on a new table or column is blocked by the `apps/hasura` migration that adds it, and a frontend call to a new Action is blocked by the `apps/backend` handler behind it — so land the data layer first and let it deploy.
  * Record each piece as isolated, blocked by X, or blocking Y (the same edge, recorded once), handing the result to `writing-task-specs` (child tickets with a `blocked-by` edge only where real), `task-tracker` (records the `blockedBy` edge), and `analyze` (audits an existing breakdown against this test and flags edges never earned).

* Steps
  1. Investigate with CodeGraph who depends on what, once, up front.
  2. For each piece, ask the three ways whether merging it alone right now is safe.
  3. For each yes, try to dissolve it with a feature flag or a behaviour-preserving default before accepting it as an edge.
  4. Record each piece as isolated, blocked by X, or blocking Y, and hand off.
