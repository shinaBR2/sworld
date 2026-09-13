---
name: frontend-ui-architecture
description: The load-bearing rule for WHERE frontend code lives — packages/ui is the single source of truth for all UI, and the universal-vs-site folder split governs both ui and core. Auto-triggers when creating or placing a component, deciding which package or folder new frontend code belongs in, adding app-local styles, importing from @mui/material inside an app, or reviewing where code landed.
user-invocable: false
---

* frontend-ui-architecture: decides WHERE frontend code lives — the package and folder each component, style, hook, or transformer belongs in.

* Rules
  * These two placement rules are the most load-bearing structural convention in the codebase, and this skill is their canonical home — `mui` (HOW a component is styled), `architecture` (the data path, one page = one query = one transformer), `writing-task-specs` (a sub-task is one app/package), and `self-review` (code landed in the right package/folder) reference it rather than restate it.
  * This skill is only about WHERE code lives; HOW to style is `mui`, and the top-level structural facts it rests on live in `.claude/references/repo-map.md` and `.claude/references/architecture.md`.
  * All UI lives in `packages/ui` (imported as the `ui` package), and apps consume UI through `ui`, never by importing `@mui/material` directly — MUI is an implementation detail inside `ui`.
  * Even raw MUI primitives are re-exported for apps through `packages/ui/src/universal/containers/generic/index.tsx` (`Alert`, `Box`, `Button`, `Container`, `Grid`, `TextField`, `Typography`, …), so an app needing a primitive imports it from `ui/universal/containers/generic`, not `@mui/material`.
  * App-local custom CSS / `sx` is a one-time tweak, never the source of truth — a genuine one-off is fine, but anything reusable (a shared look, a component used more than once, a repeated pattern) belongs in `ui`, not hand-rolled in the app.
  * If "should this look/component be shared?" is yes, it goes in `ui`; writing the same styling twice in an app means it belongs in `ui`, so that there is one place to look for any UI and re-skinning stays a one-line theme-provider swap, and app-local UI that duplicates or fights `ui` quietly destroys that guarantee.
  * Both `ui` and `core` use the same filing system, and folder location — not per-change judgement — decides shared vs specific: `*/universal/*` is used by every app, `*/<site>/*` by one app only, which mirrors the core data doctrine (`architecture`) and means never re-litigating shared-vs-specific per change, with `/universal` the single place cross-app code accumulates.
    * scopes and examples: `references/folder-map.md`
  * `<site>` is one app (the roster is `.claude/references/apps.md`) or a domain area within one (e.g. main's `journal`, `finance`).
  * A handful of direct `@mui/material` imports and app-local `sx` exist in the apps today as tolerated tweaks, NOT the pattern to copy — prefer moving the shared part into `ui` when you touch or add near that code, and treat new app-local UI that should be shared as a review finding.

* Steps
  1. Pick the package: presentation (components, theme, layout) → `packages/ui`; data (queries, hooks, transformers) → `packages/core`.
  2. Pick the folder: used across apps → `/universal`; used by one app → that app's folder.
