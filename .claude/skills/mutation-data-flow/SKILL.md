---
name: mutation-data-flow
description: Enforces the mutation data flow pattern — how data moves between server, client state, UI, and back to server via payload builders and generic mutation hooks. Auto-triggers when working with mutations, payload builders, or form data transformations.
user-invocable: false
---

* mutation-data-flow: enforces how data moves from server to client state to UI and back to the server through transformers, payload builders, and generic mutation hooks.

* Rules
  * Every feature's CRUD data (library books, journal entries, listen playlists) follows the same path from Hasura through the transformer, view type, UI/form/payload builder, and mutation hook.
    * the full flow: [`references/data-flow-diagram.md`](references/data-flow-diagram.md)
  * The transformer converts the raw Hasura response into a view type `X` (e.g. `BookView`), which is the single source of truth for all frontend logic — every table, form, and calculation derives from `X`, never from the raw API.
  * The transformer lives in `packages/core/src/<domain>/query-hooks` next to the query and is tested on its own.
  * A form receives a slice of `X` via its own transformer (e.g. `toBookEditData` extracts the editable fields of `BookView`), never the raw API response.
  * The payload builder is a pure function that shapes data from `X` (or a subset) into the Hasura mutation input (`HasuraInsertInput`), and is where the domain logic — what to copy, reset, or default — lives.
  * The payload builder is colocated with the component that uses it, not in `packages/core`, and is tested on its own as a pure function.
  * Use one builder per action (`buildAddBookInput`, `buildDuplicateBookInput`) and never a generic `buildPayload` with flags, since add/duplicate/edit have different semantics and never share a builder — though a trivial add may build its input inline at the call site instead of a named builder.
  * The mutation hook lives in `packages/core/src/<domain>/mutation-hooks`, receives the full `object` (the Hasura input), and forwards it while handling the optimistic cache update, error rollback, and query invalidation.
  * The mutation hook is payload-agnostic: it never inspects or transforms `object` — that is the builder's job, so the hook never reads inside `object` (e.g. reading `status` to apply a default).
  * Keep only the routing fields the hook actually needs (collection, shelfId) at the top level of the request; everything else stays inside `object`, untouched.
  * Never give the hook a discriminated-union input with per-collection request types carrying a required field the hook never uses — if the hook doesn't use it, don't type it.
  * Never duplicate a field at request level and inside `object` — `object` is the payload, so don't carry its fields alongside it too.

* Steps
  * Build the transformer that converts the Hasura response into the view type `X`.
  * Give each form its own transformer taking a slice of `X`.
  * Write a per-action payload builder that shapes `X` (or a subset) into the Hasura input, colocated with the component.
  * Forward that input through the generic, payload-agnostic mutation hook.
