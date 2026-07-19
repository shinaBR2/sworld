---
name: design-principles
description: Owner's cross-app product/UX principles — generous spacing, input-vs-view app affordances, and the Listen app's design north star. Auto-triggers when designing or reviewing layout, spacing, navigation affordances (FAB/drawer/dashboard), or any UI work in apps/listen.
user-invocable: false
---

# Design Principles

These are product-taste decisions from the owner (vincent), not derived from the code — get them wrong and a technically-correct PR still misses the point.

## Generous spacing, always

Across ALL apps (listen, watch, til, game, docs, main), the design language is **generous spacing** — large paddings/margins, airy layouts, roomy components, deliberately. More spacing reads as more generous to the end user; dense, neat, tightly-packed UI is explicitly disliked.

- Never suggest tightening density, shrinking components, or "filling empty space" to make a layout more compact.
- If something looks off in an airy layout, the fix is almost never *less space* — it's fixing broken-looking content (grey/placeholder holes, failed-avatar icons) so the emptiness reads as intentional, not shrinking the footprint.

## Input-heavy apps get a FAB; view-first apps get a management dashboard

Decided 2026-07-04:

- **Input-heavy apps** — main's finance + journal, and til — surface their primary create action as a **floating action button** (FAB), because users input a lot.
- **View-first apps** — watch and listen — must **NOT** get a create FAB. Their surfaces stay purely about consumption. All content management (upload, edit, delete, playlists) belongs in a dedicated per-app **management dashboard**, never in the primary browsing UI.
- Create actions never belong in the avatar drawer either — that drawer is for **settings + logout only**, in any app.

**Why:** the distinction is how much the end user inputs; a FAB overweights a rare/admin action in a consumption app.

**How to apply:** when adding any create/manage affordance to watch or listen, route it to the management-dashboard concept, not a FAB or a drawer item.

## Listen app design north star

- **Player-first home.** Opening the app = one click and your songs play. The home must NOT become a browse/grid like the watch site.
- **One-screen principle.** The home and the playlist-detail page are the *same screen, same UX*: Header + feeling filter (tags) + player (`MusicWidget` + `PlayingList`). Rule of thumb: **any page where you can play audio must be this same screen** — only the data (which songs) differs.
- **Standalone songs = audios not in any playlist.** These are the home's default collection (home shows standalone, playlists hold the rest — confirm before shipping, it's a deliberate departure from "home shows all audios").
- **Playlist access = a drawer, not a page** (proposed): a quiet header icon opens a source-switcher drawer (Songs + each playlist + New), tapping one reloads the same screen. Avoid a separate `/playlists` grid — it breaks the one-screen feel.
- **Aesthetic: elegant, simple, minimal — deliberately NOT a cluttered "commercialized" music app.** Lots of whitespace, one accent, calm now-playing focal point.

Applies to any `apps/listen` UI work. See the `architecture` skill's "one page = one query" rule before adding a data fetch for a listen feature — most "like page X" needs are already in the current page's query.

See also the `mui` skill's styling model for how these principles get implemented in code.
