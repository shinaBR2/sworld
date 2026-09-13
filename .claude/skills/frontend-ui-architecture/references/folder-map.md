# Folder map — universal vs site-specific

Both `packages/ui` and `packages/core` use the same filing system. Folder location — not per-change judgement — decides shared vs specific.

| Folder | Scope | `ui` example | `core` example |
|--------|-------|--------------|----------------|
| `*/universal/*` | used by EVERY app | `ui/universal/header`, `ui/universal/containers/generic` | `core/universal/hooks/useRequest` |
| `*/<site>/*` | one app only | `ui/listen/minimalism`, `ui/watch/video-detail-page` | `core/listen/query-hooks` |

`<site>` is one app (the roster is `.claude/references/apps.md`) or a domain area within one (e.g. main's `journal`, `finance`).
