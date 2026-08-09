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

## Body — two sections, nothing else

```markdown
## Summary

[1–3 sentences: what changed and why. Link related PRs as #NNNN.]

## Test plan

- [ ] [specific check]
- [ ] CI green
```

Both are read by a **non-technical end user** — write them to the `plain-english` law: no
function names, file paths, or insider shorthand. The one exception is a PR with **no
user-facing change** (pure refactor, tech-debt, build/CI): open the Summary with a literal
`No user-facing changes.` line, after which a plainly-explained developer view is fine. When
in doubt, treat it as user-facing.

- **Summary** — state the change directly. User-facing: what changes *on screen*, before →
  after. No-user-facing: the `No user-facing changes.` line, then the plain explanation.
- **Test plan** — user-facing: steps a non-technical person can follow, naming the exact
  page (click by click), the exact thing to look at, and plain pass/fail; confirm it's
  genuinely visible and actually changes. No-user-facing: the developer checks that fit what
  changed (type-checks/tests pass for a refactor; often just `CI green` for docs/config).

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
