---
name: cleanup
description: >-
  The single owner of the mechanical git cleanup after a PR merges — remove its throwaway worktree,
  delete its local branch, and fast-forward local `main` — plus the standalone "keep local `main`
  fresh" refresh. Use whenever a PR has merged and its worktree/branch need tearing down, or the user
  says "cleanup", "clean up the worktree", "refresh main", "update main", "pull main", or invokes
  /cleanup. Other skills (`ci-loop`, `wait-for-pr-merge`) point here for these steps and carry none of
  the commands. It never touches issue status (that's the tracker's — see `task-tracker`) and never
  fixes CI, conflicts, or review comments (that's the loop — see `ci-loop`).
user-invocable: true
---

# Cleanup

When a PR merges, three git chores follow: **remove its worktree**, **delete its local branch**, and
**fast-forward local `main`** so the next piece of work branches off the latest code. This skill owns
those commands so every caller just says "run cleanup" — the exact commands and guardrails live in one
place, never copy-pasted. It also owns the standalone **refresh local `main`** action on its own.

Same "centralise a duplicated mechanic into one owner, consumers reference it" move `task-tracker` made
for the tracker coupling — here on the git-cleanup axis.

## What it does NOT do

- **No tracker writes.** Issue status is entirely the tracker's concern — see `task-tracker`. This skill
  never touches it.
- **No CI / conflict / comment fixing.** Getting a PR *to* merged — CI, merge conflicts, review threads —
  is the loop ("do the loop"; see `ci-loop`). This skill runs only *after* a merge (teardown) or on its
  own (refresh).
- **Complements the `blockMainWorktreeWrites` hook**, never fights it. That hook blocks *edits* to a main
  worktree but explicitly permits advancing it with `git pull --ff-only origin main` — which is exactly
  the refresh below. Cleanup never writes files into a main worktree; it only advances the `main` ref.

## The one repo

Everything — frontend apps, shared packages, backend, Hasura — lives in `ShinaBR2/sworld`, so every branch
and worktree belongs to that single clone. The git-based steps live as scripts in `scripts/` beside this
file — `teardown.sh` (A2) and `refresh-main.sh` (B). Each takes the clone's **absolute path** as an
argument and runs via `git -C`, never relying on the current directory (which may still be the worktree
being torn down), and each validates that the path really is a clone before touching it. (The same-session
path A1 uses `ExitWorktree`, which restores the cwd itself.) Pass the real absolute path of the sworld
clone as that argument.

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

Then **refresh local `main`** (section B) — a torn-down branch means `main` just moved. (After A1's
`ExitWorktree` the session is back in the main worktree, so section B's `main`-checked-out path applies.)

## B. Refresh local `main`

Fetching only advances the `origin/main` **ref**; the local `main` branch pointer stays stale, so any lazy
reference to local `main` (a code read, a diff, a new worktree base) is wrong. In this parallel-worktree
workflow local `main` is *chronically* behind, so keep the pointer current — refresh before you read off
`main` or branch from it.

Fast-forward only, never rebase, never a merge commit on `main`. The exact command depends on what the
repo's **main worktree** (the first entry in `git worktree list`) is checked out on — the refresh script
probes that and picks the right one (`git pull --ff-only origin main` when the main worktree sits on `main`,
`git fetch origin main:main` to advance the ref without a checkout when it sits on a feature branch, the
common case):

```bash
"<repo_path>"/.claude/skills/cleanup/scripts/refresh-main.sh "<repo_path>"
```

It exits non-zero on a failed refresh (`--ff-only`, the wrong upstream, or `main` checked out elsewhere), so
a caller **must stop** success reporting on that non-zero exit (and, for a caller that relaunches a poll,
prevent the relaunch). The reasoning behind each branch lives in the script's comments.

Run the refresh:

1. **As the tail of every teardown** (section A) — the branch just torn down moved `main`.
2. **Before starting new work / before any code read on `main`**.
3. **Standalone, on demand** — whenever the user says "refresh main", "update main", "pull main", or any
   equivalent. It's a one-command action, never a question: just run it and report.
