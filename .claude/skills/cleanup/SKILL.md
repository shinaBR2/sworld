---
name: cleanup
description: >-
  Owns the mechanical git chores after a PR merges: from the main worktree, remove the merged worktree +
  its local branch, then pull latest `main`. Also does the standalone `main` pull on demand. Triggers: a
  merged PR needing teardown, or "cleanup", "clean up the worktree", "refresh main", "update main", "pull
  main", /cleanup. Callers (`ci-loop`, `wait-for-pr-merge`) point here. Not issue status (that's
  `task-tracker`), not CI/conflict/review fixing (that's `ci-loop`).
user-invocable: true
---

# Cleanup

Once a PR has merged, from the main worktree:

1. **Remove its worktree.**
2. **Remove its local branch.**
3. **Pull latest `main`.**

Paths and branch names follow `parallel-workflow`.

Two things that aren't obvious from the intent:

- **If you're inside the worktree, use `ExitWorktree(action: "remove")`** — it does steps 1 and 2 and returns
  you to the root in one move (you can't remove the worktree you're standing in).
- **This repo squash-merges,** so a merged branch still looks *unmerged* to git. Expect the force path on the
  branch delete, and expect `ExitWorktree` to refuse until you pass `discard_changes: true` — but only once
  you've confirmed the flagged commit is exactly that merged work and nothing beyond it.

The `main` pull also runs on its own whenever `main` needs to be current — before new work, or on "refresh
main".
