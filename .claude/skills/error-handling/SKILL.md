---
name: error-handling
description: How a failed GraphQL mutation should be surfaced to the user — the rule that exactly one layer (a global fallback, the mutation hook, or the call site) shows a given error, never two. Auto-triggers when writing or editing mutation hooks, deciding where a mutation error should appear (toast vs inline), or handling Hasura / Hono Action errors.
user-invocable: false
---

* error-handling: decides which single layer surfaces a failed GraphQL mutation to the user, so the same error never shows twice.

* Rules
  * exactly one layer shows a given mutation error to the user, never two — one layer displays it, toast or inline, not both.
  * the most specific handler that claims the error owns its display and every other layer must show nothing — ownership, not timing, decides who displays.
  * the global fallback (least specific) is a catch-all at the query-client level that shows a toast only when neither the hook nor the call site claims the error, and most mutations need no error-handling code and fall through to it.
  * the mutation hook (more specific) always owns rollback of any optimistic update, and may claim the display with a toast only when no component will show the error itself — a hook that only rolls back claims nothing and the error falls through to the fallback.
  * the call site (most specific) is the component that fired the mutation, and when it renders the error itself (inline under a field, closing a dialog, resetting a form) it claims ownership, neither the hook nor the fallback shows anything, and it decides how the error appears.
  * if the UI needs a custom (inline) display, the hook handles rollback but shows no toast and the call site renders the message.
  * if the hook shows a toast, the call site must not show one too.
  * turn a caught error into a user-facing message before displaying it — never render a raw Hasura constraint string or a network error to the user.
  * Hono Action errors carry a `message` already meant for the user — display it as-is.
  * direct Hasura mutation errors carry raw text, so map the `code` to a friendly message or fall back to a generic one — never surface the raw constraint text.
  * non-GraphQL errors (network, unexpected) have an unsafe `error.message` — show a known-safe mapping if one exists, otherwise a generic message, never the raw string.
  * how the mutation hooks themselves are structured (payload builders, the generic pipe) is `mutation-data-flow`; this skill is only about the error path.

* Steps
  1. Identify the error's source to know how friendly its `message` already is.
     * source → `message` / `code` lookup: [`references/error-sources.md`](references/error-sources.md)
  2. Convert the caught error into a user-facing message.
  3. Pick the owning layer — the call site if a component renders the error, else the hook if it shows a toast, otherwise the global fallback.
  4. Show the message in that one layer only.
