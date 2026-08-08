#!/bin/sh
# Tear down a MERGED PR's worktree + local branch — the cross-session / manual path
# (cleanup skill, section A2). The same-session path (A1) uses the ExitWorktree tool
# instead and is not scriptable, so it is not here.
#
# Usage: teardown.sh <PR_NUMBER> <REPO_PATH>
#   PR_NUMBER  the merged PR to tear down
#   REPO_PATH  absolute path to the sworld clone (never relies on cwd, which may still
#              be the worktree being removed)
#
# Runs via git -C "$REPO_PATH" throughout. Aborts on the first failure and reports the
# partial state — never falls through or claims completion. Local `main` is deliberately
# NOT refreshed afterwards — we never reference local `main`; work always bases off
# `origin/main` (see the parallel-workflow skill).

pr="${1:?usage: teardown.sh <PR_NUMBER> <REPO_PATH>}"
repo="${2:?usage: teardown.sh <PR_NUMBER> <REPO_PATH>}"

# Confirm it really is a clone before any git -C against it.
git -C "$repo" rev-parse --git-dir >/dev/null 2>&1 || { echo "teardown: $repo is not a git clone — stop"; exit 1; }

# MERGED gate (mandatory). Only ever tear down a MERGED PR: CLOSED means the branch/worktree
# may still be wanted (do nothing); OPEN means it isn't ready (that's ci-loop's job, not this).
# Read state explicitly — a failed gh call must never be mistaken for MERGED.
state=$(gh pr view "$pr" --repo ShinaBR2/sworld --json state -q .state)
[ "$state" = "MERGED" ] || { echo "PR $pr: state is '$state', not MERGED — cleanup only tears down merged PRs; stop"; exit 1; }

branch=$(gh pr view "$pr" --repo ShinaBR2/sworld --json headRefName -q .headRefName)
# Never act on an empty branch — an empty ref would match every worktree below.
[ -n "$branch" ] || { echo "PR $pr: cannot resolve branch — aborting cleanup"; exit 1; }

# Exact worktree path for this branch (porcelain, exact ref match — never a substring, which
# could remove the wrong worktree; handles paths with spaces).
wt=$(git -C "$repo" worktree list --porcelain | awk -v b="refs/heads/$branch" '
  /^worktree /{p=substr($0,10)} $0=="branch "b{print p}')

# Only remove a worktree that actually exists; abort if removal fails.
if [ -n "$wt" ]; then
  git -C "$repo" worktree remove "$wt" || { echo "PR $pr: worktree remove failed — aborting"; exit 1; }
fi

# -D (not -d) because a squash-merge leaves the branch technically unmerged. Abort if deletion fails.
git -C "$repo" branch -D "$branch" || { echo "PR $pr: branch delete failed — aborting"; exit 1; }

echo "PR $pr: torn down (worktree + branch '$branch')."
