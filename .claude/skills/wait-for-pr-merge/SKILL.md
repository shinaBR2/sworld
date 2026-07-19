---
name: wait-for-pr-merge
description: Poll one or more PRs until each merges (or closes), cleaning up each PR the moment it merges — remove its worktree, delete its local branch, refresh local main (issue status is the tracker's — see `task-tracker`). Use whenever the user says "wait for PR X to merge", "wait for PRs X and Y to merge", "watch these PRs until they merge", "let me know when PR X lands", "poll PR X", or invokes /wait-for-pr-merge. This is post-READY watching only — it does NOT fix CI, conflicts, or review comments (that is "the loop"; see parallel-workflow).
user-invocable: true
---

# Wait for PR merge

The human merges a READY PR by hand on GitHub. This skill watches for that merge and does the cleanup, so the user can say "wait for PR X to merge" and walk away instead of manually re-checking GitHub. It accepts **one or more** PRs and handles each independently — each PR is cleaned up the moment *it* merges, without waiting for the others.

**Scope boundary:** this skill assumes each PR is already READY and the user is merging manually. It does **NOT** touch CI, conflicts, or review comments — that is the loop ("do the loop"; see [`parallel-workflow`](../parallel-workflow/SKILL.md)). If a PR simply isn't merged yet, keep waiting; never start fixing things under this skill.

## Workspace: three repos

Each PR belongs to exactly one of the three repos (`sworld`, `sworld-backend`, `sworld-hasura-v2`, all under `ShinaBR2`). The repo is resolved once up front (see §1's resolve step) and every `gh pr view` is qualified with `--repo ShinaBR2/<repo>`. Per-PR cleanup runs **in the repo the PR belongs to** — never cross-repo — and is delegated to the `cleanup` skill, which owns the repo→local-path map and every `git` command. If a PR's repo can't be resolved or isn't one of the three, report and drop the PR from the poll — don't guess.

## 1. Resolve each PR's repo, then poll

Every `gh pr view <N>` in this skill MUST be **repository-qualified** — a bare `gh pr view <N>` resolves against the *current* repo's remote only, so a `sworld-backend` or `sworld-hasura-v2` PR number looked up from a `sworld` worktree either fails or, where numbers collide, resolves the **wrong PR**. Resolve each PR's repo **once up front**, then pass `--repo ShinaBR2/<repo>` on every `gh pr view`.

**Resolve step (you run it, not the background script).** For each PR number, probe the three repos until one returns a PR with that number — that repo owns it:

```sh
for n in <N1> <N2>; do
  for r in sworld sworld-backend sworld-hasura-v2; do
    gh pr view "$n" --repo "ShinaBR2/$r" --json state >/dev/null 2>&1 && { echo "$n:$r"; break; }
  done
done
```

Build the resolved pairs as `<num>:<repo>` and pass them to the background poll. A failed `gh` call (auth, network, bad PR number) must NOT be mistaken for `OPEN` — otherwise the loop spins silently forever. Treat only a successful, non-empty state as truth; retry a few times before declaring a PR unreachable. **NEVER** use `gh pr view --watch` / `gh pr checks --watch`.

Keep the poll script **portable across sh / bash / zsh** — the background shell is not guaranteed to be any one of them: NO bash-only constructs (`declare -A`, associative arrays); put the resolved pairs in **positional parameters** (`set -- …`) and loop with `for pair in "$@"`. Do NOT write `for pair in $LIST` — zsh does not word-split an unquoted variable, so it would iterate once over the whole string and poll a bogus pair.

```sh
# Replace the pairs below with the RESOLVED pairs from the step above (445:sworld 446:sworld-backend are only an example).
# Exits as soon as any tracked PR is terminal (MERGED/CLOSED) or stays unreachable after 3 quick retries.
set -- 445:sworld 446:sworld-backend
while true; do
  hit=0
  for pair in "$@"; do
    n="${pair%%:*}"; repo="${pair#*:}"
    s=""; i=1
    while [ "$i" -le 3 ]; do
      s=$(gh pr view "$n" --repo "ShinaBR2/$repo" --json state -q .state 2>/dev/null)
      [ -n "$s" ] && break
      i=$((i + 1)); sleep 5
    done
    if [ -z "$s" ]; then
      echo "ERROR:$n:gh-unreachable"; hit=1
    elif [ "$s" = "MERGED" ] || [ "$s" = "CLOSED" ]; then
      echo "FINAL:$n:$repo:$s"; hit=1
    fi
  done
  [ "$hit" = 1 ] && exit 0
  sleep 120
done
```

Run it with the background flag. When it exits, read the `FINAL:<n>:<repo>:<state>` and `ERROR:<n>:...` lines and handle each (below). Then **re-launch the poll for the PRs still pending** (re-resolving is not needed — the repo is stable) and repeat, until none are left.

## 2. Handle each event

Each `FINAL` line already carries the resolved repo (`FINAL:<n>:<repo>:<state>`). Every `gh pr view <N>` below MUST keep `--repo "ShinaBR2/$repo"`; the repo→local-path mapping and all `git` commands belong to `cleanup`.

### MERGED → clean up

Hand the resolved `repo` and PR number to the `cleanup` skill's **teardown** (its section A): it removes the branch's worktree (exact ref match, only if one exists), deletes the local branch (`-D`), then refreshes that repo's local `main` — aborting on the first failure and reporting the partial state. The PR is already known `MERGED` here, so cleanup's own MERGED gate passes straight through.

Issue status is the tracker's to manage — merging auto-moves it to `Done` (see `task-tracker`). This path only cleans up.

### CLOSED without merge → stop watching it

Report that the PR was closed without merging and drop it from the pending set. Do **not** clean up — the branch and worktree may still be wanted.

### ERROR (unreachable) → surface it

Report that the PR could not be polled and drop it from the pending set so the user can decide. Never keep silently looping on it.

## 3. After the round

- Local `main` is already refreshed — `cleanup`'s teardown fast-forwards the merged PR's repo as its final step, so there's nothing extra to run here. If `cleanup` aborted for a PR (worktree, branch, or refresh), mark **that PR** failed and surface it — but keep polling the other pending PRs; only stop watching a repo entirely if the repo itself is unreachable.
- Report per PR: cleaned-up (merged), closed-without-merge, or unreachable.
- If PRs remain pending, re-launch the poll (step 1) for just those. When the pending set is empty, report the final tally and stop.