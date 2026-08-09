# Worked PR examples

Three complete title-plus-body examples, one per PR type. Read this when you want to see a whole PR
assembled, not just the rules and anti-patterns the SKILL.md shows inline. The rules these
illustrate — audience, before→after Summary, plain-English test steps — all live in the SKILL.md;
these are only the filled-in form. Two rules aren't shown in the bodies below and aren't meant to
be: the tracker ID (`SWO-NNN`) rides in the branch name rather than the body, and a real test step
names the exact page and click path — kept short here for readability, spelled out in the SKILL.md.

## Example 1: Pure refactor (no user-facing change)

Title: `refactor(core): rename abbreviated names in the query and mutation hooks`

```markdown
**Category:** refactor
**Impact:** no user-facing change

## Summary

Renames a set of short, cryptic variable names in the query and mutation hooks to full descriptive names, so the code is easier to read. The behaviour it produces is identical.

## Test plan

Nothing to verify by hand — a pure rename with no behaviour change; CI's type-checks and unit tests cover it.
```

## Example 2: Bug fix (user-facing)

Title: `fix(listen): playback position now persists across reloads`

```markdown
**Category:** bug fix
**Impact:** user-facing change

## Summary

Fixes where playback resumes in the Listen app. Before, reloading the page dropped you back to the start of a track; now it picks up exactly where you left off.

## Test plan

- [ ] Open the **Listen** app, start a track, reload the page. Playback resumes from where you left off, not the start.
- [ ] Switch tracks, reload again — the new track resumes from its own position.
```

## Example 3: Feature behind a flag (user-facing)

Title: `feat(library): bulk import items from a pasted list`

```markdown
**Category:** wiring
**Impact:** user-facing change

## Summary

Adds a way to paste a list in the Library app and have it split into separate items automatically, instead of typing each one. Behind feature flag `bulk_import` — but with the flag on the end user sees a new import box, so it counts as user-facing.

## Test plan

- [ ] In the **Library** app, paste the sample list into the import box. Separate items appear, matching the pasted list.
```
