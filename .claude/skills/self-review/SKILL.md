---
name: self-review
description: The single place all code review happens in this repo — bugs and code quality both. Use as the mandatory pre-PR gate in the parallel workflow — a loop of fresh, zero-context reviews of this branch's diff vs origin/main until nothing blocking is left, before the PR is created (commits are pushed freely as backup; the PR is what's gated). Also fires whenever the user asks to "review this", "look at this branch", "what do you think of this", "give me feedback on this", "is this ready to merge", or any variant where current work is being evaluated — including a request to be especially strict or thorough. The target is ALWAYS the local diff, never a remote PR.
---

# Self-review

Code review here is done by a **fresh, zero-context session** — a stranger to the
diff. The author is the worst judge of their own code: they know why every line
exists and rationalise every choice. So this session never reviews its own work.
Its only jobs are to *drive the loop* and to *fix* what the stranger finds.

This is the only place code review is defined; other skills call it by name.

## The loop

1. Commit your work.
2. Run the reviewer: `.claude/skills/self-review/scripts/cold-review.sh` (from the
   worktree root). It prints findings as JSON (`[]` is clean); a non-zero exit is a
   failed run, not a pass — re-run it.
3. Act on each finding:
   - **Blocking** — a real bug, a broken contract, a security hole, or a missing
     test for a case that can actually happen. Fix it.
   - **Nit** — a pure cleanup (style, micro-efficiency, a test covering no real
     gap). Collect it; don't loop on nits.
   - **Ambiguous** → treat as blocking. **Needs an owner's call** → stop and ask.
4. Fixed something? That's new, unreviewed code — commit and go back to step 2.

Exit when a fresh run finds nothing blocking and no edit has happened since — the
reviewer runs via Bash and does **not** satisfy the gate, so the last action before
the PR is always to re-invoke this skill through the Skill tool (see the gate
below). Never invent a finding to keep looping, nor dismiss a real one to stop. The
bar: CodeRabbit finds nothing on the PR.

A diff too sprawling or mixed to review with confidence *is* the finding — split it
(`micro-prs`) before shipping. A trust-boundary diff (auth, Hasura
permissions/metadata, a Hono webhook/action handler, secrets, `VITE_` env vars)
also needs `security-reviewer` — the cold-eyes pass is not the stack-aware security
review.

## The pre-PR gate

This loop is `parallel-workflow`'s gate before a PR is created (pushing is never
gated). `.claude/hooks/review-gate.sh` blocks PR creation until this skill is
invoked **through the Skill tool** with no edit afterward. The stamp only proves the
skill loaded — not that the reviewer ran — so the loop above has to actually run;
and since any edit clears the stamp, the converged reviewer pass and the stamping
invocation are the last two things before the PR. Read the hook for the exact stamp
mechanics (which tool calls clear it, how it keys sessions) before relying on it.

## When the user just asks for a review

"review this", "is this ready to merge" — run the reviewer, relay what it found in
plain language, and recommend. This is not the gate: surface the findings and let
them decide; don't force the fix loop unless they want the fixes made.

## Reporting back

Short and human. Lead with the verdict, say what the loop caught and fixed, list
the nits so none are dropped silently, and close with one straight sentence to the
developer — "Good to go" when it's clean, or the single thing to confirm when it
isn't. Don't manufacture a concern to fill space.
