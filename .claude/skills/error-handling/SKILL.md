---
name: error-handling
description: How a failed GraphQL mutation should be surfaced to the user — the rule that exactly one layer (a global fallback, the mutation hook, or the call site) shows a given error, never two. Auto-triggers when writing or editing mutation hooks, deciding where a mutation error should appear (toast vs inline), or handling Hasura / Hono Action errors.
user-invocable: false
---

# Mutation Error Handling

The rule that matters: **exactly one layer shows a given mutation error to the user — never two.** A failed mutation can be handled in three places, and they fire in order; the job is to decide which one owns the display, so the same failure never toasts twice (or toasts *and* shows inline).

For how the mutation hooks themselves are structured (payload builders, the generic pipe), see `mutation-data-flow`. This skill is only about the error path.

## The three layers, by responsibility

They fire in this order, and each can bow out in favour of a more specific one.

- **Global fallback (fires first).** A catch-all at the query-client level: if nothing more specific handles the error, it shows a toast. Most mutations need no error-handling code at all — they fall through to this. The moment a more specific layer takes the error, the fallback must show nothing.
- **The mutation hook (fires second).** Owns rollback of any optimistic update. It *may* also show a toast — but only when no component will display the error itself. Its presence is the signal that tells the fallback to stay quiet.
- **The call site (fires last).** The component that fired the mutation. Owns component-specific display: an inline error under a field, closing a dialog, resetting a form. The component decides *how* the error appears.

## The rules

- **Never show the same error twice.** One layer displays it — toast or inline, not both.
- If the UI needs a **custom (inline)** display, the hook handles rollback but shows no toast, and the call site renders the message.
- If the **hook** shows a toast, the call site must not show one too.
- Turn a caught error into a **user-facing message** before displaying it — never render a raw Hasura constraint string or a network error to the user.

## Error sources

Where the error came from decides how friendly its message already is:

| Source | `message` | `code` example |
|--------|-----------|----------------|
| Hono Action (a deliberate app error) | User-friendly | `PROJECT.NAME_ALREADY_EXISTS` |
| Hono Action (unexpected) | User-friendly fallback | `COMMON.UNEXPECTED_ERROR` |
| Direct Hasura mutation | Raw (e.g. constraint text) | `constraint-violation` |
| Non-GraphQL error | `error.message` | `UNKNOWN_ERROR` |

- Hono Action errors: the `message` is already meant for the user — display it as-is.
- Direct Hasura mutation errors: map the `code` to a friendly message, or fall back to a generic one — never surface the raw constraint text.
