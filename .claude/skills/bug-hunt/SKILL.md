---
name: bug-hunt
description: Multi-agent correctness bug hunt over a working diff, with adversarial verification to filter false positives. This is the model-invocable finder half of the parallel-workflow self-review gate (step 11) — run it on `git diff origin/main` before creating a PR. Use whenever hunting for real bugs in a change: "find bugs in this", "is this correct", "review this for bugs", or as the pre-PR gate. Replaces `/code-review`, which Claude Code 2.1.215 made user-invocable only. For structure/abstraction critique use `thermo-nuclear-code-quality-review`; for the judgment/merge-recommendation pass use `reviewing-pull-requests`.
---

# Bug hunt

Find **correctness bugs** in a working diff, and report only the ones that survive an attempt to disprove them.

This exists because Claude Code **2.1.215** removed the model's ability to self-invoke `/code-review`
("Claude no longer runs the `/verify` and `/code-review` skills on its own"). That command was the
mechanical finder in the pre-PR gate; this skill restores an equivalent the model can actually run.
A user-typed `/code-review` remains a valid extra pass and also stamps the gate.

## What this is and is not

- **Is:** a bug finder. Logic errors, edge cases, error handling, broken invariants, convention violations that cause real defects.
- **Is not:** a structure critique (`thermo-nuclear-code-quality-review`) or a merge recommendation (`reviewing-pull-requests`). Don't duplicate their jobs.

## Non-negotiable rules

- **The target is the LOCAL working diff**, never a remote PR: `git fetch origin main && git diff origin/main`.
- **Anchor to the worktree.** Background agents run in the session's root cwd, NOT your worktree. Always pass an absolute `git -C <worktree> diff origin/main`. An unanchored run reviews the wrong tree.
- **Verify scope before trusting the result.** The files the run reports MUST match `git diff origin/main --name-only` in the worktree. A mismatch, or "no changes found", means it mis-scoped — that is a FAILED run, not a clean pass. Fix the anchoring and re-run.
- **Report only verified findings.** A confident-but-wrong finding wastes an engineer's day and burns trust in the whole gate. When in doubt, drop it.
- **A clean result is a real result.** Never manufacture a finding to look thorough.

## Step 1 — Scope and depth

Pick the depth from blast radius, not line count. This mirrors `reviewing-pull-requests` Step 2 — use the band you already chose there:

| Band | When | Finder agents |
| --- | --- | --- |
| Light | copy, styling, renames, config, declarative data | 2 |
| Standard | a feature or fix inside one app | 3 |
| Deep | shared `packages/core` / `packages/ui`, auth, Hasura permissions, DB migrations, money | 5 |

Declarative-only diffs (SQL/YAML/JSON with no logic) are Light — there is little for a bug hunt to find, and saying so plainly is the correct outcome.

## Step 2 — Run the hunt

Call the **Workflow** tool with the script below (this skill instructing you to call it *is* the opt-in). Substitute `WORKTREE` and `FINDERS`.

```javascript
export const meta = {
  name: 'bug-hunt',
  description: 'Parallel bug finders over a diff, adversarially verified',
  phases: [
    { title: 'Find', detail: 'parallel finders, one per lens' },
    { title: 'Verify', detail: 'skeptics try to refute each finding' },
  ],
}

const WORKTREE = args.worktree
const FINDERS = args.finders
const DIFF = `git -C ${WORKTREE} diff origin/main`

const LENSES = [
  { key: 'logic',      prompt: 'Hunt for logic errors: wrong operator, inverted condition, off-by-one, wrong variable used, incorrect order of operations, state mutated at the wrong time.' },
  { key: 'edges',      prompt: 'Hunt for edge cases the change mishandles: null/undefined, empty arrays/strings, zero, negative numbers, very large inputs, duplicate entries, timezone/DST boundaries, concurrent updates.' },
  { key: 'failures',   prompt: 'Hunt for error-handling defects: unhandled promise rejections, missing try/catch around I/O, errors silently swallowed, a failed network/DB call leaving state half-applied, misleading error surfaced to the user.' },
  { key: 'contract',   prompt: 'Hunt for broken contracts: a caller or consumer this change breaks, a changed function signature or return shape not updated everywhere, a hallucinated/nonexistent API, a type assertion hiding a real mismatch.' },
  { key: 'convention', prompt: 'Read the repo AGENTS.md/CLAUDE.md, then hunt ONLY for violations that cause real defects or that the project explicitly forbids (ES modules, arrow functions only, named exports at file bottom). Ignore cosmetic preference.' },
].slice(0, FINDERS)

const FINDINGS = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title:    { type: 'string' },
          file:     { type: 'string' },
          line:     { type: 'integer' },
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          detail:   { type: 'string', description: 'What is wrong and why it breaks' },
          scenario: { type: 'string', description: 'Concrete inputs/state that trigger it' },
        },
        required: ['title', 'file', 'detail', 'scenario'],
      },
    },
  },
  required: ['findings'],
}

const VERDICT = {
  type: 'object',
  properties: {
    refuted:    { type: 'boolean', description: 'true if this is NOT a real bug' },
    confidence: { type: 'integer', description: '0-100 that it IS a real bug' },
    reason:     { type: 'string' },
  },
  required: ['refuted', 'confidence', 'reason'],
}

const results = await pipeline(
  LENSES,
  lens => agent(
    `Review ONLY the changes in this diff:\n\n\`${DIFF}\`\n\n` +
    `Run that command first. Read surrounding context in ${WORKTREE} as needed to judge correctness. ` +
    `${lens.prompt}\n\n` +
    `Report ONLY defects you can tie to concrete triggering inputs. Pre-existing issues outside the diff are out of scope. ` +
    `Return an empty array if you find nothing — that is a valid, expected answer.`,
    { label: `find:${lens.key}`, phase: 'Find', schema: FINDINGS }
  ),
  (res, lens) => parallel((res?.findings ?? []).map(f => () =>
    parallel([
      `Re-read the code and try to prove this is a FALSE POSITIVE. Look for guards, defaults, callers, or types that already prevent it.`,
      `Try to actually reproduce it: walk the exact inputs through the code path step by step and check the claimed outcome really occurs.`,
    ].map(angle => () => agent(
      `Finding from lens "${lens.key}": ${f.title}\nFile: ${f.file}${f.line ? ':' + f.line : ''}\n` +
      `Claim: ${f.detail}\nTrigger: ${f.scenario}\n\n` +
      `Worktree: ${WORKTREE}. Diff: \`${DIFF}\`\n\n${angle}\n\n` +
      `Default to refuted=true when uncertain. A wrong finding costs more than a missed one.`,
      { label: `verify:${f.file}`, phase: 'Verify', schema: VERDICT }
    )))
      .then(vs => {
        const ok = vs.filter(Boolean)
        const survives = ok.length > 0 && ok.every(v => !v.refuted)
        const confidence = ok.length ? Math.min(...ok.map(v => v.confidence)) : 0
        return { ...f, lens: lens.key, survives, confidence, verdicts: ok }
      })
  ))
)

const all = results.flat().filter(Boolean)
const confirmed = all
  .filter(f => f.survives && f.confidence >= 80)
  .sort((a, b) => ({ critical: 0, high: 1, medium: 2, low: 3 }[a.severity ?? 'low'] - { critical: 0, high: 1, medium: 2, low: 3 }[b.severity ?? 'low']))

log(`${all.length} raw finding(s) -> ${confirmed.length} confirmed after verification`)
return { confirmed, dropped: all.length - confirmed.length }
```

Pass `args` as `{ worktree: "<absolute path>", finders: <2|3|5> }`.

## Step 3 — Report

Report **only** `confirmed`. State the dropped count in one line so the run is auditable — it shows verification did work rather than that nothing was found.

For each confirmed finding: what's wrong, the file:line, and the concrete trigger. Order by severity.

If `confirmed` is empty, say so plainly in one sentence. That is the successful exit, and for a small or declarative diff it is the *expected* one. Do not pad it with speculative concerns.

## Step 4 — In the self-review gate

Invoking this skill through the **Skill tool** stamps the `code_review` half of the review gate
(`.claude/hooks/review-gate.sh`). Then:

1. Fix everything confirmed.
2. Fixes are new, unreviewed code — **re-run this skill and `reviewing-pull-requests`** from the top.
3. Exit only when both are clean with **no edits afterward**.

The bar: CodeRabbit should find nothing on the PR. A substantive bot finding means this gate failed.
