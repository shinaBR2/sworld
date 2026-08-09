---
name: writing-task-specs
description: This skill should be used whenever work is being captured as a ticket — "create a ticket", "write a task", "raise a bug", "scope this out", "break this down", "plan this feature" — or when the user describes a problem, bug, or feature idea and the natural next step is a written spec. It owns the shape a ticket takes here; `task-tracker` owns the tracker itself and every command.
---

# Writing Task Specs

A ticket is ordinary writing — you draft it yourself. This skill holds only the two rules that make a ticket good here, and the shape it takes. The tracker (which one, the team, how to create and wire issues) is owned by `task-tracker` — point there for anything about the tool.

## Two rules

- **One purpose per ticket.** Apply `micro-prs`' one-purpose test. If the work is too big for one purpose, it's a *parent*: create the ticket, break it into child sub-tickets — one purpose each — and use `dependency-analysis` to decide which children block which. That's the only thing that earns a `blocked-by` edge (see `task-tracker`).
- **Plain words, always.** Every ticket opens by explaining the problem in plain language (`plain-english` owns what counts as plain). This doubles as a decomposition check: **if you can't explain the problem shortly, it's too big — break it down further.**

## The shape

Every ticket, whatever its size, is these sections in order — keep the ones that apply, drop the ones that don't:

- **In plain words** — the problem, short, no jargon (`plain-english`). Always first.
- **User story** — only on a parent ticket for a feature: who needs this and why, from the user's side.
- **Root cause & solution** — what's actually wrong (a bug) or what's being built (a feature), and the approach. Skip root cause if it still needs investigating; say so.
- **Goal — what it looks like when this is done.** Concrete and checkable: what a person can now see or do that they couldn't before. This is the acceptance test — specific enough that someone with no context can confirm it.

On a **parent**, the Goal describes the *whole* feature finished. That's the one check that proves the assembled children deliver the story — no single child's Goal can, since each only covers its own slice.

## Creating it

Get the user's sign-off on the plan before creating anything — an issue is an external write. Then create it per `task-tracker`: one ticket, or a parent plus one child per sub-task, with a `blocked-by` edge only where `dependency-analysis` found a real one. Confirm back with the identifiers and URLs.
