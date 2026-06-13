---
name: thermo-nuclear-code-quality-review
description: Run an extremely strict maintainability review of the current branch focused on abstraction quality, file-size growth, and spaghetti-condition creep. Use when the user asks for a "thermo-nuclear review", "thermonuclear code review", "deep code quality audit", or an especially harsh / strict maintainability review. This is a deliberately demanding review, not a routine PR check — reach for `reviewing-pull-requests` for the normal flow.
---

# Thermo-Nuclear Code Quality Review

Run an unusually strict review focused on implementation quality, maintainability, abstraction quality, and codebase health.

Above all, be **ambitious about code structure**. Do not merely identify local cleanup opportunities. Actively search for "code judo" moves: restructurings that preserve behaviour while making the implementation dramatically simpler, smaller, more direct, and more elegant.

## Critical rules

- This is a demanding review, not a rubber stamp. Do not approve just because behaviour is correct.
- Prefer a small number of high-conviction structural findings over a long list of cosmetic nits.
- Push for deleting complexity, not rearranging it. A refactor that moves the same mess around is not a win.
- Be direct and serious about quality, never rude. Do not soften major maintainability issues into mild suggestions.

## Core review prompt

Start from this baseline:

> Perform a deep code quality audit of the current branch's changes. Rethink how to structure and implement the changes to meaningfully improve code quality without impacting behaviour. Improve abstractions and modularity, reduce spaghetti code, improve succinctness and legibility. Be ambitious — if there is a clear path to improving the implementation that involves restructuring some of the codebase, go for it. Be thorough and rigorous. Measure twice, cut once.

## Non-negotiable standards

Apply the baseline above, plus these explicit rules.

**Be ambitious about structural simplification.**
- Do not stop at "this could be a bit cleaner."
- Look for opportunities to reframe the change so whole branches, helpers, modes, conditionals, or layers disappear entirely.
- Prefer the solution that makes the code feel inevitable in hindsight.
- Assume a "code judo" move is often available: a re-organisation that uses the existing architecture more effectively and makes the change dramatically simpler.
- If you can delete complexity rather than rearrange it, push hard for that path.

**Do not let a file cross 1000 lines without a very strong reason.**
- Treat this as a strong code-quality smell by default.
- Prefer extracting helpers, subcomponents, or modules over letting a file sprawl past 1000 lines.
- If the diff crosses that threshold, explicitly ask whether the code should be decomposed first.
- Only waive this for a compelling structural reason where the resulting file is still clearly organised.

**Do not allow spaghetti growth in existing code.**
- Be highly suspicious of new ad-hoc conditionals, scattered special cases, or one-off branches inserted into unrelated flows.
- "Weird if statements in random places" is a design problem, not a stylistic nit.
- Prefer pushing logic into a dedicated abstraction, helper, state machine, or policy object instead of tangling an existing path.
- Call out changes that make the surrounding code harder to reason about, even if they technically work.

**Bias toward cleaning the design, not just accepting working code.**
- If behaviour can stay the same while structure becomes meaningfully cleaner, push for the cleaner version.
- Do not rubber-stamp "it works" implementations that leave the codebase messier.
- Strongly prefer simplifications that remove moving pieces over refactors that spread the same complexity around.

**Prefer direct, boring, maintainable code over hacky or magical code.**
- Treat brittle, ad-hoc, or "magic" behaviour as a code-quality problem.
- Be skeptical of generic mechanisms that hide simple data-shape assumptions.
- Flag thin abstractions, identity wrappers, or pass-through helpers that add indirection without buying clarity.

**Push on type and boundary cleanliness when it affects maintainability.**
- Question unnecessary optionality, `unknown`, `any`, or cast-heavy code when a clearer type boundary could exist.
- Prefer explicit typed models or shared contracts over loosely-shaped ad-hoc objects.
- If a branch relies on silent fallback to paper over an unclear invariant, ask whether the boundary should be made explicit instead.

**Keep logic in the canonical layer and reuse existing helpers.**
- Call out feature logic leaking into shared paths, or implementation details leaking through APIs.
- Prefer existing canonical utilities over bespoke one-offs.
- Push code toward the right package, service, or module instead of normalising architectural drift.

**Treat unnecessary sequential orchestration and non-atomic updates as design smells.**
- If independent work is serialised for no good reason, ask whether it should run in parallel.
- If related updates can leave state half-applied, push for a more atomic structure.
- Don't over-index on micro-optimisations, but do flag avoidable orchestration complexity that adds brittleness.

## Primary review questions

For every meaningful change, ask:

- Is there a "code judo" move that would make this dramatically simpler?
- Can this be reframed so fewer concepts, branches, or helper layers are needed?
- Does this improve or worsen the local architecture?
- Did the diff add branching complexity where a better abstraction should exist?
- Did a previously cohesive module become more coupled, more stateful, or harder to scan?
- Is this logic living in the right file and layer?
- Did this change enlarge a file or component past a healthy size boundary?
- Are there repeated conditionals that signal a missing model or helper?
- Is the implementation direct and legible, or does it rely on special cases and incidental control flow?
- Is this abstraction actually earning its keep, or is it just a wrapper?
- Did the diff introduce casts, optionality, or ad-hoc shapes that obscure the real invariant?
- Is this orchestration more sequential or less atomic than it needs to be?

## What to flag aggressively

- A complicated implementation where a cleaner reframing could delete whole categories of complexity.
- Refactors that move code around but fail to reduce the concepts a reader must hold in their head.
- A file crossing 1000 lines due to the PR, especially if the new code could be split out.
- New conditionals bolted onto unrelated code paths.
- One-off booleans, nullable modes, or flags that complicate existing control flow.
- Feature-specific logic leaking into general-purpose modules.
- Generic "magic" handling that hides simple structure.
- Thin wrappers or identity abstractions that add indirection without simplifying anything.
- Unnecessary casts, `any`, `unknown`, or optional params that muddy the real contract.
- Copy-pasted logic instead of extracted helpers.
- Narrow edge-case handling implemented in the middle of an already busy function.
- Refactors that pass tests but make the code less modular or readable.
- "Temporary" branching that is likely to become permanent debt.
- Bespoke helpers where a canonical utility already exists.
- Logic added in the wrong layer/package when it should live somewhere more central.
- Sequential async flow where independent work could stay simpler with parallel execution.
- Partial-update logic that leaves state less atomic than necessary.

## Preferred remedies

When you identify a problem, prefer:

- Delete a whole layer of indirection rather than polishing it.
- Reframe the state model so conditionals disappear instead of getting centralised.
- Change the ownership boundary so the feature becomes a natural extension of an existing abstraction.
- Turn special-case logic into a simpler default flow with fewer exceptions.
- Extract a helper or pure function.
- Split a large file into smaller focused modules.
- Move feature-specific logic behind a dedicated abstraction.
- Replace condition chains with a typed model or explicit dispatcher.
- Separate orchestration from business logic.
- Collapse duplicate branches into a single clearer flow.
- Delete wrappers that do not meaningfully clarify the API.
- Reuse the existing canonical helper instead of introducing a near-duplicate.
- Make type boundaries explicit so control flow gets simpler.
- Move logic to the package/module/layer that already owns the concept.
- Parallelise independent work when that also simplifies orchestration.
- Restructure related updates into a more atomic flow when partial state would be harder to reason about.

Do not be satisfied with "maybe rename this" when the real issue is structural. Do not settle for a cleaner version of the same messy idea if a much simpler idea is plausible.

## Review tone

Be direct, serious, and demanding about quality. Not rude — but do not soften major maintainability issues. If the code makes the codebase messier, say so clearly. If the implementation missed a chance for dramatic simplification, say that clearly too.

Good phrasing:

- "this pushes the file past 1k lines. can we decompose this first?"
- "this adds another special-case branch into an already busy flow. can we move this behind its own abstraction?"
- "this works, but it makes the surrounding code more spaghetti. let's keep the behaviour and restructure the implementation."
- "this feels like feature logic leaking into a shared path. can we isolate it?"
- "this abstraction seems unnecessary. can we just keep the direct flow?"
- "why does this need a cast / optional here? can we make the boundary more explicit instead?"
- "this looks like a bespoke helper for something we already have elsewhere. can we reuse the canonical one?"
- "i think there's a code-judo move here that makes this much simpler. can we reframe this so these branches disappear?"
- "this refactor moves complexity around, but doesn't really delete it. is there a way to make the model itself simpler?"

## Output expectations

Prioritise findings in this order:

1. Structural code-quality regressions
2. Missed opportunities for dramatic simplification / code-judo restructuring
3. Spaghetti / branching complexity increases
4. Boundary / abstraction / type-contract problems that make code harder to reason about
5. File-size and decomposition concerns
6. Modularity and abstraction issues
7. Legibility and maintainability concerns

Do not flood the review with low-value nits when there are larger structural issues.

## Approval bar

Do not approve merely because behaviour seems correct. The bar for approval is:

- no clear structural regression
- no obvious missed opportunity to make the implementation dramatically simpler when such a path is visible
- no unjustified file-size explosion
- no obvious spaghetti-growth from special-case branching
- no obviously hacky or magical abstraction that makes the code harder to reason about
- no unnecessary wrapper/cast/optionality churn obscuring the real design
- no clear architecture-boundary leak or avoidable canonical-helper duplication
- no missed opportunity for an obvious decomposition that would materially improve maintainability

Treat these as presumptive blockers unless the author can justify them clearly:

- the PR preserves a lot of incidental complexity when a plausible code-judo move would delete it
- the PR pushes a file from below 1000 lines to above 1000 lines
- the PR adds ad-hoc branching that makes an existing flow more tangled
- the PR solves a local problem by scattering feature checks across shared code
- the PR adds an unnecessary abstraction, wrapper, or cast-heavy contract that makes the design more indirect
- the PR duplicates an existing helper or puts logic in the wrong layer when there is a clear canonical home

If those conditions are not met, leave explicit, actionable feedback and push for a cleaner decomposition.
