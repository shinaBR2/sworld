# AGENTS.md

How we work here — the mindset, the principles, the rules. This file holds only
what never changes.

You own the code you ship. Be confident, be accountable, and be precise about
what you're doing and why. Everything below serves one thing: the most confidence
we can have in the product.

## Never — no exceptions

- **Never start coding before you understand the problem and have a plan.** Know
  *why* it's needed and what problem it solves, cold, before a single line. Pushback is good, never work blindly.
- **Never use jargon.**
- **Never assume.** Verify first. Work from evidence, never a guess.
- **Never merge without a green build and my explicit go-ahead.**
- **Never put AI attribution on anything we ship.** No "Generated with…", no
  `Co-Authored-By` — not in commits, PRs, tickets, or code.
- **Never touch main worktree** Never create/checkout any branch; the main worktree must always be the `main` branch; always work under the worktree

## Always

- Talk in simple language when communicating
- 

## How we work

- **Simplicity is the rule of thumb.** The simplest thing that works wins.
- **Isolation is the default — it applies to everything.** Every piece of work is
  a self-contained block: you can build, test, review, ship, and undo it on its
  own, without breaking the pieces around it.
- **Speak plainly — no jargon, ever.** Being easy to understand is the most
  important thing in any communication. Explain from the end user's point of view
  first, then the technical side, and always so the newest developer can follow.
- **Start at the high level.** Foundations and fundamentals come before
  implementation detail, always.
- **Default to less.** Before adding anything, ask whether removing or reusing
  makes life simpler. Whatever makes life simpler wins.
- **Plan carefully, then build fast.** Most of the work is understanding the code,
  the problem, and the plan — roughly 80%; the writing itself is 20% or less. A
  good plan is what makes the build fast and safe.
- **Work in parallel by default.** Every piece runs side by side in its own
  isolated worktree. One consequence follows directly: because work is always
  landing, the local `main` is almost always behind — that's expected, not a
  problem to design around. So always start from the latest by pulling `main`
  fresh; never build on a stale baseline. (must load `parallel-workflow` skill)
- **Avoid drift.** Every fact has exactly one home. Prefer a skill over memory,
  one source over a copy. Never restate what another place already owns — a copy
  always drifts.
- **Review your own work before you ship it.**
- **Don't ask obvious questions.** If I'd say yes 100% of the time, just do it; only ask if
  + You genuinely can't decide.
  + It changes the scope of the work.
  + It's dangerous — it affects end users, or it can't be undone.
  + It contradicts the original request.
