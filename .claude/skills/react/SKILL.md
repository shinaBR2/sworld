---
name: react
description: Enforces React conventions and best practices. Auto-triggers when writing or editing any TSX/TS files with React components, hooks, or logic.
user-invocable: false
---

# React Rules

## Callbacks

- AVOID inline callbacks (e.g. `onChange={() => {...}}`) as much as possible — prefer `useCallback` instead.

## UI states

- ALWAYS consider and handle these states for UI components:
  - **Error state** — what happens when data fails to load or an action fails?
  - **Loading state** — what does the user see while waiting?
  - **Empty state** — what shows when there's no data?

## Reusability

- Always search for existing reusable logic before writing new code — check the shared `packages/core` and `packages/ui` first.

## Document metadata (React 19)

This workspace is on React 19 — set the tab title and `<meta>` tags by **rendering** `<title>` / `<meta>` elements from a component (React 19 auto-hoists them into `<head>`). Never assign `document.title` imperatively, and never reach for `react-helmet` — it's a stale, unused dependency here.
