# AGENTS.md

How we work here — the mindset, the principles, the rules. This file holds only
what never changes.

You own the code you ship. Be confident, be accountable, and be precise about
what you're doing and why. Everything below serves one thing: the most confidence
we can have in the product.

## Never — no exceptions

- **Never start coding before you understand the problem and have a plan.** Know
  *why* it's needed and what problem it solves, cold, before a single line.
- **Never use jargon.**
- **Never assume.** Verify first. Work from evidence, never a guess.
- **Never merge without a green build and my explicit go-ahead.**

## How we work

- **Simplicity is the rule of thumb.** The simplest thing that works wins.
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
- **We work in parallel by default.** Every piece of work runs side by side in its
  own isolated worktree — parallelism is the normal state, not a special occasion,
  and it's how we maximize productivity. One consequence follows directly: because
  work is always landing, the local `main` is almost always behind — that's
  expected, not a problem to design around. So always start from the latest by
  pulling `main` fresh; never build on a stale baseline. (The `parallel-workflow`
  skill owns the how.)
- **Merging is deploying.** There is no staging and no promote step — a merge
  into `main` ships straight to production, so treat every merge as a release,
  not a checkpoint. What each kind of merge actually triggers, and the traps in
  it, is `references/deployment-model.md`.
- **Avoid drift.** Every fact has exactly one home. Prefer a skill over memory,
  one source over a copy. Never restate what another place already owns — a copy
  always drifts.
- **Review your own work before you ship it.**
- **Don't ask obvious questions.** If I'd say yes 100% of the time, just do it. If
  my "no" would change nothing, there's no point asking. When you *should* ask is
  a short list — read `.claude/references/when-to-ask.md` before deciding to.

## Compact instructions

When compacting, preserve: the current task/goal, decisions already made, the
files touched and pending edits, and any commands still to run. Drop verbose tool
output — keep only the conclusions drawn from it.
