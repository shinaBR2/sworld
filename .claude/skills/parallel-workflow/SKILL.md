---
name: parallel-workflow
description: Enforces the parallel subtask workflow using Linear issues, git worktrees, and PRs. Auto-triggers when working with git, branches, worktrees, PRs, Linear issues/tasks, codegen, or CI.
user-invocable: false
---

# Parallel Workflow Rules

## Non-negotiable prerequisites

- **The Linear issue is the source of truth.** A Linear issue (in the **SWorld** team) is REQUIRED before starting any work. NEVER start working without one — if there isn't one, create it first (see `writing-task-specs`).
- **ALWAYS work in a dedicated worktree.** NEVER create branches or make changes in the main worktree. The main worktree must stay clean.

## Git fundamentals

- "main branch" ALWAYS means `origin/main` — fetch first with `git fetch origin main`. The local `main` is often stale.
- ALWAYS `git merge`, NEVER `git rebase`. This applies everywhere — syncing, resolving divergence, integrating changes.

## Before starting

1. Read the current Linear issue (`linear issue view SWO-NNN`) and confirm its `state`. All Linear operations go through the `linear` CLI via Bash — NEVER through Linear MCP tools (they authenticate as the wrong account).
2. Verify an issue exists for this work — a sub-issue under a feature's parent issue, or a standalone issue. If none exists, create it first (`writing-task-specs`).
3. Check the issue's blocking relations (`linear issue relation list SWO-NNN`); resolve those blockers first.
4. Set the issue's `state` to `In Progress` (`linear issue update SWO-NNN -s "In Progress"`) before starting.

## Creating a worktree

5. `git fetch origin main` first, then create worktree inside `.claude/worktrees/` from `origin/main`.
6. Name worktrees after the issue's slug — the kebab-case short form of its title, optionally prefixed with the identifier (e.g. `.claude/worktrees/swo-123-sticky-progress-bar`). This keeps worktrees self-contained, gitignored, and aligned with Claude Code's official default. Including the `SWO-NNN` identifier in the branch name lets the GitHub↔Linear integration auto-link the PR to the issue.
7. Copy `.env` files from the main worktree into the matching `apps/<app>/` directories. **Also copy `packages/core/.env`** — `pnpm codegen` reads `HASURA_GRAPHQL_URL` / `HASURA_ADMIN_SECRET` from it; without it codegen aborts with `Unable to find any GraphQL type definitions ... - undefined`.
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
- Run `pnpm codegen` in `packages/core` to regenerate GraphQL types. Needs `packages/core/.env` in the worktree (see step 7) — codegen introspects the live Hasura schema using the URL/secret from it.
- See `architecture` skill for GraphQL conventions (generated files, `graphql()` usage).

## Resolving conflicts

- ALWAYS fetch the latest main first: `git fetch origin main && git merge origin/main`. ALWAYS.
- NEVER rebase. ALWAYS merge.
- If conflicts are in codegen-generated files, take the changes from main and re-run `pnpm codegen` in `packages/core`.

## PR submission

- Create PR with `[WIP]` prefix (not draft).
- Reference the Linear issue in the PR description (e.g. `SWO-123`) so the integration links them.
- ALWAYS assign PR to the user (`--assignee "@me"`).
- Set the issue's `state` to `In Review` (`linear issue update SWO-NNN -s "In Review"`) after the PR is created.
- Ensure PR is independent and mergeable without other PRs.
- Run the CI loop after pushing.

## CI loop ("do the loop")

A strict sequential state machine. Each step is a **gate**. If any gate triggers a code change, push the fix, wait 6 minutes for CI, then **restart from Step 1**. NEVER proceed to the next step after fixing something. NEVER batch multiple steps in parallel.

Before entering the gates, push any unpushed local commits so the remote PR reflects the latest work.

### Step 1: Check merge status

- Run `gh pr view <number> --json state` as the **ONLY** command. Do NOT batch it with anything else.
- If `MERGED` → set the issue's `state` to `Done` (`linear issue update SWO-NNN -s "Done"`), clean up worktree + delete local branch. Loop is done.
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

## Issue state management

- States follow the SWorld team lifecycle: `Backlog → Todo → In Progress → In Review → Done`.
- A **project** is an app (Til, Watch, Listen, Game, Docs, Main) — a long-lived container, never marked `Done`. Only issues move through the lifecycle.
- Starting work on a large feature (even planning) → set the **parent issue** to `In Progress` (`linear issue update SWO-NNN -s "In Progress"`).
- Each sub-task **sub-issue** carries its own `state` (`Todo → In Progress → In Review → Done`), driven by the steps above.
- Last sub-issue of a parent done → set the **parent issue** to `Done`.

## Good PR criteria

- Clear goal, scope, and impact (before vs after).
- Clear steps to test.
- Constants-only PRs are safe to merge.
- Props drilling can touch many files but few lines — still a good PR.
- Renaming/refactoring across files is easy to review.
