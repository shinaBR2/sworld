---
name: task-tracker
description: >-
  The single source of truth for WHICH task tracker we use and HOW to talk to it. Load this
  whenever you need to create, read, update, relate, or comment on a task/issue/project, or
  whenever another skill says "the task tracker", "the tracker issue", "the issue's state", or
  points at `task-tracker`. It owns the tool (Linear, via the `linear` CLI — never the Linear
  MCP), auth, the SWorld team and `SWO` key, the project-is-an-app model, the
  Backlog→Todo→In Progress→In Review→Done lifecycle, and the exact issue/relation/document
  command forms. Reach for it any time a workflow step runs a `linear …` command or names a
  tracker concept, even when the triggering skill refers to "the issue" only generically.
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
- **Tool:** the **`linear` CLI** ([schpet/linear-cli](https://github.com/schpet/linear-cli),
  installed via `brew install schpet/tap/linear`, authenticated with `linear auth login`), run
  through Bash.
- **Never the Linear MCP.** A connected Linear MCP server authenticates as the *wrong account* —
  never use `mcp__*Linear*` tools for any tracker operation. If the CLI is missing or broken, stop
  and tell the user; do not fall back to MCP.
- **For anything the CLI doesn't expose** (e.g. querying parent/sub-issue relationships), use
  `linear auth token` + a direct Linear GraphQL API call with curl.

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
owns *when* each transition happens as work ships — this skill owns the vocabulary and the command
that performs a transition (`linear issue update SWO-NNN -s "<state>"`).

## Command mechanics

The CLI resolves `--state`, `--project`, and `--label` **by name** (e.g. `-s "In Progress"`,
`--project "Main"`) to the workspace's IDs — you never pass raw UUIDs. Pass markdown bodies with
`--description-file` (issues) / `--content-file` or `-f` (documents) rather than inline strings,
and add `--no-interactive` when creating issues so it never prompts.

### Issues

| Intent | Command |
|---|---|
| Create | `linear issue create --team SWO --project "<app>" -s "<state>" [--estimate N] [-l <label>] [--parent SWO-NNN] -t "<title>" --description-file <file.md> --no-interactive` |
| Read | `linear issue view SWO-NNN` |
| Update (e.g. state) | `linear issue update SWO-NNN -s "<state>"` |
| Comment | `linear issue comment add SWO-NNN --body-file <file.md>` |

### Relations (dependencies / waves)

- Add a dependency: `linear issue relation add SWO-<child> blocked-by SWO-<dep>`
- Remove one: `linear issue relation delete SWO-<child> blocked-by SWO-<dep>`
- List an issue's relations: `linear issue relation list SWO-NNN`

`blocked-by` is the dependency edge; a set of them is what encodes waves. `writing-task-specs` owns
*when* a blocker is earned; this skill owns the command that records it.

### Projects & documents

- Create a project (new app surface only): `linear project create`
- Create a document (a heavy concept spec): `linear document create --project "<app>" -t "<title>" -f <doc.md>`

### The field mapping

What an in-repo tracker would keep in a file's frontmatter, Linear keeps as native fields:

| Frontmatter concept | Linear field (via `linear issue create` / `update`) |
|---|---|
| `status:` | `-s/--state` — a state from the lifecycle above |
| `estimate:` | `--estimate` |
| which app | `--project` |
| `parent:` (which feature) | `--parent SWO-NNN` |
| `blocked-by:` | `linear issue relation add SWO-child blocked-by SWO-dep` |
| bug / user-story tagging | `-l/--label` (repeatable) |

## The GitHub link

Putting the `SWO-NNN` identifier in a PR's branch name lets the GitHub↔Linear integration auto-link
the PR to the issue — so name branches with the issue slug (see `parallel-workflow`). Referencing
`SWO-NNN` in the PR description links it too.
