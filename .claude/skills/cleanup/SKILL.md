---
name: cleanup
description: >-
  Owns the mechanical git chores after a PR merges: from the main worktree, remove the merged worktree +
  its branch, then `git pull`. Also does the standalone `git pull` refresh on demand. Triggers: a merged PR
  needing teardown, or "cleanup", "clean up the worktree", "refresh main", "update main", "pull main",
  /cleanup. Callers (`ci-loop`, `wait-for-pr-merge`) point here. Not issue status (that's `task-tracker`),
  not CI/conflict/review fixing (that's `ci-loop`).
user-invocable: true
---

# Cleanup

Once a PR has merged, from the main worktree (where every session starts):

```bash
git worktree remove .claude/worktrees/<slug>   # --force only if it refuses (dirty tree)
git branch -D worktree-<slug>                  # -D: a squash-merge leaves the branch "unmerged"
git pull --ff-only origin main
```

`<slug>` is the issue slug; the branch is `worktree-<slug>` (see `parallel-workflow`).

If you're **inside** the worktree, `ExitWorktree(action: "remove")` removes it and drops you back at the root
in one step — then just `git pull`. It refuses on uncommitted or unmerged commits; only pass
`discard_changes: true` once you've confirmed the flagged commit is exactly the squash-merged work.

The `git pull` also runs on its own whenever `main` needs to be current — before new work, or on "refresh
main". `--ff-only` so a surprise divergence fails loudly instead of making a merge commit on `main`.
