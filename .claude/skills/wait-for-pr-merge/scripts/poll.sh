#!/bin/sh
# Poll one or more PRs until any tracked PR is terminal (MERGED/CLOSED) or stays unreachable,
# then exit so the caller can handle the events (wait-for-pr-merge skill, step 1). Run it with
# the background flag; on exit, read the emitted lines and re-launch for any still-pending PRs.
#
# Usage: poll.sh <PR_NUMBER> [<PR_NUMBER> ...]
#
# Emits one line per terminal/unreachable PR, parsed by the caller:
#   FINAL:<n>:<state>     PR reached MERGED or CLOSED
#   ERROR:<n>:gh-unreachable   PR could not be polled after retries
#
# Portable across sh / bash / zsh — the background shell is not guaranteed to be any one of
# them: no bash-only constructs (no `declare -A`, no arrays); PR numbers live in positional
# parameters and are iterated with `for n in "$@"` (never `for n in $LIST` — zsh won't
# word-split that); every expansion before a ':' is braced (`${n}`) so zsh doesn't read
# `$n:...` as a history modifier and swallow the number. NEVER use `gh pr view --watch`.

[ "$#" -ge 1 ] || { echo "usage: poll.sh <PR_NUMBER> [<PR_NUMBER> ...]"; exit 2; }

while true; do
  hit=0
  for n in "$@"; do
    s=""; i=1
    # A failed gh call (auth, network, bad PR number) must NOT be mistaken for OPEN — otherwise
    # the loop spins silently forever. Treat only a successful, non-empty state as truth; retry
    # a few times before declaring the PR unreachable.
    while [ "$i" -le 3 ]; do
      s=$(gh pr view "$n" --repo ShinaBR2/sworld --json state -q .state 2>/dev/null)
      [ -n "$s" ] && break
      i=$((i + 1)); sleep 5
    done
    if [ -z "$s" ]; then
      echo "ERROR:${n}:gh-unreachable"; hit=1
    elif [ "$s" = "MERGED" ] || [ "$s" = "CLOSED" ]; then
      echo "FINAL:${n}:${s}"; hit=1
    fi
  done
  [ "$hit" = 1 ] && exit 0
  sleep 120
done
