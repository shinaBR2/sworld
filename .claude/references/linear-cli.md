# Linear CLI mechanics

The mechanics of driving our task tracker from the command line. `task-tracker`
owns the *policy* (that the tracker is Linear, the `linear` CLI, never the MCP,
the lifecycle, the project-is-an-app model); this file holds only the CLI
mechanics that don't belong in a policy skill. Drive the CLI by intent and
confirm the current flags at runtime — `linear --help`, then
`linear <noun> [<verb>] --help`. Don't freeze a flag list; a third-party CLI
version bump can rename one and leave a stale command that silently misbehaves.

## Setup

- Install: the [schpet/linear-cli](https://github.com/schpet/linear-cli) tap
  (`brew install schpet/tap/linear`).
- Authenticate: `linear auth login`.

## Workspace resolution — the worktree trap

The CLI resolves its workspace from **`.linear.toml` at the checkout root** and
never walks up to a parent. That file is gitignored, so a fresh worktree starts
without one and the CLI silently falls back to the account's default
workspace — which is **not** `sworld`: reads return another workspace's data,
writes fail with `Team not found: SWO`. The repo's `.worktreeinclude` auto-copies
it into every worktree Claude Code creates, so a worktree entered via
`EnterWorktree` already has it. If a tracker command misbehaves in a worktree,
check that file first.

## Driving the CLI — the stable gotchas

- **Everything resolves by name, not UUID.** Pass a state, project, or label by
  its name (`"In Progress"`, `"Main"`) and the CLI maps it to the workspace ID.
- **Pass markdown bodies as a file, never inline.** Issue descriptions, comments,
  and document contents each take a file flag; an inline string mangles
  multi-line markdown.
- **Create issues non-interactively.** There's a flag to suppress prompts —
  without it a create can hang in a non-interactive shell.
- **The CLI reads the issue id from the git branch name**, so most issue commands
  need no explicit id inside a correctly-named worktree.

## Anything the CLI doesn't expose

For what the CLI can't do (e.g. querying parent/sub-issue relationships), use
`linear auth token` to get a token and call the Linear **GraphQL API** directly
with curl.
