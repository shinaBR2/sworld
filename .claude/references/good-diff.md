# What makes a good diff

The single home for the four tests that answer "is this a good diff / good
PR?". Applies to both a local diff and a PR — a good diff passes all four.
`self-review` and `micro-prs` link here when they need the full criteria.

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
| **Highest — can break production** | a migration, auth, a permission rule, a shared contract many callers depend on | keep it tiny and surgical |
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
can observe changes — and *changing* a live constant's value (a limit, a
timeout) is exactly that, so it needs one.

The finding: **an observable change in behaviour with no test is not a good
diff.**

## Test 4 — one side of a boundary

A good diff stays on one side of a boundary. A diff that touches both the data
layer (`apps/hasura`) and the frontend, or two apps at once, is bad **even at a
few lines** — each side is reviewed and rolled back differently, so a
boundary-crossing diff can't be reviewed or reverted cleanly.

Generated code is not a second side. A source change and the code generated
*from* it are one purpose and belong in the same diff — a GraphQL query change
and its regenerated types (that's Test 1: the generated half only exists to serve
the source half). They live on the same side anyway, so this is no crossing —
it's called out only because the extra generated files can *look* like one.

These four tests judge whether a diff is *good*. How to actually split one that
fails a test — which side lands first, blockers before dependents, the
line-count sizing hints — is `micro-prs`'.

## Worked examples

**Good**

- *Rename `getUser` → `fetchUser` across 30 files in one package.* One purpose; a
  pure refactor (lowest risk); the existing tests stay green. Large, but good.
- *Fix an off-by-one in pagination, with a test that reproduces it.* One purpose
  (the fix and its own test); one visible change; the test fails without the fix.
- *Add a `MAX_UPLOAD_SIZE` constant a later PR will use.* One purpose;
  constants-only (safe); no behaviour changes, so no test is owed.

**Bad**

- *"Add dark mode **and** fix the login redirect."* Two purposes that each stand
  alone — split them (fails Test 1).
- *A three-line permission-rule tightening buried in a 200-line handler
  refactor.* The highest-risk change is hidden inside a large low-risk one, so
  neither can be reviewed or reverted cleanly — isolate the permission change
  (fails Test 2).
- *A new checkout flow shipped with no tests.* Behaviour a user can observe
  changes, with nothing proving it works or guarding it (fails Test 3).
- *A three-file change to a Hasura permission and the React component that reads
  it.* Two sides of a boundary in one diff — they review and roll back
  separately; split by side (fails Test 4).
