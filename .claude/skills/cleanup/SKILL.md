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

# Cleanup

Once a PR has merged, from the main worktree:

1. **Remove its worktree.**
2. **Remove its local branch.**
3. **Pull latest `main`.**

Cleanup is not done until step 3 has actually advanced local `main` — removing the worktree is not the
finish line, a current `main` is.

Branch and worktree names follow `task-tracker`.

Two things that aren't obvious from the intent:

- **If you're inside the worktree, use `ExitWorktree(action: "remove")`** — it does steps 1 and 2 (you can't
  remove the worktree you're standing in) and returns you to the root. But it does **not** do step 3: it never
  pulls. Its tidy "you're back at root" result looks like completion but isn't — the `git pull` on `main` is a
  separate command you MUST still run right after, every time. Do not treat the `ExitWorktree` return as the
  end of cleanup.
- **This repo squash-merges,** so a merged branch still looks *unmerged* to git. Expect the force path on the
  branch delete, and expect `ExitWorktree` to refuse until you pass `discard_changes: true` — but only once
  you've confirmed the flagged commit is exactly that merged work and nothing beyond it.

The `main` pull also runs on its own whenever `main` needs to be current — before new work, or on "refresh
main".
