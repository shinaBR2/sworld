---
name: self-review
description: The single place all code review happens in this repo — bugs and code quality both, since `/code-review` covers both. Use as the mandatory pre-PR gate in the parallel workflow — it drives a loop of cold-eyes `/code-review` passes over this branch's committed diff vs origin/main until nothing blocking is left, before the PR is created (commits are pushed freely as backup; the PR is what's gated). Also fires whenever the user asks to "review this", "look at this branch", "what do you think of this", "give me feedback on this", "is this ready to merge", "do a deep code quality audit", "be really strict about this", "thermo-nuclear review", or any variant where current work is being evaluated. The target is ALWAYS the local diff, never a remote PR.
---

# Self-review

The review itself is done by a **fresh Claude Code session with zero context** —
a stranger to the code. This session's only jobs are to *drive the loop* and to
*fix* what the stranger finds. The session that wrote the code is the worst judge
of it (it already knows why every line exists and rationalises its own choices),
so it never reviews its own work — it hands the diff to cold eyes.

This skill is the **only** place code review is defined. Other skills call it by
name and know nothing about how it works.

## Critical rules

- **The review target is this branch's own diff vs `origin/main`, never a remote
  PR.** No PR exists at review time — this branch's diff and the eventual PR diff
  are the same thing. Commit first (the `origin/main...HEAD` range is defined by
  commits) so what's reviewed is exactly what the PR will show.
- **The reviewer is a fresh, zero-context session** — see "The reviewer" below for
  the exact command. Never review the diff yourself from inside this session — that
  is marking your own homework, which is the whole thing this skill exists to
  prevent.
- Post-PR concerns (review threads, CI, bots) belong to the `ci-loop` skill —
  this skill stops at the pre-PR gate.
- **Reviewing a PR that already exists on GitHub is not this skill's job.** Check
  the branch out and review its local diff here instead.
- Be direct and conversational when you report back — like a colleague, not a
  checklist robot. No padded preamble, no review-theatre.

## The reviewer — a fresh, zero-context session

Launch the review as a brand-new headless session, from inside the worktree:

```
claude -p "/code-review high origin/main...HEAD" --dangerously-skip-permissions
```

Why each part:

- **`claude -p`** starts a new session with no memory of this conversation. The
  isolation is *contextual*, not filesystem-scoped: it can read the whole tree for
  context, like any reviewer, but it carries none of *our* rationalisations about
  why each line exists. That cold read is the entire value — it reviews the diff
  like a teammate who wasn't in the room.
- **`/code-review high`** is the built-in reviewer at high effort: broad coverage
  of correctness bugs plus reuse/simplification/efficiency cleanups. It already
  reads this repo's `AGENTS.md`/`CLAUDE.md`, so it reviews with our conventions in
  mind.
- **`origin/main...HEAD`** is the explicit review target, and it is not optional.
  With no target, `/code-review` reviews only "commits ahead of `@{upstream}` plus
  uncommitted changes" — which is **empty** on a committed-and-pushed branch (the
  workflow's normal state, since pushing is backup), giving a silent false-clean
  pass. It also falls back to *local* `main`, which is almost always stale. Naming
  `origin/main...HEAD` pins the review to exactly the diff this branch adds since it
  forked from the real `origin/main` — the same diff the PR will show. This is why
  step 1 fetches `origin/main` first.
- **`--dangerously-skip-permissions`** — the review is read-only (no `--fix`; this
  session does the fixing). Skip-permissions only keeps the headless session from
  deadlocking on a prompt it can't answer. Never pass `--fix` to the reviewer.

Run it from Bash; its findings print to stdout as a JSON array (empty `[]` when
clean) — read them there. **An empty or errored run is not a clean pass.** Only a
run that finished and printed `[]` counts as clean; a timeout, a non-zero exit, or
empty stdout means the review didn't happen — re-run it, never treat it as a pass.
And a clean `[]` is only trustworthy if the reviewer actually saw the diff: before
believing it, confirm `git diff origin/main...HEAD --stat` is non-empty (and, when
the reviewer named files, that they belong to it). A clean pass over an empty or
stale diff — a reviewer launched against the wrong ref or outside the worktree —
is a failed run, not a pass. Each finding is a `{file, line, summary,
failure_scenario}` object. There is **no `category` field** to switch on, so you
classify each finding yourself by reading its `summary` and `failure_scenario` and
judging what it actually is:

- **Blocking** — a real correctness bug, a broken contract, a security hole, or a
  missing test for a genuine case (an edge or failure path that can really occur).
  Fix it, then loop.
- **Nit** — a pure cleanup: simplification, micro-efficiency, style, or a
  nice-to-have test that covers no real gap. Collect these, report at the end,
  don't loop on them alone.
- **When a finding is genuinely ambiguous between the two, treat it as blocking.**
  The bar is "CodeRabbit finds nothing", so err toward fixing.
- **Trust-boundary diffs get more.** If the diff touches Auth0/JWT, Hasura
  permissions or metadata, a Hono Action/Event/webhook handler, the admin secret,
  or `VITE_`-prefixed env vars, also run the `security-reviewer` skill over it —
  `/code-review` is not the stack-aware security pass.

## The gate loop (the parallel-workflow pre-PR gate)

This is the mandatory gate before a PR is created. Commits may already be pushed —
pushing is backup, not publication; the PR is what this gate unlocks.

1. `git fetch origin main`.
2. **Reviewability first.** Before spending a review pass, glance at the diff. If
   it's too sprawling or mixes unrelated concerns to review with confidence, that
   IS the finding: stop and split the work (`micro-prs`) before shipping anything.
   Don't power through a review you won't trust.
3. **Commit, then run the reviewer** (fresh session, as above). The
   `origin/main...HEAD` range is defined by commits, so commit your work first — it
   guarantees the reviewer sees exactly the diff the PR will show.
4. **Act on what it found:**
   - **Blocking finding** → fix it *in this session* (full context makes the fix
     better than a blind `--fix`). A fix is new code, so start a fresh pass — two
     separate actions, both required: (a) **commit the fix and re-run step 3's
     reviewer** over it (that is what actually re-reviews it), and (b) **re-invoke
     this skill through the Skill tool** to re-stamp the gate, since the `Write`/
     `Edit` that made the fix deleted the stamp. Re-invoking the skill only reloads
     these instructions and re-stamps the gate — it does **not** run any review; the
     `claude -p` reviewer in (a) is the only thing that does.
   - **A finding that needs the owner's decision** (a real fork, a
     product/behaviour call, a destructive or irreversible change) → **stop and
     ask.** Don't guess past a judgment call.
   - **Nit** (a pure cleanup, or a test that covers no real gap — see the
     blocking/nit split above) → collect it for the final report; it doesn't force
     another loop.
5. **Exit when a fresh review returns no blocking findings** — and no edit has
   happened since that clean pass.

Loop discipline:

- **Every fix is new, unreviewed code** *and* invalidates the gate stamp, so after
  any fix the loop restarts with both actions from step 4: re-run the reviewer over
  the fixed diff, and re-invoke this skill to re-stamp the gate. There is no "review
  once, fix, ship" — the last thing that runs is always a clean cold-eyes pass over
  the final diff, with no edit after it.
- **A clean pass is the goal, not a failure to find something.** Never invent a
  finding to keep the loop going, and never dismiss a real one to end it early.
- **The bar: CodeRabbit finds nothing.** A substantive bot finding on the PR
  later means this gate failed.

### How the gate is enforced

`.claude/hooks/review-gate.sh` (wired in the tracked `.claude/settings.json`)
denies PR creation until this skill has run and **no file has been edited since**
— any `Write`/`Edit` invalidates the stamp. Consequences worth knowing:

- **Invoke this skill through the Skill tool.** Only a Skill-tool invocation
  stamps the gate — the `/self-review` slash command and doing the steps by hand
  do not.
- **The stamp records "the skill was loaded and nothing has been edited since" —
  not "a review actually ran."** It fires when this skill is invoked, *before* the
  separate `claude -p` reviewer runs — and it fires just the same if the reviewer
  never runs, errors out, or you skip it. So invoking the skill and skipping the
  reviewer opens the gate over a **completely unreviewed diff**; the stamp cannot
  tell the difference. This trap is sharper now that the review is a separate manual
  command, not something this skill runs for you — you must actually run it every
  pass. The stamp only approximates loop convergence because every fix stamps
  `last_edit` and forces a fresh invocation, so the final clean pass must come
  *after* the last fix: fix (invalidates) → re-run the reviewer (finds nothing) →
  re-invoke this skill (re-stamp) → no edits after → gate opens.
- **The `last_edit` stamp fires on `Write`/`Edit` only, not Bash.** A file written
  by a build, a formatter, or a stray `sed` after the final pass will NOT re-flag
  it as stale, so it can silently ship unreviewed. Do all rebuilds and probes
  **before** the final pass, and treat any `Write`/`Edit` after it as forcing a
  fresh one.
- **Subagents have their own `session_id`, so their stamps land in a different
  bucket.** Edits you delegate to a subagent never mark the parent's review stale;
  a review delegated to a subagent never unblocks the parent. Keep the fix-edits
  and the final gate pass in the same agent that creates the PR. (The *reviewer*
  is a separate `claude -p` process by design — that's fine, it makes no edits.)
- The gate blocks PR creation only. **Pushing is never gated** — push freely as
  backup.

## When the user just asks for a review

"review this", "what do you think of this", "is this ready to merge" — with the
branch checked out. Run the same fresh cold-eyes reviewer over the local diff:
`git fetch origin main` first (the `origin/main...HEAD` target resolves against a
stale local ref otherwise), and commit any work-in-progress so it lands in the
range. Then relay what the reviewer found in plain, conversational language and
give a clear recommendation. This is not the gate: don't force the fix loop unless
they want the fixes made — surface the findings and let them decide.

## Reporting back

Keep it short and human. Lead with the verdict, then the substance:

1. **Verdict.** One line: clean / blocked on findings / too sprawling to review —
   plus, when useful, a rough confidence score out of 100. On the gate path, "clean"
   means the gate passed; on the ad-hoc path it's just the review's verdict, no gate
   state to claim.
2. **What the cold-eyes loop did.** How many passes, what it caught and you fixed.
3. **Nits.** The non-blocking findings you collected, so the owner can decide
   whether any are worth a follow-up. Don't silently drop them.
4. **Straight to you.** One sentence to the developer — "Good to go — merging."
   when it's genuinely clean, or the single most important thing to confirm when
   it isn't. Never manufacture a concern to fill the space.

## Validation before reporting

- Did the review run in a **fresh `claude -p` session**, not in this one?
- Did it target this branch's committed diff vs `origin/main` (the
  `origin/main...HEAD` range), over a non-empty diff?
- Did the loop actually converge — a final fresh pass with zero blocking findings
  and **no edits after it** — rather than being declared done?
- Trust-boundary diff → did `security-reviewer` also run?
- Every nit reported, nothing silently dropped?
- No AI attribution anywhere.
