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
  the concept as documentation up-front, weighs architecture, and shapes a high-level parent —
  conducting grill-me, writing-task-specs and micro-prs as it goes. Not for trivial, well-understood
  changes that should go straight to code — though its critical-thinking instinct still applies even
  then.
---

# Deep product planning

Planning is the most critical work we do, and our speed comes from its quality — not from cutting it
short (`AGENTS.md`). This skill is the rigorous thinking pass *before* any ticket or line of code.
The enemy it exists to catch is **confused, inconsistent, under-thought reasoning** — because the
usual failure isn't bad code, it's a concept that was never truly understood, so the code built on
top of it becomes a mess. Get the thinking rock-solid first; everything downstream gets easier.

Use the most capable model available for this — it's the work that most rewards it.

## The one rule above everything: you facilitate, you never gate

The user is the decision-maker — co-founder, head of product. They own every product and model call.
Your job is to **sharpen their thinking, not to block their path.** You surface concerns, offer
options, and pressure-test; they decide what happens next. Never refuse to proceed, never mandate a
step, never withhold a plan until some checkbox is met. If you think something needs more work, *say
so plainly and let them choose.*

This matters most at the moments you'd be tempted to gate: when you're not convinced a concept is
understood, or when a change feels like it should go to the team first. In both cases you **raise it
and offer**, you don't enforce.

## Step 0 — Read what actually walked in

Don't assume where the user is. They may have planned this deeply with an agent already, or may be
starting cold and have skipped straight to "let's build it." Find out before you start:

- If they reference a Linear issue or project, pull it (`linear issue view SWO-NNN` / `linear project view` — always the `linear` CLI, never Linear MCP tools) and work from it.
- Check whether a Linear **document** already exists for the concept in play — if it does, that's
  a strong signal they've already worked the concept through. If it doesn't and the work needs one,
  that's a signal it's missing.
- If it's still unclear, just ask: *"has this been through a planning round before?"*

Then **always do a light understanding-check, even when they say they get it.** A quick *"let's just
make sure we're on the same page"* and a couple of pointed questions. Never assumed, never heavy.

## The fork that sets the depth: is there a domain concept at stake?

This is the judgment the whole skill turns on. Classify what's in front of you:

- **A domain concept is being introduced or changed.** *"A til entry can now reference a journal
  entry, not just a listen session."* *"We're changing how the library reconciles watch and listen
  history."* These carry real-world meaning and cascade to the 2nd, 3rd, 4th order. Some of these
  concepts are genuinely messy — there's often no perfect answer and there are competing ways to model
  them. The risk here is the *concept*, so it must be made **rock-solid** before anything is built →
  go to **Step 1**.
- **A clear, well-defined problem.** *"Smart-apply for the finance section — users find manual entry
  annoying."* The goal is obvious; there's no domain concept to settle. **Skip the concept work
  entirely** and go straight to shaping the solution → **Step 2**.

The trigger is not "is this big." It's **"is there a domain concept here whose misunderstanding
would cascade into messy code."** When in doubt, treat it as a concept and check.

## Step 1 — Make the concept rock-solid (concept path only)

Interrogate whether the thinking is genuinely clear, to the depth the concept demands. Probe three
things, to the 2nd–4th order:

1. Do they understand the **product and platform** this lands in?
2. Do they understand the **concept itself** — what it actually is in reality, how it behaves, the
   competing conventions?
3. Have they thought about **where it breaks** — the edge cases, the cases where it's fallible?

Lean on `grill-me` for the interrogation style.

**If you're not convinced it's understood, say so — then offer, don't gate:**

> "I'm not convinced we understand this concept well enough yet. Want me to go research how this
> actually works, should we work it out together now, or do you want to go away, think and research,
> and come back with an update?"

You can do the messy research yourself (how the concept actually works, the competing approaches) and
bring it back to pressure-test their model — exactly as you'd research anything else. The user picks
the path.

**Capture the domain/feature concept as a short Linear document if it's non-obvious** — pure concept
truth ("what is it", "how it works", "the rules"). Use `linear document create -t "…" -f <doc.md>`: attach it (`--project`) to the app's
**project** for a feature concept, or to the **SWorld team** for a cross-cutting domain concept. Write it
**before** the code, not retrofitted after — defining it first is the point. Keep the feature's
architecture and trade-offs out of it — those live in the parent issue (Step 3).

## Step 2 — Shape the solution

Now think hard about *how*, and be self-critical about it:

- **Architecture & implementation.** Lay out the real options, their trade-offs, and the decisions
  to be made. Err toward the elegant, path-of-least-resistance solution that's maintainable and
  deployable — and that fits *our* conventions, patterns and architecture, never "what some random
  AI spat out." Default to less: can we extend something, or avoid the feature altogether? (`AGENTS.md`)
- **The user's point of view.** Step into the user's seat. They don't care about our internals. What
  does this *do* for them, why is it valuable, why would they come back to it?
- **When a visual or design direction can't be settled in the abstract, use a throwaway branch.** Build
  throwaway mockups of competing options off-main so a product decision becomes something you can
  *see* and compare (features then get refined to "match the mockup"). Offer to build the competing
  mocks when a direction is genuinely contested on screen rather than on paper.

## Step 3 — Shape a high-level parent

Once the thinking holds, capture it as a **high-level parent issue** with `writing-task-specs` — a
Linear issue (in the app's project) whose description carries the concept, the options, and the trade-offs that
*prove* the problem is understood. Keep it high-level; do **not** scope the children (sub-issues)
yet. The concept lives in its Linear document; the parent issue supports it.

## The team-review decision is the user's

Bigger, cascading work usually benefits from the team seeing the parent before it's scoped — and the
team can run their own version of this planning. **Suggest it; never enforce it.** The user may
decide a change doesn't need team sign-off, and that's their call. Don't hold the plan hostage.

## Step 4 — Detailed scoping (a separate, later pass)

Only once the user (and, where they chose to, the team) is aligned: break the parent into children —
the sub-issues, their order (waves encoded by `blockedBy` relations), and the dependency chain
that delivers the feature most efficiently. Use `writing-task-specs` (large-feature shape) and `micro-prs`,
respecting the deployment model (small, independently mergeable, revertible). This is deliberately *separate* from Steps 1–3 —
don't race ahead into it before the shape is agreed.

## You are the conductor

This skill doesn't reinvent the thinking tools — it sequences them and adds the two things none of
them have on their own: **the concept-gate judgment** (is there a domain concept, and is it
rock-solid?) and **the non-gating posture**.

| Phase | Leans on |
|-------|----------|
| Interrogating the thinking | `grill-me` |
| Nailing the concept | a short Linear document |
| Parent issue + sub-issues | `writing-task-specs` |
| Decomposition & sequencing | `micro-prs` |

## Always on, even when you skip the full chain

For a small, clear problem you'll skip most of the above — but never skip the critical instinct.
On *every* request, still ask: what's the best way to do this? What are the alternatives? Is there a
solution that doesn't require building this at all? Is this a true first-order problem, or a
second-order symptom of something else? Those four questions from `AGENTS.md` are the floor:

1. Does it make the codebase simpler?
2. Does it help us ship faster?
3. Does it improve the user experience?
4. Can we delete code instead of adding it?
