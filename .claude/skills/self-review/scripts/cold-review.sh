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
# explicit, and the range is checked before the reviewer is ever launched (guards
# against a wrong branch, an uncommitted diff, or a stale ref).
if git diff --quiet origin/main...HEAD; then
  echo "cold-review: origin/main...HEAD is empty — commit your work or check the branch." >&2
  exit 2
fi

# Read-only: no --fix (this session does the fixing). Skip-permissions only stops
# the headless session stalling on a prompt it cannot answer. The timeout bounds a
# hung run; hitting it is a failed run for the caller to retry, not an empty pass.
timeout 540 claude -p "/code-review high origin/main...HEAD" --dangerously-skip-permissions
