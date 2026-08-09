---
name: pr-descriptions
description: This skill should be used whenever the user asks to "create a PR", "open a pull request", "raise a PR", "push and PR", "write a PR description", or "draft a PR". Also use when updating an existing PR's title or description. Enforces the conventional commit title format and the lean Summary + Test plan body.
---

# PR Descriptions

Produce short, scannable PRs. A reviewer should be oriented in 30 seconds. Aim for under 100 words in the body.

For whether a change is well-scoped to ship as one PR, see `.claude/references/good-diff.md`; for how to sequence a split, `dependency-analysis`. This skill covers writing the title and body once a change is scoped.

## Critical rules

- Do not add `Co-Authored-By` headers on commits
- Do not include "Generated with Claude Code" or any AI attribution
- Do not mention Claude, AI, or assistants anywhere in the PR
- Do not pad the description by restating the diff
- The one thing that must be true: the PR is linked to its tracker issue. The `SWO-NNN` has to reach the integration — through the branch name and/or the body — so it moves the issue to In Review (see `task-tracker`). Where the ID appears is an implementation detail; the link is what matters.

## Title format

Use conventional commits. This is enforced by the repo.

Pattern: `type(scope): <short imperative description>`

Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`, `style`, `build`, `ci`.

Scope is the area of the codebase or product surface. Examples seen in this repo: `library`, `listen`, `watch`, `til`, `game`, `docs`, `extension`, `core`, `ui`, `auth`, `db`, `ci`. Pick the scope that best matches what's actually changing.

Good titles:

- `refactor(core): rename abbreviated names in the query and mutation hooks`
- `fix(listen): playback position now persists across reloads`
- `feat(library): bulk import items from a pasted list`
- `chore(ci): bump node version in the CI workflow`

Bad titles:

- `Fix playback bug` (no type, no scope)
- `feat: stuff` (no scope, no description)
- `[Listen] Fix playback` (square brackets — not the convention here)

## Who reads this PR

Default assumption: **the description and test plan are read by a non-technical end user.** Apply the `plain-english` skill's law to both the Summary and the Test plan below.

There is exactly one exception: a PR with **no user-facing change at all** (pure refactor, tech-debt, internal cleanup, build/CI). For those:

- Start the Summary with a literal **`No user-facing changes.`** line so the reviewer knows immediately.
- A developer's perspective is then fine — but still explain it as simply as possible, so a brand-new developer could follow it. Avoid jargon and abbreviated symbol names wherever you can; spell things out.

When in doubt about which type a PR is, treat it as user-facing.

## Body structure

Two sections. That's it.

```markdown
## Summary

[1–3 sentences. What was done and why. Reference related PRs with #NNNN if relevant.]

## Test plan

- [ ] [Specific check 1]
- [ ] [Specific check 2]
- [ ] CI green
```

No "Changelog" section in the PR body. The changelog is driven by changesets (see below).

### Summary

1–3 sentences, plain English. State the change directly. Link related PRs as `#NNNN`. Reference the tracker issue it came from (see `task-tracker`).

**User-facing PR — describe what the user sees, before → after.** Say what changes *on screen*, never the developer's mental model. This is the trap:

> Fixes the player pulling position from a stale local value instead of the live state computed by `usePlaybackPosition`.

Function names and internal terms a user can't see.

**No-user-facing-change PR (refactor / tech-debt) — say so on the first line, then explain plainly.** This is the trap:

> Wave 2a of the naming standardisation. Replaces abbreviations in the queryHooks, mutationHooks & store.

Doesn't flag that there's no user impact, and leans on insider shorthand a new developer wouldn't recognise.

### Test plan

**User-facing PR — steps a non-technical person can actually follow.** Each step names the exact page (click by click to get there), the exact thing to look at, and what pass vs. fail looks like in plain terms — apply the `plain-english` law. Before publishing a step, make sure the thing is genuinely visible on that page and that it actually changes in the example given. Avoid the vague, developer-seat version:

- [ ] Tested
- [ ] Listen app loads
- [ ] Playback position works after reload

No page path, no concrete behaviour, nothing a user can verify.

**No-user-facing-change PR (refactor / tech-debt) — developer checks are fine,** because there's nothing on screen to look at. Pick the checks that actually fit what changed — don't list irrelevant ones. Keep them concrete and in plain words:

- A refactor of shared logic: `Type checks pass` + `Tests pass (the behaviour is unchanged)` + `CI green`.
- A docs / skill / config change with no code behaviour: often just `CI green`.
- A build / CI change: the specific thing that should now work (e.g. `Build completes on Node 20`) + `CI green`.

## No changelog section in the PR body

Versioning and changelog entries are driven by changesets. Add a changeset with `pnpm changeset` when the change should appear in a package's changelog; the PR body does not need to repeat that decision.

## Process

You usually have full context from working on the task. Even so, **review the actual diff before opening the PR** — context drifts, and the description must match what's really on the branch.

1. **Read the diff between the branch and `origin/main`** (fetch it first — local `main` is chronically stale). Confirm the files and changes match what you're about to describe. State what you reviewed in your reply (e.g. "Reviewed the diff: 2 files, ~30 lines, all in the playback hook") — don't just assert it's reviewed.
2. **Decide the PR type** — user-facing, or no-user-facing-change (refactor / tech-debt). This drives the whole body.
3. Confirm the title — conventional commit format with a scope.
4. Draft the Summary in 1–3 sentences for the right audience (see above).
5. Draft a Test plan: dead-simple user steps for a user-facing PR, or plain developer checks for a no-user-facing-change PR.
6. Open the PR, assigned to the user (`--assignee "@me"`) so it lands in their queue. Pass the multi-line body through a heredoc so the markdown survives instead of being flattened — that idiom is the one detail worth remembering (`.claude/references/github-cli.md`).

Never open the PR as a draft. The only reviewers here are the code-review bots,
and a draft PR can stop them from running — which defeats the whole point of
opening it.

## Updating an existing PR

When updating an existing PR, rewrite the title and Summary to reflect the current full state of the branch — not a changelog of what changed since the last update.

Do not use language like "also adds", "now includes", "additionally". Describe the whole PR as it stands.

**Updating an existing PR's title or body has a trap: the obvious edit command fails silently.** Use the reliable path in `.claude/references/github-cli.md`, and re-read the PR afterwards to confirm the change landed.

## Worked examples

Three complete title-plus-body examples — a pure refactor, a user-facing bug fix, and a flag-gated feature — are in `references/examples.md`. Read it when you want to see a whole PR assembled — the Good forms in full, not just the rules and anti-patterns shown above.

## Validation checklist

Before opening the PR:

- Diff between the branch and `origin/main` actually reviewed, and what was reviewed is stated
- Title uses conventional commit format with a scope
- Summary is 1–3 sentences and does not restate the diff
- PR type decided: user-facing, or starts with `No user-facing changes.`
- User-facing test steps name the exact page, the exact thing to look at, and plain pass/fail — no file/function names
- No AI attribution anywhere
- PR is linked to its tracker issue — `SWO-NNN` is in the branch name and/or the body (see `task-tracker`)
