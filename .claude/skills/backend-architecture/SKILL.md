---
name: backend-architecture
description: The decisions that govern backend work in apps/backend — where a new handler belongs (io vs compute), when work goes to a Cloud Task vs a direct Action, Events vs Actions, the idempotency and failure rules, and the discipline for the fact that the full pipeline can only be tested live. Auto-triggers when working in apps/backend, planning a backend feature, touching Hasura Actions/Events, creating a Cloud Task handler, or designing any server-side video/audio processing flow.
user-invocable: false
---

* backend-architecture: makes the load-bearing calls for backend work in apps/backend — where a handler belongs, whether work is a Cloud Task or an Action, Event or Action, and how the live-only pipeline is tested.

* Rules
  * The facts these decisions rest on live elsewhere — read them there rather than restating them, so nothing drifts.
    * services, ingestion pipeline shape, ports & adapters: `.claude/references/architecture.md`
    * platforms (Cloud Run, Cloud Tasks, GCS, how they authenticate): `.claude/references/infrastructure.md`
    * database-layer rules (single-gateway, write atomicity, validation): `hasura-architecture`
    * GCS layout and operator CLIs: `backend-ops`
    * whether a table's rows may be deleted (a product rule, not a backend assumption): `.claude/references/business-constraints.md`
  * Place a new handler by workload, not feature — the three services split on whether work is CPU-bound or just I/O, so ffmpeg and encoding go to compute while copying bytes and calling other services go to io.
  * The gateway only routes — it never does the heavy work itself.
  * The choice of where a new heavy operation runs turns on one number: Hasura Actions time out at 30 seconds, and a Cloud Run cold start can eat most of that.
  * Use a Cloud Task for anything ffmpeg, multi-segment I/O, or anything that could run long — it gets up to ~30 minutes and retries, and it is the default for real work.
  * Use a direct synchronous Action only for work that reliably finishes well under 30s (e.g. minting a signed upload URL).
  * Use a direct frontend mutation for work the browser can do itself, so the backend never touches it (e.g. capturing a thumbnail frame from the `<video>` element).
  * When in doubt it's a Cloud Task — guessing wrong toward a direct Action is a production timeout under load, while toward a Cloud Task it is only a little latency.
  * Two things separate an Event from an Action, and the second is the one that protects the data.
  * Who starts it: an Event fires because something happened — a row changed — automatic, fire-and-forget, signed, and this is how ingestion starts; an Action answers a user asking for something — session-carried, and must reply within the 30s window.
  * Whether integrity is guaranteed is the deciding factor — an Action is synchronous, its handler running inside the caller's request so the caller sees success only if the handler succeeded and the effect is confirmed with no committed-then-maybe-fail gap, whereas an Event Trigger fires after the triggering write has already committed, in a separate transaction that is never atomic, so a failed handler leaves a committed row with its follow-up missing, an inconsistency only idempotent retries can eventually reconcile, never atomically.
  * Use an Action when the follow-up must stay consistent with the change that triggered it, and use an Event only where the follow-up is genuinely allowed to lag and be retried — ingestion is exactly that, with the video row sitting "processing" until the async work catches up.
  * A new user-initiated heavy operation has a fixed shape: an Action that returns a task id immediately, whose gateway handler creates a Cloud Task to compute, finalise, and notify — the ingestion pipeline entered through an Action instead of an Event — where the Action's success confirms only that the work was accepted (the task exists), not that it finished, the heavy step still completing asynchronously and reconciling by the idempotent-retry rule, and what the Action buys over an Event is the immediate, in-session handshake the user is waiting on.
  * Tasks are idempotent by a deterministic id — the task id is derived from the entity and type (a uuidv5) so the same logical work always maps to the same task, and enqueuing an already-completed task short-circuits and creates nothing, so lean on this instead of adding your own "did I already do this?" guard.
  * A permanent failure is ACKed, not retried forever — video-processing handlers are wrapped so a terminal error marks the video failed, alerts, then returns 2xx to tell Cloud Tasks to stop retrying, while a retryable error re-throws (5xx) so it retries, and the trap is that this wrapper is only for genuine processing handlers, so don't wrap repair-style handlers that run on already-`ready` videos.
  * The full flow has no local emulator, so it can't run on your machine — locally you can only unit-test handler logic with mocked deps and call a handler directly to sanity-check it, and everything above that is real integration that runs for real only against the live system, in production.
  * Plan backend work knowing the last mile is only verifiable live, and treat any live run as a controlled test because it writes real rows and nothing absorbs the mess.
  * Expect a re-delivery — Cloud Tasks retries, so the handler can run more than once on one trigger, and your handler and assertions must tolerate it.

* Steps
  1. Own the data: trigger only with a record you created, under an account you control, so you can name every row the run touched.
  2. Verify the run.
  3. Clean up: delete the notifications and anything else it generated — nothing else prunes them.
  4. Stop, keeping the blast radius to one record.
