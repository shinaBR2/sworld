---
name: mui
description: Enforces MUI component and styling conventions. Auto-triggers when writing or editing any TSX/TS files that use MUI components, styling, or theming.
user-invocable: false
---

* mui: builds and styles a component inside `packages/ui` the house way.

* Rules
  * This skill governs HOW to build and style a component inside `packages/ui`; WHERE UI lives is `frontend-ui-architecture` and the container/presentational split is `code-conventions`.
  * Every styling decision answers to one test: swapping the theme provider must be the ENTIRE re-skin of an app, so wrapping the app in a different provider must leave every screen looking right with zero extra work.
  * A look that applies everywhere (colours, surfaces, radii, typography, per-component looks) is global and belongs in the theme (`packages/ui`'s minimalism theme), via palette plus `components` styleOverrides.
  * A look for one component in one spot is situational and belongs in the `sx` prop on that component.
  * A screen that looks wrong after a provider swap is a styling hack — a component hardcoding what the theme owns — so fix it by moving the look into the theme or reducing it to a genuine one-off `sx`, never by patching around it with app-specific styling.
  * When many components need the same look, that look belongs in the theme's `styleOverrides`, once.
  * Import from `@mui/material` directly, with no custom wrappers unless strictly required.
  * Style with `sx` or the theme, never `className`.
  * No raw `px`, because it ignores the user's font-size setting — type carries its own unit (`rem`, unitless line-height) and spacing goes through `theme.spacing` or the `sx` shorthand.
  * No hardcoded colours — no hex/rgb and nothing mode-blind (`grey[100]`, `'white'`) — use mode-aware palette tokens (`background.paper`, `action.hover`, `text.secondary`, …) so every colour survives both light and dark mode, adding a missing token to the theme first.

* Steps
  * Decide each style's home: a global look goes in the theme, a genuine one-off goes in `sx`.
  * Before writing a colour, reach for a mode-aware palette token, adding one to the theme if it's missing.
  * Sanity-check by imagining a theme-provider swap — if any screen would break, move the offending look into the theme.
