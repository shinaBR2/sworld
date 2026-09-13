---
name: react
description: Enforces React conventions and best practices. Auto-triggers when writing or editing any TSX/TS files with React components, hooks, or logic.
user-invocable: false
---

* react: keeps React components and hooks on this repo's conventions.

* Rules
  * Avoid inline callbacks (e.g. `onChange={() => {...}}`) as much as possible — prefer `useCallback` instead.
  * Always consider and handle these states for every UI component: the error state (data fails to load or an action fails), the loading state (what the user sees while waiting), and the empty state (what shows when there's no data).
  * Always search for existing reusable logic before writing new code — check the shared `packages/core` and `packages/ui` first.
  * This workspace is on React 19, so set the tab title and `<meta>` tags by rendering `<title>`/`<meta>` elements from a component (React 19 auto-hoists them into `<head>`), never assigning `document.title` imperatively and never reaching for `react-helmet` (a stale, unused dependency here).
