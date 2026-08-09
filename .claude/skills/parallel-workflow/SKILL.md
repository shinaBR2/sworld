---
name: parallel-workflow
description: Open this before you start any work — the high-level plan for how a change ships here, and which skill owns each step. Load it first; it points you to the rest.
user-invocable: false
---

# Parallel Workflow

The plan for shipping any change here. Short on purpose — each step's detail is
owned by the skill named beside it.

## Rules

- **No work without a task.** Pick up an issue or create one first
  (`writing-task-specs`; `task-tracker` owns the tracker).
- **Always in a worktree.** `git pull` `main`, then `EnterWorktree` — before
  anything else, so the worktree branches off current `main` (`git` owns why).
- A fresh worktree needs `pnpm install` — no hook covers it.
- Never bypass commit hooks.
- **Never merge a PR** unless the user says so ("merge when settled"). They
  merge, not you.

## Steps

1. Check the issue — run `analyze` first if it's non-trivial or reopened — then
   mark it started (`task-tracker`).
2. `EnterWorktree` and build: commit often, keep commits small, push immediately
   (a push is backup, not publishing).
3. Run the `self-review` loop to a clean exit.
4. Open the PR (`pr-descriptions`).
5. Drive CI to settled with `ci-loop`.
