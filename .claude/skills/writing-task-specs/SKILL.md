---
name: writing-task-specs
description: This skill should be used whenever work is being captured as a ticket — "create a ticket", "write a task", "raise a bug", "scope this out", "break this down", "plan this feature" — or when the user describes a problem, bug, or feature idea and the natural next step is a written spec. It owns the shape a ticket takes here; `task-tracker` owns the tracker itself and every command.
---

* writing-task-specs: the shape a ticket takes here, so each one captures a single purpose in plain words.

* Rules
  * One purpose per ticket — the same does-one-thing bar as `.claude/references/good-diff.md` Test 1; if the work is too big for one purpose it's a *parent*, so create the ticket, break it into child sub-tickets (one purpose each, each inside a single app/package per Test 4 — split again if one spans two), and use `dependency-analysis` to decide which children block which, the only thing that earns a `blocked-by` edge (see `task-tracker`).
  * Plain words, always — every ticket opens by explaining the problem in plain language (`plain-english` owns what counts as plain), which doubles as a decomposition check: if you can't explain the problem shortly, it's too big, so break it down further.
  * Get the user's sign-off on the plan before creating anything, because an issue is an external write.

* Steps
  1. Draft the ticket yourself in the required sections, in order, keeping the ones that apply and dropping the ones that don't.
     * shape and example: [`references/ticket-shape.md`](references/ticket-shape.md)
  2. Get the user's sign-off on the plan.
  3. Create it per `task-tracker` — one ticket, or a parent plus one child per sub-task, with a `blocked-by` edge only where `dependency-analysis` found a real one.
  4. Confirm back with the identifiers and URLs.
