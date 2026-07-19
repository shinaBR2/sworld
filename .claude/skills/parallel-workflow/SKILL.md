---
name: parallel-workflow
description: Enforces the parallel subtask workflow using tracker issues, git worktrees, and PRs. Auto-triggers when working with git, branches, worktrees, PRs, tracker issues/tasks, codegen, or CI.
user-invocable: false
---

# Parallel Workflow Rules

## Non-negotiable prerequisites

- **The tracker issue is the source of truth.** A tracker issue is REQUIRED before starting any work. NEVER start working without one — if there isn't one, create it first (see `writing-task-specs`; `task-tracker` owns the tracker itself and its commands).
- **ALWAYS work in a dedicated worktree.** NEVER create branches or make changes in the main worktree. The main worktree must stay clean — the *only* permitted operation there advances the local `main` ref (the fast-forward refresh the `cleanup` skill owns — see "Keep local `main` fresh" below). No branch work, no manual edits.

## Scope: all three repos

This workflow applies to the whole workspace — **sworld** (frontend), **sworld-backend** (Hono), and **sworld-hasura-v2** (Hasura) — not just the frontend. Same rules everywhere: tracker issue first, dedicated worktree, commit often / push immediately, self-review loop before PR, CI loop after. Repo-specific adjustments:

- **Substitute the repo name in `gh` commands.** Every `gh` / GraphQL call is repo-scoped — fill in `sworld`, `sworld-backend`, or `sworld-hasura-v2`. Querying the wrong repo silently returns nothing. (The `ci-loop` gate queries carry the same rule.)
- **Worktree setup steps 7–8 are frontend-specific** (.env copies into `apps/<app>/`, `packages/core/.env`, `pnpm install`). In a sibling repo, follow that repo's own setup instead.
- **Trust boundaries get the deep treatment.** Hasura permissions/metadata and Hono Action/Event/webhook handlers are trust boundaries — in those repos the self-review loop (step 11) MUST also include the `security-reviewer` skill, not just the two general review skills.
- **Hasura changes are not done when their PR is clean.** A schema change ripples into the frontend: apply the migration locally, re-run `pnpm codegen` in `packages/core` (it introspects the LOCAL Hasura), and land the regenerated types as a follow-up frontend PR — linked in the tracker with a blocking relation from the Hasura issue.

## Git fundamentals

- "main branch" ALWAYS means `origin/main` — fetch first with `git fetch origin main`. The local `main` is often stale.
- ALWAYS `git merge`, NEVER `git rebase`. This applies everywhere — syncing, resolving divergence, integrating changes.
- **Sync before analyzing, not just before coding.** Before exploring or reasoning about code anywhere in this workspace (any of the three repos), check `git status` and pull/fast-forward to `origin/main` first. Analyzing a stale checkout produces wrong conclusions and clarifying questions that contradict what's actually on main.

### Keep local `main` fresh

Fetching only advances the `origin/main` **ref** — the local `main` branch pointer stays stale, so any lazy reference to local `main` (a code read, a diff, a new worktree base) is wrong. Because of the parallel-worktree workflow, local `main` is *chronically* behind — keep the pointer current in **every** repo whose `main` you are about to read off or branch from.

The refresh mechanic and every trigger for it are owned by the `cleanup` skill — see `cleanup`. Refresh a repo's `main` before you start new work in it or read off it.

## Before starting

1. Read the current tracker issue and confirm its `state` (see `task-tracker`).
2. Verify an issue exists for this work — a sub-issue under a feature's parent issue, or a standalone issue. If none exists, create it first (`writing-task-specs`).
3. Check the issue's blocking relations (see `task-tracker`); resolve those blockers first.
4. **Analyse before you build, then start.** For any non-trivial issue — especially a large-feature parent or a reworked/reopened one — run the `analyze` skill on the ticket + its breakdown first: it re-derives requirements (via `grill-me`'s completeness sweep) and checks the breakdown is still internally consistent (stale blockers, parent drift, deploy-order encoded as real relations) before a line of code. Reconcile what it flags as fixable; raise anything that changes scope with the owner. **Let its verdict gate the advance:** if analyze concludes the breakdown needs the owner to resolve blocking findings first, stop at raising them — don't start building against a breakdown they haven't signed off (non-gating still holds — you surface and offer, you just don't unilaterally build past an unresolved blocker). Once analyze's verdict is safe-to-build — as-is or after the reconciling edits — or the owner says go, start the issue in the tracker (see `task-tracker`) before touching code. Skip the whole pass only for a trivial single-issue change with nothing to audit.

## Creating a worktree

5. `git fetch origin main` first, then create worktree inside `.claude/worktrees/` from `origin/main`.
6. Create the worktree under `.claude/worktrees/` — self-contained, gitignored, and aligned with Claude Code's official default — named for the issue per `task-tracker`'s branch convention.
7. Copy `.env` files from the main worktree into the matching `apps/<app>/` directories. **Also copy `packages/core/.env`** — `pnpm codegen` reads `HASURA_GRAPHQL_URL` / `HASURA_ADMIN_SECRET` from it; without it codegen aborts with `Unable to find any GraphQL type definitions ... - undefined`.
8. Run `pnpm install` in each worktree.

## During work

Once a breakdown or plan is approved, work through it without pausing to reconfirm each step: don't ask "want me to start the next one?" between already-planned sub-issues/PRs — proceed automatically when one finishes and the next is unblocked, reporting progress as you go. Only stop to ask when there's a genuine decision the plan didn't settle: a real fork, a destructive/irreversible action, or new ambiguity.

9. The 3 files limit is soft — more is fine if changes are small, cohesive, and easy to review.
10. NEVER bypass commit hooks — code MUST be formatted, linted, and type-checked.
11. **Self-review before creating the PR** — run the `self-review` skill and follow it to a clean exit. It gates PR creation, not pushing (see step 14).
12. Always verify `git branch --show-current` before committing.
13. Don't dismiss automated review findings without thorough verification.
14. Commit often and push immediately — never ask, just do it. Pushing is **backup, not publication**: a pushed branch with no PR is invisible, and it means a broken laptop loses zero work. Pushing is NEVER gated; only PR creation is (step 11).

## Codegen

- ALWAYS `git fetch origin main && git merge origin/main` before running codegen.
- Run `pnpm codegen` in `packages/core` to regenerate GraphQL types. Needs `packages/core/.env` in the worktree (see step 7) — codegen introspects the live Hasura schema using the URL/secret from it.
- See `architecture` skill for GraphQL conventions (generated files, `graphql()` usage).

## Resolving conflicts

- ALWAYS fetch the latest main first: `git fetch origin main && git merge origin/main`. ALWAYS.
- NEVER rebase. ALWAYS merge.
- If conflicts are in codegen-generated files, take the changes from main and re-run `pnpm codegen` in `packages/core`.

## PR submission

- A PR may ONLY be created after the self-review loop (step 11) has exited clean on BOTH review skills. Pushing commits needs no gate; creating the PR does.
- Create PR with `[WIP]` prefix (not draft).
- Reference the tracker issue in the PR description (see `task-tracker`).
- ALWAYS assign PR to the user (`--assignee "@me"`).
- Ensure PR is independent and mergeable without other PRs.
- Run the `ci-loop` skill after pushing.

## CI loop ("do the loop")

Once the PR is up, hand off to the **`ci-loop`** skill to drive it to settled. See `ci-loop`.

## Issue state management

An issue's status changes at exactly three moments — you **start** it, it's **ready for review**, it's **done**. Those moments are the workflow's; what each one requires — a manual step or nothing at all — is the tracker's. At every moment, do what `task-tracker` says. Starting a large-feature parent (even just to plan it) is a "start" moment too.

## Good PR criteria

- Clear goal, scope, and impact (before vs after).
- Clear steps to test.
- Constants-only PRs are safe to merge.
- Props drilling can touch many files but few lines — still a good PR.
- Renaming/refactoring across files is easy to review.
