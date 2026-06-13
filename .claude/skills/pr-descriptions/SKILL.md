---
name: pr-descriptions
description: This skill should be used whenever the user asks to "create a PR", "open a pull request", "raise a PR", "push and PR", "write a PR description", or "draft a PR". Also use when updating an existing PR's title or description. Enforces the conventional commit title format and the lean Summary + Test plan body.
---

# PR Descriptions

Produce short, scannable PRs. A reviewer should be oriented in 30 seconds. Aim for under 100 words in the body.

For how to *slice and size* the work into small PRs, see `micro-prs`. This skill covers writing the title and body once a change is scoped.

## Critical rules

- Do not add `Co-Authored-By` headers on commits
- Do not include "Generated with Claude Code" or any AI attribution
- Do not mention Claude, AI, or assistants anywhere in the PR
- Do not pad the description by restating the diff
- Do not put the task ID in the title — keep the title clean and link the task file in the body instead

## Title format

Use conventional commits. This is enforced by the repo.

Pattern: `[WIP] type(scope): <short imperative description>`

Always prefix with `[WIP]` (not draft). This is mandatory on every PR title.

Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`, `style`, `build`, `ci`.

Scope is the area of the codebase or product surface. Examples seen in this repo: `library`, `listen`, `watch`, `til`, `game`, `docs`, `extension`, `core`, `ui`, `auth`, `db`, `ci`. Pick the scope that best matches what's actually changing.

Good titles:

- `[WIP] refactor(core): rename abbreviated names in the query and mutation hooks`
- `[WIP] fix(listen): playback position now persists across reloads`
- `[WIP] feat(library): bulk import items from a pasted list`
- `[WIP] chore(ci): bump node version in github actions`

Bad titles:

- `Fix playback bug` (no type, no scope)
- `feat: stuff` (no scope, no description)
- `[Listen] Fix playback` (square brackets — not the convention here)

## Who reads this PR

Default assumption: **the description and test plan are read by a non-technical end user.** Write what *they see and do* in the product — plain English, real numbers, click-by-click. No file names, no function names, no jargon.

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

1–3 sentences, plain English. State the change directly. Link related PRs as `#NNNN`. Reference the task file under `docs/tasks/` it came from.

**User-facing PR — describe what the user sees, before → after.**

Good:

> Fixes where playback resumes in the Listen app. Before, reloading the page dropped you back to the start of a track; now it picks up exactly where you left off.

> Adds a way to paste a list in the Library app and have it split into separate items automatically, instead of typing each one by hand. Behind feature flag `bulk_import`.

Bad:

> Fixes the player pulling position from a stale local value instead of the live state computed by `usePlaybackPosition`.

That's the developer's mental model — function names and internal terms a user can't see. Say what changes *on screen*.

**No-user-facing-change PR (refactor / tech-debt) — say so on the first line, then explain plainly.**

Good:

> No user-facing changes. Renames a set of short, cryptic variable names in the query and mutation hooks to full descriptive names, so the code is easier to read. The behaviour is identical. Split from #2578.

Bad:

> Wave 2a of the naming standardisation. Replaces abbreviations in the queryHooks, mutationHooks & store.

Doesn't flag that there's no user impact, and leans on insider shorthand a new developer wouldn't recognise.

### Test plan

**User-facing PR — steps a non-technical person can actually follow.** Each step names the exact page (click by click to get there), the exact thing to look at, and what pass vs. fail looks like in plain terms. No file names, no function names, no jargon. Before publishing a step, make sure the thing is genuinely visible on that page and that it actually changes in the example given.

Good:

- [ ] Open the **Listen** app, start a track, then reload the page. Playback should resume from where you left off, not jump back to the start.
- [ ] In the **Library** app, paste the sample list into the import box. Three separate items should appear, matching the pasted list.
- [ ] CI green

Bad:

- [ ] Tested
- [ ] Listen app loads
- [ ] Playback position works after reload

Too vague, or written from the developer's seat — no page path, no concrete behaviour, nothing a user can verify.

**No-user-facing-change PR (refactor / tech-debt) — developer checks are fine,** because there's nothing on screen to look at. Pick the checks that actually fit what changed — don't list irrelevant ones. Keep them concrete and in plain words:

- A refactor of shared logic: `Type checks pass` + `Tests pass (the behaviour is unchanged)` + `CI green`.
- A docs / skill / config change with no code behaviour: often just `CI green`.
- A build / CI change: the specific thing that should now work (e.g. `Build completes on Node 20`) + `CI green`.

## No changelog section in the PR body

Versioning and changelog entries are driven by changesets. Add a changeset with `pnpm changeset` when the change should appear in a package's changelog; the PR body does not need to repeat that decision.

## Process

You usually have full context from working on the task. Even so, **review the actual diff before opening the PR** — context drifts, and the description must match what's really on the branch.

1. **Run and read the diff.** `git diff origin/main...HEAD --stat` then `git diff origin/main...HEAD`. Confirm the files and changes match what you're about to describe. State what you reviewed in your reply (e.g. "Reviewed the diff: 2 files, ~30 lines, all in the playback hook") — don't just assert it's reviewed.
2. **Decide the PR type** — user-facing, or no-user-facing-change (refactor / tech-debt). This drives the whole body.
3. Confirm the title — `[WIP]` prefix, conventional commit format, no task ID.
4. Draft the Summary in 1–3 sentences for the right audience (see above).
5. Draft a Test plan: dead-simple user steps for a user-facing PR, or plain developer checks for a no-user-facing-change PR.
6. Open the PR with `gh pr create`.

```bash
gh pr create --title "[WIP] type(scope): description" --body "$(cat <<'EOF'
## Summary

...

## Test plan

- [ ] ...
- [ ] CI green
EOF
)"
```

For drafts: add `--draft`.

## Updating an existing PR

When updating an existing PR, rewrite the title and Summary to reflect the current full state of the branch — not a changelog of what changed since the last update.

Do not use language like "also adds", "now includes", "additionally". Describe the whole PR as it stands.

**Do not use `gh pr edit` for the title or body — it does not reliably update them.** It hits a deprecated Projects (classic) GraphQL field and, depending on the `gh` version, either errors/aborts or leaves the title/body unchanged. Use the REST API instead:

```bash
gh api repos/{owner}/{repo}/pulls/<pr_number> -X PATCH \
  -f title="[WIP] type(scope): description" \
  -f body="$(cat <<'EOF'
## Summary

...

## Test plan

- [ ] ...
- [ ] CI green
EOF
)"
```

`{owner}/{repo}` is filled in automatically by `gh` from the current repo. `<pr_number>` is the literal PR number (e.g. `3036`). After running it, re-read the PR (`gh pr view <pr_number> --json title,body`) to confirm the update actually landed.

## Worked examples

### Example 1: Pure refactor (no user-facing change)

Title: `[WIP] refactor(core): rename abbreviated names in the query and mutation hooks`

```markdown
## Summary

No user-facing changes. Renames a set of short, cryptic variable names in the query and mutation hooks to full descriptive names, so the code is easier to read. The behaviour it produces is identical. Split from #2578.

## Test plan

- [ ] Type checks pass across all packages
- [ ] Tests pass (the behaviour is unchanged)
- [ ] CI green
```

### Example 2: Bug fix (user-facing)

Title: `[WIP] fix(listen): playback position now persists across reloads`

```markdown
## Summary

Fixes where playback resumes in the Listen app. Before, reloading the page dropped you back to the start of a track; now it picks up exactly where you left off.

## Test plan

- [ ] Open the **Listen** app, start a track, reload the page. Playback resumes from where you left off, not the start.
- [ ] Switch tracks, reload again — the new track resumes from its own position.
- [ ] CI green
```

### Example 3: Feature behind a flag (user-facing)

Title: `[WIP] feat(library): bulk import items from a pasted list`

```markdown
## Summary

Adds a way to paste a list in the Library app and have it split into separate items automatically, instead of typing each one. Behind feature flag `bulk_import`.

## Test plan

- [ ] In the **Library** app, paste the sample list into the import box. Separate items appear, matching the pasted list.
- [ ] CI green
```

## Validation checklist

Before opening the PR:

- Diff actually reviewed (`git diff origin/main...HEAD`) and what was reviewed is stated
- Title has `[WIP]` prefix
- Title uses conventional commit format with a scope
- Summary is 1–3 sentences and does not restate the diff
- PR type decided: user-facing, or starts with `No user-facing changes.`
- User-facing test steps name the exact page, the exact thing to look at, and plain pass/fail — no file/function names
- No AI attribution anywhere
- No task ID in the title
