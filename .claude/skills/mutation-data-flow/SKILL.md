---
name: mutation-data-flow
description: Enforces the mutation data flow pattern — how data moves between server, client state, UI, and back to server via payload builders and generic mutation hooks. Auto-triggers when working with mutations, payload builders, or form data transformations.
user-invocable: false
---

# Mutation Data Flow Pattern

This pattern defines how data flows through the frontend for CRUD operations. Every feature (library books, journal entries, listen playlists, etc.) follows this same architecture.

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

## Four Layers

### 1. Transformer: Server → Client

Converts the raw Hasura response into a **view type** (e.g., `BookView`). This type `X` is the single source of truth for all frontend logic.

- Lives in `packages/core/src/<domain>/query-hooks` next to the query
- Tested independently
- Decouples frontend from DB schema

### 2. View Type X: Source of Truth

All frontend operations derive from `X`. No component should fetch or compute data outside of `X`.

- UI tables read fields directly from `X`
- Forms pick **a subset** of `X` — only what that form needs (e.g., `toBookEditData` extracts editable fields from `BookView`)
- Calculations derive from `X`

### 3. Payload Builder: Client → Hasura Input

A pure function that shapes data into the Hasura mutation input type. This is where domain logic lives — what to copy, what to reset, what to default.

- Colocated with the component that uses it (not in `packages/core`)
- Takes data from `X` (or a subset), returns `HasuraInsertInput`
- Examples: `buildDuplicateBookInput`, `buildAddBookInput`
- Each action (add, duplicate, edit) has its own builder
- Tested independently as pure functions

### 4. Mutation Hook: Generic Pipe

The hook just forwards the payload to Hasura. It knows nothing about the payload contents.

- Lives in `packages/core/src/<domain>/mutation-hooks`
- Receives the full `object` (Hasura input) from the caller
- Handles: optimistic cache update, error rollback, query invalidation
- NEVER inspects or transforms the payload — that's the builder's job

## Rules

- **Mutation hooks are payload-agnostic.** They receive a typed Hasura input and forward it. No defaults, no overrides, no field-level logic inside the hook.
- **Payload builders own the domain logic.** Deciding which fields to copy, reset, or default is the builder's job, not the hook's.
- **Forms derive from X, not from the API.** A form component receives a slice of X (via a transformer like `toBookEditData`), never the raw API response.
- **One builder per action.** Don't make a generic "buildPayload" that handles add, duplicate, and edit — each action has different semantics.

## Example: Duplicate Book

```ts
// 1. X = BookView (from transformer)
// 2. Builder picks what it needs from X, shapes Hasura input
const object = buildDuplicateBookInput(sourceBook, shelfId, sortOrder);

// 3. Hook just forwards it
createItem({
  collection: 'library',
  shelfId,
  object,
});
```

## Example: Add Book (inline)

```ts
// Builder is inline because the payload is trivial
createItem({
  collection: 'library',
  shelfId,
  object: {
    shelfId,
    title: '',
    author: '',
    status: 'unread',
    sortOrder: shelf.books.length,
  },
});
```

## Anti-patterns

- **Hook inspects payload fields** — e.g., reading `status` from the request to apply defaults. The hook should never look inside `object`.
- **Discriminated union for hook input** — e.g., per-collection types with required `status` at request level. If the hook doesn't use it, don't type it.
- **Duplicate data at request level and inside object** — e.g., `status` both at top-level and inside `object`. The object is the payload; everything the hook needs for routing (collection, shelfId) goes at top-level.
- **Generic builder for multiple actions** — don't merge add/duplicate/edit into one function with flags. Each action is a separate builder.
