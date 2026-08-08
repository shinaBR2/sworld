#!/usr/bin/env bash
# Cold-eyes reviewer — hands this branch's committed diff to a fresh, zero-context
# Claude session, so the code is judged by a stranger instead of its author.
# Run from inside the worktree. Prints the reviewer's JSON findings to stdout;
# `[]` means clean. A non-zero exit is a FAILED run, never a clean pass — re-run it.
set -euo pipefail

# The diff is measured against origin/main, so it must be current.
git fetch --quiet origin main

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

# Read-only: no --fix (this session does the fixing). Skip-permissions only stops
# the headless session stalling on a prompt it cannot answer. A timeout bounds a
# hung run (hitting it is a failed run for the caller to retry, not an empty pass),
# but only if one is installed — GNU `timeout` isn't on stock macOS. Without it the
# review still runs, just unbounded.
TIMEOUT=""
if command -v timeout >/dev/null; then TIMEOUT="timeout 1800"
elif command -v gtimeout >/dev/null; then TIMEOUT="gtimeout 1800"; fi
$TIMEOUT claude -p "/code-review high origin/main...HEAD" --dangerously-skip-permissions
