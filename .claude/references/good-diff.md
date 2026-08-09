# What makes a good diff

The single home for the "is this a good diff / good PR?" criteria. Applies to
both a local diff and a PR — same two tests. A good diff passes both. Skills
that judge a diff's shape point here instead of restating the rules
(`self-review`, `micro-prs`).

This is a tool for *judging* a diff, not a checklist to satisfy. When a diff
fails a test, the fix is almost always to split it.

## Test 1 — one purpose

Describe the whole diff in one sentence. If you can't, it's more than one diff.

Watch for "and" in that sentence — it usually joins two purposes. But not
always: "add X and its test", "rename foo and update its callers" read as "and"
yet are one purpose, because the second half exists *only to serve* the first —
the test has no reason to exist without X, the caller updates none without the
rename. The real test:

> Does each half stand on its own as a separate purpose?

- One half exists only because of the other → **one purpose, keep it together.**
- Both stand alone — a feature and an unrelated bug fix → **two purposes, split
  them.**

## Test 2 — small blast radius, judged by risk not size

What must be small is the **risk**, not the line count. A large diff can be a
good diff. Rank the diff by the worst thing it can touch, and let that set how
small and surgical it has to be:

| Risk | What it touches | The bar |
|------|-----------------|---------|
| **Highest — can break production** | a migration, auth, a permission rule, a shared contract many callers depend on | keep it tiny and surgical |
| **Middle — user-facing** | UI, copy, behaviour a user sees | keep it to one visible change |
| **Lowest — refactor / tech-debt** | rename, extract, props-drilling, constants-only | can span many files and still be good — the risk is low even when the size is large |

The load-bearing point: **size is not risk.** A rename across 30 files or a
constants-only change is a *good* diff even though it's large. A five-line
change to a permission rule is the one to keep smallest and review hardest.
