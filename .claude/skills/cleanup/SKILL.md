---
name: cleanup
description: >-
  The single owner of the mechanical git cleanup after a PR merges — remove its throwaway worktree and
  delete its local branch. Use whenever a PR has merged and its worktree/branch need tearing down, or the
  user says "cleanup", "clean up the worktree", or invokes /cleanup. Other skills (`ci-loop`,
  `wait-for-pr-merge`) point here for teardown and carry none of the commands. It never refreshes local
  `main` — we never reference it; work always bases off `origin/main` (see `parallel-workflow`). It never
  touches issue status (that's the tracker's — see `task-tracker`) and never fixes CI, conflicts, or
  review comments (that's the loop — see `ci-loop`).
user-invocable: true
---

# Cleanup

When a PR merges, two git chores follow: **remove its worktree** and **delete its local branch**. This
skill owns those commands so every caller just says "run cleanup" — the exact commands and guardrails live
in one place, never copy-pasted.

There is deliberately **no "refresh local `main`" step**. Local `main` is left stale on purpose: nothing
ever reads it — every worktree bases off `origin/main` and every sync merges `origin/main` (see
`parallel-workflow`), so keeping a local pointer current would be busywork that touches the main worktree
for no reason.

Same "centralise a duplicated mechanic into one owner, consumers reference it" move `task-tracker` made
for the tracker coupling — here on the git-cleanup axis.

## What it does NOT do

- **No tracker writes.** Issue status is entirely the tracker's concern — see `task-tracker`. This skill
  never touches it.
- **No CI / conflict / comment fixing.** Getting a PR *to* merged — CI, merge conflicts, review threads —
  is the loop ("do the loop"; see `ci-loop`). This skill runs only *after* a merge.
- **Never touches the main worktree.** Teardown runs entirely on shared repo admin (`git worktree remove`,
  `branch -D`) or via `ExitWorktree`; it never edits the main worktree's files and never advances local
  `main`. That keeps it aligned with the `blockMainWorktreeWrites` hook — the main worktree is never meant
  to be written to at all.

## The one repo

Everything — frontend apps, shared packages, backend, Hasura — lives in `ShinaBR2/sworld`, so every branch
and worktree belongs to that single clone. The git-based teardown lives as a script beside this file —
`scripts/teardown.sh` (the A2 path). It takes the clone's **absolute path** as an argument and runs via
`git -C`, never relying on the current directory (which may still be the worktree being torn down), and
validates that the path really is a clone before touching it. (The same-session path A1 uses
`ExitWorktree`, which restores the cwd itself.) Pass the real absolute path of the sworld clone as that
argument.

## A. Tear down a merged branch

Input: the **PR number** `<N>`. Teardown keys off the PR — that's what makes the `MERGED` gate below
unambiguous — and derives the branch from it; a caller with the branch already resolved
(`wait-for-pr-merge`) still passes the number so the gate can run. **The `MERGED` gate is mandatory on every
path.** The two automated callers (`wait-for-pr-merge`, `ci-loop`) invoke teardown only after they've
observed the merge, so they satisfy it; a direct `/cleanup` invocation must confirm it here.

**Only ever tear down a `MERGED` PR.** If `CLOSED`, do nothing — the branch and worktree may still be
wanted. If `OPEN`, it isn't ready; that's `ci-loop`'s job, not this skill's. The A2 script enforces this
gate itself (it reads the PR state and refuses anything but `MERGED`); the A1 path uses the `ExitWorktree`
tool, so confirm the gate there first — `gh pr view <N> --repo ShinaBR2/sworld --json state -q .state` must
return `MERGED` before you remove anything.

Pick the teardown path by **whether *this* session created the worktree** — either path aborts on the first
failure and reports the partial state, never falling through or claiming completion.

### A1 — Same-session teardown (preferred): `ExitWorktree`

When the worktree was created by **`EnterWorktree` earlier in *this* session**, tear it down with the native
**`ExitWorktree`** tool — it removes the worktree directory *and* its local branch, and restores the
session's cwd to the repo root, so you are never stranded in a just-deleted directory (the exact hazard the
manual path below has to work around):

```text
ExitWorktree(action: "remove")
```

A squash-merge leaves the branch with one commit not on local `main` — the pre-squash twin — so
`ExitWorktree` refuses and lists it. The `MERGED` gate above already confirmed that work reached
`origin/main` via the squash, so that one flagged commit is a duplicate: re-invoke with
`discard_changes: true`. **Only ever discard after the `MERGED` gate has passed, and only when the flagged
work is exactly that merged commit** — if `ExitWorktree` lists anything beyond it (an extra local commit
made after the merge), stop and inspect, because that work is *not* on the PR and `discard_changes` would
lose it. `ExitWorktree` acts *only* on worktrees this session created via `EnterWorktree`; for anything
else, use A2.

### A2 — Cross-session / manual teardown: `git -C`

When a **different or later session** tears down the merge (e.g. `wait-for-pr-merge` polling in a fresh
session), or the worktree wasn't created via `EnterWorktree` this session, `ExitWorktree` can't touch it —
remove it manually with the teardown script, which never relies on the current directory (which may still
be the worktree being torn down):

```bash
# Located via <repo_path> too, not a bare relative path — the caller's cwd may not be a
# checkout (or may be the very worktree being removed); the script itself lives in the clone.
"<repo_path>"/.claude/skills/cleanup/scripts/teardown.sh <N> "<repo_path>"
```

It re-checks the `MERGED` gate, resolves the branch from the PR, removes the branch's worktree, and deletes
the branch. The load-bearing guardrails live in the script and its comments: the `MERGED` gate, an exact
`refs/heads/$branch` match (a substring match could remove the wrong worktree), never acting on an empty
branch (empty matches every worktree), only removing a worktree that exists, `-D` because a squash-merge
leaves the branch technically unmerged, and aborting on the first failure.

That completes teardown. Local `main` is intentionally **not** refreshed afterwards — nothing reads it;
the next piece of work bases off `origin/main` (see `parallel-workflow`).
