---
name: self-review
description: The single place all code review happens in this repo. Use as the mandatory pre-PR gate in the parallel workflow — reviewing the LOCAL working diff vs origin/main before the PR is created (commits are pushed freely as backup; the PR is what's gated) — and whenever the user asks to "review this", "look at this branch", "what do you think of this", "give me feedback on this", "is this ready to merge", or any variant where current work is being evaluated. The target is ALWAYS the local diff, never a remote PR. Owns both halves of a review — the mechanical bug hunt and the judgment pass — scaled to risk across four depth bands, ending in a clear merge recommendation. The harshest band covers a "thermo-nuclear review", "deep code quality audit", or any request for an especially strict maintainability/abstraction-quality pass.
---

# Self-review

Act as a thoughtful colleague reviewing a teammate's work — not a checklist robot, not an over-cautious junior. The goal is to catch what matters before it hits production and to give the developer feedback they can act on quickly.

This skill is the **only** place code review is defined. Other skills call it by name and know nothing about how it works.

## Critical rules

- **The review target is the LOCAL working diff, never a remote PR.** Get it with `git fetch origin main`, then `git diff origin/main`. No PR exists at review time — the local diff and the eventual PR diff are the same thing.
- Never touch `gh pr` in this skill. Post-PR concerns (review threads, CI, bots) belong to the `ci-loop` skill.
- **Reviewing a PR that already exists on GitHub is not this skill's job** — use the built-in `/review`. To get a sworld-aware pass on one, check the branch out and review its local diff here instead.
- For follow-up questions, work from what's already in context. Re-run the diff only when the code has changed (e.g. the next iteration of the self-review loop).
- If the diff is too large or sprawling to confidently review, push back before doing the review. Do not power through a review you don't trust.
- Be direct and conversational, like a colleague leaving a comment on the PR. No padded preamble, no exhaustive bullet lists, no review-theatre.

## How to start a review

Two patterns — the target is the local working diff in both:

**Pattern A — Self-review gate (pre-PR, the parallel-workflow default).** Invoked as `parallel-workflow`'s pre-PR gate, inside the worktree, before the PR is created. Commits may already be pushed — pushing is backup, not publication; the PR is what this gate unlocks. Target: the local working diff (`git fetch origin main && git diff origin/main`). See "Self-review mode" below for how the output semantics change.

**Pattern B — User asks for a review.** They'll say "review this", "look at this branch", or "what do you think of this" with the branch checked out and context loaded. Same target: the local diff vs `origin/main`. Use what's in context.

## Self-review mode (Pattern A — the pre-PR gate)

When this skill runs as `parallel-workflow`'s pre-PR gate, the review itself is identical — same hierarchy, same depth-scaling, same format — but the output semantics change, because the reviewer and the developer are the same party and the point is to fix, not to inform:

- **Concerns are work items, not feedback.** Every concern MUST be fixed before the gate passes. There is no "merge with changes" exit — the changes get made.
- **Suggestions must be resolved, not parked.** Apply each one, or explicitly reject it with reasoning. Never silently drop a suggestion.
- **It loops.** After any fix the loop restarts from Step 1 — fixes are new code and have not been reviewed. The gate exits only when a full pass is clean: zero confirmed findings from the sweep (Step 3) and verdict "Merge" with zero concerns from the judgment pass, with **no edits afterward**.
- **A clean pass is the successful exit, not a failure to find something.** Never manufacture a concern to keep the loop going — the anti-pattern rules apply doubly here.
- **The reviewability judgment still applies.** If the local diff is too sprawling or mixes concerns, that IS the finding: stop and split the work (`micro-prs`) before shipping anything.

The goal of this mode: the PR that eventually goes up is already a good PR. **The bar: CodeRabbit finds nothing.** A substantive bot finding on the PR means this gate failed.

### How the gate is enforced

`.claude/hooks/review-gate.sh` (wired in the tracked `.claude/settings.json`) denies PR creation until this skill has run and **no file has been edited since** — any `Write`/`Edit` invalidates the review outright. Consequences worth knowing:

- **Invoke this skill through the Skill tool.** Only a Skill-tool invocation stamps the gate — the `/self-review` slash command and doing the review's steps by hand do not.
- **The stamp fires when the skill is *invoked*, not when the review finishes.** It records "the skill was loaded and nothing has been edited since" — which approximates convergence only because every fix stamps `last_edit` and forces a fresh invocation. An abandoned review that made no edits still leaves the gate open.
- **The `last_edit` stamp fires on `Write`/`Edit` only, not Bash.** A file written by a build, a formatter or a stray `sed` after the final pass will NOT re-flag it as stale, so it can silently ship unreviewed. Do all rebuilds and Playwright probes **before** the final pass, and treat any `Write`/`Edit` after it as forcing a fresh one. Don't rely on the hook to catch everything.
- **Subagents have their own `session_id`, so their stamps land in a different bucket.** Edits you delegate to a subagent never mark the parent's review stale — that code can ship unreviewed. And a review delegated to a subagent never unblocks the parent, which deadlocks until you re-run it yourself. Keep the fix-edits and the final pass in the same agent that creates the PR.
- The gate blocks PR creation only. **Pushing is never gated** — push freely as backup.
- It matches the phrase anywhere in a Bash command, so a command that merely *mentions* it in quotes is blocked too. That is deliberate — matching only in command position needs quote-aware parsing, and a regex that fakes it lets real invocations slip through. Assemble the string in pieces to work around it.

## Step 1 — Reviewability judgment

Before reviewing the code itself, make a fast judgment about whether this diff is actually reviewable.

Look at:

- **Scope.** Apply `micro-prs`' one-purpose test to the finished diff, after the fact.
- **Surface area.** How many files? How many distinct changes?
- **Risk profile.** Auth, data access, database migrations, shared logic in `packages/core` or `packages/ui` that many apps depend on? Or buttons, copy, styling, internal renames?
- **Coherence.** Is it easy to hold the change in your head, or does it sprawl across the codebase in ways that are hard to reason about?

There is no hard line count. A 150-line button-rename across 20 files can be trivial. A 60-line auth change can be terrifying. Make the call.

If the diff feels too big or too tangled to review with confidence, **push back before reviewing**:

> "This is too sprawling for me to review with confidence. It mixes [X] and [Y]. I'd suggest splitting it — [X] could go in its own PR and ship independently. Want me to break it down, or do you want to do that and come back?"

Better to slow down for ten minutes here than to rubber-stamp something that breaks production.

## Step 2 — Determine review depth

Match the depth of review to the risk and surface area of the change. Four bands:

**Light review (5–10 minutes):**
- Copy changes, button styling, internal refactors with no behaviour change, dependency bumps, type fixes, test additions
- Read the diff, check for obvious mistakes, confirm tests pass, confirm it does what the description says
- Skip deep edge-case analysis — there isn't much to analyse

**Standard review (15–30 minutes):**
- New features, bug fixes, frontend changes that affect UX, refactors that change behaviour
- Read the diff carefully, think through edge cases, check for scope creep, verify tests cover the change, look for unintended side effects
- Consider how this interacts with the rest of the system

**Deep review (30+ minutes, "think it through"):**
- Anything touching shared logic in `packages/core` that many apps depend on
- Database migrations, auth, permissions, security-sensitive code
- Changes to widely-shared UI in `packages/ui`
- New patterns or architectural decisions that will be copied later
- Think deeply: walk through edge cases, consider how it could break, look for missed scenarios, check it against the intended behaviour

**Thermo-nuclear review (the harshest band):**
- Never chosen automatically — the user asks for it: "thermo-nuclear review", "deep code quality audit", "be really strict about this". `/thermo-nuclear-code-quality-review` requests this band.
- Everything in Deep, plus the maintainability bar in *Step 4 — Maintainability* applied at full strength, with its presumptive blockers treated as blockers.
- Correctness is table stakes here. Working code is not a pass — the question is whether the codebase is better afterwards.

The user may tell you what depth they want. If they don't, decide based on the diff — but never self-select thermo-nuclear.

## Step 3 — Finder sweep

Before the judgment read, run a mechanical hunt for correctness bugs. Spawn subagents over the diff — **Light 2, Standard 3, Deep 5**, using the band from Step 2 — one lens each:

- **logic** — wrong operator, inverted condition, off-by-one, wrong variable, bad ordering, state mutated at the wrong time
- **edges** — null/undefined, empty collections, zero, negatives, huge inputs, duplicates, timezone/DST boundaries, concurrent updates
- **failures** — unhandled rejections, missing try/catch around I/O, swallowed errors, a failed call leaving state half-applied
- **contract** — a caller this change breaks, a changed signature or return shape not updated everywhere, a hallucinated API, a type assertion hiding a real mismatch
- **conventions** (Deep only) — violations that cause real defects or that this repo explicitly forbids; ignore cosmetic preference

Each returns findings with `file:line` and the concrete inputs that trigger them. Then, for each finding, spawn one skeptic told to disprove it — look for guards, defaults, callers or types that already prevent it, and walk the claimed inputs through the code path. **Drop anything refuted or not reproducible.** Report survivors, plus a one-line dropped count so the sweep is auditable.

Rules:

- **Anchor to the worktree.** Subagents run in the session's root cwd, not your worktree — always pass an absolute `git -C <worktree> diff origin/main`.
- **Verify scope.** The files reported MUST match `git diff origin/main --name-only` in the worktree. A mismatch, or "no changes found", is a FAILED run, not a clean pass — fix the anchoring and re-run.
- **Empty is a valid result.** For a small or declarative diff it's the expected one. Never manufacture a finding to look thorough; a confident-but-wrong finding burns trust in the whole gate. When in doubt, drop it.
- **Trust boundaries get more.** If the diff touches Hasura permissions/metadata, Hono Action/Event/webhook handlers, or auth, also run `security-reviewer`.

## Step 4 — What to look for

The hierarchy below is in order of importance. A correctness issue is always more important than a style nit. Do not lead with nits.

### Correctness (most important)

- Does it actually do what the tracker issue (or the stated intent) says it should?
- Are there obvious logic errors?
- Edge cases — what about empty arrays, null values, very large inputs, negative numbers, zero, dates that span timezones?
- Round-tripping, what happens at boundaries
- Race conditions, ordering assumptions, concurrent updates
- Error handling — what happens when the network call fails, the file doesn't exist, the database is unreachable? Look for try/catch around I/O. Silently swallowing errors is a bug.

### AI-specific failure modes

If the code looks AI-generated (which most of this code is), specifically check for:

- **Scope creep.** Did the change touch only what was asked? Files modified outside the stated scope are a red flag.
- **Duplicated logic.** Did the AI write a new utility that already exists somewhere in `packages/core`, `packages/ui`, or one of the apps? Search for the function name and similar patterns. Reusing existing utilities is almost always better than creating a parallel one.
- **Wrong-place code.** Did frontend code land in the right package and folder per `frontend-ui-architecture`? Shared UI hand-rolled in an app rather than `packages/ui` is a finding, not a shortcut.
- **Weakened tests.** Were tests deleted or skipped instead of fixed? That is never the right move without explicit justification.
- **Hallucinated APIs.** Calls to functions or properties that don't actually exist, or that exist but with different signatures.
- **Plausible-but-wrong patterns.** Code that follows a pattern in the codebase but applies it where it doesn't fit.
- **Tests that only cover the happy path.** AI tends to write tests that prove the function returns the right thing with perfect input. Check for tests that cover failures, edge cases, and bad data.

### Code style (always top priority here)

Our style rules are non-negotiable and easy to slip past in an AI-generated diff. Check the diff against the style law in `code-conventions` and flag any violation.

### Security and data handling

If the PR touches a **trust boundary** — authentication / Auth0, Hasura permissions or metadata, the `sworld-backend` (Hono) Action/Event or webhook handlers, the admin secret, or `VITE_`-prefixed env vars — do a careful stack-aware pass. For changes that don't touch a boundary, the quick checks are enough:

- Inputs validated where they enter the system?
- Output sanitised where it crosses a trust boundary?
- Secrets, tokens, API keys — handled correctly, not logged or committed?
- User data — appropriate access controls?

Remember the backend lives in the separate `sworld-backend` repo and the data layer is Hasura (`sworld-hasura-v2`) over Postgres — a frontend PR can't be trusted to enforce anything on its own; validation and access control belong server-side.

### Performance

- Obvious N+1 queries or unnecessary loops?
- Expensive operations in hot paths?
- Anything that scales badly with data size?

### Maintainability

The everyday questions:

- Will a future developer (or AI) understand this?
- Naming clear and consistent with the codebase?
- Functions doing one thing each?
- Reasonable abstractions, not over-engineered?

**At the thermo-nuclear band, this dimension becomes the review.** Be ambitious about structure: don't stop at "this could be a bit cleaner". Look for the *code judo* move — a reframing that uses the existing architecture better and makes whole branches, helpers, modes or layers disappear. Prefer deleting complexity to rearranging it; a refactor that moves the same mess around is not a win. Prefer a few high-conviction structural findings over a long list of nits.

What to push on:

- **Spaghetti growth.** New ad-hoc conditionals, scattered special cases, one-off branches bolted onto unrelated flows. "Weird if statements in random places" is a design problem, not a stylistic nit — push the logic behind a dedicated abstraction instead of tangling an existing path.
- **File size.** A file crossing 1000 lines because of this diff is a strong smell. Ask whether it should be decomposed first; waive only when the result is still clearly organised.
- **Magic and thin abstractions.** Brittle or "clever" behaviour, generic mechanisms hiding simple data-shape assumptions, identity wrappers and pass-through helpers that add indirection without buying clarity. Boring and direct wins.
- **Type and boundary cleanliness.** Unnecessary optionality, `any`, `unknown`, cast-heavy code, or a silent fallback papering over an unclear invariant — make the boundary explicit and the control flow usually simplifies with it.
- **Canonical layer.** Feature logic leaking into shared paths, bespoke helpers where a canonical one exists, logic sitting in the wrong package. Push it to the module that already owns the concept rather than normalising the drift.
- **Orchestration.** Independent work serialised for no reason, or related updates that can leave state half-applied.

Presumptive blockers at this band, unless clearly justified — a plausible code-judo move left on the table, a file pushed past 1000 lines, ad-hoc branching that tangles an existing flow, feature checks scattered across shared code, an unnecessary wrapper or cast-heavy contract, or a duplicated helper that has a canonical home.

Say it plainly: *"this pushes the file past 1k lines — can we decompose first?"*, *"this refactor moves complexity around but doesn't delete it"*, *"I think there's a code-judo move here that makes this much simpler"*. Direct and serious, never rude, and never softened into a mild suggestion.

**Prefer these remedies**, in roughly this order — delete a whole layer of indirection rather than polishing it; reframe the state model so conditionals disappear instead of getting centralised; move the ownership boundary so the feature becomes a natural extension of something that already exists; turn special-case logic into a simpler default flow with fewer exceptions; replace condition chains with a typed model or an explicit dispatcher; separate orchestration from business logic; make type boundaries explicit so control flow simplifies with them; parallelise independent work where that also simplifies orchestration; restructure related updates to be more atomic where partial state would be hard to reason about. Only then the ordinary moves: extract a helper, split a file, reuse the canonical utility.

**Ordering the output at this band** overrides the default "correctness first" ordering — correctness is assumed. Lead with structural regressions, then missed code-judo simplifications, then spaghetti/branching growth, then boundary/abstraction/type-contract problems, then file size, then modularity, then legibility. Never flood the review with low-value nits while a structural issue is on the table.

### Style and nits (least important)

- Formatting, naming conventions, minor preferences
- Never block on these alone. Mention them as "nit:" if mentioning at all.

## Step 5 — The output

End the review with a single, structured response that includes:

1. **Verdict and score.** A one-line judgment (merge / merge with changes / don't merge) and a score out of 100. The score is a rough indicator, not a precise measurement. Use it to communicate confidence level.
2. **What's good.** Two or three lines on what works. Concrete, not generic. This isn't padding — it tells the developer what to keep doing.
3. **Concerns.** Direct, conversational, ordered by importance. Lead with anything that could break production. Use plain English, write as if leaving a comment on the PR.
4. **Suggestions.** Things worth considering but not blocking. Frame as questions or "have you considered" — leave the call to the developer.
5. **Straight to you.** Close with one sentence addressed directly to the developer, as if you were messaging them personally — no nonsense, straight to the core. This is the whole point of the review distilled: the one thing that most affects your confidence the code works, keeps working, and has the edge cases thought through. When you're confident in the PR, it's simply "Good to go — merging." Do not manufacture a concern to fill the space — if it's clean, say it's clean. When you're not confident, it's the single thing you'd most want them to confirm, double-check, or change to give the PR that confidence. Suggestive, not authoritative.

### Format

```markdown
**Verdict:** [Merge / Merge with changes / Don't merge — needs work]
**Score:** XX/100

**What's good**
- [Specific thing 1]
- [Specific thing 2]

**Concerns**
[Direct conversational feedback. One concern per paragraph. Lead with the highest-impact one. State what's wrong and why, briefly.]

**Suggestions**
[Optional. Things worth considering but not blocking. Frame as questions.]

**Straight to you**
[One sentence, addressed to the developer. "Good to go — merging." when you're confident; otherwise the single most important thing you'd want them to confirm or change.]
```

### Tone

Write like a senior colleague leaving a comment. Direct on the things that are wrong, suggestive on the things that could be better.

Direct examples:

> The `resumePlayback` call here passes the wrong track ID — it's pulling from `currentTrack` but the surrounding code is in a loop iterating over `tracks`. This will resume every item at the same position.

> The test only covers the happy path. There's no test for what happens when the saved position is past the end of the track, or when the list is empty. Both are real scenarios in our data.

Suggestive examples:

> Have you considered pulling the position-restore logic into the existing `usePlaybackPosition` hook rather than inlining it here? It exists already and is tested — would avoid the duplication.

> Worth thinking about whether this should be behind a feature flag. It changes how playback resumes for every existing user — might want to roll it out gradually.

### Anti-patterns

Avoid:

- Long preamble. Get to the point.
- Exhaustive bullet lists that pretend to be thorough but mostly say nothing. One sharp concern beats five vague ones.
- Restating the diff. The user can read it.
- Hedging language like "you might want to consider potentially thinking about whether perhaps..." Be direct.
- "Great PR!" followed by serious concerns. Match the tone to the verdict.
- Mentioning style nits before correctness issues.
- Manufacturing a closing concern when the PR is genuinely clean. If you're confident, "Good to go — merging." is the right answer — don't invent something to ask for.

## Step 6 — After delivering the review

If the user asks follow-up questions, work from context. Do not re-fetch anything. If you genuinely need information that isn't in context (e.g. "what does this function do in the rest of the codebase"), say so and ask the user whether to dig in.

## Worked example — light review

For a copy change across 5 files (change: "rename Listen tab labels for consistency"):

```markdown
**Verdict:** Merge
**Score:** 95/100

**What's good**
- Consistent rename across all five files
- Test snapshots updated correctly

**Concerns**
None blocking.

**Suggestions**
The string "Now playing" appears twice in `PlayerBar.tsx` — looks like one of them was missed in the rename and still says "Currently playing". Worth a quick check before merge.

**Straight to you**
One quick thing before you merge — eyeball that second "Currently playing" in PlayerBar.tsx, looks like the rename skipped it.
```

## Worked example — deep review

For a behaviour change (change: "persist playback position across reloads"):

```markdown
**Verdict:** Merge with changes
**Score:** 72/100

**What's good**
- Correctly identifies that the live player state was the right source instead of the stale local value
- New test covers the case where the track is switched mid-session

**Concerns**
The change works when a saved position exists, but `restorePosition` returns zero when the stored value is null (the function short-circuits). I'd expect this to mean playback always jumps to the start for any user who hasn't played that track before. That's likely the majority of first-time sessions. Either default to the start explicitly, or guard against the null case and keep the previous behaviour.

The test uses a track that's always been played to the same point. The bug we're fixing is specifically about resuming mid-track after a reload — that needs a test that reloads at a non-zero position and asserts the resumed position.

**Suggestions**
This changes behaviour every existing user will notice on their next reload. Worth putting it behind a feature flag so we can roll it out to a small group first.

**Straight to you**
The one I'd want nailed before this goes in: confirm playback doesn't silently jump to the start when there's no saved position — that's most first-time sessions.
```

## Worked example — clean PR

For a small, well-tested change you're fully confident in (change: "add empty state to the Library list"):

```markdown
**Verdict:** Merge
**Score:** 96/100

**What's good**
- Reuses the existing `EmptyState` component from `packages/ui` instead of rolling a new one
- Covered by a test for the no-rows case

**Concerns**
None.

**Straight to you**
Good to go — merging.
```

## Validation before delivering the review

- Did I review the LOCAL working diff vs `origin/main` (fetched `origin main` first, never touched `gh pr`)?
- In self-review mode: did I treat every concern as a work item to fix, and is the loop exit (verdict "Merge", zero concerns) genuinely earned rather than declared?
- Did I make a judgment call about reviewability before diving in?
- Did I match depth to risk and surface area?
- Is the feedback ordered by importance (correctness first, style last)?
- Is the verdict and score clear?
- Is the tone direct on what's wrong, suggestive on what could be better?
- Did I close with a direct one-sentence note to the developer — a simple "Good to go — merging." when confident, or the single most important ask when not (never a manufactured one)?
- No AI attribution anywhere?
- Under 400 words for a light review, under 800 for a standard, longer only when the PR genuinely needs it?
