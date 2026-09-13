---
name: cleanup
description: >-
  Owns the mechanical git chores after a PR merges: from the main worktree, remove the merged worktree +
  its local branch, then pull latest `main`. Also does the standalone `main` pull on demand. Triggers: a
  merged PR needing teardown — including the user just saying it merged ("PR is merged", "PR 607 is
  merged", "it's merged") — or "cleanup", "clean up the worktree", "refresh main", "update
  main", "pull main", /cleanup. Callers (`ci-loop`, `wait-for-pr-merge`) point here. Not issue status
  (that's `task-tracker`), not CI/conflict/review fixing (that's `ci-loop`).
user-invocable: true
---

* cleanup: does the mechanical git chores after a PR merges — removes the merged worktree and its local branch, then pulls latest `main`.

* Rules
  * branch and worktree names follow `task-tracker`.
  * this repo squash-merges, so a merged branch still looks unmerged to git — expect the force path on the branch delete, and expect `ExitWorktree` to refuse until you pass `discard_changes: true`.
  * pass `discard_changes: true` only once you've confirmed the flagged commit is exactly that merged work and nothing beyond it.
  * `ExitWorktree`'s "you're back at root" result is not completion — it never pulls, so the `git pull` on `main` is a separate command you must still run right after.
  * the `main` pull also runs on its own whenever `main` needs to be current — before new work, or on "refresh main".
  * stop when step 3 has actually advanced local `main`; a current `main` is the finish line, not the removed worktree.

* Steps
  1. Remove the merged worktree, from the main worktree.
     * inside the worktree: `ExitWorktree(action: "remove")` does this and step 2 and returns you to root, but never step 3.
  2. Remove its local branch.
  3. Pull latest `main`.
