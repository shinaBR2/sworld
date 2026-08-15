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

# Task Tracker

This skill owns *which* task tracker we use and *how* to call it. Other skills
(`writing-task-specs`, `parallel-workflow`, `pr-descriptions`, …) speak in tracker-neutral
terms — "the task tracker", "the issue", "the issue's state" — and point here. Keep every
tracker specific in this one file so a future tracker switch touches only this skill.

## The tracker: Linear

Our tracker is **Linear** — issues, projects, and documents all live there, none in-repo.

- **Team:** the **SWorld** team, key `SWO`. Identifiers look like `SWO-123`; Linear assigns
  them, you never pick one.
- **Tool:** the **`linear` CLI**, run through Bash.
- **Never the Linear MCP.** A connected Linear MCP server authenticates as the *wrong
  account*. If the CLI is missing or broken, stop and tell the user — never fall back to MCP.

## The project-is-an-app model

**A `project` is an app** — the long-lived container for everything in one app. It is *never*
a single feature, and is **never marked `Done`**. Every issue belongs to exactly one project —
its app; for a brand-new app surface, create the project first. The app roster and the
documented non-app exceptions (e.g. **Tooling**) live in `.claude/references/apps.md`.

## The state lifecycle

Every issue moves through the **SWorld team lifecycle**, in this order:

```text
Backlog → Todo → In Progress → In Review → Done
```

`Backlog` is captured-but-not-ready (e.g. a feature's parent ticket holding just its user
story, not yet broken into children); `Todo` is ready to pick up. `Canceled` / `Duplicate`
are the other, terminal endings — like `Done`, never reopen one. Only *issues* move through
this lifecycle; a project (an app) never does. `parallel-workflow` owns *when* each transition
happens.

### Status changes happen at three moments — you touch only the first

1. **You start work** → set the issue to `In Progress` **by hand**. This is the only status
   change you ever make yourself; the integration doesn't cover it.
2. **The PR opens** → the GitHub↔Linear integration auto-moves the issue to `In Review`.
3. **The PR merges** → it auto-moves to `Done`, *but only* when the PR uses a closing keyword
   (see *The GitHub link*). A parent auto-closes once its last child is `Done`. Confirm the
   final state after the last merge rather than assuming it.

## What you track

- **Issue** — the unit of work: on team `SWO`, in one app `project`, with a lifecycle `state`;
  optionally an estimate, label(s), and a `parent` (`SWO-NNN`). Give it a plain, specific title
  — no `[bracket]` prefixes; the project and labels already carry that grouping. A bug carries
  the `bug` label.
- **Dependency** — a `blocked-by` edge between issues, which is how waves are encoded.
  `dependency-analysis` owns *when* a blocker is earned; this skill owns only that the edge is
  `blocked-by`.
- **Project** — an app surface (see the model above); created only for a brand-new app.
- **Document** — a heavy concept spec, attached to its app's project.

## The GitHub link

The `SWO-NNN` identifier is what ties an issue to its code and drives the integration. Put it
in the worktree name — a kebab-case slug prefixed with the identifier, e.g.
`swo-123-sticky-progress-bar` (the name you pass `EnterWorktree`). It is matched *anywhere* in
the branch name, so the `worktree-` prefix Claude Code adds breaks neither the Linear link nor
the repo's local branch-ticket parser. Referencing `SWO-NNN` in the PR body links it too.

**Linking and closing differ.** A link (branch name, or a bare `Refs SWO-NNN` in the body)
moves the issue to `In Review` on PR open, but the merge → `Done` transition fires only for a
**closing keyword** (`Fixes`/`Closes SWO-NNN`). A PR that merely references the issue leaves it
in `In Review` after merge — so confirm the final state rather than assuming the merge closed it.
