---
name: error-handling
description: How a failed GraphQL mutation should be surfaced to the user — the rule that exactly one layer (a global fallback, the mutation hook, or the call site) shows a given error, never two. Auto-triggers when writing or editing mutation hooks, deciding where a mutation error should appear (toast vs inline), or handling Hasura / Hono Action errors.
user-invocable: false
---

# Mutation Error Handling

The rule that matters: **exactly one layer shows a given mutation error to the user — never two.** A failed mutation can be handled in three places, and they fire in order; the job is to decide which one owns the display, so the same failure never toasts twice (or toasts *and* shows inline).

For how the mutation hooks themselves are structured (payload builders, the generic pipe), see `mutation-data-flow`. This skill is only about the error path.

## The three layers, by responsibility

They form a precedence chain: the **most specific** handler that claims the error owns its display, and the others must show nothing. Ownership, not timing, decides who displays.

- **Global fallback (least specific).** A catch-all at the query-client level: it shows a toast *only* when neither the hook nor the call site claims the error. Most mutations need no error-handling code at all — they fall through to this.
- **The mutation hook (more specific).** Always owns rollback of any optimistic update. It *may* also claim the display with a toast — but only when no component will show the error itself. A hook that only rolls back claims nothing, and the error falls through to the fallback.
- **The call site (most specific).** The component that fired the mutation. When it renders the error itself — inline under a field, closing a dialog, resetting a form — it claims ownership, and neither the hook nor the fallback shows anything. The component decides *how* the error appears.

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
- Non-GraphQL errors (network, unexpected): treat `error.message` as unsafe — show a known-safe mapping if one exists, otherwise a generic message. Never render the raw string.
