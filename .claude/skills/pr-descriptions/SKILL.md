---
name: pr-descriptions
description: This skill should be used whenever the user asks to "create a PR", "open a pull request", "raise a PR", "push and PR", "write a PR description", or "draft a PR". Also use when updating an existing PR's title or description. Enforces the conventional commit title format and the lean Summary + Test plan body.
---

# PR Descriptions

Produce short, scannable PRs — a reviewer oriented in 30 seconds, body under ~100 words.
Don't pad it by restating the diff.

## The one rule that must hold

The PR is linked to its tracker issue: the `SWO-NNN` reaches the integration (through the
branch name and/or the body) so the issue moves to In Review. Where the ID sits is an
implementation detail; the link is what matters. (`task-tracker`)

## Title — conventional commits (house convention)

`type(scope): <short imperative>` — e.g. `fix(listen): playback position persists across
reloads`. The repo-specific part is the **scope**: the app or surface actually changing —
`library`, `listen`, `watch`, `til`, `game`, `docs`, `extension`, `core`, `ui`, `auth`,
`db`, `ci`. No `[bracket]` prefixes.

## Body — a two-line header, then two sections

Open with the header — category and impact, one per line — then Summary and Test plan.
Nothing else.

```markdown
**Category:** <bug fix | pure blocker | wiring | refactor>
**Impact:** <user-facing change | no user-facing change>

## Summary

[1–3 sentences: what changed and why. Link related PRs as #NNNN.]

## Test plan

- [ ] [specific check]
```

- **Category** — exactly one: **bug fix**; **pure blocker** (exists only to unblock later
  work, e.g. a migration that must deploy first); **wiring** (connecting already-built
  pieces — this is how a new feature lands); **refactor** (no behaviour change — also covers
  docs, chore, CI, and config).
- **Impact** — user-facing or not. A flag-gated change is still **user-facing** if, with the
  flag on, an end user sees something different. When in doubt, treat it as user-facing.

The Summary, and any user-facing test step, are read by a **non-technical end user** — write
them to the `plain-english` law: no function names, file paths, or insider shorthand. A
no-user-facing-change PR may then explain the developer's view, still plainly.

**The test plan follows from the impact:**

- **User-facing** — manual steps a non-technical person can follow: the exact page (click by
  click), the exact thing to look at, plain pass/fail. Confirm the thing is genuinely visible
  and actually changes.
- **Not user-facing** — CI already proves a refactor/wiring/blocker works, so don't re-list
  the automated checks (type-checks, unit tests, "CI green" are all redundant). List only a
  check CI *can't* run; if there's none, say in one line that CI covers it.

No changelog section — versioning is driven by changesets (`pnpm changeset` when the change
should appear in a package's changelog).

Full worked examples (a refactor, a bug fix, a flag-gated feature): `references/examples.md`.

## Before opening

Review the actual diff against `origin/main` first — fetch it, the local copy goes stale as
other work lands — because the description must match the branch; state what you actually
reviewed, don't just assert it. Open the PR assigned to the user (`--assignee "@me"`), never
as a **draft**: the only reviewers are the code-review bots, and a draft can stop them
running. Pass the multi-line body through the heredoc idiom so the markdown survives
(`.claude/references/github-cli.md`).

## Updating an existing PR

Rewrite the title and Summary to describe the branch's *whole current state*, not a
changelog of recent changes (no "also adds" / "now includes"). The edit command has a
silent-failure trap — use the reliable path and re-confirm the change landed, per
`.claude/references/github-cli.md`.
