---
name: thermo-nuclear-code-quality-review
description: Run the harshest band of code review — an extremely strict maintainability pass focused on abstraction quality, file-size growth, and spaghetti-condition creep. Use when the user asks for a "thermo-nuclear review", "thermonuclear code review", "deep code quality audit", or an especially harsh / strict maintainability review.
---

# Thermo-Nuclear Code Quality Review

The harshest review band. It runs **on top of** `self-review`'s cold-eyes pass,
not instead of it: `self-review` (via a fresh `/code-review high` session) already
covers correctness, so here **correctness is table stakes** — working code is not
a pass. The only question this band asks is whether the codebase is *better* after
the change than before.

Never chosen automatically — the user asks for it: "thermo-nuclear review", "deep
code quality audit", "be really strict about maintainability". Same target as
`self-review`: the LOCAL working diff vs `origin/main`.

## The bar — maintainability becomes the review

Be ambitious about structure. Don't stop at "this could be a bit cleaner". Look
for the **code judo** move — a reframing that uses the existing architecture
better and makes whole branches, helpers, modes or layers disappear. Prefer
*deleting* complexity to rearranging it; a refactor that moves the same mess
around is not a win. Prefer a few high-conviction structural findings over a long
list of nits.

What to push on:

- **Spaghetti growth.** New ad-hoc conditionals, scattered special cases, one-off
  branches bolted onto unrelated flows. "Weird if statements in random places" is
  a design problem, not a stylistic nit — push the logic behind a dedicated
  abstraction instead of tangling an existing path.
- **File size.** A file crossing 1000 lines because of this diff is a strong
  smell. Ask whether it should be decomposed first; waive only when the result is
  still clearly organised.
- **Magic and thin abstractions.** Brittle or "clever" behaviour, generic
  mechanisms hiding simple data-shape assumptions, identity wrappers and
  pass-through helpers that add indirection without buying clarity. Boring and
  direct wins.
- **Type and boundary cleanliness.** Unnecessary optionality, `any`, `unknown`,
  cast-heavy code, or a silent fallback papering over an unclear invariant — make
  the boundary explicit and the control flow usually simplifies with it.
- **Canonical layer.** Feature logic leaking into shared paths, bespoke helpers
  where a canonical one exists, logic sitting in the wrong package. Push it to the
  module that already owns the concept rather than normalising the drift.
- **Orchestration.** Independent work serialised for no reason, or related updates
  that can leave state half-applied.

## Presumptive blockers at this band

Unless clearly justified, each of these blocks: a plausible code-judo move left on
the table, a file pushed past 1000 lines, ad-hoc branching that tangles an
existing flow, feature checks scattered across shared code, an unnecessary wrapper
or cast-heavy contract, or a duplicated helper that has a canonical home.

Say it plainly: *"this pushes the file past 1k lines — can we decompose first?"*,
*"this refactor moves complexity around but doesn't delete it"*, *"I think there's
a code-judo move here that makes this much simpler"*. Direct and serious, never
rude, and never softened into a mild suggestion.

## Prefer these remedies, in roughly this order

Delete a whole layer of indirection rather than polishing it; reframe the state
model so conditionals disappear instead of getting centralised; move the ownership
boundary so the feature becomes a natural extension of something that already
exists; turn special-case logic into a simpler default flow with fewer exceptions;
replace condition chains with a typed model or an explicit dispatcher; separate
orchestration from business logic; make type boundaries explicit so control flow
simplifies with them; parallelise independent work where that also simplifies
orchestration; restructure related updates to be more atomic where partial state
would be hard to reason about. Only then the ordinary moves: extract a helper,
split a file, reuse the canonical utility.

## Ordering the output

Correctness is assumed, so it overrides the usual "correctness first" ordering.
Lead with structural regressions, then missed code-judo simplifications, then
spaghetti/branching growth, then boundary/abstraction/type-contract problems, then
file size, then modularity, then legibility. Never flood the review with low-value
nits while a structural issue is on the table.
