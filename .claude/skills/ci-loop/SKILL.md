---
name: ci-loop
description: >-
  The post-PR loop — drives one open PR to "settled" (merge status → conflicts → CodeRabbit done →
  unresolved comments → CI green), fixing/waiting/restarting until settled, then reporting (never
  auto-merging). Use whenever the user says "do the loop", "run the loop", "the CI loop", "check the
  PR", or invokes /ci-loop. On merge it runs `cleanup`. It is NOT the pre-PR self-review (that's
  `parallel-workflow`'s gate) and never touches issue status (that's `task-tracker`).
user-invocable: true
---

# CI loop ("do the loop")

**Goal:** drive one open PR to **settled**, then report to the user. Never merge yourself — the
user merges. (If they've said "merge when clean", merge once settled, not before.)

**A PR is settled** when it is one of:

- **Merged**, or
- **Closed**, or
- **Open** AND: no conflicts, CodeRabbit finished, no unresolved comments, CI green.

**Loop rule:** the steps are sequential. Any fix → push → wait 6 minutes → **restart from Step 1**.
Never batch steps, never skip ahead — every push resets CI and the bots, so a later step read
before an earlier one settles is meaningless. A `pending` gate is not a pass: wait it out and
restart, never hand an unsettled PR back.

## Steps

1. **Merge status.** Merged → run `cleanup` (pass the PR number); done. Closed → tell the user; done. Open → Step 2.
2. **Conflicts.** Conflicting → merge latest `main`, resolve, push, wait, restart. Clean → Step 3.
3. **CodeRabbit finished?** Only when it reports `"Review completed"` — read it per `references/github-cli.md`. Not yet → wait, restart. Done → Step 4.
4. **Unresolved comments.** Any unresolved thread → read it, fix the code, push, wait, restart. None → Step 5. (Never manually resolve a bot's thread — fix the code and let it re-resolve.)
5. **CI green.** Any failure → fix, push, wait, restart. Any check pending → wait, restart. All green → **settled: report to the user.**

## Notes

- Auth, and how to read CodeRabbit's status (Step 3) and the review threads (Step 4): `references/github-cli.md`.
- A `skipped` check is green, not pending (path-filtered jobs skip the expensive half) — never wait on it. An E2E job that failed at an infra step (deps, runner, cache) on a PR that doesn't touch tests is not a real failure — treat it as green.
- Waiting means a **background** `sleep`, never a foreground wait or the Monitor tool — a hook denies it.
