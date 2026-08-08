---
name: wait-for-pr-merge
description: Poll one or more PRs until each merges (or closes), running the `cleanup` skill on each PR the moment it merges (issue status is the tracker's — see `task-tracker`). Use whenever the user says "wait for PR X to merge", "wait for PRs X and Y to merge", "watch these PRs until they merge", "let me know when PR X lands", "poll PR X", or invokes /wait-for-pr-merge. This is post-READY watching only — it does NOT fix CI, conflicts, or review comments (that is "the loop"; see `ci-loop`).
user-invocable: true
---

# Wait for PR merge

The human merges a READY PR by hand. This skill watches for that merge and does the cleanup, so the user can say "wait for PR X to merge" and walk away instead of manually re-checking. It accepts **one or more** PRs and handles each independently — each PR is cleaned up the moment *it* merges, without waiting for the others.

**Scope boundary:** this skill assumes each PR is already READY and the user is merging manually. It does **NOT** touch CI, conflicts, or review comments — that is the loop ("do the loop"; see [`ci-loop`](../ci-loop/SKILL.md)). If a PR simply isn't merged yet, keep waiting; never start fixing things under this skill.

## 1. Poll the PRs

A PR number identifies a PR outright, with nothing to resolve. The poll itself is `scripts/poll.sh`, run with the background flag and given the watched PR numbers as arguments:

```sh
.claude/skills/wait-for-pr-merge/scripts/poll.sh <PR> [<PR> ...]
```

It loops until any tracked PR is terminal (MERGED/CLOSED) or stays unreachable after retries, then exits. The load-bearing details live in the script and its comments: a failed status check (auth, network, bad number) is never mistaken for `OPEN` — it retries and treats only a successful, non-empty state as truth; it stays portable across sh / bash / zsh (PR numbers in positional parameters, `for n in "$@"`, every expansion braced before a `:`); and it never uses a blocking `--watch` (see `references/github-cli.md`). Per-PR cleanup is delegated to the `cleanup` skill — this skill just passes it the PR number.

When it exits, read the `FINAL:<n>:<state>` and `ERROR:<n>:...` lines it emitted and handle each (below). Then **re-launch the poll for the PRs still pending** and repeat, until none are left.

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
