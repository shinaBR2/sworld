---
name: mui
description: Enforces MUI component and styling conventions. Auto-triggers when writing or editing any TSX/TS files that use MUI components, styling, or theming.
user-invocable: false
---

# MUI Rules

These rules are about **how** to build and style a component *inside* `packages/ui`. For **where** UI lives — source of truth, which package and folder — see `frontend-ui-architecture`.

## 1. Use MUI components directly (inside `packages/ui`)

- Import from `@mui/material` — no custom wrappers unless strictly required. This applies **inside `packages/ui`**; how apps consume UI is `frontend-ui-architecture`'s rule.

```tsx
// Good
import { Button, TextField, Stack } from '@mui/material';

// Bad — unnecessary wrapper
import { CustomButton } from '@/components/ui/CustomButton';
```

## 2. Reach for a semantic component before Box

Prefer the component that names its intent:
- `Stack` for flex layouts
- `Container` for page containers
- `Paper` for elevated surfaces
- `Card` for content cards
- `Grid` for grid layouts

`Box` is a sanctioned primitive for genuinely generic layout — use it when none of the above expresses what you mean, not as the default reach. If a `Box` is really a `Stack` or a `Container`, use the semantic one.

## 3. NEVER use className

Always use `sx` prop or theme — no `className` on MUI components.

## 4. Styling strategy — the two-case mental model

There are exactly TWO places a style can live. There is no third case.

- **Global** (a design decision that applies everywhere — colors, surfaces, glass effects, radii, typography, component looks) → the **theme** (`packages/ui/src/universal/minimalism/`), via palette + `components` styleOverrides.
- **Situational** (one single component, one spot) → the `sx` prop on that component.

**The litmus test: swapping the theme provider must be the ENTIRE re-skin of an app.** Wrap the app in a different provider and every screen must look right with zero extra work. If a screen looks wrong after a provider swap, that is a styling hack in our code — a component hardcoding what the theme owns — and the hack gets fixed (moved into the theme, or reduced to a real one-off `sx`), never patched around with app-specific styling.

Corollary: never restyle a component to "match" a design system — if many components need the same look, that look belongs in the theme's `styleOverrides`, once.

## 5. NEVER use px units

Use relative units that scale with user preferences:

| Property | Bad | Good |
|----------|-----|------|
| fontSize | `'14px'` | `'0.875rem'` |
| lineHeight | `'20px'` | `1.429` (unitless) |
| letterSpacing | `'0.5px'` | `'0.035em'` |
| spacing/padding/margin | `'16px'` | `theme.spacing(2)` or `sx={{ p: 2 }}` |
| width/height | `'300px'` | `theme.spacing(37.5)` or responsive values |

## 6. NEVER hardcode colors

- No hex/rgb in components — always use theme palette.
- Missing color? Add it to the theme first.
- Every color must survive BOTH light and dark mode. `grey[100]`, `#e0e0e0`, `'white'` in a component are latent dark-mode bugs — use mode-aware tokens (`background.paper`, `action.hover`, `text.secondary`, …) that the theme resolves per mode.

```tsx
// Bad
<Paper sx={{ bgcolor: '#193c4d' }} />

// Good
<Paper sx={{ bgcolor: 'background.paper' }} />
```

## 7. Container/Presentational pattern

For complex components, split the stateful shell from the pure view:

- **Container** — owns state, hooks, and data fetching; passes everything down as props.
- **Presentational** — pure rendering from props: no state, no hooks, no data fetching.
- **Storybook** — drives the presentational component directly with mocked props, so no API mocking is needed.

The split is what lets Storybook test the view in isolation. For where these files live and how they're named, follow `frontend-ui-architecture`.
