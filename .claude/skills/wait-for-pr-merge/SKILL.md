---
name: wait-for-pr-merge
description: Poll one or more PRs until each merges (or closes), cleaning up each PR the moment it merges — remove its worktree, delete its local branch, refresh local main, mark its Linear issue Done. Use whenever the user says "wait for PR X to merge", "wait for PRs X and Y to merge", "watch these PRs until they merge", "let me know when PR X lands", "poll PR X", or invokes /wait-for-pr-merge. This is post-READY watching only — it does NOT fix CI, conflicts, or review comments (that is "the loop"; see parallel-workflow).
user-invocable: true
---

# Wait for PR merge

The human merges a READY PR by hand on GitHub. This skill watches for that merge and does the cleanup, so the user can say "wait for PR X to merge" and walk away instead of manually re-checking GitHub. It accepts **one or more** PRs and handles each independently — each PR is cleaned up the moment *it* merges, without waiting for the others.

**Scope boundary:** this skill assumes each PR is already READY and the user is merging manually. It does **NOT** touch CI, conflicts, or review comments — that is the loop ("do the loop"; see [`parallel-workflow`](../parallel-workflow/SKILL.md)). If a PR simply isn't merged yet, keep waiting; never start fixing things under this skill.

## Workspace: three repos

Each PR belongs to exactly one of the three repos (`sworld`, `sworld-backend`, `sworld-hasura-v2`, all under `ShinaBR2`). All cleanup (worktree removal, branch deletion, local `main` refresh) runs **in the repo the PR belongs to** — never cross-repo. Resolve the repo from each PR via `gh pr view <N> --json repository -q '.repository.nameWithOwner'` (gives `ShinaBR2/<repo>`), then map to the local clone path:

- `ShinaBR2/sworld` → `<workspace>/sworld`
- `ShinaBR2/sworld-backend` → `<workspace>/sworld-backend`
- `ShinaBR2/sworld-hasura-v2` → `<workspace>/sworld-hasura-v2`

All `git -C` commands below take that local path. If the repo can't be resolved or isn't one of the three, report and drop the PR from the poll — don't guess.

## 1. Poll until a PR needs attention

Track the set of PR numbers the user gave. Poll `gh pr view <N> --json state` for each, on an interval (~2 min), in the **background**, so the sleep burns nothing and you are only re-invoked when a PR needs attention. **NEVER** use `gh pr view --watch` / `gh pr checks --watch`.

A failed `gh` call (auth, network, bad PR number) must NOT be mistaken for `OPEN` — otherwise the loop spins silently forever. Treat only a successful, non-empty state as truth; retry a few times before declaring a PR unreachable.

Keep the script **portable across sh / bash / zsh** — the background shell is not guaranteed to be any one of them:

- NO bash-only constructs (`declare -A`, associative arrays). Track transient failures with an inline retry instead of a cross-iteration counter.
- Put the PR numbers in **positional parameters** (`set -- …`) and loop with `for n in "$@"`. Do NOT write `for n in $LIST` — zsh does not word-split an unquoted variable, so it would iterate once over the whole string and poll a bogus PR.

```sh
# Set the PRs still being watched as positional params (splits correctly in sh/bash/zsh).
# Replace the numbers below with the PR numbers from THIS invocation (3645 3646 are only an example).
# Exits as soon as any PR is terminal (MERGED/CLOSED) or stays unreachable after 3 quick retries.
set -- 3645 3646
while true; do
  hit=0
  for n in "$@"; do
    s=""; i=1
    while [ "$i" -le 3 ]; do
      s=$(gh pr view "$n" --json state -q .state 2>/dev/null)
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

For every `FINAL:<n>:<state>` / `ERROR:<n>:...` line, first resolve the PR's repo:

```bash
name_with_owner=$(gh pr view <N> --json repository -q '.repository.nameWithOwner')
case "$name_with_owner" in
  ShinaBR2/sworld)          repo="<workspace>/sworld" ;;
  ShinaBR2/sworld-backend)  repo="<workspace>/sworld-backend" ;;
  ShinaBR2/sworld-hasura-v2) repo="<workspace>/sworld-hasura-v2" ;;
  *) echo "PR <N>: unknown repo '$name_with_owner' — dropping from poll"; drop; continue ;;
esac
```

### MERGED → clean up + mark Linear issue Done

Resolve the branch and its worktree **exactly** — never substring-match, and never act on an empty branch (an empty value matches every worktree):

Every step below must **abort this PR's cleanup on failure** and report the partial state — never fall through to a later step or claim completion.

```bash
 branch=$(gh pr view <N> --json headRefName -q .headRefName)
[ -n "$branch" ] || { echo "PR <N>: cannot resolve branch — aborting cleanup"; exit 1; }

# Exact worktree path for this branch (porcelain, exact ref match; handles paths with spaces).
wt=$(git -C "$repo" worktree list --porcelain | awk -v b="refs/heads/$branch" '
  /^worktree /{p=substr($0,10)} $0=="branch "b{print p}')

# Only ever remove a MERGED worktree; skip if none. Abort if removal fails.
[ -n "$wt" ] && { git -C "$repo" worktree remove "$wt" || { echo "PR <N>: worktree remove failed — aborting"; exit 1; }; }

# squash-merge leaves the branch not-fully-merged, so -D. Abort if deletion fails.
git -C "$repo" branch -D "$branch" || { echo "PR <N>: branch delete failed — aborting"; exit 1; }
```

Then mark the linked Linear issue `Done` (the parallel-workflow CI loop's Step 1 does this when *it* observes the merge; mirror it here so the manual-merge path stays consistent). Extract `SWO-NNN` from the PR body — the branch name is **not** authoritative:

```bash
swo=$(gh pr view <N> --json body -q .body | grep -oE 'SWO-[0-9]+' | head -n1)
[ -n "$swo" ] && linear issue update "$swo" -s "Done" || echo "PR <N>: no SWO-NNN found in body — skipping Linear update"
```

### CLOSED without merge → stop watching it

Report that the PR was closed without merging and drop it from the pending set. Do **not** clean up — the branch and worktree may still be wanted.

### ERROR (unreachable) → surface it

Report that the PR could not be polled and drop it from the pending set so the user can decide. Never keep silently looping on it.

## 3. After the round

- For **each** repo that had a merge this round, refresh its local `main` **once** — fast-forward only, never rebase. Use the `main:<refspec>` fetch so it works even when the repo's main worktree is checked out on a feature branch (common here — see `parallel-workflow` "Keep local main fresh"); it advances the local `main` ref to `origin/main` without needing to be on `main`, without touching any working tree, and errors loudly if `main` has diverged. Resolve the repo path explicitly via `git -C` — never rely on the current directory, which may still be a PR worktree. Propagate a failed refresh: it must stop success reporting and prevent relaunching the poll for that repo.
  ```bash
  git -C "$repo" fetch origin main:main || { echo "$repo: main refresh failed — stop, do not relaunch"; exit 1; }
  ```
  (If no worktree in that repo has `main` checked out — the common case here — this always fast-forwards cleanly. If a future `git pull --ff-only origin main` from the main worktree is preferred and that worktree sits on `main`, that is equivalent and also acceptable.)
- Report per PR: cleaned-up+moved-to-Done (merged), closed-without-merge, or unreachable.
- If PRs remain pending, re-launch the poll (step 1) for just those. When the pending set is empty, report the final tally and stop.