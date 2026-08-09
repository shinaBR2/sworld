---
name: parallel-workflow
description: Open this before you start any work — it's the high-level plan for how a change ships here: the shape of the flow end to end, and which skill owns each step. Load it first; it points you to the rest.
user-invocable: false
---

# Parallel Workflow

The plan for shipping any change here. It's short on purpose — the flow is
simple, and each step's detail is owned by the skill named beside it. Read this
first, then follow the handoffs.

Two rules frame everything:

- **A tracker issue comes first — always.** No issue, no work; create one first
  (`writing-task-specs`; `task-tracker` owns the tracker itself).
- **All work is isolated.** Every change is its own block in its own worktree
  (the default `AGENTS.md` sets). The main worktree stays clean — read-only git
  there, never edits or branches.

## The flow

1. **Start the issue.** Read it, confirm it's ready, clear its blockers.
   Non-trivial or reopened → run `analyze` first and let its verdict gate the go.
   Then mark it started (`task-tracker`).
2. **Enter a worktree off fresh `main`.** `git fetch origin main` first (the repo
   moves faster than `EnterWorktree`'s own throttled fetch), then `EnterWorktree`
   with the issue slug — it branches off current `origin/main`. A new worktree
   needs `pnpm install` (no hook covers it); tracker config and `.env` files are
   auto-provisioned, so don't copy them by hand.
3. **Build.** Commit often, push immediately — a push is backup, not publishing,
   so it needs no review. Never bypass commit hooks. Keep the change small and
   cohesive (`micro-prs`).
4. **Self-review to a clean exit — before the PR.** Run `self-review`. A change
   touching a trust boundary (Hasura permissions/metadata, a Hono webhook or
   action handler) also runs `security-reviewer`.
5. **Open the PR.** Not a draft; reference the issue; assign it to the user
   (`pr-descriptions` owns the writeup, `task-tracker` the link).
6. **Drive CI to settled** with `ci-loop`. You never merge — the user does.
7. **Clean up after merge** with `cleanup` — it removes the worktree and
   refreshes local `main`.

## Two repo specifics the plan relies on

- **Git: always merge, never rebase** — everywhere (syncing, conflicts,
  integrating). "main" always means `origin/main`; fetch before you read or
  branch off it, and sync before you *analyze*, not just before you code — a
  stale checkout produces wrong conclusions.
- **A schema change ships as two PRs, in order.** After a Hasura schema change
  lands, re-run `pnpm codegen` in `packages/core` (fetch and merge `origin/main`
  first) and ship the regenerated types as a follow-up — schema first, because
  the generated types mean nothing until it's live (`micro-prs`, "blockers land
  first"; GraphQL conventions in `architecture`). A merge conflict in a
  generated file is never hand-resolved: take main's version and re-run codegen.
