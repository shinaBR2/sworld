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
11. Self-review all work — this is a mandatory gate, not eyeballing the diff, and it is a **loop, not a single pass**. It gates **PR creation, NOT pushing** — commits are pushed freely and immediately (see step 14). When the work is done, BEFORE creating the PR:
    1. Run the `bug-hunt` skill on the working diff (`git diff origin/main`) — the mechanical finder: parallel finder agents across distinct lenses, then adversarial verification so only defects that survive an attempt to disprove them are reported. **This is the model-invocable finder, and it is what stamps the gate.** As of **Claude Code 2.1.215** the model can no longer self-invoke `/code-review` ("Claude no longer runs the `/verify` and `/code-review` skills on its own"), so do NOT try — the Skill tool refuses it with `disable-model-invocation`, and no amount of restarting or plugin fiddling changes that. `/code-review` remains available as a **user-typed** command and still stamps the gate when the user runs it, so treat it as an optional extra pass the user may add on high-risk diffs — never as a step you can perform or must wait on. **Anchor the review to the worktree:** pass the explicit command `git -C <absolute-worktree-path> diff origin/main`, since background agents run in the session's root cwd, NOT your worktree — an unanchored run silently diffs the wrong tree. **Then verify scope before trusting the result:** the changed files the review reports MUST match `git diff origin/main --name-only` in the worktree. A mismatch — or a "no changes found" result — means it mis-scoped; that is the gate FAILING, not a clean pass. Fix the anchoring and re-run. For any diff touching a **trust boundary** (Hasura permissions/metadata, Hono Action/Event/webhook handlers, auth), also run `security-reviewer`.
    2. Run the `reviewing-pull-requests` skill in self-review mode on the same diff — the judgment pass: sworld conventions, AI failure modes, reviewability, risk-scaled depth.
    3. Fix EVERYTHING actionable from both (dedupe overlapping findings — one fix), re-run lint/type-check, commit, push, and **restart this loop from sub-step 1**. Fixes are new code — they have NOT been reviewed and can introduce new defects. Never trust a fixing pass without re-reviewing it.
    4. Exit only when a full pass is clean on BOTH: **zero confirmed findings** from `bug-hunt` AND **verdict "Merge" with zero concerns** from `reviewing-pull-requests`. Never create a PR on hope.

    The local diff and the PR diff are the same thing — this loop does bugbot/CodeRabbit's job *before* the PR exists. **The bar: bugbot/CodeRabbit should find nothing.** A substantive bot finding on the PR means this gate failed. The goal: every PR that goes up is already a good PR.

    In this workspace this gate is also **mechanically enforced by a settings hook** (`PreToolUse(Bash)` denies `gh pr create` unless both review skills have run and are newer than the last edit) — so skipping it isn't just against convention, the tool call will be denied with a message saying what to run. The hook lives at `.claude/hooks/review-gate.sh` (wired up in `.claude/settings.local.json`). That means: invoke the review skills through the **Skill tool**, not by calling `Workflow` directly (e.g. a cached resume) — only a Skill-tool invocation stamps the gate. The stamps: `bug-hunt` (or a user-typed `/code-review`) sets `code_review`; `reviewing-pull-requests` sets `rpr`. The `last_edit` stamp itself only fires on `Write`/`Edit` tool calls, NOT on Bash — so a file write via Bash (a build, a formatter, a stray `sed`) after the final review does **not** re-flag it as stale, meaning it can silently ship unreviewed. Do all build/runtime verification (rebuilds, Playwright probes) **before** the final review pass, not after, and treat any `Write`/`Edit` after that point as forcing a fresh review — don't rely on the hook to catch everything.
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
