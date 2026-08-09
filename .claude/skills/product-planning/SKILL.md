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
  the concept as documentation up-front and shapes a high-level parent — conducting grill-me and
  writing-task-specs as it goes. Not for trivial, well-understood changes that should go straight to
  code — though its critical-thinking instinct still applies even then.
---

# Deep product planning

The thinking pass *before* any ticket or line of code — to stop us building the wrong thing
well. This is a tool for *judging* the thinking, not a checklist or a sequence of steps.
The principles all apply at once; only one comes first — should this exist at all?

## Default to less — should we build this at all?

The mindset, asked before anything else. What's the simplest path? Can we reuse or extend
instead of adding? Is this a real first-order problem, or a symptom of another? Can we
delete code instead of writing it?

## Push back and ask — but never gate

Interrogate the thinking: pressure-test it, ask the hard questions, don't just accept it
(`grill-me`). But the user is the decision-maker — surface the concern plainly, offer
options, then do what they choose. An incomplete or half-baked plan is never a reason to
block. (Planning quality only: still decline unsafe, unauthorised, or out-of-scope
requests.)

## Is the risk in the idea, or in the code?

The fork that sets the depth. If it's the *idea* — a real-world concept whose
misunderstanding cascades (say, *can one order contain items from more than one seller?*) —
make the concept rock-solid first, and write it down before the code: what it is, how it
behaves, its rules, as a short tracker document (`task-tracker`). If it's a clear,
well-defined problem, go straight to building it. When in doubt, treat it as a concept.

## Parent stays high-level; scope the children later

Capture the problem, the options and the trade-offs in one high-level parent
(`writing-task-specs`) that proves it's understood — pointing at the concept document where
one exists rather than restating it. Keep it high-level, then stop. Breaking it into
sub-issues (sized by `.claude/references/good-diff.md`, sequenced by `dependency-analysis`)
is a separate, later pass, only once the shape is agreed.
