---
name: error-handling
description: How errors from GraphQL mutations flow through three layers (global MutationCache, hook-level onError, call-site onError) and which layer should display them to the user. Auto-triggers when writing or editing mutation hooks (packages/core mutation-hooks), queryClient.ts, or any onError handler — and whenever deciding where to surface a mutation error (toast vs inline), handling Hasura or Hono Action errors, or using extractGraphQLErrorMessage.
user-invocable: false
---

# Mutation Error Handling

Errors from GraphQL mutations flow through three layers. Each fires in order, and **only one layer should display the error to the user** — the whole point of this model is to avoid showing the same error twice while still letting a component customise how it appears.

For how the mutation hooks themselves are structured (payload builders, generic pipe), see the `mutation-data-flow` skill. This skill is only about the error path.

## The three layers

### Layer 1: Global `MutationCache` `onError` (fires first, always)

Defined where the React Query client is configured (`queryClient.ts`). It checks whether the hook defines its own `onError`:

- Hook-level `onError` exists → **return, do nothing.**
- Hook-level `onError` does not exist → extract message → show toast.

This is the catch-all fallback. Most mutations need no error-handling code at all — the global handler shows a toast automatically.

### Layer 2: Hook-level `onError` (fires second)

Defined in `useMutation()` inside the hook. Its jobs:

- Roll back optimistic updates (restore cache from context).
- Optionally show a toast — but only if no component handles display.
- Its mere presence suppresses the global handler (Layer 1 bows out).

### Layer 3: Call-site `onError` (fires last)

Passed to `mutate()` / `mutateAsync()` by the component. Its jobs:

- Component-specific UI: inline error, close dialog, reset form.
- The component decides *how* to display the error.

## Key constraints

- `MutationCache` `onError` always fires **before** hook-level and call-site `onError`.
- `mutation.options.onError` only sees the **hook-level** `onError`, not the call-site one.
- Same behaviour for `mutate()` and `mutateAsync()`.

## Scenarios

### A) No custom handling (most mutations)

Hook has no `onError`; call-site has no `onError` → the global handler shows a toast.

```ts
// Hook — no onError
export function useArchiveProjectMutation() {
  return useMutation({
    mutationFn: async (input) => { ... },
    onSuccess: () => { queryClient.invalidateQueries(...); },
  });
}

// Component — no onError
archiveMutation.mutate({ id, isArchived: true });
```

### B) Component handles error display (e.g. inline error in a dialog)

Hook defines `onError` for rollback only — does *not* show a toast. Call-site `onError` shows the inline error.

```ts
// Hook — onError for rollback only (suppresses global handler)
export function useCreateProjectMutation() {
  return useMutation({
    mutationFn: async (input) => { ... },
    onError: (_err, _vars, context) => {
      if (context?.previous) { ... } // rollback optimistic update
    },
    onSuccess: () => { queryClient.invalidateQueries(...); },
  });
}

// Component — handles inline display
createMutation.mutate(data, {
  onError: (error) => {
    const { message } = extractGraphQLErrorMessage(error);
    setErrors({ projectName: message });
  },
});
```

### C) Hook handles the error with a toast

Hook defines `onError` for rollback *and* toast; call-site shows nothing.

```ts
// Hook — rollback + toast
export function useUpdateLineItemMutation() {
  return useMutation({
    mutationFn: async (input) => { ... },
    onError: (error, _vars, context) => {
      if (context?.previous) { ... } // rollback
      const { message } = extractGraphQLErrorMessage(error);
      showToast(message, 'error');
    },
    onSuccess: () => { queryClient.invalidateQueries(...); },
  });
}
```

## Rules

- **Never show the same error twice.** Exactly one layer displays it — toast or inline, not both.
- If the UI needs custom (inline) display, the hook must define `onError` to suppress the global handler, but must not show a toast.
- If the hook shows a toast in `onError`, the call-site must not also show one.
- Use `extractGraphQLErrorMessage(error)` from `core` to get `{ message, code }`.
- Hono Action errors: `message` is already user-friendly — just display it.
- Direct Hasura mutation errors: check `code` to map to a friendly message, or fall back to `message`.

## Error sources

| Source | `message` | `code` example |
|--------|-----------|----------------|
| Hono Action (`AppError`) | User-friendly | `PROJECT.NAME_ALREADY_EXISTS` |
| Hono Action (unexpected) | User-friendly fallback | `COMMON.UNEXPECTED_ERROR` |
| Direct Hasura mutation | Raw (e.g. constraint text) | `constraint-violation` |
| Non-GraphQL error | `error.message` | `UNKNOWN_ERROR` |
