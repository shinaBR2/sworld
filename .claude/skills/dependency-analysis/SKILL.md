---
name: dependency-analysis
description: Work out the true dependency graph of a change from the code — which pieces are isolated, which are genuinely blocked by another, and which block others. Auto-triggers when breaking a feature into sub-tasks, deciding whether a `blockedBy` edge is real, sequencing work into waves, asking "can these run in parallel?", or judging what breaks if a signature/schema/contract changes. Owns the investigation and the real-vs-fake test; `writing-task-specs` renders the result into a spec and `task-tracker` records the edge.
user-invocable: false
---

# Dependency Analysis

Every breakdown rests on one question: **what is safe to ship on its own?** Get it wrong in one direction and you invent blockers that stall work for no reason. Get it wrong in the other and you deploy a break.

This skill owns that question. It is answered **from the code, before the breakdown is written** — not from intuition about how a feature "feels" structured.

## Investigate first — you can know this, so know it

**Nothing fancy: read the code very carefully, from the beginning.** You are not guessing and you are not estimating. Before deciding any dependency, find out who actually depends on what. Reach for CodeGraph, never grep, for structural questions:

- `codegraph_callers` — who calls this? Changing its signature breaks exactly these.
- `codegraph_impact` — what's the blast radius if this changes?
- `codegraph_context` — what is this area, and what does it already touch?

The answer is knowable, and close to exact, from the moment you look. A signature consumed by six call sites cannot change alone — that is a fact in the code, discoverable in one query, not a judgement call. Do this investigation once, up front, thoroughly; every edge below falls out of it. Time spent here is what makes shipping fast safe.

## The test — three questions, asked about real impact

We ship as fast as we can, and **merging is deploying** (see `architecture`). So "isolated" does not mean "structurally unrelated." It means one thing:

> **If this merges right now, on its own — is that safe?**

Ask it three ways. **Any yes means it is not isolated:**

1. **Does it break at runtime?** Something calls into it, or it calls something that isn't there yet.
2. **Does it break the build?** A missing type, an unresolved import, a schema the codegen needs.
3. **Does it change anything for the end user?** A half-built feature appearing in the UI is a broken deploy even if every test passes.

Question 3 is the one that gets missed. Code can compile cleanly, break nothing, and still be unshippable because it puts something in front of a user before the rest exists.

**Impact is the criterion — not structure.** Two files importing each other may be perfectly safe to ship separately; two files that never reference each other may not be. Answer the three questions, then let the edges follow.

**When the answer is yes, trace it.** Don't stop at "feels risky" — find the exact call site, the exact type, the exact rendered component that causes the break. If you cannot name it, you have not found a dependency yet.

## Two tools turn a "yes" back into isolated

A "yes" is not a verdict. Before recording an edge, check whether one of these dissolves it — most cascades collapse here.

### 1. A feature flag — for question 3

Put the change behind a flag and the user sees nothing, so it ships safely on its own. That is what the flag system is for; see `micro-prs` for how to use it.

### 2. A behaviour-preserving default — for questions 1 and 2

**The single most useful move for a cascading change**, and the one that most often turns a multi-wave chain into a flat list. It applies whenever a change ripples through consumers: a new required prop on a React component used at many levels, a new parameter on a method with many callers, a changed return shape.

Answer two questions, in order:

1. **What is the *correct* API at the final state?** Design it properly. If the new prop/param should be **required**, make it required — don't deform the design to make sequencing easier.
2. **What default value makes every current consumer behave exactly as it does today?** ***Knowing this value is the key.***

**If you can name that value:** land the new prop/param carrying it. Every existing caller keeps compiling and behaving identically, so nothing is blocked — consumers then migrate **in parallel, independently**, and a follow-up task removes the default once they all pass it explicitly (that removal is `micro-prs`' "remove old code, its own PR, after the replacement is live").

**If you cannot name it:** you have now *proven* a real dependency instead of guessing at one — and the investigation tells you exactly which consumers form the edge.

**If the new prop/param is optional by design**, question 2 barely arises: consumers work untouched without passing anything. That case is isolated almost by construction.

The trap this avoids: seeing "12 files must change" and inventing 12 sequenced sub-tasks, when one safe default would have made all 12 independent.

### Not blockers

- Touching the same file — that's a merge conflict to resolve at review, not a dependency.
- Belonging to the same feature — belonging together is not depending on each other.
- "Makes more sense afterwards" — narrative order is not a dependency.
- "Would be easier afterwards" — convenience is not a dependency. Say so, and run them in parallel.

## The three outcomes

Every piece of work lands in exactly one:

- **Isolated** — nothing blocks it, it blocks nothing. Startable now.
- **Blocked by X** — cannot start until X lands. Record the edge.
- **Blocking Y** — Y waits on it. This is the same edge seen from the other end; record it once, not twice.

## Flat is the default; waves are earned

**Most breakdowns are flat** — a list of sub-tasks, all startable now. That is the expected shape, not a sign the analysis was shallow.

A wave is a barrier: everything in wave N lands before wave N+1 starts. That is a real cost in wall-clock time and coordination, so impose it **only where the test above found a genuine edge**. Never add ordering to make a plan look structured. If everything is parallel, say so plainly and skip waves and the dependency graph entirely.

## Cross-repo edges are the ones that bite

The sharpest real dependencies in this workspace run **between repos**, where nothing type-checks the seam:

- A frontend query on a new table or column is blocked by the `sworld-hasura-v2` PR that adds it.
- A frontend call to a new Action is blocked by the `sworld-backend` handler behind it.

Merging is deploying (see `architecture`), so these edges are also a **live ordering constraint in production**, not just a build-order preference. Land the data layer first and let it deploy.

## Where the answer goes

- `writing-task-specs` — renders the result: a flat table, or waves plus a dependency-graph section.
- `task-tracker` — the command that records a `blockedBy` edge.
- `micro-prs` — takes it as given and slices each piece by layer.
- `analyze` — audits an existing breakdown against this test, and flags edges that were never earned.
