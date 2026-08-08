---
name: self-review
description: The single place all code review happens in this repo. Use as the mandatory pre-PR gate in the parallel workflow — it drives a loop of cold-eyes `/code-review` passes over the LOCAL working diff vs origin/main until nothing blocking is left, before the PR is created (commits are pushed freely as backup; the PR is what's gated). Also fires whenever the user asks to "review this", "look at this branch", "what do you think of this", "give me feedback on this", "is this ready to merge", or any variant where current work is being evaluated. The target is ALWAYS the local diff, never a remote PR.
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

- **The review target is the LOCAL working diff, never a remote PR.** No PR exists
  at review time — the local diff and the eventual PR diff are the same thing.
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
claude -p "/code-review high" --dangerously-skip-permissions
```

Why each part:

- **`claude -p`** starts a new session with no memory of this conversation. It
  sees only the code and the branch's changes since it forked from `main`. That
  cold read is the entire value — it reviews like a teammate who wasn't in the room.
- **`/code-review high`** is the built-in reviewer at high effort: broad coverage
  of correctness bugs plus reuse/simplification/efficiency cleanups. It already
  reads this repo's `AGENTS.md`/`CLAUDE.md`, so it reviews with our conventions in
  mind.
- **`--dangerously-skip-permissions`** — the review is read-only (no `--fix`; this
  session does the fixing). Skip-permissions only keeps the headless session from
  deadlocking on a prompt it can't answer. Never pass `--fix` to the reviewer.

The reviewer returns findings as a JSON array (empty `[]` when clean). Each
finding carries a `category` — `correctness`, `simplification`, `efficiency`,
`test-coverage`, and so on. That category is how the loop decides what blocks.

- **`correctness` (and any real bug / broken-contract / security finding) is
  blocking** — fix it, then loop.
- **`simplification`, `efficiency`, `test-coverage` and the like are nits** —
  collect them, report at the end, don't loop on them alone.
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
3. **Run the reviewer** (fresh session, as above).
4. **Act on what it found:**
   - **Blocking finding** → fix it *in this session* (full context makes the fix
     better than a blind `--fix`). The fix is new code **and** it deleted the gate
     stamp, so start a fresh pass by **re-invoking this skill through the Skill
     tool** — that re-stamps the gate and launches a new fresh session to re-review
     the *fixed* diff with cold eyes. (Re-running step 3's reviewer alone does not
     re-stamp the gate.)
   - **A finding that needs the owner's decision** (a real fork, a
     product/behaviour call, a destructive or irreversible change) → **stop and
     ask.** Don't guess past a judgment call.
   - **Nit** (`simplification`/`efficiency`/style/`test-coverage` that isn't a
     real gap) → collect it for the final report; it doesn't force another loop.
5. **Exit when a fresh review returns no blocking findings** — and no edit has
   happened since that clean pass.

Loop discipline:

- **Every fix is new, unreviewed code** *and* invalidates the gate stamp, so after
  any fix the loop restarts by **re-invoking this skill** (which re-stamps the gate
  and launches a fresh reviewer). There is no "review once, fix, ship" — the last
  thing that runs is always a clean cold-eyes pass over the final diff, with no
  edit after it.
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
- **The stamp records "the skill was loaded and nothing has been edited since."**
  It approximates loop convergence only because every fix stamps `last_edit` and
  forces a fresh invocation. So the loop's final, clean pass must come *after* the
  last fix: fix (invalidates) → re-invoke this skill → fresh review finds nothing
  → no edits after → gate opens.
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
branch checked out. Run the same fresh cold-eyes reviewer over the local diff,
then relay what it found in plain, conversational language and give a clear
recommendation. This is not the gate: don't force the fix loop unless they want
the fixes made — surface the findings and let them decide.

For a harsher pass — "thermo-nuclear review", "deep code quality audit", "be
really strict about maintainability" — run the `thermo-nuclear-code-quality-review`
skill over the same diff in addition to the cold-eyes pass. That band is never
chosen automatically; the user asks for it.

## Reporting back

Keep it short and human. Lead with the verdict, then the substance:

1. **Verdict.** One line: clean and gated / blocked on findings / too sprawling to
   review — plus, when useful, a rough confidence score out of 100.
2. **What the cold-eyes loop did.** How many passes, what it caught and you fixed.
3. **Nits.** The non-blocking findings you collected, so the owner can decide
   whether any are worth a follow-up. Don't silently drop them.
4. **Straight to you.** One sentence to the developer — "Good to go — merging."
   when it's genuinely clean, or the single most important thing to confirm when
   it isn't. Never manufacture a concern to fill the space.

## Validation before reporting

- Did the review run in a **fresh `claude -p` session**, not in this one?
- Did it target the LOCAL working diff vs `origin/main`?
- Did the loop actually converge — a final fresh pass with zero blocking findings
  and **no edits after it** — rather than being declared done?
- Trust-boundary diff → did `security-reviewer` also run?
- Every nit reported, nothing silently dropped?
- No AI attribution anywhere.
