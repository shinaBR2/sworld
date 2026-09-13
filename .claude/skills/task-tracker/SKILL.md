---
name: task-tracker
description: >-
  The single source of truth for WHICH task tracker we use and HOW to talk to it. Load this
  whenever you need to create, read, update, relate, or comment on a task/issue/project, or
  whenever another skill says "the task tracker", "the tracker issue", "the issue's state", or
  points at `task-tracker`. It owns the tool (Linear, via the `linear` CLI — never the Linear
  MCP), auth, the SWorld team and `SWO` key, the project-is-an-app model, the
  Backlog→Todo→In Progress→In Review→Done lifecycle, and the issue/relation/document
  intents. Reach for it any time a workflow step
  talks to the tracker or names a tracker concept, even when the triggering skill refers to
  "the issue" only generically.
---

* task-tracker: the single source of truth for which task tracker we use and exactly how to talk to it.

* Rules
  * Our tracker is Linear — issues, projects, and documents all live there, none in-repo.
  * Keep every tracker specific in this one file so a future tracker switch touches only this skill, and let other skills (`writing-task-specs`, `parallel-workflow`, `pr-descriptions`, …) speak in tracker-neutral terms and point here.
  * Work happens on the SWorld team, key `SWO` — identifiers look like `SWO-123` and Linear assigns them, you never pick one.
  * Talk to Linear only through the `linear` CLI, run through Bash.
  * Never use the Linear MCP — a connected Linear MCP server authenticates as the wrong account, so if the CLI is missing or broken, stop and tell the user rather than falling back to MCP.
  * A `project` is an app — the long-lived container for everything in one app, never a single feature and never marked `Done`.
  * Every issue belongs to exactly one project (its app), and for a brand-new app surface you create the project first.
    * app roster and documented non-app exceptions (e.g. Tooling): [`.claude/references/apps.md`](../../references/apps.md)
  * Every issue moves through the SWorld team lifecycle, in order.
    * `Backlog → Todo → In Progress → In Review → Done`
  * `Backlog` is captured-but-not-ready (e.g. a feature's parent ticket holding just its user story, not yet broken into children) and `Todo` is ready to pick up.
  * `Canceled` / `Duplicate` are the other, terminal endings — like `Done`, never reopen one.
  * Only issues move through this lifecycle; a project (an app) never does, and `parallel-workflow` owns when each transition happens.
  * An Issue is the unit of work — on team `SWO`, in one app `project`, with a lifecycle `state`, optionally an estimate, label(s) and a `parent` (`SWO-NNN`) — given a plain, specific title with no `[bracket]` prefixes since the project and labels already carry that grouping, and a bug carries the `bug` label.
  * A Dependency is a `blocked-by` edge between issues, which is how waves are encoded — `dependency-analysis` owns when a blocker is earned, this skill owns only that the edge is `blocked-by`.
  * A Project is an app surface, created only for a brand-new app.
  * A Document is a heavy concept spec, attached to its app's project.
  * The `SWO-NNN` identifier ties an issue to its code and drives the integration: put it in the worktree name as a kebab-case slug prefixed with the identifier (e.g. `swo-123-sticky-progress-bar`, the name you pass `EnterWorktree`), where it is matched anywhere in the branch name so the `worktree-` prefix Claude Code adds breaks neither the Linear link nor the repo's local branch-ticket parser, and referencing `SWO-NNN` in the PR body links it too.
  * Linking and closing differ — a link (the branch name, or a bare `Refs SWO-NNN` in the body) moves the issue to `In Review` on PR open, but the merge → `Done` transition fires only for a closing keyword (`Fixes`/`Closes SWO-NNN`), so a PR that merely references the issue leaves it in `In Review` after merge and you confirm the final state rather than assuming the merge closed it.

* Steps
  1. When you start work, set the issue to `In Progress` by hand — the only status change you ever make yourself, since the integration doesn't cover it.
  2. When the PR opens, the GitHub↔Linear integration auto-moves the issue to `In Review`.
  3. When the PR merges, it auto-moves to `Done` only if the PR used a closing keyword, a parent auto-closes once its last child is `Done`, and you confirm the final state after the last merge rather than assuming it.
