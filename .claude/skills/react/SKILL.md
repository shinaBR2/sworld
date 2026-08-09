---
name: react
description: Enforces React conventions and best practices. Auto-triggers when writing or editing any TSX/TS files with React components, hooks, or logic.
user-invocable: false
---

# React Rules

## Document metadata (React 19)

This workspace is on React 19 — set the tab title and `<meta>` tags by **rendering** `<title>` / `<meta>` elements from a component (React 19 auto-hoists them into `<head>`). Never assign `document.title` imperatively, and never reach for `react-helmet` — it's a stale, unused dependency here.
