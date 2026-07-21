---
name: micro-prs
description: How to break work into the smallest possible, independently reviewable and revertible PRs, and how to size and sequence them. Use when planning or scoping a feature, deciding how to split a change, staring at a diff that's growing large, or asking "how should I break this down?" Fires whenever a change is heading past quick-review size, and can be invoked on demand to plan a decomposition.
user-invocable: true
---

# Micro-PRs

Ship features like LEGO blocks: break every feature into the smallest increments that each stand on their own. A PR should be one logical unit a reviewer understands in a few minutes and that can be safely reverted without breaking anything else.

This isn't process hygiene for its own sake — it's velocity. Small PRs review fast, merge fast, and when something breaks you revert one block instead of unpicking a monolith. Big PRs stall in review and kill momentum.

## The two governing rules

Apply these mechanically, before anything else — when breaking a ticket into sub-tasks, when opening a PR, and when reviewing one.

### 1. One PR solves exactly ONE problem

Not "mostly one". One. If describing the PR needs an "and", it's two PRs.

### 2. ONE app or ONE shared package — never combine

Everything now lives in one repo, so nothing stops you combining pieces that shouldn't be combined. This rule has to be applied deliberately:

- A single PR touches **at most one** of: one `apps/<app>` directory — including `apps/backend` and `apps/hasura` — or `packages/core`, or `packages/ui`.
- Touching two apps in one PR is wrong. An app plus `packages/core` in one PR is wrong. `packages/core` plus `packages/ui` in one PR is wrong.
- Each layer carries different review and verification concerns — an app PR is checked by running that app; a `packages/core` PR is checked by its unit tests and `pnpm codegen`; a `packages/ui` PR is checked in Storybook. A PR mixing them can't be reviewed properly or reverted cleanly.
- **One repo is not permission to merge layers.** A Hasura migration in `apps/hasura` and the frontend's regenerated types in `packages/core` are still two PRs, in that order (see `parallel-workflow`) — the schema has to be live before the generated types mean anything. Sharing a repo removes the friction, not the dependency.

## Blockers land first, as their own PRs

- **Database/schema.** Anything Hasura migration + metadata (permissions, relationships) is ONE dedicated PR in `apps/hasura`. It lands first; the frontend codegen follow-up is blocked-by it.
- **Codegen never lands bundled with app logic.** When a schema change drove it, it's the follow-up PR blocked by the schema PR above. For a read-only phase with no migration, it's its own tiny PR, blocked by nothing.
- **`packages/core`.** Its own PR, even for a one-line change. Never bundled into an app PR that consumes it.
- **Constants.** Their own independent PR, first, when a later PR needs them.
- **Foundation/scaffolding.** A foundation-only PR containing nothing but the scaffolding, cut from `main` — never `blockedBy` the feature that surfaced the need. Foundation comes first; the feature builds on it.

## Sequencing — break by layer, not by feature

Which pieces genuinely block which is `dependency-analysis`' call — take its graph as given. What this skill owns is the shape of the split: within one app or package, break by **layer, not by feature** — each layer below is an independent top-blocker that can be built in parallel; only wiring waits:

1. Types/interfaces (no implementation) — independent, top blocker.
2. Core logic (behind a flag if it's user-visible) — independent, pure, unit-tested.
3. API/endpoint — a stub returning a placeholder is enough; nothing calls it until wiring, so nothing breaks.
4. GraphQL query + codegen — independent, unless a schema change blocks it (see above).
5. Wiring — **always last.** This assembles the pieces: endpoint → core logic, hook → query → UI.
6. Remove old code — its own PR, after the replacement is live.

Common shapes:

- **Database change:** table schema → migration → GraphQL schema update (all one PR in `apps/hasura`, per "Blockers land first" above) → frontend codegen follow-up (separate PR in `packages/core`).
- **New API:** endpoint stub (returns empty) → core logic → validation & error handling.
- **Frontend feature:** component skeleton → basic functionality → styling/interactions → wire to backend.

## Scope is the limit — size is only a hint

**Decide splits by scope first** (the two governing rules above) — a PR that spans two apps or does two jobs is wrong **even at 10 lines**. Once the scope is right, lines changed is a rough sanity check, not a hard rule — use judgement (a 200-line pure rename is fine; a 60-line tangle of logic may not be):

- **0–50 lines** — perfect, ship immediately.
- **51–150 lines** — good for a cohesive change.
- **151–300 lines** — needs justification: why can't this be smaller?
- **300+ lines** — almost certainly more than one job. Re-check the scope.

See `parallel-workflow` for the file-count view and the good-PR criteria — same idea from the other axis.

## Ship incomplete work safely with flags

Feature flags let you merge half-built work without exposing it:

```tsx
if (featureFlags.bulkImportCosts) {
  return <BulkImportPanel />;
}
return <LegacyImportPanel />;
```

This is what makes the core-logic layer above land safely ahead of the UI — behind a flag, before it's ready.

## What a good micro-PR looks like

- Reviewable in a few minutes.
- Safely revertible on its own.
- Delivers value, or a foundation for the next step.
- Single responsibility — does one thing, in one app or package.
- Independently deployable (behind a flag if needed).

Before opening any PR, ask: **what ONE problem, in ONE app or package, does this solve?** If the answer names two, split it — database/schema and constants land first as blockers, app logic on top.

Once a slice is scoped, see `pr-descriptions` for writing the title and body.

The goal: ship working software continuously, not perfect software eventually.
