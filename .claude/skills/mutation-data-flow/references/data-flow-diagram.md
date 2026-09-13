# The mutation data flow

How data flows through the frontend for CRUD operations. Every feature (library books, journal entries, listen playlists) follows this same path.

```
Hasura ──query──> transformer ──> X (view type, source of truth)
                                  │
                                  ├──> UI display (table rows, summaries)
                                  ├──> form data (picks a subset of X)
                                  └──> payload builder (shapes X back into Hasura input)
                                        │
                                        └──> mutation hook (generic, forwards to Hasura)
```
