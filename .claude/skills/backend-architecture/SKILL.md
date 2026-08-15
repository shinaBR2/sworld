---
name: backend-architecture
description: The decisions that govern backend work in apps/backend — where a new handler belongs (io vs compute), when work goes to a Cloud Task vs a direct Action, Events vs Actions, the idempotency and failure rules, and the discipline for the fact that the full pipeline can only be tested live. Auto-triggers when working in apps/backend, planning a backend feature, touching Hasura Actions/Events, creating a Cloud Task handler, or designing any server-side video/audio processing flow.
user-invocable: false
---

# Backend Architecture

This skill is the **calls you make** while working on the backend. The facts it
rests on live elsewhere, so nothing here drifts:

- What the services are, the ingestion pipeline shape, ports & adapters →
  `.claude/references/architecture.md`.
- The platforms (Cloud Run, Cloud Tasks, GCS, how they authenticate) →
  `.claude/references/infrastructure.md`.
- Database-layer rules (single-gateway, write atomicity, validation) →
  `hasura-architecture`.
- GCS layout and operator CLIs → `backend-ops`.
- Whether a table's rows may be deleted (a product rule, not a backend
  assumption) → `.claude/references/business-constraints.md`.

## Where does a new handler go — io or compute?

The three services split by **workload, not feature**, so the only placement
question is: **is this work CPU-bound or just I/O?** ffmpeg and encoding go to
**compute**; copying bytes and calling other services go to **io**. The gateway
only routes — it never does the heavy work itself.

## Cloud Task, direct Action, or frontend mutation?

The load-bearing choice for any new heavy operation, and it turns on **one
number: Hasura Actions time out at 30 seconds**, and a Cloud Run cold start can
eat most of that.

- **Cloud Task** — anything ffmpeg, multi-segment I/O, or anything that could run
  long. It gets up to ~30 minutes and retries. This is the default for real work.
- **Direct synchronous Action** — only work that reliably finishes well under 30s
  (e.g. minting a signed upload URL).
- **Direct frontend mutation** — work the browser can do itself, so the backend
  never touches it (e.g. capturing a thumbnail frame from the `<video>` element).

When in doubt it's a Cloud Task: guessing wrong toward "direct Action" is a
production timeout under load; toward "Cloud Task" is a little latency.

## Event or Action — which door?

Two things separate them; the second is the one that protects the data.

- **Who starts it.** An **Event** fires because *something happened* — a row
  changed: automatic, fire-and-forget, signed. This is how ingestion starts. An
  **Action** answers *a user asking for something*: session-carried, must reply
  within the 30s window.
- **Whether integrity is guaranteed — the deciding factor.** An **Action is
  synchronous**: its handler runs inside the caller's request, and the caller
  sees success only if the handler succeeded, so the effect is confirmed before
  the caller moves on — no committed-then-maybe-fail gap. An **Event Trigger
  fires *after* the triggering write has already committed, in a separate
  transaction** — the two are never atomic. That write stands whether or not the
  handler ever succeeds, so a failed handler leaves a committed row with its
  follow-up missing: an inconsistency only idempotent retries can *eventually*
  reconcile, never atomically.

When the follow-up must stay consistent with the change that triggered it, use
an **Action**. Use an **Event** only where the follow-up is genuinely allowed to
lag and be retried — ingestion is exactly that: the video row sits "processing"
until the async work catches up.

A new **user-initiated** heavy operation therefore has a fixed shape: an Action
that returns a task id immediately, whose gateway handler creates a Cloud Task to
compute, finalise, and notify — the ingestion pipeline entered through an Action
instead of an Event. The Action's success confirms only that the work was
**accepted** (the task exists), not that it finished; the heavy step still
completes asynchronously and reconciles by the idempotent-retry rule below. What
the Action buys over an Event is the immediate, in-session handshake the user is
waiting on.

## The two rules a reasonable person would get wrong unaided

- **Tasks are idempotent by a deterministic id.** The task id is derived from the
  entity and type (a uuidv5), so the same logical work always maps to the same
  task; enqueuing an already-completed task short-circuits and creates nothing.
  Lean on this instead of adding your own "did I already do this?" guard.
- **A permanent failure is ACKed, not retried forever.** Video-processing
  handlers are wrapped so a *terminal* error marks the video failed, alerts, then
  **returns 2xx** — which tells Cloud Tasks to *stop* retrying. A *retryable*
  error re-throws (5xx) so it retries. The trap: this wrapper is only for genuine
  processing handlers — don't wrap repair-style handlers that run on
  already-`ready` videos.

## Testing: the last mile only runs live, so run it deliberately

Cloud Tasks has no local emulator (`.claude/references/infrastructure.md`), so the full
flow can't run on your machine. Locally you can unit-test handler logic with
mocked deps and call a handler directly to sanity-check it. Everything above that is real integration, and it only runs for real against the live system — **in production**.

Plan backend work knowing the last mile is only verifiable live, and when you run
it, treat it as a controlled test — it writes real rows and nothing absorbs the
mess:

- **Own the data** — trigger only with a record you created, under an account you
  control; you must be able to name every row the run touched.
- **Clean up** — delete the notifications and anything else it generated; nothing
  else prunes them.
- **Expect a re-delivery** — Cloud Tasks retries, so the handler can run more than
  once on one trigger; your handler and assertions must tolerate it.
- **Keep the blast radius to one record** — verify, clean up, stop.
