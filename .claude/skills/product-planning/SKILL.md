---
name: product-planning
description: >-
  Deep, first-principles product planning — the rigorous thinking pass that happens
  *before* tickets and code. Use whenever planning or scoping a feature, thinking through a product
  idea, or deciding how to approach something: "let's plan this", "I want to build/add X", "how
  should we approach Y", "scope this out", or when bringing a rough idea or a parent task to work
  through. Reach for it proactively the moment a new feature, a change to how something works, or a
  domain concept is on the table — especially when the real risk is whether the *concept* is
  understood, not how to code it. It interrogates whether the thinking is genuinely clear, captures
  the concept as documentation up-front, weighs architecture, and shapes a high-level parent —
  conducting grill-me, writing-task-specs and micro-prs as it goes. Not for trivial, well-understood
  changes that should go straight to code — though its critical-thinking instinct still applies even
  then.
---

# Deep product planning

The rigorous thinking pass *before* any ticket or line of code. Our speed comes from
planning quality, not from cutting it short (`AGENTS.md`). The failure this exists to
catch isn't bad code — it's a domain concept that was never truly understood, so
everything built on top of it becomes a mess. Get the thinking rock-solid first;
everything downstream gets easier. Use the most capable model available — this is the
work that most rewards it.

This skill conducts other thinking tools (`grill-me`, `writing-task-specs`, `micro-prs`,
`dependency-analysis`) and adds only the two things none of them have on their own: **the
non-gating posture** and **the concept-gate judgment**. Those two are its real content.

## You facilitate, you never gate

The user is the decision-maker — co-founder, head of product — and owns every product
and model call. Your job is to sharpen their thinking, not block their path: surface
concerns, offer options, pressure-test; *they* decide what happens next. Never refuse to
proceed, mandate a step, or withhold a plan until some box is ticked.

This matters most exactly where you'd be tempted to gate — when you're not convinced a
concept is understood, or a change feels like it should go to the team first. In both you
**raise it and offer**, never enforce. Bigger, cascading work usually benefits from the
team seeing the parent before it's scoped (and running their own planning) — suggest it,
but the user may decide it needs no sign-off, and that's their call.

## Step 0 — Find out where the user already is

Don't assume. They may have planned this deeply with an agent already, or jumped straight
to "let's build it." Pull any referenced issue/project (`task-tracker`) and work from it.
Check whether a tracker **document** already exists for the concept — its presence signals
they've worked it through, its absence that one may be missing. If still unclear, just ask
whether it's been planned before. Then always do a light *"let's make sure we're on the
same page"* check with a couple of pointed questions, even when they say they get it.

## The fork that sets the depth: is there a domain concept at stake?

The judgment the whole skill turns on — not "is this big" but **"is there a domain
concept here whose misunderstanding would cascade into messy code."**

- **A domain concept is being introduced or changed** — *"a til entry can now reference a
  journal entry, not just a listen session."* These carry real-world meaning, cascade to
  the 2nd–4th order, and are often genuinely messy with competing ways to model them. The
  risk is the concept, so make it rock-solid → **Step 1**.
- **A clear, well-defined problem** with no concept to settle — *"smart-apply for the
  finance section, manual entry is annoying."* Skip the concept work → **Step 2**.

When in doubt, treat it as a concept and check.

## Step 1 — Make the concept rock-solid (concept path only)

Interrogate whether the thinking is genuinely clear, to the 2nd–4th order, using
`grill-me`. Probe three things: do they understand the **product and platform** it lands
in; the **concept itself** — what it actually is in reality, how it behaves, the competing
conventions; and **where it breaks** — the edge and fallible cases.

If you're not convinced it's understood, say so and offer the paths — you go research how
it actually works, you work it out together now, or they go away and come back — then
follow their call. Doing the messy research yourself and bringing it back to pressure-test
their model is fair game.

Capture a non-obvious concept as a short tracker **document** (`task-tracker`) — pure
concept truth (what it is, how it works, the rules), written *before* the code, attached
to the app's project for a feature concept or to the team for a cross-cutting one. Keep
architecture and trade-offs out of it — those live in the parent (Step 3).

## Step 2 — Shape the solution

Think hard about *how*, and be self-critical about it:

- **Architecture.** Lay out the real options and their trade-offs. Err toward the elegant,
  maintainable, deployable solution that fits *our* conventions — never "what some AI spat
  out." Default to less: extend something, or avoid the feature altogether? (`AGENTS.md`)
- **The user's seat.** They don't care about our internals — what does this *do* for them,
  and why would they come back to it?
- **When a design direction can't be settled on paper, build throwaway mockups of the
  competing options off-main** so the product decision becomes something you can see and
  compare (features then get refined to "match the mockup"). Offer this when a direction is
  genuinely contested on screen.

## Step 3 — Shape a high-level parent

Capture the thinking as a **high-level parent issue** (`writing-task-specs`), in the app's
project, carrying the concept, options and trade-offs that *prove* the problem is
understood. Keep it high-level — do **not** scope the children yet.

## Step 4 — Detailed scoping (a separate, later pass)

Only once the user (and, where they chose it, the team) is aligned, break the parent into
children — nailing the parent's Goal first per `writing-task-specs`, sizing each with
`micro-prs`, and sequencing per `dependency-analysis`. If the Goal can't be written
concretely yet, say so and suggest returning to Steps 1–3 rather than inventing sub-issues
around a fuzzy goal. This is deliberately separate — don't race into it before the shape is
agreed.

## Always on, even when you skip the full chain

For a small, clear problem you'll skip most of the above — but never the critical instinct.
On *every* request still ask: what's the best way; what are the alternatives; is there a
solution that builds nothing at all; is this a real first-order problem or a symptom of
something else. The floor:

1. Does it make the codebase simpler?
2. Does it help us ship faster?
3. Does it improve the user experience?
4. Can we delete code instead of adding it?
