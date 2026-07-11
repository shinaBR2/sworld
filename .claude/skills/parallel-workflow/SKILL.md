---
name: parallel-workflow
description: Enforces the parallel subtask workflow using Linear issues, git worktrees, and PRs. Auto-triggers when working with git, branches, worktrees, PRs, Linear issues/tasks, codegen, or CI.
user-invocable: false
---

# Parallel Workflow Rules

## Non-negotiable prerequisites

- **The Linear issue is the source of truth.** A Linear issue (in the **SWorld** team) is REQUIRED before starting any work. NEVER start working without one — if there isn't one, create it first (see `writing-task-specs`).
- **ALWAYS work in a dedicated worktree.** NEVER create branches or make changes in the main worktree. The main worktree must stay clean — the *only* permitted operation there is `git pull --ff-only origin main` (run in each of the three repo worktrees as needed) to advance local `main` (a fast-forward, which updates the branch pointer and the tracked files in the checkout). No branch work, no manual edits. See Git fundamentals.

## Scope: all three repos

This workflow applies to the whole workspace — **sworld** (frontend), **sworld-backend** (Hono), and **sworld-hasura-v2** (Hasura) — not just the frontend. Same rules everywhere: Linear issue first, dedicated worktree, commit often / push immediately, self-review loop before PR, CI loop after. Repo-specific adjustments:

- **Substitute the repo name in `gh` commands.** The CI-loop Step 3 GraphQL query below takes a `name:"<repo>"` placeholder — fill in `sworld`, `sworld-backend`, or `sworld-hasura-v2`. Querying the wrong repo silently returns nothing.
- **Worktree setup steps 7–8 are frontend-specific** (.env copies into `apps/<app>/`, `packages/core/.env`, `pnpm install`). In a sibling repo, follow that repo's own setup instead.
- **Trust boundaries get the deep treatment.** Hasura permissions/metadata and Hono Action/Event/webhook handlers are trust boundaries — in those repos the self-review loop (step 11) MUST also include the `security-reviewer` skill, not just the two general review skills.
- **Hasura changes are not done when their PR is clean.** A schema change ripples into the frontend: apply the migration locally, re-run `pnpm codegen` in `packages/core` (it introspects the LOCAL Hasura), and land the regenerated types as a follow-up frontend PR — linked in Linear with a blocking relation from the Hasura issue.

## Git fundamentals

- "main branch" ALWAYS means `origin/main` — fetch first with `git fetch origin main`. The local `main` is often stale.
- ALWAYS `git merge`, NEVER `git rebase`. This applies everywhere — syncing, resolving divergence, integrating changes.
- **Sync before analyzing, not just before coding.** Before exploring or reasoning about code anywhere in this workspace (any of the three repos), check `git status` and pull/fast-forward to `origin/main` first. Analyzing a stale checkout produces wrong conclusions and clarifying questions that contradict what's actually on main.

### Keep local `main` fresh

Fetching only advances the `origin/main` **ref** — the local `main` branch pointer stays stale, so any lazy reference to local `main` (a code read, a diff, a new worktree base) is wrong. Because of the parallel-worktree workflow, local `main` is *chronically* behind. So also keep the local pointer current: run **`git pull --ff-only origin main` in the relevant repo's main worktree** (each of the three repos has its own `.git` and its own `main`). Run it in *every* repo whose `main` you are about to read off or branch from. Name the `origin main` target explicitly so the pull can't depend on — or advance — the wrong upstream. `--ff-only` so a diverged `main` errors loudly instead of silently creating a merge commit.

Run it:

1. After every merged-worktree cleanup (see loop Step 1) — for the repo whose PR just merged.
2. Before starting new work / before any code read on `main` in that repo.
3. **Standalone, on demand** — whenever the user says "refresh main", "update main", "pull main", or any equivalent. Just run it in the relevant main worktree(s) and report the result; it is a one-command action per repo, never a question. If the user doesn't name a repo, run it for all three (`sworld`, `sworld-backend`, `sworld-hasura-v2`).

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

Once a breakdown or plan is approved, work through it without pausing to reconfirm each step: don't ask "want me to start the next one?" between already-planned sub-issues/PRs — proceed automatically when one finishes and the next is unblocked, reporting progress as you go. Only stop to ask when there's a genuine decision the plan didn't settle: a real fork, a destructive/irreversible action, or new ambiguity.

9. The 3 files limit is soft — more is fine if changes are small, cohesive, and easy to review.
10. NEVER bypass commit hooks — code MUST be formatted, linted, and type-checked.
11. Self-review all work — this is a mandatory gate, not eyeballing the diff, and it is a **loop, not a single pass**. It gates **PR creation, NOT pushing** — commits are pushed freely and immediately (see step 14). When the work is done, BEFORE creating the PR:
    1. Run the `code-review` skill (`/code-review`) at **high** effort on the working diff (`git diff origin/main`) — the mechanical finder: verified correctness/quality findings. **Anchor it to the worktree:** the high-effort review spawns background agents that run in the session's root cwd, NOT your worktree, so an unanchored run silently diffs the wrong tree and reviews the wrong commit. Either run the review inline in the worktree, or pass the explicit command `git -C <absolute-worktree-path> diff origin/main`. **Then verify scope before trusting the result:** the changed files the review reports MUST match `git diff origin/main --name-only` in the worktree. A mismatch — or a "no changes found" result — means it mis-scoped; that is the gate FAILING, not a clean pass. Fix the anchoring and re-run.
    2. Run the `reviewing-pull-requests` skill in self-review mode on the same diff — the judgment pass: sworld conventions, AI failure modes, reviewability, risk-scaled depth.
    3. Fix EVERYTHING actionable from both (dedupe overlapping findings — one fix), re-run lint/type-check, commit, push, and **restart this loop from sub-step 1**. Fixes are new code — they have NOT been reviewed and can introduce new defects. Never trust a fixing pass without re-reviewing it.
    4. Exit only when a full pass is clean on BOTH: **zero confirmed findings** from `/code-review` AND **verdict "Merge" with zero concerns** from `reviewing-pull-requests`. Never create a PR on hope.

    The local diff and the PR diff are the same thing — this loop does bugbot/CodeRabbit's job *before* the PR exists. **The bar: bugbot/CodeRabbit should find nothing.** A substantive bot finding on the PR means this gate failed. The goal: every PR that goes up is already a good PR.

    In this workspace this gate is also **mechanically enforced by a settings hook** (`PreToolUse(Bash)` denies `gh pr create` unless both review skills have run and are newer than the last edit) — so skipping it isn't just against convention, the tool call will be denied with a message saying what to run. That means: run `/code-review` through the **Skill tool**, not by calling `Workflow` directly (e.g. a cached resume) — only a Skill-tool invocation stamps the gate. The `last_edit` stamp itself only fires on `Write`/`Edit` tool calls, NOT on Bash — so a file write via Bash (a build, a formatter, a stray `sed`) after the final review does **not** re-flag it as stale, meaning it can silently ship unreviewed. Do all build/runtime verification (rebuilds, Playwright probes) **before** the final review pass, not after, and treat any `Write`/`Edit` after that point as forcing a fresh review — don't rely on the hook to catch everything.
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

- Query via GitHub **GraphQL API** (REST doesn't expose resolved status). Substitute `<repo>` with the repo the PR actually lives in — `sworld`, `sworld-backend`, or `sworld-hasura-v2` — and `NUMBER` with the PR number. Querying the wrong repo silently returns nothing:
  ```bash
  gh api graphql -f query='{ repository(owner:"ShinaBR2", name:"<repo>") { pullRequest(number:NUMBER) { reviewThreads(first:100) { nodes { isResolved comments(first:1) { nodes { body path line } } } } } } }'
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
- **Known non-blocking checks** — confirm the specific failure mode before waving these through, then gate on `test` + CodeRabbit instead:
  - **Argos visual-regression** (`argos/Listen E2E`) does a pixel-perfect diff against the anonymous home, which is data-driven (real Firebase preview + prod Hasura, no mocking) — it reports "changed" whenever the underlying data changes, not just on real UI regressions. Root-cause fix tracked in SWO-310 (mask the data-driven pixels). If the diff is plausibly a genuine intended UI change, say so — it needs approving in Argos, not dismissing.
  - **`prod_deploy` / Deploy Preview 429** (`RESOURCE_EXHAUSTED: channel quota reached`) — Firebase Hosting preview channels are per-app-per-PR with a 7-day TTL; a burst of PRs exhausts a site's quota, and it can fire on an app the PR doesn't even touch. Confirm by grepping the failed job log for `429`/`RESOURCE_EXHAUSTED` — a different `prod_deploy` failure still needs investigating.

### Merging — never automatic

- **DEFAULT: never merge.** The user reviews every PR themselves. The loop's terminal action for an OPEN, settled PR is ALWAYS "report to the user that it's ready" — merging is a separate, explicit action taken only when the user has authorized it for that PR (e.g. "you can merge" / "merge when settled").
- **A PR is "settled"** when the loop has run to completion and every gate is green AND stable: OPEN + mergeable (no conflicts), CI fully passed (nothing `pending`, no failures), and zero unresolved review threads. `pending` is not `pass` — never act on an unsettled gate.
- **"You can auto merge when clean" means:** run the full loop until the PR is settled, THEN merge it yourself. It does NOT mean skip the flow and merge now, and it never means skip the review-comment gate (Step 3) — that is the single most important gate, since a green bugbot/CodeRabbit *check* says nothing about whether they left real comments.
- **Never delegate the merge condition to `gh pr merge --auto`.** In this repo it merges the instant the PR is mergeable — GitHub auto-merge only waits on *required* status checks, and this repo's branch protection defines none, so it does not wait for `test`/`prod_deploy`/E2E to go green. Run the full CI loop yourself — Steps 1–4 above, including Step 4's `gh pr checks` — then run `gh pr merge --squash` manually once settled. Skipping straight to Steps 1–3 and merging without Step 4 ships whatever CI state happens to be current, which given this workspace's merge-is-deploy model means shipping broken code to production.
- Any fix mid-loop → push → wait 6 minutes → restart from Step 1. A new instruction mid-task folds into this process; it never cancels it or justifies a shortcut.

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
