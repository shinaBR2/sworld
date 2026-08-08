#!/bin/sh
# Fast-forward the local `main` branch pointer (cleanup skill, section B).
#
# Usage: refresh-main.sh <REPO_PATH>
#   REPO_PATH  absolute path to the sworld clone
#
# Fetching only advances the origin/main ref; the local `main` pointer stays stale, so any
# lazy reference to local main (a code read, a diff, a new worktree base) is wrong. In this
# parallel-worktree workflow local main is chronically behind — refresh before reading off it
# or branching from it. Fast-forward only: never rebase, never a merge commit on main.
# A failed refresh exits non-zero so the caller can stop success reporting.

repo="${1:?usage: refresh-main.sh <REPO_PATH>}"
git -C "$repo" rev-parse --git-dir >/dev/null 2>&1 || { echo "refresh: $repo is not a git clone — stop"; exit 1; }

# Probe what the repo's MAIN worktree (first `git worktree list` entry) is checked out on:
# emits "main" if it sits on main, else the feature-branch name (empty/detached => not on main).
onmain=$(git -C "$repo" worktree list --porcelain | awk '
  /^branch refs\/heads\//{sub(/^branch refs\/heads\//,""); print; found=1} /^$/{if(!found)print"detached"; exit}')

case "$onmain" in
  # Main worktree sits on `main`: advance the branch pointer AND its checkout. --ff-only so a
  # diverged main errors loudly instead of silently creating a merge commit; name `origin main`
  # so it can't depend on — or advance — the wrong upstream.
  main) (cd "$repo" && git pull --ff-only origin main) || { echo "main refresh failed — stop"; exit 1; } ;;
  # Main worktree sits on a feature branch (the common case here): advance the local `main` ref
  # without a checkout and without touching any working tree. It refuses loudly if `main` IS
  # checked out somewhere — that refusal is the tell to use `git pull --ff-only` there instead.
  *)    git -C "$repo" fetch origin main:main || { echo "main refresh failed — stop"; exit 1; } ;;
esac

echo "local main refreshed."
