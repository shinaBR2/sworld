---
name: task-tracker
description: >-
  The single source of truth for WHICH task tracker we use and HOW to talk to it. Load this
  whenever you need to create, read, update, relate, or comment on a task/issue/project, or
  whenever another skill says "the task tracker", "the tracker issue", "the issue's state", or
  points at `task-tracker`. It owns the tool (Linear, via the `linear` CLI — never the Linear
  MCP), auth, the SWorld team and `SWO` key, the project-is-an-app model, the
  Backlog→Todo→In Progress→In Review→Done lifecycle, and the issue/relation/document
  intents (CLI mechanics in `references/linear-cli.md`). Reach for it any time a workflow step
  talks to the tracker or names a tracker concept, even when the triggering skill refers to
  "the issue" only generically.
---

# Task Tracker

Every skill that plans, specs, or ships work talks to a task tracker — but only this skill owns
*which tracker it is and how to call it*. The others (`writing-task-specs`, `parallel-workflow`,
`product-planning`, `wait-for-pr-merge`, `pr-descriptions`, …) speak in tracker-neutral terms —
"the task tracker", "the issue", "the issue's state" — and point here for the actual tool and
commands. The split is deliberate: if we ever switch trackers, this one skill changes and every
other skill keeps working unedited. So keep tracker specifics *here*, never scattered across the
skills that consume them — that scattering is exactly the drift `skill-creator`'s reuse-not-duplicate
rule warns against.

## The tracker: Linear

Our tracker is **Linear**. There is no in-repo task tracker — issues, projects, and documents all
live in Linear.

- **Team:** everything goes in the **SWorld** team, key `SWO`. Identifiers look like `SWO-123` —
  Linear assigns them, you never pick one.
- **Tool:** the **`linear` CLI**, run through Bash. Its setup, workspace-resolution trap, and
  driving gotchas live in `references/linear-cli.md` — read that before running commands.
- **Never the Linear MCP.** A connected Linear MCP server authenticates as the *wrong account* —
  never use `mcp__*Linear*` tools for any tracker operation. If the CLI is missing or broken, stop
  and tell the user; do not fall back to MCP.

## The project-is-an-app model

**A `project` is an app** — the long-lived container for everything in one app: `Til`, `Watch`,
`Listen`, `Game`, `Docs`, and `Main` (the main app, covering its finance, journal, and library
areas). A project is *never* a single feature, and is **never marked `Done`**. Every issue belongs
to exactly one project — its app. For a brand-new app surface, create the project with
`linear project create` first.

## The state lifecycle

Every issue moves through the **SWorld team lifecycle**, in order:

```text
Backlog → Todo → In Progress → In Review → Done
```

- **Backlog** — captured, not yet ready to work (e.g. an unscoped user story).
- **Todo** — ready to pick up.
- **In Progress** — actively being worked (set before starting).
- **In Review** — a PR is open for it.
- **Done** — merged and cleaned up.

Only *issues* move through this lifecycle; a *project* (an app) never does. `parallel-workflow`
owns *when* each transition happens as work ships — this skill owns the vocabulary and the fact that
a transition is a `linear issue` update to the target state (discover the exact flag via `--help`).

### Status changes: three moments, and what each needs today

An issue's status only ever changes at **three moments** in the work — *start working on it*,
*it's ready for review*, *it's done*. That's fixed no matter the tooling; consumers just recognise
the moment and defer here. What each moment does in our current GitHub↔Linear setup:

1. **You start working on something** → set the issue to `In Progress`, **by hand** — the integration
   doesn't cover this one (a `linear issue` state update; flags via `--help`). This is the **only**
   status change you ever make yourself.
2. **It's ready for review** → opening the PR auto-moves the issue to `In Review` (the integration,
   keyed off the `SWO-NNN` in the branch / PR body — see *The GitHub link* below). Nothing to do.
3. **It's done** → merging auto-moves the issue to `Done` **only when the PR uses a closing keyword**
   (`Fixes`/`Closes SWO-NNN`); a bare `Refs SWO-NNN` links and reviews but does *not* close on merge
   (see *The GitHub link*). A parent auto-closes once its last child is `Done`. Verify the final state
   after the last merge rather than assuming it.

So in practice you touch status exactly once — at the start; moments 2 and 3 happen on their own.

## Command mechanics

Drive the CLI by *intent* and discover the exact current flags at runtime. The setup, the
workspace-resolution trap, and the stable gotchas (resolve-by-name, markdown-body-as-a-file,
create-non-interactively, id-read-from-the-branch) all live in `references/linear-cli.md` — read
it before running commands. What this skill owns is *what* each intent maps to:

### What you can do, and where it maps

| Intent | Where |
|---|---|
| Create / read / update / comment on an **issue** | `linear issue …` — set team `SWO`, the app `project`, a lifecycle `state`; optionally an estimate, label(s), and a `parent` (`SWO-NNN`) |
| Record a **dependency** — the `blocked-by` edge that encodes waves | `linear issue relation …` (add / remove / list). `dependency-analysis` owns *when* a blocker is earned (the real-vs-fake test); this skill owns only that the edge is a `blocked-by` relation |
| Create a **project** (new app surface only) | `linear project …` |
| Create a **document** (a heavy concept spec) | `linear document …` — attached to the app's project |

### The field mapping

What an in-repo tracker would keep in a file's frontmatter, Linear keeps as native fields, all set
through `linear issue`:

| Frontmatter concept | Linear field |
|---|---|
| `status:` | the issue **state** (from the lifecycle above) |
| `estimate:` | the issue **estimate** |
| which app | the **project** |
| `parent:` (which feature) | the **parent** issue (`SWO-NNN`) |
| `blocked-by:` | a **`blocked-by` relation** between issues |
| bug / user-story tagging | one or more **labels** |

## The GitHub link

The issue identifier (`SWO-NNN`) is what ties an issue to its code, so it drives the worktree
name: a kebab-case slug **prefixed with the identifier**, e.g. `swo-123-sticky-progress-bar` — the
name you pass `EnterWorktree`. Claude Code creates the branch from that name with a `worktree-`
prefix (`worktree-swo-123-sticky-progress-bar`); the embedded `SWO-NNN` is what lets the
GitHub↔Linear integration auto-link the PR to the issue — and, once linked, fire the automatic
status transitions above (PR opened → `In Review`). The identifier is matched *anywhere* in the
branch name (not anchored to the start), so the `worktree-` prefix breaks neither the Linear link
nor the repo's local branch-ticket parser. Referencing `SWO-NNN` in the PR description links it too.

**Linking and closing are different, though.** A link (branch name, or a bare `Refs SWO-NNN` in the
body) is enough to move the issue to `In Review` on open — but the merged → `Done` transition fires
only for a **closing keyword** (`Fixes`/`Closes SWO-NNN`). A PR that merely *references* the issue
leaves it in `In Review` after merge, so confirm the final state rather than assuming the merge
closed it. Consumers (`parallel-workflow`, `pr-descriptions`, …) just follow this convention and
point here; they carry none of these specifics.
