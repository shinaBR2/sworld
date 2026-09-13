---
name: wait-for-pr-merge
description: Poll one or more PRs until each merges (or closes), running the `cleanup` skill on each PR the moment it merges (issue status is the tracker's — see `task-tracker`). Use whenever the user says "wait for PR X to merge", "wait for PRs X and Y to merge", "watch these PRs until they merge", "let me know when PR X lands", "poll PR X", or invokes /wait-for-pr-merge. This is post-READY watching only — it does NOT fix CI, conflicts, or review comments (that is "the loop"; see `ci-loop`).
user-invocable: true
---

* wait-for-pr-merge: watches one or more already-READY PRs until each merges or closes, cleaning up each the moment it merges, so the user can say "wait for PR X to merge" and walk away.

* Rules
  * accept one or more PRs and handle each independently — each is cleaned up the moment it merges, without waiting for the others.
  * this skill assumes each PR is already READY and the user is merging manually, so it never touches CI, conflicts, or review comments — that is the loop (see [`ci-loop`](../ci-loop/SKILL.md)) — and if a PR simply isn't merged yet, keep waiting and never start fixing things here.
  * a PR number identifies a PR outright, with nothing to resolve.
  * the poll loops until any tracked PR is terminal (MERGED/CLOSED) or stays unreachable after retries then exits, and its load-bearing details live in the script and its comments: a failed status check (auth, network, bad number) is never mistaken for `OPEN` (it retries and treats only a successful, non-empty state as truth), it stays portable across sh / bash / zsh (PR numbers in positional parameters, `for n in "$@"`, every expansion braced before a `:`), and it never uses a blocking `--watch` (see `.claude/references/github-cli.md`).
  * MERGED → run the `cleanup` skill for the PR, passing its number, since tearing down a merged PR is cleanup's concern not this skill's.
  * CLOSED without merge → report it and drop the PR from the pending set, and do not clean up, since the branch and worktree may still be wanted.
  * ERROR (unreachable) → report that the PR could not be polled and drop it from the pending set so the user can decide, never keep silently looping on it.
  * if `cleanup` reported failure for a PR, mark that PR failed and surface it, but keep polling the other pending PRs.
  * issue status is the tracker's to manage — see `task-tracker`.
  * stop when the pending set is empty, then report the final tally — per PR: cleaned-up (merged), closed-without-merge, or unreachable.

* Steps
  1. Run the poll script in the background with the watched PR numbers as arguments.
     ```sh
     .claude/skills/wait-for-pr-merge/scripts/poll.sh <PR> [<PR> ...]
     ```
  2. When it exits, read the `FINAL:<n>:<state>` and `ERROR:<n>:...` lines it emitted and handle each PR per the Rules.
  3. Re-launch the poll for the PRs still pending and repeat until none are left.
