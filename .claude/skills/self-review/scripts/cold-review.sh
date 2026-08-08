#!/usr/bin/env bash
# Cold-eyes reviewer — hands this branch's committed diff to a fresh, zero-context
# Claude session, so the code is judged by a stranger instead of its author.
# Run from inside the worktree. The loop in SKILL.md owns how to read the result.
set -euo pipefail

# Refresh origin/main so the diff is measured against the current base. A failure
# here (offline, wrong remote) must not set -e-abort before the friendly guards
# below — but warn, because the review then runs against a possibly-stale base.
if ! git fetch --quiet origin main; then
  echo "cold-review: couldn't fetch origin/main — reviewing against the local ref, which may be stale." >&2
fi

# A clean `[]` is worthless over an empty range. On a committed-and-pushed branch an
# unset review target reviews nothing and "passes" silently — so the target is
# explicit, and the range is checked before the reviewer is ever launched. The ref
# is resolved first: a git error here (unresolvable origin/main, wrong remote) must
# fail loudly, not be mistaken for "has changes" and reviewed against a broken range.
if ! git rev-parse --verify --quiet origin/main >/dev/null; then
  echo "cold-review: can't resolve origin/main — check the remote and re-fetch." >&2
  exit 2
fi
if [ -z "$(git diff --name-only origin/main...HEAD)" ]; then
  echo "cold-review: origin/main...HEAD is empty — commit your work or check the branch." >&2
  exit 2
fi
if ! command -v claude >/dev/null; then
  echo "cold-review: 'claude' not on PATH — install the CLI to run the reviewer." >&2
  exit 2
fi

# The reviewer only sees committed code (origin/main...HEAD). Uncommitted or untracked
# changes are invisible to it, so a fix left unstaged would pass as clean — a false
# pass, the same failure the other guards exit on. --untracked-files=all so a brand-new
# unstaged file counts too. Commit first; don't review a tree that doesn't match what
# the reviewer sees.
if [ -n "$(git status --porcelain --untracked-files=all)" ]; then
  echo "cold-review: uncommitted or untracked changes — commit them first so the review matches your work." >&2
  exit 2
fi

# No --fix — the reviewer reports rather than applies; this session does the fixing.
# --disallowed-tools removes the write tools from the reviewer's environment entirely,
# so a review of our own diff can't modify this worktree even though permission prompts
# are skipped. Bash stays (the review needs git), so this is defence-in-depth over our
# own code, not a full sandbox. Skip-permissions only stops the headless session
# stalling on a prompt it cannot answer. A timeout bounds a hung run (hitting it is a
# failed run for the caller to retry, not an empty pass), but only if one is installed —
# GNU `timeout` isn't on stock macOS. Without it the review still runs, just unbounded.
TIMEOUT=""
if command -v timeout >/dev/null; then TIMEOUT="timeout 1800"
elif command -v gtimeout >/dev/null; then TIMEOUT="gtimeout 1800"; fi
$TIMEOUT claude -p "/code-review high origin/main...HEAD" \
  --dangerously-skip-permissions \
  --disallowed-tools Write Edit MultiEdit NotebookEdit
