# AGENTS.md

Always-on context for AI agents working in **sworld** — a personal Turborepo + pnpm monorepo holding the whole product (web apps, shared packages, backend, data layer). This file holds only what never changes: the scope, the gates, and the mindset. Everything tool-, command-, or architecture-specific lives in `.claude/skills/` (auto-triggered by task) or is derivable from the code — this file points at it rather than restating it, so there is one source of truth to keep current.

## Scope: this monorepo is the whole project

**All project work — every file you author, edit, or ship — lives under this monorepo and nowhere else.** Always launch Claude Code from the monorepo root; there are no sibling repos to reach into.

The one sanctioned location outside the monorepo is your global `~/.claude/` — where the tool keeps its own per-user state (memory, session transcripts, global settings). That is not project storage: it is personal and secret-adjacent, this repo is **public**, and the path is harness-owned, so it stays out by design. Never treat any directory above the monorepo as a project directory.

## Hard gate: plan before code — always

**You must NOT write a single line of code, propose implementation solutions, or suggest specific APIs/libraries until these steps are done:**

1. Load the `product-planning` skill and work through the concept with the user — interrogate motivation, constraints, and edge cases until shared understanding is reached
2. Create tracker subtask(s) via `writing-task-specs`
3. Get explicit user approval on the plan

Only after step 3 is complete may you write code. No proto, no scaffold, no "here's a quick implementation" — the plan comes first, always.

## Mandatory gates — never skip either loop

Two loops gate every change; neither is optional. Each is a skill that owns its own steps — this is the always-on reminder that they exist and are mandatory, not a restatement of them.

- **Loop A — Self-review, before creating a PR.** Never skip it. Owned by `parallel-workflow`.
- **Loop B — CI, after creating a PR and before merging.** Run the `ci-loop` skill and drive the PR to settled; never merge unless the user explicitly authorized it for that PR. Owned by `ci-loop`.

## How we work

You are part of this project and you own the code you ship. Be confident, be accountable, and be precise about what you're doing and why. The aim of everything below is one thing — the most confidence we can have in the product.

**First principles before code.** Don't write a line until the concept is genuinely clear. If the idea, the edge cases, or the downstream impact aren't thought through, that's a stop signal — not something to figure out as you go. Question assumptions, surface what's unclear, and stress-test the design before committing to it.

**Plan deeply, then ship fast.** Speed comes from the quality of the planning, not from cutting corners. Invest the time up front — think, iterate, pressure-test — then break the work into tracker issues and micro-PRs (see the `writing-task-specs`, `micro-prs`, and `parallel-workflow` skills). Deep planning is what makes fast, direct-to-main work safe.

**Default to less.** Before adding, ask whether you can delete or extend instead, and whether the platform already solves it — can an existing pattern, package, or tool do this for us? No cleverness for its own sake, no abstractions until there are 3+ real uses, no new dependencies without justification. Boring and proven beats clever; the most maintainable solution wins.

Every change should answer four questions:

1. Does it make the codebase simpler?
2. Does it help us ship faster?
3. Does it improve the user experience?
4. Can we delete code instead of adding it?

## Where knowledge lives

This file deliberately holds no app catalogue, tech-stack list, command reference, or directory map — those drift, and each already has a home. Reach for it there:

- **How to code** — the `.claude/skills/` conventions; they auto-trigger by task. Browse the directory for the full set.
- **Commands, scripts, tooling** — `package.json` (root and per-package) and the Turborepo pipeline. Local-dev traps live in `dev-environment-gotchas`.
- **Architecture & where code belongs** — `frontend-ui-architecture`, `backend-architecture`, `hasura-architecture`.
- **Tasks & requirements** — the source of truth for work is the **task tracker**, and a **project is an app**: every issue belongs to one. `task-tracker` owns which tracker it is and every command; `writing-task-specs` owns how to author specs; `parallel-workflow` owns how an issue's state moves as work ships.
- **Ops & auth** — media/prod-data operations in `backend-ops`; the `gh` / `GH_TOKEN` bootstrap and the whole git/worktree/PR flow in `parallel-workflow`.

## Compact instructions

When compacting, preserve: the current task/goal, decisions already made, the files touched and pending edits, and any commands still to run. Drop verbose tool output (full file dumps, large command logs, codegraph listings) — keep only the conclusions drawn from them.
