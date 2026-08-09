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

The thinking pass *before* any ticket or line of code — to stop us building the wrong
thing well. The rules:

1. **Decide where the risk lives before touching the "how".** Is it in the *idea* — a
   real-world concept whose misunderstanding cascades into messy code (say, *can one order
   contain items from more than one seller?*) — or only in the code? If the idea: make the
   concept rock-solid first (`grill-me`) before shaping any solution. If a clear,
   well-defined problem: go straight to the solution. When in doubt, treat it as a concept.

2. **Don't gate on planning; the user decides.** State the concern plainly, offer options,
   then do what they choose — an incomplete or half-baked plan is never a reason to block.
   (Planning quality only: still decline unsafe, unauthorised, or out-of-scope requests.)

3. **Write a non-obvious concept down before the code.** Capture what it is, how it
   behaves, and its rules as a short tracker document (`task-tracker`) — defining it first
   is the point. Keep architecture and trade-offs out; those belong in the parent ticket.

4. **Keep the parent high-level; scope the children later.** One high-level parent
   (`writing-task-specs`) carrying the concept, options and trade-offs that prove the
   problem is understood — then stop. Break it into sub-issues (sized by
   `.claude/references/good-diff.md`, sequenced by `dependency-analysis`) as a separate
   pass, only once the shape is agreed.

5. **Ask whether to build anything at all.** Before adding: what's the simplest way, can we
   reuse or extend, is this a first-order problem or a symptom of another — can we delete
   code instead of writing it?
