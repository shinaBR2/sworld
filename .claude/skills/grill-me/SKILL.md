---
name: grill-me
description: Interview the user relentlessly about every aspect of a plan until you reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one by one. Use when the user wants their plan stress-tested, asks to be "grilled" on a design, wants help thinking through a decision tree, or wants every assumption and edge case surfaced before any code is written.
---

# Grill Me

Interview the user relentlessly about every aspect of their plan until you reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one by one.

## How it works

When this skill is invoked, switch into interviewer mode:

1. **Read the plan** — understand what the user has described so far.
2. **Identify the decision tree** — map out every branch: architecture, data model, UX, edge cases, deployment, dependencies. Run **the completeness sweep** (below) so the map covers every actor and scenario, not only the branches that came to mind first.
3. **Grill one branch at a time** — ask focused questions, starting from the highest-impact unknowns. Don't move on until the branch is resolved.
4. **Surface dependencies** — when one decision blocks or constrains another, name it explicitly before continuing.
5. **Summarize as you go** — after each resolved branch, restate the decision so the user can confirm or correct.
6. **Stop when aligned** — once all branches are resolved *and the completeness sweep is fully covered*, present the complete shared understanding as a structured summary.

## The completeness sweep

A decision tree only covers the branches you thought to draw — the real failure is a whole actor or scenario nobody mapped, so it never gets grilled and surfaces later as a missing requirement. Before calling a branch (or the whole plan) resolved, walk these three axes out loud and confirm each is either handled or *explicitly* ruled out of scope. Silence is not coverage.

- **Actors / roles** — enumerate *every* kind of person or system that touches this: a signed-out visitor, the signed-in owner, another user's shared or public data, an admin. For each, is there a story — or a deliberate "not this one"? In this product, permission turns on role (owner vs vip vs anonymous vs admin), so a role nobody mapped is usually a requirement nobody wrote.
- **States & scale** — empty (nothing created yet), one, many, and the extreme (hundreds of items, the longest, the largest). Where does behaviour change as the count grows?
- **Failure & timing** — the request fails or the user is offline, permission is denied, two actions happen at once (concurrent edits), something is left half-finished, and first-run versus returning.

Any cell that isn't clearly handled is an open branch — grill it like any other. Name the ones the user rules out, so "out of scope" is a decision on the record rather than an omission nobody noticed.

## Rules

- **Never assume.** If something is ambiguous, ask.
- **Sweep before resolving.** Don't trust the branches you happened to think of — run the completeness sweep (actors, states, failure) before calling anything resolved.
- **One topic at a time.** Don't bundle unrelated questions.
- **Push back.** If a decision seems risky or contradictory, say so.
- **No implementation.** This skill is for planning only. Don't write code.
- **Be direct.** Skip pleasantries. Get to the point.
- **Track progress.** Keep a map of resolved vs. open branches so the user knows how much is left.
