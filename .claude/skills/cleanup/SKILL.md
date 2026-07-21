---
name: cleanup
description: >-
  The single owner of the mechanical git cleanup after a PR merges — remove its throwaway worktree,
  delete its local branch, and fast-forward local `main` — plus the standalone "keep local `main`
  fresh" refresh. Use whenever a PR has merged and its worktree/branch need tearing down, or the user
  says "cleanup", "clean up the worktree", "refresh main", "update main", "pull main", or invokes
  /cleanup. Other skills (`ci-loop`, `wait-for-pr-merge`) point here for these steps and carry none of
  the commands. It never touches issue status (that's the tracker's — see `task-tracker`) and never
  fixes CI, conflicts, or review comments (that's the loop — see `ci-loop`).
user-invocable: true
---

# Cleanup

When a PR merges, three git chores follow: **remove its worktree**, **delete its local branch**, and
**fast-forward local `main`** so the next piece of work branches off the latest code. This skill owns
those commands so every caller just says "run cleanup" — the exact commands and guardrails live in one
place, never copy-pasted. It also owns the standalone **refresh local `main`** action on its own.

Same "centralise a duplicated mechanic into one owner, consumers reference it" move `task-tracker` made
for the tracker coupling — here on the git-cleanup axis.

## What it does NOT do

- **No tracker writes.** Issue status is entirely the tracker's concern — see `task-tracker`. This skill
  never touches it.
- **No CI / conflict / comment fixing.** Getting a PR *to* merged — CI, merge conflicts, review threads —
  is the loop ("do the loop"; see `ci-loop`). This skill runs only *after* a merge (teardown) or on its
  own (refresh).
- **Complements the `blockMainWorktreeWrites` hook**, never fights it. That hook blocks *edits* to a main
  worktree but explicitly permits advancing it with `git pull --ff-only origin main` — which is exactly
  the refresh below. Cleanup never writes files into a main worktree; it only advances the `main` ref.

## The one repo

Everything — frontend apps, shared packages, backend, Hasura — lives in `ShinaBR2/sworld`, so every branch
and worktree belongs to that single clone. Cleanup always runs via `git -C "$repo_path"`, never relying on
the current directory, which may still be the worktree being torn down. Set `repo_path` once to the clone's
absolute path and confirm it really is a clone before any `git -C`:

```bash
repo_path="<path-to-sworld-clone>"   # absolute path to the sworld clone — substitute the real one
git -C "$repo_path" rev-parse --git-dir >/dev/null 2>&1 || { echo "cleanup: $repo_path is not a git clone — stop"; exit 1; }
```

## A. Tear down a merged branch

Input: the **PR number** `<N>`. Teardown keys off the PR — that's what makes the `MERGED` gate below
unambiguous — and derives the branch from it; a caller with the branch already resolved
(`wait-for-pr-merge`) still passes the number so the gate can run. **The `MERGED` gate is mandatory on every
path.** The two automated callers (`wait-for-pr-merge`, `ci-loop`) invoke teardown only after they've
observed the merge, so they satisfy it; a direct `/cleanup` invocation must confirm it here.

Read the PR's state:

```bash
state=$(gh pr view <N> --repo ShinaBR2/sworld --json state -q .state)
```

**Only ever tear down a `MERGED` PR.** If `CLOSED`, do nothing — the branch and worktree may still be
wanted. If `OPEN`, it isn't ready; that's `ci-loop`'s job, not this skill's. Enforce it, then run the
teardown — **abort on the first failure** and report the partial state, never fall through or claim
completion:

```bash
[ "$state" = "MERGED" ] || { echo "PR <N>: state is '$state', not MERGED — cleanup only tears down merged PRs; stop"; exit 1; }

branch=$(gh pr view <N> --repo ShinaBR2/sworld --json headRefName -q .headRefName)
[ -n "$branch" ] || { echo "PR <N>: cannot resolve branch — aborting cleanup"; exit 1; }

# Exact worktree path for this branch (porcelain, exact ref match — never substring; handles paths with spaces).
wt=$(git -C "$repo_path" worktree list --porcelain | awk -v b="refs/heads/$branch" '
  /^worktree /{p=substr($0,10)} $0=="branch "b{print p}')

# Only ever remove a MERGED worktree; skip cleanly if there is none. Abort if removal fails.
[ -n "$wt" ] && { git -C "$repo_path" worktree remove "$wt" || { echo "PR <N>: worktree remove failed — aborting"; exit 1; }; }

# squash-merge leaves the branch not-fully-merged, so -D. Abort if deletion fails.
git -C "$repo_path" branch -D "$branch" || { echo "PR <N>: branch delete failed — aborting"; exit 1; }
```

Guardrails baked in above, all load-bearing: exact `refs/heads/$branch` match (a substring match could
remove the wrong worktree), never act on an empty `$branch` (empty matches every worktree), only remove a
worktree that exists, `-D` because squash-merge leaves the branch technically unmerged.

Then **refresh local `main`** (section B) — a torn-down branch means `main` just moved.

## B. Refresh local `main`

Fetching only advances the `origin/main` **ref**; the local `main` branch pointer stays stale, so any lazy
reference to local `main` (a code read, a diff, a new worktree base) is wrong. In this parallel-worktree
workflow local `main` is *chronically* behind, so keep the pointer current — refresh before you read off
`main` or branch from it.

Fast-forward only, never rebase, never a merge commit on `main`. Which command depends on what the repo's
**main worktree** (the first entry in `git worktree list`) is checked out on — probe it, then pick:

```bash
# Emits "main" if the main worktree sits on `main`, else the feature-branch name (empty/detached => not on main).
onmain=$(git -C "$repo_path" worktree list --porcelain | awk '
  /^branch refs\/heads\//{sub(/^branch refs\/heads\//,""); print; found=1} /^$/{if(!found)print"detached"; exit}')

case "$onmain" in
  # Main worktree sits on `main`: advance the branch pointer AND its checkout. --ff-only so a diverged
  # main errors loudly instead of silently creating a merge commit; name `origin main` so it can't
  # depend on — or advance — the wrong upstream.
  main) (cd "$repo_path" && git pull --ff-only origin main) || { echo "main refresh failed — stop"; exit 1; } ;;
  # Main worktree sits on a feature branch (the common case here): advance the local `main` ref without a
  # checkout and without touching any working tree. It refuses loudly if `main` IS checked out somewhere —
  # that refusal is the tell to use `git pull --ff-only` in that worktree instead.
  *)    git -C "$repo_path" fetch origin main:main || { echo "main refresh failed — stop"; exit 1; } ;;
esac
```

A failed refresh must **stop** success reporting (and, for a caller that relaunches a poll, prevent the
relaunch).

Run the refresh:

1. **As the tail of every teardown** (section A) — the branch just torn down moved `main`.
2. **Before starting new work / before any code read on `main`**.
3. **Standalone, on demand** — whenever the user says "refresh main", "update main", "pull main", or any
   equivalent. It's a one-command action, never a question: just run it and report.
