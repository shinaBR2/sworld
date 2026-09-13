---
name: self-review
description: The single place all code review happens in this repo — bugs and code quality both. Use as the required pre-PR review in the parallel workflow — a loop of fresh, zero-context reviews of this branch's diff vs origin/main until nothing blocking is left, before the PR is created (commits are pushed freely as backup). Also fires whenever the user asks to "review this", "look at this branch", "what do you think of this", "give me feedback on this", "is this ready to merge", or any variant where current work is being evaluated — including a request to be especially strict or thorough. The target is ALWAYS the local diff, never a remote PR.
---

* self-review: the single place all code review happens in this repo, looping fresh zero-context reviews of the branch diff until nothing blocking is left.

* Rules
  * Code review is done by a fresh, zero-context session — a stranger to the diff — that never reviews its own work, because the author is the worst judge of their own code; its only jobs are to drive the loop and fix what the stranger finds.
  * This is the only place code review is defined; other skills call it by name.
  * A non-zero exit from the reviewer is never a pass — read what it printed and act on it (commit first, fix the branch, or re-run a genuine hang).
  * A blocking finding is a real bug, a broken contract, a security hole, or a missing test for a case that can actually happen — fix it.
  * A nit is a pure cleanup (style, micro-efficiency, a test covering no real gap) — collect it and never loop on nits.
  * Treat an ambiguous finding as blocking, and stop and ask on any finding that needs an owner's call.
  * A diff too sprawling or mixed to review with confidence is itself the finding — judge it against `.claude/references/good-diff.md` and split it before shipping.
  * A trust-boundary diff (auth, Hasura permissions/metadata, a Hono webhook/action handler, secrets, `VITE_` env vars) also needs `security-reviewer`, since the cold-eyes pass is not the stack-aware security review.
  * Never invent a finding to keep looping, nor dismiss a real one to stop; the bar is that CodeRabbit finds nothing on the PR.
  * Report back short and human — lead with the verdict, say what the loop caught and fixed, list the nits so none are dropped silently, and close with one straight sentence to the developer ("Good to go" when clean, or the single thing to confirm when not) without manufacturing a concern to fill space.
  * Exit when a fresh run finds nothing blocking and no edit has happened since.

* Steps
  1. Commit your work.
  2. Run the reviewer, from the worktree root.
     * `.claude/skills/self-review/scripts/cold-review.sh`
     * clean when its review ends with `[]`
  3. Act on each finding by its class.
  4. If you fixed anything, commit that new unreviewed code and go back to step 2.
