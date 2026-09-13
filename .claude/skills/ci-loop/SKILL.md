---
name: ci-loop
description: >-
  The post-PR loop — drives one open PR to "settled" (merge status → conflicts → CodeRabbit done →
  unresolved comments → CI green), fixing/waiting/restarting until settled, then reporting (never
  auto-merging). Use whenever the user says "do the loop", "run the loop", "the CI loop", "check the
  PR", or invokes /ci-loop. On merge it runs `cleanup`. It is NOT the pre-PR self-review
  (`parallel-workflow` owns that) and never touches issue status (that's `task-tracker`).
user-invocable: true
---

* ci-loop: drives one open PR to settled — no conflicts, CodeRabbit done, no unresolved comments, CI green — then reports to the user without merging.

* Rules
  * never merge the PR yourself — the user merges; only if they've said "merge when clean", merge once settled and not before.
  * a PR is settled when it is merged, or closed, or open with no conflicts, CodeRabbit finished, no unresolved comments, and CI green.
  * the steps are sequential, so any fix → push → wait 6 minutes → restart from Step 1; never batch steps or skip ahead, since every push resets CI and the bots and a later step read before an earlier one settles is meaningless.
  * a `pending` gate is not a pass — wait it out and restart, never hand an unsettled PR back.
  * never manually resolve a bot's thread — fix the code and let it re-resolve.
  * a `skipped` check is green, not pending (path-filtered jobs skip the expensive half) — never wait on it.
  * an E2E job that failed at an infra step (deps, runner, cache) on a PR that doesn't touch tests is not a real failure — treat it as green.
  * waiting means a background `sleep`, never a foreground wait or the Monitor tool, which a hook denies.
  * auth, reading CodeRabbit's status (Step 3), and reading the review threads (Step 4) all live in `.claude/references/github-cli.md`.
  * stop when the PR is settled, then report to the user without auto-merging.

* Steps
  1. Merge status: merged → run `cleanup` with the PR number, done; closed → tell the user, done; open → Step 2.
  2. Conflicts: conflicting → merge latest `main`, resolve, push, wait, restart; clean → Step 3.
  3. CodeRabbit finished? not yet → wait, restart; done → Step 4.
     * which status values count as done: `.claude/references/github-cli.md`
  4. Unresolved comments: any unresolved thread → read it, fix the code, push, wait, restart; none → Step 5.
  5. CI green: any failure → fix, push, wait, restart; any check pending → wait, restart; all green → settled, report to the user.
