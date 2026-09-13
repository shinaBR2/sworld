# Error sources

Where a caught mutation error came from decides how friendly its `message` already is.

| Source | `message` | `code` example |
|--------|-----------|----------------|
| Hono Action (a deliberate app error) | User-friendly | `PROJECT.NAME_ALREADY_EXISTS` |
| Hono Action (unexpected) | User-friendly fallback | `COMMON.UNEXPECTED_ERROR` |
| Direct Hasura mutation | Raw (e.g. constraint text) | `constraint-violation` |
| Non-GraphQL error | `error.message` | `UNKNOWN_ERROR` |
