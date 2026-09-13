---
name: hasura-architecture
description: Cross-cutting Hasura/database-layer principles — the single-gateway rule (nothing talks to Postgres except Hasura), when a write needs a database-level concurrency-safe pattern versus a plain read-then-write, and the three layers that validate data. Auto-triggers when designing a new mutation/Action, deciding how a write should be structured, or reasoning about concurrent writes or data validation. Complements `architecture` (frontend query/transformer conventions) and `backend-architecture` (the Cloud Run/Cloud Task service pipeline) — this skill owns only the database-layer decisions neither of those covers.
user-invocable: false
---

* hasura-architecture: makes you structure sworld's database-layer work correctly — the single gateway, when a write needs concurrency-safety, and where data is validated.

* Rules
  * Nothing but Hasura ever talks to Postgres: no service, frontend app, or script has a direct Postgres client, ORM, or connection string, and the Hono backend reaches the database only through Hasura's GraphQL API, exactly as the frontend does — one gateway means one place that enforces permissions, one that validates input, and one schema that can drift, whereas any direct connection (even "just for this one ops task") creates a second path Hasura's rules don't cover.
  * Human and ops database access uses the Hasura Console, never a direct SQL client such as psql or a database provider's console.
  * The Console's "Run SQL" tab executes raw SQL through Hasura's admin API and bypasses Hasura's own permission and validation layer, so it is fine for migrations but must never be used to route around a permission or validation rule you would otherwise have to build properly.
  * Concurrency-safety is needed only when two writers can race for the same outcome, not as a box to tick on every write — the default of one query to fetch, manipulate, then one mutation to persist is correct for the overwhelming majority of writes.
  * When two writers would each compute the same next value (a lost update), send the delta rather than the computed value, using `_inc` on numeric columns or the JSONB operators (`_append`, `_prepend`, `_delete_key`) which apply the change atomically inside Postgres.
  * Reach for optimistic concurrency — filtering the mutation's `where` on a value you already read, e.g. `updated_at: {_eq: <value you saw>}` — only when the change genuinely can't be expressed as a delta, such as a full-object replace where you must detect whether anything changed since you read it.
  * When two writers both try to create the same record, use a unique constraint plus Hasura's `on_conflict`, because `INSERT ... ON CONFLICT` performs the existence check and the write in one atomic statement.
    * upsert example and the `update_columns` vs `DO NOTHING` choice: [`references/concurrency-patterns.md`](references/concurrency-patterns.md)
  * A Hasura Action's handler that makes its own query call and then its own separate mutation call is issuing two independent HTTP requests that share no transaction, so any Race 1 or Race 2 protection must be applied inside the handler with `_inc`, optimistic concurrency, or `on_conflict` itself.
  * Multiple mutation fields inside one mutation request run sequentially in a single Postgres transaction that rolls back as a whole if any field fails, but that guarantee does not extend to an Action or Remote Schema call mixed with direct table mutations — only the plain table mutations are transactional together.
  * Reach for a custom Postgres function (invoked as a custom mutation) that does the whole read-decide-write in one transaction only when `_inc`, `on_conflict`, and optimistic concurrency genuinely can't express the logic, never as a default.
  * Authorization (row ownership via `user_id = X-Hasura-User-Id` in a permission's `check`/`filter`) is a separate concern from data validity: permissions decide who can touch a row, and the validation layers decide whether the data is valid regardless of who writes it.
  * Data validity lives in three layers — database schema constraints (types, `NOT NULL`, `CHECK`, foreign keys, unique constraints; the always-enforced floor with no round-trip cost, where a rule like "an amount must be positive" belongs as a `CHECK`), Hasura's `validate_input` webhook (per role and operation inside that role's permission block, for CRUD business rules the schema can't express, added deliberately because it adds webhook latency to every mutation it's attached to), and application-layer validation inside an Action's handler that is already in the request path.
  * This skill owns only the database-layer decisions: frontend query/transformer conventions are `architecture`, the Cloud Run/Cloud Task service pipeline and Events-vs-Actions routing are `backend-architecture`, and frontend mutation payload-building is `mutation-data-flow`.

* Steps
  * Route the write through Hasura, never around it.
  * Use the default single-query-then-single-mutation and stop there unless two writers can race for the same outcome.
  * If they can race, pick the pattern by race shape — a delta for a shared computed value, `on_conflict` for a duplicate create, and optimistic concurrency or a custom Postgres function only when neither fits.
  * Place each validation rule in the right one of the three layers, kept separate from permissions.
