---
name: mutation-data-flow
description: Enforces the mutation data flow pattern — how data moves between server, client state, UI, and back to server via payload builders and generic mutation hooks. Auto-triggers when working with mutations, payload builders, or form data transformations.
user-invocable: false
---

# Mutation Data Flow Pattern

How data flows through the frontend for CRUD operations. Every feature (library
books, journal entries, listen playlists) follows this same path.

## The Flow

```
Hasura ──query──> transformer ──> X (view type, source of truth)
                                  │
                                  ├──> UI display (table rows, summaries)
                                  ├──> form data (picks a subset of X)
                                  └──> payload builder (shapes X back into Hasura input)
                                        │
                                        └──> mutation hook (generic, forwards to Hasura)
```

## The layers

### 1. Transformer: server → client

Converts the raw Hasura response into a **view type** (e.g. `BookView`). This
type `X` is the single source of truth for all frontend logic — every table,
form, and calculation derives from `X`, never from the raw API.

- Lives in `packages/core/src/<domain>/query-hooks`, next to the query
- Tested on its own

A form receives a *slice* of `X` via its own transformer (e.g. `toBookEditData`
extracts the editable fields of `BookView`), never the raw API response.

### 2. Payload builder: client → Hasura input

A pure function that shapes data from `X` (or a subset) into the Hasura mutation
input (`HasuraInsertInput`). This is where the domain logic lives — what to copy,
reset, or default.

- Colocated with the component that uses it — **not** in `packages/core`
- One builder per action: `buildAddBookInput`, `buildDuplicateBookInput`. Never a
  generic `buildPayload` with flags — add/duplicate/edit have different semantics
  and never share a builder. (A trivial add may build its input inline at the call
  site instead of a named builder.)
- Tested on its own as a pure function

### 3. Mutation hook: generic pipe

Lives in `packages/core/src/<domain>/mutation-hooks`. Receives the full `object`
(the Hasura input) and forwards it, handling the optimistic cache update, error
rollback, and query invalidation. It is **payload-agnostic**: it never inspects or
transforms `object` — that is the builder's job.

## Anti-patterns

- **Hook reads inside `object`** — e.g. reading `status` to apply a default. Only
  the routing fields the hook actually needs (collection, shelfId) sit at the *top
  level* of the request; everything else stays inside `object`, untouched.
- **Discriminated-union hook input** — per-collection request types carrying a
  required field the hook never uses. If the hook doesn't use it, don't type it.
- **A field duplicated at request level and inside `object`** — `object` is the
  payload; don't carry its fields alongside it too.
