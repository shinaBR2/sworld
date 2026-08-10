---
name: mui
description: Enforces MUI component and styling conventions. Auto-triggers when writing or editing any TSX/TS files that use MUI components, styling, or theming.
user-invocable: false
---

# MUI Rules

**How** to build and style a component *inside* `packages/ui`. For **where** UI
lives — source of truth, which package and folder — see `frontend-ui-architecture`.
The container/presentational split is `code-conventions`.

## The styling doctrine — one litmus test

Every styling decision answers to one test: **swapping the theme provider must be
the ENTIRE re-skin of an app.** Wrap the app in a different provider and every
screen must look right with zero extra work.

That leaves exactly two homes for a style, and no third:

- **Global** — any look that applies everywhere (colours, surfaces, radii,
  typography, per-component looks) → the **theme** (`packages/ui`'s minimalism
  theme), via palette + `components` styleOverrides.
- **Situational** — one component, one spot → the `sx` prop on that component.

A screen that looks wrong after a provider swap is a styling hack: a component
hardcoding what the theme owns. Fix it — move the look into the theme, or reduce
it to a genuine one-off `sx` — never patch around it with app-specific styling. If
many components need the same look, that look belongs in the theme's
`styleOverrides`, once.

## House do/don'ts (inside `packages/ui`)

- **Import from `@mui/material` directly** — no custom wrappers unless strictly
  required. (How apps *consume* UI is `frontend-ui-architecture`'s rule.)
- **Style with `sx` or the theme, never `className`.**
- **No raw `px`** — it ignores the user's font-size setting. Type carries its own
  unit (`rem`, unitless line-height); spacing goes through `theme.spacing` or the
  `sx` shorthand.
- **No hardcoded colours** — no hex/rgb, and nothing mode-blind (`grey[100]`,
  `'white'`). Use mode-aware palette tokens (`background.paper`, `action.hover`,
  `text.secondary`, …) so every colour survives both light and dark mode; missing
  one? Add it to the theme first.
