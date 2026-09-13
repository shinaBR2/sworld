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

* analyze: audits an already-scoped ticket and its sub-issue breakdown before any code, catching a missing requirement, crept scope, or a dependency gone stale while it is still cheap to fix.

* Rules
  * Run analyze on any non-trivial or reopened issue you pick up, before the worktree — it is `parallel-workflow`'s step-one gate.
  * It audits the plan, it does not re-plan: reuse `grill-me` for the requirement pass and `.claude/references/good-diff.md` for the scope pass, and add the one check only analyze can — whether a breakdown still holds together against a codebase that has moved on since the plan was written.
  * Pull the issue, its relations, and any sub-issues via `task-tracker` so you audit what's there, not memory.
  * Skip the breakdown-integrity pass on a single issue with no sub-issues.
  * A `blocked-by` pointing at an issue since closed, merged, or superseded is a stale blocker to catch, because a dead blocker makes startable work look blocked while a blocker dropped to prose only makes blocked work look startable.
  * Parent drift is a finding: the parent's Goal no longer describing what the children deliver, or a real new blocker between children not captured as a relation — the parent is the source of truth, so its drift propagates to every child.
  * An orphan (a sub-issue the parent's Goal doesn't cover) or a gap (part of the Goal no sub-issue delivers) is a finding.
  * A "must ship before X" deploy-order living only in prose must become a `blocks` relation under merge-is-deploy — see `dependency-analysis` for whether the edge is real and `writing-task-specs` for how it's recorded.
  * Re-run `dependency-analysis`'s test over each `blocked-by`; it survives only as a genuine dependency, not ordering invented to make the plan feel structured.
  * A sub-issue that has grown a second purpose, or now spans two apps or an app plus a shared package, is a split — flag it before it's built.
  * Tag each finding by what it needs: "Reconcile now" (bookkeeping the analysis can just fix, like deleting a stale relation or realigning the parent's drifted Goal — do it and say what changed) or "Owner decision" (anything that changes child scope or adds a requirement — surface and offer, and never silently rewrite the breakdown).
  * End with a one-line verdict: safe to build as-is, safe after the reconciling edits, or blocked on the owner resolving open findings.

* Steps
  1. Re-derive requirements: run `grill-me`'s completeness sweep against the written spec, confirming each axis is either handled or explicitly ruled out of scope.
  2. Check breakdown integrity: confirm the parent still matches its sub-issues and their relations, against the stale-blocker, parent-drift, orphan/gap, deploy-order, and waves-earned rules above.
  3. Check one-purpose / scope: apply the does-one-thing and one-boundary bars to the issue and to each sub-issue if broken down.
     * bars: `.claude/references/good-diff.md`, Tests 1 and 4
  4. Report the findings that block or change the build first, tagged Reconcile now or Owner decision, ending with the one-line verdict.
     * worked example: [`references/worked-example.md`](references/worked-example.md)
