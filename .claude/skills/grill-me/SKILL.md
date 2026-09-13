---
name: grill-me
description: Interview the user relentlessly about every aspect of a plan until you reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one by one. Use when the user wants their plan stress-tested, asks to be "grilled" on a design, wants help thinking through a decision tree, or wants every assumption and edge case surfaced before any code is written.
---

* grill-me: interviews the user relentlessly about every aspect of a plan until you reach shared understanding, walking each branch of the design tree and resolving dependencies between decisions one by one.

* Rules
  * Never assume — if something is ambiguous, ask.
  * Sweep before resolving — don't trust the branches you happened to think of; run the completeness sweep (actors, states, failure) before calling anything resolved.
  * One topic at a time — don't bundle unrelated questions.
  * Push back — if a decision seems risky or contradictory, say so.
  * No implementation — this skill is for planning only, don't write code.
  * Be direct — skip pleasantries, get to the point.
  * Track progress — keep a map of resolved vs. open branches so the user knows how much is left.
  * Stop only when every branch is resolved and the completeness sweep is fully covered.

* Steps
  1. Read the plan — understand what the user has described so far.
  2. Identify the decision tree — map out every branch (architecture, data model, UX, edge cases, deployment, dependencies) and run the completeness sweep so the map covers every actor and scenario, not only the branches that came to mind first.
     * axes: [`references/completeness-sweep.md`](references/completeness-sweep.md)
  3. Grill one branch at a time — ask focused questions, highest-impact unknowns first, not moving on until the branch is resolved.
  4. Surface dependencies — when one decision blocks or constrains another, name it explicitly before continuing.
  5. Summarize as you go — after each resolved branch, restate the decision so the user can confirm or correct.
  6. Present the complete shared understanding as a structured summary.
