# GitHub CLI facts for this repo

The **non-rediscoverable** `gh`/`git` facts for driving pull requests in this
repo. Everything here is either a decision or a trap — the kind of thing
`--help` will never teach you. Plain, stable commands (view a PR, list checks,
open a PR, read a diff) are **not** here on purpose: drive those by intent and
confirm the current flags at runtime with `gh <command> --help`.

## The repo

Every PR lives in **`ShinaBR2/sworld`** — frontend, backend, and Hasura all ship
from the one repo. When a command can't rely on the current directory's remote
(e.g. a background shell whose working directory isn't a checkout), name the repo
explicitly.

## Authentication — `GH_TOKEN`

Every `gh` call authenticates via the `GH_TOKEN` env var — the only token with
collaborator access to `ShinaBR2/sworld`, so `gh auth switch` and the keyring are
never the right source. It's a personal secret kept in the **main clone's**
`.claude/settings.local.json` (`env.GH_TOKEN`); read it from there, since a fresh
worktree has no copy of its own. Two constraints, no fixed recipe (derive the
exact extraction at runtime so a tooling change can't leave a stale command here):

- Make it available to `gh` **before** the first PR/CI command.
- This repo is **public**, so don't leave a session-wide `export GH_TOKEN` active
  while running repository code (tests, package scripts, build) — any of it could
  read the token. Scope it to the `gh` calls themselves.

## Reading resolved review threads needs GraphQL

The REST API does **not** expose whether a review thread is resolved, so listing
"unresolved comments" has to go through the GraphQL API. This query is worth
keeping verbatim — substitute `NUMBER`:

```bash
gh api graphql -f query='{ repository(owner:"ShinaBR2", name:"sworld") { pullRequest(number:NUMBER) { reviewThreads(first:100) { nodes { isResolved comments(first:1) { nodes { body path line } } } } } } }'
```

Filter to `isResolved: false`.

## Updating a PR title/body — never `gh pr edit`

`gh pr edit` does **not** reliably update the title or body: it hits a deprecated
Projects (classic) GraphQL field and, depending on the `gh` version, either
errors or silently leaves them unchanged. Update through the **REST API PATCH**
instead — `gh api repos/{owner}/{repo}/pulls/<n> -X PATCH` with `title` / `body`
fields (`{owner}/{repo}` auto-fills from the current repo). **Re-read the PR
afterwards to confirm the update landed** — silent failure is exactly the risk.

## Multi-line bodies — the heredoc idiom

Pass any multi-line PR body (create or PATCH) through a heredoc so the markdown
survives instead of being flattened:

```bash
--body "$(cat <<'EOF'
… body …
EOF
)"
```

This idiom is the one detail worth remembering; the surrounding flags are stable
`gh` core.

## Merging — the two traps

- **Never `gh pr merge --auto`.** GitHub auto-merge only waits on *required*
  status checks, and this repo's branch protection defines none — so it merges
  the instant the PR is mergeable, before `test`/E2E go green. Given merge-is-
  deploy, that ships broken code. Run the full gate yourself, then merge
  manually with a squash once settled.
- **Never `--watch` on `gh pr checks`.** It blocks the session; a hook denies the
  Monitor tool for the same reason. Poll by re-running the plain command.
