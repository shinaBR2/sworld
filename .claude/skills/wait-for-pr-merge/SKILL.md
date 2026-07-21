---
name: wait-for-pr-merge
description: Poll one or more PRs until each merges (or closes), running the `cleanup` skill on each PR the moment it merges (issue status is the tracker's — see `task-tracker`). Use whenever the user says "wait for PR X to merge", "wait for PRs X and Y to merge", "watch these PRs until they merge", "let me know when PR X lands", "poll PR X", or invokes /wait-for-pr-merge. This is post-READY watching only — it does NOT fix CI, conflicts, or review comments (that is "the loop"; see `ci-loop`).
user-invocable: true
---

# Wait for PR merge

The human merges a READY PR by hand on GitHub. This skill watches for that merge and does the cleanup, so the user can say "wait for PR X to merge" and walk away instead of manually re-checking GitHub. It accepts **one or more** PRs and handles each independently — each PR is cleaned up the moment *it* merges, without waiting for the others.

**Scope boundary:** this skill assumes each PR is already READY and the user is merging manually. It does **NOT** touch CI, conflicts, or review comments — that is the loop ("do the loop"; see [`ci-loop`](../ci-loop/SKILL.md)). If a PR simply isn't merged yet, keep waiting; never start fixing things under this skill.

## 1. Poll the PRs

Everything lives in the one repo, `ShinaBR2/sworld` — a PR number identifies a PR outright, with nothing to resolve. Still pass `--repo ShinaBR2/sworld` explicitly on every `gh pr view`: the poll runs from a background shell whose working directory isn't guaranteed to be a checkout, and a bare `gh pr view` resolves against the current directory's remote. Per-PR cleanup is delegated to the `cleanup` skill — this skill just passes it the PR number.

A failed `gh` call (auth, network, bad PR number) must NOT be mistaken for `OPEN` — otherwise the loop spins silently forever. Treat only a successful, non-empty state as truth; retry a few times before declaring a PR unreachable. **NEVER** use `gh pr view --watch` / `gh pr checks --watch`.

Keep the poll script **portable across sh / bash / zsh** — the background shell is not guaranteed to be any one of them: NO bash-only constructs (`declare -A`, associative arrays); put the PR numbers in **positional parameters** (`set -- …`) and loop with `for n in "$@"`. Do NOT write `for n in $LIST` — zsh does not word-split an unquoted variable, so it would iterate once over the whole string and poll a bogus number.

```sh
# Replace the numbers below with the PRs being watched (445 446 are only an example).
# Exits as soon as any tracked PR is terminal (MERGED/CLOSED) or stays unreachable after 3 quick retries.
set -- 445 446
while true; do
  hit=0
  for n in "$@"; do
    s=""; i=1
    while [ "$i" -le 3 ]; do
      s=$(gh pr view "$n" --repo ShinaBR2/sworld --json state -q .state 2>/dev/null)
      [ -n "$s" ] && break
      i=$((i + 1)); sleep 5
    done
    if [ -z "$s" ]; then
      echo "ERROR:$n:gh-unreachable"; hit=1
    elif [ "$s" = "MERGED" ] || [ "$s" = "CLOSED" ]; then
      echo "FINAL:$n:$s"; hit=1
    fi
  done
  [ "$hit" = 1 ] && exit 0
  sleep 120
done
```

Run it with the background flag. When it exits, read the `FINAL:<n>:<state>` and `ERROR:<n>:...` lines and handle each (below). Then **re-launch the poll for the PRs still pending** and repeat, until none are left.

## 2. Handle each event

### MERGED → clean up

Run the `cleanup` skill for this PR, passing its number. Whatever tearing down a merged PR involves is cleanup's concern, not this skill's.

Issue status is the tracker's to manage — see `task-tracker`. This path only cleans up.

### CLOSED without merge → stop watching it

Report that the PR was closed without merging and drop it from the pending set. Do **not** clean up — the branch and worktree may still be wanted.

### ERROR (unreachable) → surface it

Report that the PR could not be polled and drop it from the pending set so the user can decide. Never keep silently looping on it.

## 3. After the round

- If `cleanup` reported failure for a PR, mark **that PR** failed and surface it — but keep polling the other pending PRs.
- Report per PR: cleaned-up (merged), closed-without-merge, or unreachable.
- If PRs remain pending, re-launch the poll (step 1) for just those. When the pending set is empty, report the final tally and stop.