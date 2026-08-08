---
name: cleanup
description: >-
  The single owner of the mechanical git chores after a PR merges: remove its worktree, delete its local
  branch, and `git pull` the main worktree so local `main` is current — plus that same `main` refresh on
  demand. Use whenever a PR has merged and its worktree/branch need tearing down, or the user says
  "cleanup", "clean up the worktree", "refresh main", "update main", "pull main", or invokes /cleanup.
  Callers (`ci-loop`, `wait-for-pr-merge`) point here for these steps. It never touches issue status
  (that's `task-tracker`) and never fixes CI, conflicts, or review comments (that's `ci-loop`).
user-invocable: true
---

# Cleanup

When a PR merges, cleanup is two dead-simple steps:

1. **Remove the merged worktree and its branch.**
2. **`git pull` the main worktree** so local `main` is current for the next piece of work.

That's the whole skill. It's this simple because of one invariant: **every session starts from the monorepo
root — the main worktree.** So cleanup runs from there, never from inside the worktree it's deleting, and the
worktree path is the deterministic one below. No `git -C`, no path probing, no lookups, no script.

We work in parallel by default, so `origin/main` moves constantly and local `main` falls behind — expected,
not a problem to design around. `git pull` is the entire fix.

## What it does NOT do

- **No tracker writes.** Issue status is `task-tracker`'s job.
- **No CI / conflict / comment fixing.** Getting a PR *to* merged is `ci-loop` ("do the loop"). Cleanup runs
  only *after* a merge.
- **No edits or branch work in the main worktree.** The only thing it ever does there is `git pull`.

## Only tear down a merged PR

Confirm the PR is **merged** before removing anything — the worktree and branch are the local home of that
work. You don't need to fear losing it: every branch is pushed, so origin has it; `git worktree remove`
refuses a dirty worktree, and `ExitWorktree` refuses one with uncommitted or unmerged commits — the tools
guard you. If the PR is closed-not-merged, leave it (it may still be wanted); if it's still open, that's
`ci-loop`'s job, not this.

## Remove the worktree + branch

The worktree lives at `.claude/worktrees/<slug>/` on branch `worktree-<slug>` (per `parallel-workflow`).
Which of two ways depends only on where you are:

**Inside the worktree right now** — this session created it with `EnterWorktree`. Use the native tool; it
removes the worktree *and* its branch and returns you to the root in one step:

```text
ExitWorktree(action: "remove")
```

If it lists uncommitted or unmerged commits, that's the merged-check doing its job. Only re-invoke with
`discard_changes: true` once you've confirmed the flagged commit is exactly the squash-merged work — a
squash-merge leaves the branch's pre-squash twin looking unmerged, but anything *beyond* that is real work
not on the PR, so stop and inspect instead.

**At the monorepo root** — a fresh, background, or separate session (e.g. `wait-for-pr-merge` polling).
`ExitWorktree` only acts on worktrees *this* session created, so use plain git. You're at the root, so the
path is just its deterministic location and you're not standing in it:

```bash
git worktree remove .claude/worktrees/<slug>   # add --force only if it refuses (dirty worktree)
git branch -D worktree-<slug>                  # -D because a squash-merge leaves the branch "unmerged"
```

## Refresh local `main`

```bash
git pull --ff-only origin main
```

Runs in the main worktree, where every session already sits. `--ff-only` so a surprise divergence fails
loudly instead of quietly making a merge commit on `main`; if it fails, stop — don't report success (and,
for a caller that relaunches a poll, don't relaunch).

Run it as the tail of every teardown (the branch just merged moved `main`), before starting new work, or
standalone whenever the user says "refresh main" / "update main" / "pull main" — a one-command action,
never a question.
