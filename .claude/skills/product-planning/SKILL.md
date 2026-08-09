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

The thinking pass *before* any ticket or line of code — its whole point is to stop us
building the wrong thing well. Five things here change what I'd do left to my own devices;
the rest of planning I do unaided.

1. **Ask "is there a domain concept at stake?" before asking "how do I build it?"** My
   default is to jump to implementation. First decide where the risk lives: in the *idea* —
   a real-world concept whose misunderstanding cascades into messy code (*"a til entry can
   now reference a journal entry, not just a listen session"*) — or just in the code. If
   it's the idea, make the concept rock-solid first (lean on `grill-me`); if it's a clear,
   well-defined problem, go straight to the solution. When in doubt, treat it as a concept.

2. **Facilitate, never gate on planning.** The user is the decision-maker — co-founder,
   head of product. When I think the *thinking* isn't ready, my instinct is to stall or
   push back until it's fixed. Instead: say the concern plainly, offer options, then do
   what they decide — an incomplete or half-baked plan is never my reason to block. (This
   is about planning quality only: an unsafe, unauthorised, or out-of-scope request I can
   still decline as normal.)

3. **Write the concept down before the code, not after.** For a non-obvious concept,
   capture what it is, how it behaves, and its rules as a short tracker document
   (`task-tracker`) up-front — defining it first is the point. Keep architecture and
   trade-offs out; those belong in the parent ticket.

4. **Keep the parent ticket high-level; don't scope the children yet.** Capture the
   concept, options and trade-offs in one high-level parent (`writing-task-specs`) that
   proves the problem is understood — then stop. Breaking it into sub-issues (sized by
   `.claude/references/good-diff.md`, sequenced by `dependency-analysis`) is a separate,
   later pass, only after the shape is agreed.

5. **Ask whether we can build nothing at all.** On every request, before adding anything:
   what's the simplest way, can we reuse or extend instead, is this a real first-order
   problem or a symptom of another — can we delete code instead of writing it? (`AGENTS.md`)
