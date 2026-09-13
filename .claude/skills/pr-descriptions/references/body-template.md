# PR body template

Produce this shape — a two-line header, then Summary and Test plan, nothing else:

```markdown
**Category:** <bug fix | pure blocker | wiring | refactor>
**Impact:** <user-facing change | no user-facing change>

## Summary

[1–3 sentences: what changed and why. Link related PRs as #NNNN.]

## Test plan

- [ ] [user-facing step — exact page, thing to look at, pass/fail. Not user-facing: no checkboxes, see below.]
```
