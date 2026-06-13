---
name: parallel-workflow
description: Enforces the parallel subtask workflow using markdown task files, git worktrees, and PRs. Auto-triggers when working with git, branches, worktrees, PRs, task files, codegen, or CI.
user-invocable: false
---

# Parallel Workflow Rules

## Non-negotiable prerequisites

- **The task file is the source of truth.** A task file under `docs/tasks/` is REQUIRED before starting any work. NEVER start working without one.
- **ALWAYS work in a dedicated worktree.** NEVER create branches or make changes in the main worktree. The main worktree must stay clean.

## Git fundamentals

- "main branch" ALWAYS means `origin/main` — fetch first with `git fetch origin main`. The local `main` is often stale.
- ALWAYS `git merge`, NEVER `git rebase`. This applies everywhere — syncing, resolving divergence, integrating changes.

## Before starting

1. Read the current task file under `docs/tasks/` and confirm its `status`.
2. Verify a task file exists for this work (a child `docs/tasks/<parent-slug>/<child-slug>.md`, or a standalone `docs/tasks/<slug>.md`).
3. Check the `blocked-by: []` frontmatter for blockers; resolve them first.
4. Set the task file's `status: in-progress` and commit before starting.

## Creating a worktree

5. `git fetch origin main` first, then create worktree inside `.claude/worktrees/` from `origin/main`.
6. Name worktrees after the child-slug of the task file (e.g. `.claude/worktrees/<child-slug>`). This keeps worktrees self-contained, gitignored, and aligned with Claude Code's official default.
7. Copy `.env` files from the main worktree into the matching `apps/<app>/` directories.
8. Run `pnpm install` in each worktree.

## During work

9. The 3 files limit is soft — more is fine if changes are small, cohesive, and easy to review.
10. NEVER bypass commit hooks — code MUST be formatted, linted, and type-checked.
11. Self-review all work.
12. Always verify `git branch --show-current` before committing.
13. Don't dismiss automated review findings without thorough verification.
14. Commit and push as soon as possible — never ask, just do it.

## Codegen

- ALWAYS `git fetch origin main && git merge origin/main` before running codegen.
- Run `pnpm codegen` in `packages/core` to regenerate GraphQL types.
- See `architecture` skill for GraphQL conventions (generated files, `graphql()` usage).

## Resolving conflicts

- ALWAYS fetch the latest main first: `git fetch origin main && git merge origin/main`. ALWAYS.
- NEVER rebase. ALWAYS merge.
- If conflicts are in codegen-generated files, take the changes from main and re-run `pnpm codegen` in `packages/core`.

## PR submission

- Create PR with `[WIP]` prefix (not draft).
- Reference the task file in the PR description.
- ALWAYS assign PR to the user (`--assignee "@me"`).
- Set the task file's `status: in-review` after the PR is created.
- Ensure PR is independent and mergeable without other PRs.
- Run the CI loop after pushing.

## CI loop ("do the loop")

A strict sequential state machine. Each step is a **gate**. If any gate triggers a code change, push the fix, wait 6 minutes for CI, then **restart from Step 1**. NEVER proceed to the next step after fixing something. NEVER batch multiple steps in parallel.

Before entering the gates, push any unpushed local commits so the remote PR reflects the latest work.

### Step 1: Check merge status

- Run `gh pr view <number> --json state` as the **ONLY** command. Do NOT batch it with anything else.
- If `MERGED` → set the task file's `status: done`, clean up worktree + delete local branch. Loop is done.
- If `CLOSED` → stop the loop. Report to user that the PR was closed without merging.
- If `OPEN` → proceed to Step 2.

### Step 2: Check merge conflicts

- Run `gh pr view <number> --json mergeable`.
- If conflicting → `git fetch origin main && git merge origin/main`, resolve conflicts, push. **STOP. Wait 6 minutes. Restart from Step 1.**
- If clean → proceed to Step 3.

### Step 3: Check unresolved review comments

- Query via GitHub **GraphQL API** (REST doesn't expose resolved status):
  ```
  gh api graphql -f query='{ repository(owner:"ShinaBR2", name:"sworld") { pullRequest(number:NUMBER) { reviewThreads(first:100) { nodes { isResolved comments(first:1) { nodes { body path line } } } } } } }'
  ```
- Filter to `isResolved: false` threads only.
- If unresolved threads exist → read them, fix the code, push. **STOP. Wait 6 minutes. Restart from Step 1.**
- If no unresolved threads → proceed to Step 4.
- **NEVER manually resolve bugbot threads** — fix code, let bugbot re-resolve on next push.
- Bugbot CI check **ALWAYS shows SUCCESS** even when it finds real bugs. CI green means NOTHING about comments — you must read threads regardless.

### Step 4: Check CI

- Run `gh pr checks <number>` (NEVER use `--watch`).
- If failures → fix them, push. **STOP. Wait 6 minutes. Restart from Step 1.**
- If all green AND no unresolved comments → PR is ready. Report to user.
- **Flaky E2E**: if an E2E job failed at an infra/setup step (Playwright OS deps, Node.js setup, cache, runner allocation) and the PR doesn't touch test code, treat it as green — don't trigger reruns or block readiness on it. Reruns are only appropriate when the failure is in a step that executes changed code.

### The rule that gets violated

The #1 failure mode: batching multiple checks in parallel, fixing multiple things at once, or skipping Step 3 because CI is green. The steps are gates in strict order because each push triggers new CI + bugbot runs. Checking later steps before earlier ones settle is meaningless — the state changes after every push.

### Reporting

After each iteration, report what you found and fixed. Lead with unresolved comments if they exist — that's the #1 thing the user cares about.

## Task file management

- Starting work on a parent task (even planning) → set the parent `docs/tasks/<parent-slug>/README.md` `status: in-progress`.
- Each child subtask carries its own `status` (todo → in-progress → in-review → done) in its frontmatter.
- Last child of a parent done → set the parent `status: done`.

## Good PR criteria

- Clear goal, scope, and impact (before vs after).
- Clear steps to test.
- Constants-only PRs are safe to merge.
- Props drilling can touch many files but few lines — still a good PR.
- Renaming/refactoring across files is easy to review.
