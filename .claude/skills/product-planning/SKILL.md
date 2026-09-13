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

* product-planning: the rigorous, first-principles thinking pass before any ticket or line of code, to stop us building the wrong thing well.

* Rules
  * This is a tool for judging whether the thinking is clear, not a checklist or a sequence of steps — the principles all apply at once, and only one comes first: should this exist at all?
  * Before anything else, ask whether we should build this at all — the simplest path, whether to reuse or extend instead of adding, whether it's a real first-order problem or a symptom of another, and whether code can be deleted instead of written.
  * Interrogate and pressure-test the thinking and ask the hard questions (`grill-me`), but never gate on it — the user is the decision-maker, so surface the concern plainly, offer options, then do what they choose, and treat an incomplete or half-baked plan as never a reason to block.
  * Never block on the quality or completeness of the planning itself — but still decline requests that are unsafe, unauthorised, or out of scope.
  * When the risk is in the idea — a real-world concept whose misunderstanding cascades (say, can one order contain items from more than one seller?) — make the concept rock-solid and write it down before the code, as a short tracker document (`task-tracker`) covering what it is, how it behaves, and its rules.
  * When it's a clear, well-defined problem go straight to building it, and when in doubt treat it as a concept.
  * Capture the problem, the options and the trade-offs in one high-level parent (`writing-task-specs`) that proves it's understood, pointing at the concept document where one exists rather than restating it, then keep it high-level and stop.
  * Breaking the parent into sub-issues (sized by `.claude/references/good-diff.md`, sequenced by `dependency-analysis`) is a separate, later pass, done only once the shape is agreed.

* Steps
  1. Ask whether this should exist at all, before anything else.
  2. Decide where the risk sits — in the idea or in the code.
  3. If it's the idea, write the concept down as a short tracker document before any code; if it's a clear problem, go straight to building.
  4. Capture one high-level parent that proves the shape is understood, then stop.
