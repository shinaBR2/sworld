---
name: frontend-ui-architecture
description: The load-bearing rule for WHERE frontend code lives — packages/ui is the single source of truth for all UI, and the universal-vs-site folder split governs both ui and core. Auto-triggers when creating or placing a component, deciding which package or folder new frontend code belongs in, adding app-local styles, importing from @mui/material inside an app, or reviewing where code landed.
user-invocable: false
---

# Frontend UI Architecture

Two rules decide **WHERE** frontend code lives. They are the most load-bearing structural convention in this codebase: get placement right and everything else — re-skinning, reuse, review — follows. This skill is the canonical home for the convention; other skills reference it rather than restating it:

- `mui` — HOW a component is styled once it's in the right place (global=theme vs situational=`sx`).
- `architecture` — the data path (one page = one query = one transformer).
- `writing-task-specs` — a sub-task is one app/package; placement follows the rules below.
- `reviewing-pull-requests` — review checks code landed in the right package/folder.

This skill is only about **where**. For **how** to style, see `mui`.

## Rule 1 — `packages/ui` is the single source of truth for ALL UI

- All UI lives in `packages/ui` (imported as the `ui` package). MUI is an implementation detail *inside* `ui` — **apps consume UI through `ui`, never by importing `@mui/material` directly.**
- Even raw MUI primitives are re-exported for apps through `packages/ui/src/universal/containers/generic/index.tsx` (`Alert`, `Box`, `Button`, `Container`, `Grid`, `TextField`, `Typography`, …). An app that needs a primitive imports it from `ui/universal/containers/generic`, not `@mui/material`.
- **App-local custom CSS / `sx` is a one-time tweak, never the source of truth.** A genuine one-off is fine (that's `mui`'s situational case). But anything reusable — a shared look, a component used more than once, a repeated pattern — belongs in `ui`, not hand-rolled in the app.

**Litmus test:** if "should this look/component be shared?" is *yes*, it goes in `ui`. If you're writing the same styling twice in an app, stop — it belongs in `ui`.

**Why:** one place to look for any piece of UI, and re-skinning an app stays a one-line theme-provider swap (see `mui`). App-local UI that duplicates or fights `ui` quietly destroys that guarantee.

## Rule 2 — `universal` vs site-specific, mirrored across `ui` AND `core`

Both packages use the **same** filing system. Folder location — not per-change judgement — decides shared vs specific.

| Folder | Scope | `ui` example | `core` example |
|--------|-------|--------------|----------------|
| `*/universal/*` | used by EVERY app | `ui/universal/header`, `ui/universal/containers/generic` | `core/universal/hooks/useRequest` |
| `*/<site>/*` | one app only | `ui/listen/minimalism`, `ui/watch/video-detail-page` | `core/listen/query-hooks` |

`<site>` ∈ `watch | listen | til | main | game | journal | finance | …` (the app / domain).

**Placement decision, every time:**

1. **Which package?** Presentation (components, theme, layout) → `packages/ui`. Data (queries, hooks, transformers) → `packages/core`.
2. **Which folder?** Used across apps → `/universal`. Used by one app → that app's folder.

**Why:** the split is the presentation-and-data twin of the core data doctrine (`architecture`). Deciding shared-vs-specific by folder means never re-litigating it per change, and `/universal` is the single place cross-app code accumulates.

## The reality check (not an excuse)

A handful of direct `@mui/material` imports and app-local `sx` exist in the apps today. They are tolerated tweaks, **not** the pattern to copy. When you touch that code or add near it, prefer moving the shared part into `ui`. New app-local UI that should be shared is a review finding, not a shortcut.
