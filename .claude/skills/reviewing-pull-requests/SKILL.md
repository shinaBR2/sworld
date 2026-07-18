---
name: reviewing-pull-requests
description: This skill should be used as the mandatory pre-PR self-review gate in the parallel workflow (step 11) — reviewing the LOCAL working diff vs origin/main before the PR is created (commits are pushed freely as backup; the PR is what's gated) — and whenever the user asks to "review this", "look at this branch", "what do you think of this", "give me feedback on this", "is this ready to merge", or any variant where the current work is being evaluated. The review target is ALWAYS the local diff, never a remote PR. Enforces a judgment-driven review approach — scaled to risk and size, with colleague-tone feedback ending in a clear merge recommendation.
---

# Reviewing Pull Requests

Act as a thoughtful colleague reviewing a teammate's work — not a checklist robot, not an over-cautious junior. The goal is to catch what matters before it hits production and to give the developer feedback they can act on quickly.

## Critical rules

- **The review target is the LOCAL working diff, never a remote PR.** Get it with `git fetch origin main`, then `git diff origin/main`. No PR exists at review time — the local diff and the eventual PR diff are the same thing.
- Never touch `gh pr` in this skill. Post-PR concerns (review threads, CI, bots) belong to the CI loop in `parallel-workflow`.
- For follow-up questions, work from what's already in context. Re-run the diff only when the code has changed (e.g. the next iteration of the self-review loop).
- If the diff is too large or sprawling to confidently review, push back before doing the review. Do not power through a review you don't trust.
- Be direct and conversational, like a colleague leaving a comment on the PR. No padded preamble, no exhaustive bullet lists, no review-theatre.

## How to start a review

Two patterns — the target is the local working diff in both:

**Pattern A — Self-review gate (pre-PR, the parallel-workflow default).** Invoked as step 11 of the parallel workflow, inside the worktree, before the PR is created. Commits may already be pushed — pushing is backup, not publication; the PR is what this gate unlocks. Target: the local working diff (`git fetch origin main && git diff origin/main`). See "Self-review mode" below for how the output semantics change.

**Pattern B — User asks for a review.** They'll say "review this", "look at this branch", or "what do you think of this" with the branch checked out and context loaded. Same target: the local diff vs `origin/main`. Use what's in context.

## Self-review mode (Pattern A — the pre-PR gate)

When this skill runs as the parallel-workflow step-11 gate, the review itself is identical — same hierarchy, same depth-scaling, same format — but the output semantics change, because the reviewer and the developer are the same party and the point is to fix, not to inform:

- **Concerns are work items, not feedback.** Every concern MUST be fixed before the gate passes. There is no "merge with changes" exit — the changes get made.
- **Suggestions must be resolved, not parked.** Apply each one, or explicitly reject it with reasoning. Never silently drop a suggestion.
- **It loops.** This skill runs alongside `/code-review`, and after any fix the loop restarts — fixes are new code and have not been reviewed. The gate exits only when a full pass is clean on BOTH: verdict "Merge" with zero concerns here, zero confirmed findings from `/code-review`.
- **A clean pass is the successful exit, not a failure to find something.** Never manufacture a concern to keep the loop going — the anti-pattern rules apply doubly here.
- **The reviewability judgment still applies.** If the local diff is too sprawling or mixes concerns, that IS the finding: stop and split the work (`micro-prs`) before shipping anything.

The goal of this mode: the PR that eventually goes up is already a good PR — bugbot/CodeRabbit and the human reviewer should find nothing substantive.

## Step 1 — Reviewability judgment

Before reviewing the code itself, make a fast judgment about whether this diff is actually reviewable.

Look at:

- **Scope.** Same test as `micro-prs`' one-purpose rule, applied after the fact: does this change do one thing, in one app/package/repo, or is it touching too many unrelated concerns?
- **Surface area.** How many files? How many distinct changes?
- **Risk profile.** Auth, data access, database migrations, shared logic in `packages/core` or `packages/ui` that many apps depend on? Or buttons, copy, styling, internal renames?
- **Coherence.** Is it easy to hold the change in your head, or does it sprawl across the codebase in ways that are hard to reason about?

There is no hard line count. A 150-line button-rename across 20 files can be trivial. A 60-line auth change can be terrifying. Make the call.

If the diff feels too big or too tangled to review with confidence, **push back before reviewing**:

> "This is too sprawling for me to review with confidence. It mixes [X] and [Y]. I'd suggest splitting it — [X] could go in its own PR and ship independently. Want me to break it down, or do you want to do that and come back?"

Better to slow down for ten minutes here than to rubber-stamp something that breaks production.

## Step 2 — Determine review depth

Match the depth of review to the risk and surface area of the change. Three rough bands:

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

The user may tell you what depth they want. If they don't, decide based on the diff.

### Review depth → `/code-review` effort tier

The self-review gate (`parallel-workflow` step 11) runs the `code-review` skill (`/code-review`) on the same diff. This is the canonical mapping from the depth band above to that skill's effort tier — pick the tier from the band you just chose, don't decide it fresh each run:

| Depth band | `/code-review` effort | What runs |
| --- | --- | --- |
| Light | `low` | One inline pass. The judgment read here + CodeRabbit on the PR already cover breadth — a background fleet adds cost, not signal. |
| Standard | `medium` | One inline pass, slightly wider net. Still no background fleet. |
| Deep | `high` (`xhigh` only when genuinely warranted) | Spawns the multi-agent finder + verifier fleet — worth its cost only when a hidden bug's blast radius is many apps or a trust boundary. |

`max` is not on this ladder — reserve it for a specific, exceptional call, never a default. The band is set by blast radius (what the diff touches), not line count: shared `packages/core`/`packages/ui`, auth, Hasura permissions, or DB migrations → Deep; one app's components, copy, styling, renames → Light. A typical micro-PR is Light or Standard, so it defaults to `low`/`medium` — it should never trigger `high`.

## Step 3 — What to look for

The hierarchy below is in order of importance. A correctness issue is always more important than a style nit. Do not lead with nits.

### Correctness (most important)

- Does it actually do what the Linear issue (or the stated intent) says it should?
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

Our style rules are non-negotiable and easy to slip past in an AI-generated diff. Flag any violation:

- **ES modules** — no CommonJS `require`/`module.exports`.
- **Arrow functions only** — no `function` declarations.
- **Named exports at the bottom of the file** — no inline `export const`, no default exports; the export statement lives at the end.

These are enforced by Biome where possible, but check them by eye too.

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

- Will a future developer (or AI) understand this?
- Naming clear and consistent with the codebase?
- Functions doing one thing each?
- Reasonable abstractions, not over-engineered?

### Style and nits (least important)

- Formatting, naming conventions, minor preferences
- Never block on these alone. Mention them as "nit:" if mentioning at all.

## Step 4 — The output

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

## Step 5 — After delivering the review

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
