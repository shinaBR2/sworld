---
name: wait-for-pr-merge
description: Poll one or more PRs until each merges (or closes), cleaning up each PR the moment it merges — remove its worktree, delete its local branch, refresh local main, mark its tracker issue Done. Use whenever the user says "wait for PR X to merge", "wait for PRs X and Y to merge", "watch these PRs until they merge", "let me know when PR X lands", "poll PR X", or invokes /wait-for-pr-merge. This is post-READY watching only — it does NOT fix CI, conflicts, or review comments (that is "the loop"; see parallel-workflow).
user-invocable: true
---

# Wait for PR merge

The human merges a READY PR by hand on GitHub. This skill watches for that merge and does the cleanup, so the user can say "wait for PR X to merge" and walk away instead of manually re-checking GitHub. It accepts **one or more** PRs and handles each independently — each PR is cleaned up the moment *it* merges, without waiting for the others.

**Scope boundary:** this skill assumes each PR is already READY and the user is merging manually. It does **NOT** touch CI, conflicts, or review comments — that is the loop ("do the loop"; see [`parallel-workflow`](../parallel-workflow/SKILL.md)). If a PR simply isn't merged yet, keep waiting; never start fixing things under this skill.

## Workspace: three repos

Each PR belongs to exactly one of the three repos (`sworld`, `sworld-backend`, `sworld-hasura-v2`, all under `ShinaBR2`). All cleanup (worktree removal, branch deletion, local `main` refresh) runs **in the repo the PR belongs to** — never cross-repo. The repo is resolved once up front (see §1's resolve step) and maps to the local clone path:

- `sworld` → `<workspace>/sworld`
- `sworld-backend` → `<workspace>/sworld-backend`
- `sworld-hasura-v2` → `<workspace>/sworld-hasura-v2`

All `git -C` commands below take that local path. If a PR's repo can't be resolved or isn't one of the three, report and drop the PR from the poll — don't guess.

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

Each `FINAL` line already carries the resolved repo (`FINAL:<n>:<repo>:<state>`). Map it to the repo's local clone path (and remember it — every `gh pr view <N>` below MUST keep `--repo "ShinaBR2/$repo"`, and every git command below uses `git -C "$repo_path"`):

```bash
case "$repo" in
  sworld)           repo_path="<workspace>/sworld" ;;
  sworld-backend)   repo_path="<workspace>/sworld-backend" ;;
  sworld-hasura-v2) repo_path="<workspace>/sworld-hasura-v2" ;;
  *) echo "PR <N>: unknown repo '$repo' — dropping from poll"; continue ;;
esac
```

### MERGED → clean up + mark tracker issue Done

Resolve the branch and its worktree **exactly** — never substring-match, and never act on an empty branch (an empty value matches every worktree):

Every step below must **abort this PR's cleanup on failure** and report the partial state — never fall through to a later step or claim completion.

```bash
branch=$(gh pr view <N> --repo "ShinaBR2/$repo" --json headRefName -q .headRefName)
[ -n "$branch" ] || { echo "PR <N>: cannot resolve branch — aborting cleanup"; exit 1; }

# Exact worktree path for this branch (porcelain, exact ref match; handles paths with spaces).
wt=$(git -C "$repo_path" worktree list --porcelain | awk -v b="refs/heads/$branch" '
  /^worktree /{p=substr($0,10)} $0=="branch "b{print p}')

# Only ever remove a MERGED worktree; skip if none. Abort if removal fails.
[ -n "$wt" ] && { git -C "$repo_path" worktree remove "$wt" || { echo "PR <N>: worktree remove failed — aborting"; exit 1; }; }

# squash-merge leaves the branch not-fully-merged, so -D. Abort if deletion fails.
git -C "$repo_path" branch -D "$branch" || { echo "PR <N>: branch delete failed — aborting"; exit 1; }
```

Then mark the linked tracker issue `Done` (the parallel-workflow CI loop's Step 1 does this when *it* observes the merge; mirror it here so the manual-merge path stays consistent) — see `task-tracker` for the command. Extract `SWO-NNN` from the PR body — the branch name is **not** authoritative:

```bash
swo=$(gh pr view <N> --repo "ShinaBR2/$repo" --json body -q .body | grep -oE 'SWO-[0-9]+' | head -n1)
[ -n "$swo" ] && linear issue update "$swo" -s "Done" || echo "PR <N>: no SWO-NNN found in body — skipping tracker update"
```

### CLOSED without merge → stop watching it

Report that the PR was closed without merging and drop it from the pending set. Do **not** clean up — the branch and worktree may still be wanted.

### ERROR (unreachable) → surface it

Report that the PR could not be polled and drop it from the pending set so the user can decide. Never keep silently looping on it.

## 3. After the round

- For **each** repo that had a merge this round, refresh its local `main` **once** — fast-forward only, never rebase. Pick the command the same way as `parallel-workflow`'s "Keep local `main` fresh":
  ```bash
  # Is that repo's main worktree sitting on `main`? (empty/detached => feature-branch case)
  onmain=$(git -C "$repo_path" worktree list --porcelain | awk '
    /^branch refs\/heads\//{sub(/^branch refs\/heads\//,""); print; found=1} /^$/{if(!found)print"detached"; exit}')
  ```
  - **`main`** → run **`git pull --ff-only origin main`** in that main worktree.
  - **feature branch / detached** → run **`git -C "$repo_path" fetch origin main:main`** (advances the local `main` ref to `origin/main` without a checkout; refuses loudly if `main` *is* checked out somewhere — that refusal is the tell to use `pull --ff-only` in that worktree instead).
  Resolve the repo path explicitly via `git -C` — never rely on the current directory, which may still be a PR worktree. Propagate a failed refresh: it must stop success reporting and prevent relaunching the poll for that repo.
  ```bash
  case "$onmain" in
    main) (cd "$repo_path" && git pull --ff-only origin main) || { echo "$repo: main refresh failed — stop"; exit 1; } ;;
    *)    git -C "$repo_path" fetch origin main:main || { echo "$repo: main refresh failed — stop"; exit 1; } ;;
  esac
  ```
- Report per PR: cleaned-up+moved-to-Done (merged), closed-without-merge, or unreachable.
- If PRs remain pending, re-launch the poll (step 1) for just those. When the pending set is empty, report the final tally and stop.