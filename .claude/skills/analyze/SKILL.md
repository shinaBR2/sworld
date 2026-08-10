---
name: analyze
description: >-
  The audit pass on an already-scoped ticket and its sub-issue breakdown, run BEFORE any code.
  Use it as the first move whenever picking up, starting, resuming, or "analysing" a non-trivial
  tracker issue — especially a large-feature parent with sub-issues — to catch missing requirements
  and a breakdown that has drifted out of sync before you build against it. Reach for it the moment
  you're about to start an issue, when a plan "looks done" but nobody has re-checked it,
  or when the user says "analyse this issue / take a look at this breakdown / is this plan right".
  This is the backward/audit direction on a *spec* — distinct from `product-planning`/`grill-me`
  (forward, idea → breakdown) and `self-review` (analysing *code*). Not needed for a
  trivial, single-issue bug or a one-line change with no breakdown to audit.
---

# Analyze

Before you build a non-trivial or reopened issue, audit its plan — catching a missing requirement, a
scope that's crept, or a dependency gone stale is cheap here and expensive three sub-issues deep.
This is `parallel-workflow`'s step-one gate: run it on any non-trivial or reopened issue you pick up,
before the worktree.

Beyond a fresh read of the spec, here's the reason it pays: a plan is written once, but work lands in
parallel constantly, so by the time you build it can describe a codebase that has moved on — a
blocker since closed, a sibling that shipped its part differently, a Goal no remaining child
delivers. That drift is sharpest on a **parent with sub-issues**, and invisible until something
checks.

Where it sits: `product-planning`/`grill-me` make the plan (forward, idea → breakdown); **`analyze`
audits it before code** (backward); `self-review` audits the code. It doesn't re-plan — it reuses
`grill-me` for the requirement pass and `.claude/references/good-diff.md` for the scope pass, and
adds the one check only it can: whether a breakdown still holds together against the moved codebase.
Pull the issue, its relations, and any sub-issues (`task-tracker`) so you audit what's there, not
memory.

## The three passes

### 1. Requirement re-derivation

Run `grill-me`'s completeness sweep against the written spec — walk each axis and confirm it's
either handled or *explicitly* ruled out of scope. A silent axis is a requirement nobody wrote.

### 2. Breakdown integrity

Analyze's own contribution, and the pass that needs a breakdown — skip it on a single issue with no
sub-issues. Does the parent still match its sub-issues and their relations?

- **Stale blockers** — a `blocked-by` pointing at an issue since closed, merged, or superseded. A
  dead blocker makes startable work look blocked; a blocker dropped in prose only makes blocked work
  look startable.
- **Parent drift** — the parent's Goal no longer describes what the children deliver, or a real new
  blocker between children isn't captured as a relation. The parent is the source of truth, so its
  drift propagates to every child.
- **Orphans & gaps** — a sub-issue the parent's Goal doesn't cover, or part of the Goal no sub-issue
  delivers.
- **Deploy-order as a real relation** — a "must ship before X" living only in prose is a trap under
  merge-is-deploy: a migration a consumer's query needs must be a `blocks` relation, not a sentence
  someone has to remember. See `dependency-analysis` (is the edge real) and `writing-task-specs`
  (how it's recorded).
- **Waves earned** — re-run `dependency-analysis`' test over each `blocked-by`; it survives only as
  a genuine dependency, not ordering invented to make the plan feel structured.

### 3. One-purpose / scope

Apply the does-one-thing and one-boundary bars (`.claude/references/good-diff.md`, Tests 1 and 4)
to the issue you're building, and to each sub-issue if it's broken down. One that's grown a second
purpose, or now spans two apps or an app plus a shared package, is a split — flag it before it's
built.

## Output

A short report — most serious findings first — each tagged by what it needs:

- **Reconcile now** — bookkeeping the analysis can just fix (delete a stale relation, realign the
  parent's drifted Goal). Do it and say what changed.
- **Owner decision** — anything that changes child scope or adds a requirement (a missing actor's
  behaviour, a new failure path, a sub-issue that should split). Surface and offer; the owner
  decides — don't silently rewrite their breakdown.

End with a one-line verdict: safe to build as-is, safe after the reconciling edits, or blocked on
the owner resolving open findings.

For a worked example, see `references/worked-example.md`.
