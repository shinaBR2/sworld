---
name: micro-prs
description: How to break work into the smallest possible, independently reviewable and revertible PRs, and how to size and sequence them. Use when planning or scoping a feature, deciding how to split a change, staring at a diff that's growing large, or asking "how should I break this down?" Fires whenever a change is heading past quick-review size, and can be invoked on demand to plan a decomposition.
user-invocable: true
---

# Micro-PRs

Ship features like LEGO blocks: break every feature into the smallest increments that each stand on their own. A PR should be one logical unit a reviewer understands in a few minutes and that can be safely reverted without breaking anything else.

This isn't process hygiene for its own sake — it's velocity. Small PRs review fast, merge fast, and when something breaks you revert one block instead of unpicking a monolith. Big PRs stall in review and kill momentum.

## Size guide

Lines changed is a rough proxy, not a hard rule — use judgement (a 200-line pure rename is fine; a 60-line tangle of logic may not be).

- **0–50 lines** — perfect, ship immediately.
- **51–150 lines** — good for a cohesive change.
- **151–300 lines** — needs justification: why can't this be smaller?
- **300+ lines** — decompose further.

See `parallel-workflow` for the file-count view ("the 3-files limit is soft") and the good-PR criteria — same idea from the other axis.

## How to decompose

Break a large change by layer, each layer its own PR:

1. Add new types/interfaces (no implementation).
2. Implement core logic (behind a flag if it's user-visible).
3. Update API/endpoints — one at a time.
4. Migrate frontend components — one by one.
5. Remove the old code (separate PR).

Common shapes:

- **Database change:** table schema → migration → GraphQL schema update.
- **New API:** endpoint stub (returns empty) → core logic → validation & error handling.
- **Frontend feature:** component skeleton → basic functionality → styling/interactions → wire to backend.

## Ship incomplete work safely with flags

Feature flags let you merge half-built work without exposing it:

```tsx
if (featureFlags.bulkImportCosts) {
  return <BulkImportPanel />;
}
return <LegacyImportPanel />;
```

This is what makes step 2 above possible — land the logic before the UI is ready.

## What a good micro-PR looks like

- Reviewable in a few minutes.
- Safely revertible on its own.
- Delivers value, or a foundation for the next step.
- Single responsibility — does one thing.
- Independently deployable (behind a flag if needed).

Once a slice is scoped, see `pr-descriptions` for writing the title and body.

The goal: ship working software continuously, not perfect software eventually.
