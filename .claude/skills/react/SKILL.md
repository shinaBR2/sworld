---
name: react
description: Enforces React conventions and best practices. Auto-triggers when writing or editing any TSX/TS files with React components, hooks, or logic.
user-invocable: false
---

# React Rules

## Pure logic

- NEVER put pure logic inside React components — extract to a dedicated file and unit test it.
- See `code-conventions` skill for testing rules.

## Callbacks

- AVOID inline callbacks (e.g. `onChange={() => {...}}`) as much as possible — prefer `useCallback` instead.

## UI states

- ALWAYS consider and handle these states for UI components:
  - **Error state** — what happens when data fails to load or an action fails?
  - **Loading state** — what does the user see while waiting?
  - **Empty state** — what shows when there's no data?

## Reusability

- Always search for existing reusable logic before writing new code — check the shared `packages/core` and `packages/ui` (and the app's own `src/lib`) first.
