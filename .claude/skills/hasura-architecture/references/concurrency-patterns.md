# Concurrency patterns

## Race 2 — `on_conflict` upsert

A unique constraint plus Hasura's `on_conflict` makes the existence check and the write one atomic `INSERT ... ON CONFLICT` statement:

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

`update_columns: [natural_key]` looks like a no-op — it re-sets the column to its own value — but it is deliberate: it forces Postgres onto the `DO UPDATE` path instead of `DO NOTHING`, which is the only way `returning` gives back the *existing* row on conflict. `DO NOTHING` returns null instead. Use it when the caller needs the existing row (e.g. to short-circuit work that's already been done); use `DO NOTHING` when it only needs the insert to be idempotent.
