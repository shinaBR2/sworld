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
  (forward, idea → breakdown) and `reviewing-pull-requests` (analysing *code*). Not needed for a
  trivial, single-issue bug or a one-line change with no breakdown to audit.
---

# Analyze

An existing ticket and its breakdown are a set of claims about what to build and in what order. Before
you build against them, check the claims hold — because the cheapest place to catch a missing
requirement or a wrong dependency is here, not three sub-issues deep into implementation. This is the
step between "read the issue" and "start coding" that `parallel-workflow`'s *Before starting* points at.

It is the **audit** direction, and it's why it's its own skill:

| Skill | Direction | Target |
|---|---|---|
| `product-planning` / `grill-me` | forward — rough idea → breakdown | a concept being shaped |
| **`analyze`** | **backward — existing breakdown → findings** | **a scoped ticket + its sub-issues** |
| `reviewing-pull-requests` | backward | a code diff |

Analyze reuses the thinking tools rather than restating them — it points at `grill-me` for the
requirement pass and `micro-prs` for the scope pass, and adds the one thing neither has: checking that
a breakdown is still internally consistent with itself.

## When to run it

The first move on picking up any non-trivial issue — before you start it, before a line of
code. Highest value on a large-feature **parent with sub-issues**, on any issue that was scoped a while
ago, and on anything reopened or reworked (where the plan and the sub-issues drift apart most). Skip it
for a trivial single-issue bug with no breakdown to audit — there's nothing to reconcile.

Pull the issue, its relations, and the sub-issues first (see `task-tracker`) so you're auditing what's
actually there, not memory.

## The three passes

### 1. Requirement re-derivation

Read the spec as if you were about to grill it, and run `grill-me`'s **completeness sweep** against what's
already written — walk the actors/roles, states & scale, and failure & timing axes and confirm each is
either handled in the spec or *explicitly* ruled out of scope. `grill-me` owns the method; here you apply
it to an existing document instead of a live conversation. A silent axis is a requirement nobody wrote.

This is the pass that catches the expensive class of gap — the actor nobody enumerated, the half-finished
state nobody handled — at analysis time instead of during implementation self-review.

### 2. Breakdown integrity

Does the parent still match its sub-issues and their relations? This is analyze's own contribution — check:

- **Stale blockers** — a `blocked-by` pointing at an issue that's since closed, merged, or been superseded.
  A dead blocker makes startable work look blocked (and a removed-in-prose-only blocker makes blocked work
  look startable). Reconcile the relations to reality.
- **Parent drift** — the parent description's schema, dependency graph, status table, or estimates no longer
  match the actual sub-issue set (a column a child added but the parent's schema block never gained; a
  "dependency graph (unchanged shape)" that omits a real new blocker; a sub-issue missing from the status
  table). The parent is the source of truth — when it lies, everyone downstream inherits the lie.
- **Orphans & gaps** — a sub-issue not reflected in the parent's plan, or planned work with no sub-issue.
- **Deploy-order encoded as a real relation** — a "must ship before X" that lives only in prose is a trap
  under this workspace's merge-is-deploy model (a schema migration a consumer's query needs must be a
  `blocks` relation, not a sentence someone has to remember). See `parallel-workflow` and `writing-task-specs`.
- **Waves earned** — each `blocked-by` is a genuine dependency, not invented ordering to make the plan feel
  structured (`writing-task-specs`: flat by default, waves only when real).

### 3. One-purpose / scope

Apply `micro-prs`' one-purpose test to each sub-issue as it stands: can its `What` be said without an "and",
and does its scope stay inside one repo/app? A sub-issue that has quietly grown a second purpose, or now
spans two repos, is a split — flag it before it's built, not at review. `micro-prs` owns the test.

## Output

A short report, findings ordered by severity, each tagged as one of:

- **Reconcile now** — unambiguous bookkeeping the analysis can just fix: delete a stale relation, update the
  parent's drifted schema/graph/status. Do these and say what changed.
- **Owner decision** — anything that changes child scope or adds a requirement (a missing actor's behaviour,
  a new failure path, a sub-issue that should split). Raise it clearly; the owner decides — you don't
  silently rewrite their breakdown. (`product-planning`'s non-gating posture applies: surface and offer.)

End with a one-line verdict: is this breakdown safe to build against as-is, safe after the reconciling
edits, or does it need the owner to resolve open findings first?

## Worked example

A per-user third-party login feature (connect an external account, then import from it), scoped into a parent
plus sub-issues. Here's what an up-front analyze pass catches — each of which, skipped, tends to surface the
expensive way, mid-build in a sub-issue's self-review:

- **Requirement pass (actor axis):** the connect/import actions are marked for any signed-in user, but the
  implementation runs against a single shared account belonging to the owner — so any user could act as the
  owner. "What does a *non-owner* user actually get here?" was never enumerated. The actor axis surfaces it
  before it's built.
- **Requirement pass (failure / half-finished axis):** a user who already has a working connection starts a
  re-login and abandons it — and the design reuses the same field for the in-progress session, so the
  abandoned attempt overwrites and destroys their working one. Data-loss. "Returning user, login left
  half-finished" was never handled; the failure axis names exactly that case.
- **Breakdown integrity:** the parent sits live with a `blocked-by` pointing at a sub-issue that's already
  been closed/superseded; a schema block in the parent that never gained a column a later sub-issue added;
  and a dependency diagram labelled "unchanged" that omits a real new deploy-order blocker — one that, under
  this workspace's merge-is-deploy model, would break prod if the two shipped in the wrong order.

The first two are *Owner decision* findings (they change what gets built); the integrity ones are *Reconcile
now* — exactly the split this skill produces.
