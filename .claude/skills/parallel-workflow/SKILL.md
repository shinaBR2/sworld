---
name: parallel-workflow
description: Open this before you start any work — the high-level plan for how a change ships here, and which skill owns each step.
user-invocable: false
---

# Parallel Workflow

## Rules

- **No work without a task.** Pick up an issue or create one first
  (`writing-task-specs`; `task-tracker` owns the tracker).
- **Never build outside a worktree.** Before you write code: pull `main` (a plain
  `git pull` in the main worktree), then `EnterWorktree`.
- A fresh worktree needs `pnpm install` — no hook covers it.
- Never bypass commit hooks.
- **Never merge a PR** unless the user says so ("merge when settled"). They
  merge, not you.

## Steps

1. Check the issue — blockers cleared, and run `analyze` first if it's
   non-trivial or reopened — then mark it started (`task-tracker`).
2. `EnterWorktree` and build: commit often, keep commits small, push immediately.
3. Run the `self-review` loop to a clean exit.
4. Open the PR (`pr-descriptions`).
5. Drive CI to settled with `ci-loop`.
