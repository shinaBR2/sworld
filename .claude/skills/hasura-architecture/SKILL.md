---
name: hasura-architecture
description: Cross-cutting Hasura/database-layer principles — the single-gateway rule (nothing talks to Postgres except Hasura), when a write needs a database-level concurrency-safe pattern versus a plain read-then-write, and the three layers that validate data. Auto-triggers when designing a new mutation/Action, deciding how a write should be structured, or reasoning about concurrent writes or data validation. Complements `architecture` (frontend query/transformer conventions) and `backend-architecture` (the Cloud Run/Cloud Task service pipeline) — this skill owns only the database-layer decisions neither of those covers.
user-invocable: false
---

# Hasura Architecture

sworld's data layer has one non-negotiable shape: **Hasura is the only thing that ever talks to Postgres.** Everything else in this skill is about using Hasura's own tools correctly once you're inside that boundary — when a write needs real concurrency-safety, and what actually validates data before it lands.

## The single-gateway rule

No service, no frontend app, no script talks to Postgres directly. The Hono backend reaches the database exclusively through Hasura's GraphQL API — same as the frontend. There is no direct Postgres client, no ORM, no raw connection string anywhere in application code.

Human/ops access follows the same rule: **use the Hasura Console, never a direct SQL client (psql, a database provider's console, etc.).** The Console is still a client of Hasura — it reaches Postgres through Hasura's own connection, not around it. The one nuance worth remembering: the Console's "Run SQL" tab executes raw SQL through Hasura's admin API, which bypasses Hasura's own permission and validation layer even though the connection itself is still Hasura-mediated. Fine for migrations; don't reach for it as a way to route around a permission or validation rule you'd otherwise have to build properly.

**Why:** one gateway means one place that enforces permissions, one place that validates input, one schema that's ever out of sync with reality. A direct connection anywhere — even "just for this one ops task" — creates a second path that Hasura's rules don't cover.

**Deployment:** we run Hasura Cloud. Metadata and migrations deploy automatically when they merge into `main` — there is no separate manual "apply" step. Treat a merge as a live schema change.

## Writes: default is fine, until two things can race

**Default pattern: one query to fetch what you need, manipulate, one mutation to persist it.** This is correct and sufficient for the overwhelming majority of writes — a user editing their own single row has no real contention to guard against.

This stops being sufficient specifically when **two writers can race for the same outcome** — not because "atomic" is a box to check on every write. Two concrete race shapes come up, each with its own Hasura-native fix:

### Race 1 — two writers compute the same "next value"

Classic lost-update: two clients read the same counter, each computes `current + delta` locally, and whichever writes last wins — the other's change is silently gone.

**Fix: send the delta, not the computed value.** Hasura's `_inc` (numeric columns) and the JSONB operators (`_append`, `_prepend`, `_delete_key`, etc.) apply the change atomically inside Postgres — there's no client-side "read the current value" step to race on at all.

```graphql
mutation { update_videos(where: {...}, _inc: {view_count: 1}) { affected_rows } }
```

Reach for optimistic concurrency instead — filter the mutation's `where` on a value you already read (e.g. `updated_at: {_eq: <value you saw>}`) — only when the change genuinely isn't expressible as a delta (a full-object replace where you need to detect "did anything change since I read this").

### Race 2 — two writers both try to be "the one that creates X"

Two concurrent requests both check "does this record already exist?" and both decide to create it, because the check and the create aren't atomic together.

**Fix: a unique constraint plus Hasura's `on_conflict`.** `INSERT ... ON CONFLICT` is one Postgres statement — the existence check and the write happen atomically, with no gap between them for a second writer to land in.

```graphql
mutation CreateThing($object: things_insert_input!) {
  insert_things_one(
    object: $object
    on_conflict: { constraint: things_natural_key, update_columns: [natural_key] }
  ) {
    id
  }
}
```

`update_columns: [natural_key]` looks like a no-op — it re-sets the column to its own value — but it can be deliberate: it forces Postgres onto the `DO UPDATE` path instead of `DO NOTHING`, which is the only way `returning` gives back the *existing* row on conflict. `DO NOTHING` returns null instead. Use it when the caller needs the existing row (e.g. to short-circuit work that's already been done); use `DO NOTHING` when it only needs the insert to be idempotent.

### The gap this closes: Actions don't get free atomicity across their own calls

A Hasura Action's handler making its own query call and then its own separate mutation call is **two independent HTTP requests** — Hasura's transaction guarantee (below) does not span them. If the write in that handler needs Race 1 or Race 2 protection, the handler must use `_inc`/optimistic concurrency/`on_conflict` itself — issuing a query then a mutation does not make the pair atomic just because they're both Hasura calls.

### What Hasura's transaction guarantee actually covers

Multiple **mutation fields inside one mutation request** run sequentially in a single Postgres transaction — if any fails, everything in that request rolls back. So a single mutation that, say, updates a task row, inserts a notification row, and updates the target row is genuinely all-or-nothing.

**The gap:** if a request mixes an **Action or Remote Schema** with direct table mutations, the rollback guarantee does not extend to the Action/Remote Schema call — only the plain table mutations are transactional together. Don't rely on "it's all in one Hasura request" to make an Action-plus-table-write combination atomic; it isn't.

### For logic too complex for any of the above

A custom Postgres function (invoked as a custom mutation) that does the whole read-decide-write inside one Postgres transaction is the only way to get true atomicity for logic more complex than a delta or an upsert. Reach for this only when `_inc`/`on_conflict`/optimistic concurrency genuinely can't express the logic, not as a default.

## Validation: three layers, not one

Authorization (row ownership — `user_id = X-Hasura-User-Id` in a permission's `check`/`filter`) is a **different concern** from data validity. Keep them separate: permissions decide *who* can touch a row; the layers below decide whether the *data* is valid regardless of who's writing it.

1. **Database schema constraints** — types, `NOT NULL`, `CHECK`, foreign keys, unique constraints. The floor, always enforced, no round-trip cost. A rule like "an amount must be positive" belongs here as a `CHECK` before anything higher up.
2. **Hasura's `validate_input`** — for plain, auto-generated CRUD mutations (insert/update/delete) that need a business rule the schema can't express. Configured per role, per operation, inside that role's permission block; routes the mutation's input to an HTTP webhook *before* the Postgres transaction starts. Adds webhook latency to every mutation it's attached to, so add it deliberately per table/role rather than by default.
3. **Application-layer validation inside an Action's handler** — for writes that already go through a custom handler (an Action), rather than auto-generated CRUD. The handler is already in the request path, so validation just lives in its own code.

Match the layer to how the write happens: plain CRUD with a rule the schema can't express → `validate_input`. Already-custom-handler writes → validate in that handler. Everything → schema constraints as the baseline regardless.

## What this skill does NOT cover

- Frontend query/transformer conventions (one page = one query = one transformer, react-query) — see `architecture`.
- The Cloud Run service topology, Cloud Task lifecycle, Events vs Actions routing — see `backend-architecture`.
- Frontend mutation payload-building — see `mutation-data-flow`.
