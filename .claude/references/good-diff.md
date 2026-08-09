# What makes a good diff

The home for the four tests that answer "is this a good diff / good PR?". Applies
to both a local diff and a PR — a good diff passes all four. Many planning and
review skills link here for these tests — it's a shared home, so weigh the blast
radius before editing.

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

## Test 2 — judged by risk, not size

What must be small is the **risk**, not the line count. A large diff can be a
good diff. Rank the diff by the worst thing it can touch, and let that set how
small and surgical it has to be:

| Risk | What it touches | The bar |
|------|-----------------|---------|
| **Highest — can break production** | a migration, auth, a permission rule, a shared contract whose consumers this diff can't update in step | keep it tiny and surgical |
| **Middle — user-facing** | UI, copy, behaviour a user sees | keep it to one visible change |
| **Lowest — refactor / tech-debt** | a rename, pulling shared code into a helper, passing a value down through many files, adding a constant nothing reads yet | can span many files and still be good — the risk is low even when the size is large |

The load-bearing point: **size is not risk.** A rename across 30 files within one
app or package is a *good* diff even though it's large. A five-line change to a
permission rule is the one to keep smallest and review hardest.

## Test 3 — behaviour that changes is covered by a test

A change in behaviour ships with a test. A new feature or a bug fix carries a
test that **fails without the change and passes with it** — that's the proof it
works now, and the guard that stops it breaking silently later. A bug fix, in
particular, ships with a test that reproduces the bug.

Not every diff adds a test: a pure refactor changes no behaviour, so it rides on
the existing tests staying green; a docs change, or adding a constant nothing
reads yet, owes none. The test is only owed where behaviour a user or a caller
can observe changes — *changing* a live limit's value (a size cap, a page size)
is exactly that, and the test is a value that lands on the far side of the change:
allowed under one limit, blocked under the other.

The finding: **an observable change in behaviour with no test is not a good
diff.**

## Test 4 — one side of a boundary

A good diff stays within one side of a boundary — one self-contained unit that's
built, reviewed, and reverted on its own terms. Span two of them in one diff and
it's a crossing; even a few lines that way is bad, because a crossing can't be
reviewed or reverted cleanly. One unit is **at most one** of: a single app (each
app counts on its own — including the backend and the Hasura layer), the shared
core package, or the shared UI package. Touching two apps, or an app plus a
shared package, or both shared packages, in one diff is a crossing.

Generated code that lands beside its own source is not a second side: a GraphQL
query change and its regenerated types are one diff, one purpose (Test 1) —
codegen writes its output into the same package or app as the query, so it never
crosses a boundary on its own. The crossing to watch is different: a query that
needs a **new column or table** and the Hasura schema change that adds it. Those
are two sides — the migration in the Hasura app, the query (carrying its
regenerated types) in its own package. Because codegen reads the *live* schema,
the migration must deploy first; it lands as its own PR and the query+codegen PR
is blocked by it — that ordering is what `dependency-analysis` decides.

These four tests judge whether a diff is *good*. When one fails, the split
itself — which pieces are genuinely separate, and which must land first — is
what `dependency-analysis` decides.

## Worked examples

**Good**

- *Rename `getUser` → `fetchUser` across 30 files in one package, every caller
  updated in the same diff.* One purpose; a pure refactor (lowest risk — nothing
  outside the diff depends on the old name); the existing tests stay green. Large,
  but good.
- *Fix an off-by-one in pagination, with a test that reproduces it.* One purpose
  (the fix and its own test); one visible change; the test fails without the fix.
- *Add a `MAX_UPLOAD_SIZE` constant a later PR will use.* One purpose;
  constants-only (safe); no behaviour changes, so no test is owed.

**Bad**

- *"Add dark mode **and** fix the login redirect."* Two purposes that each stand
  alone — split them (fails Test 1).
- *Adding one new auth check by restructuring the whole 120-line middleware
  around it.* One purpose, but a highest-risk change spread across 120 lines can't
  be reviewed or reverted as the tight, surgical edit it should be (fails Test 2).
- *A new checkout flow shipped with no tests.* Behaviour a user can observe
  changes, with nothing proving it works or guarding it (fails Test 3).
- *A three-file change to a Hasura permission and the React component that reads
  it.* Two sides of a boundary in one diff — they review and roll back
  separately; split by side (fails Test 4).
