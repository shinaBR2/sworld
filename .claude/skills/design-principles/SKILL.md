---
name: design-principles
description: Owner's cross-app product/UX principles — generous spacing, input-vs-view app affordances, and the Listen app's design north star. Auto-triggers when designing or reviewing layout, spacing, navigation affordances (FAB/drawer/dashboard), or any UI work in apps/listen.
user-invocable: false
---

* design-principles: keeps UI work true to the owner's cross-app product and UX taste — generous spacing, input-vs-view affordances, and the Listen app's design north star.

* Rules
  * These are product-taste decisions from the owner, not derived from the code — get them wrong and a technically-correct PR still misses the point.
  * Across ALL apps the design language is generous spacing — large paddings/margins, airy layouts, roomy components, deliberately — because more spacing reads as more generous to the end user and dense, tightly-packed UI is explicitly disliked.
    * roster: `.claude/references/apps.md`
  * Never suggest tightening density, shrinking components, or "filling empty space" to make a layout more compact.
  * When something looks off in an airy layout, fix the broken-looking content (grey/placeholder holes, failed-avatar icons) so the emptiness reads as intentional, never shrink the footprint.
  * Input-heavy apps — main's finance and journal, and til — surface their primary create action as a floating action button (FAB), because users input a lot.
  * View-first apps — watch and listen — must NOT get a create FAB; their surfaces stay purely about consumption.
  * All content management (upload, edit, delete, playlists) in a view-first app belongs in a dedicated per-app management dashboard, never in the primary browsing UI.
  * Create actions never belong in the avatar drawer either — that drawer is for settings and logout only, in any app.
  * The FAB-vs-dashboard distinction is how much the end user inputs; a FAB overweights a rare/admin action in a consumption app.
  * Listen's home is player-first — opening the app is one click and your songs play — and the home must NOT become a browse/grid like the watch site.
  * Listen's home and playlist-detail page are the same screen with the same UX (Header + feeling filter tags + player: `MusicWidget` + `PlayingList`), and any page where you can play audio must be this same screen — only the data differs.
  * In Listen, standalone songs (audios not in any playlist) are the home's default collection — home shows standalone, playlists hold the rest — a deliberate departure from "home shows all audios".
  * Listen's playlist access is a drawer, not a page: a quiet header icon opens a source-switcher drawer (Songs + each playlist + New) and tapping one reloads the same screen, avoiding a separate `/playlists` grid that would break the one-screen feel.
  * Listen's aesthetic is elegant, simple, and minimal — deliberately NOT a cluttered "commercialized" music app — with lots of whitespace, one accent, and a calm now-playing focal point.

* Steps
  * When adding any create/manage affordance to watch or listen, route it to the management-dashboard concept, not a FAB or a drawer item.
  * For any `apps/listen` UI work, check the `architecture` skill's "one page = one query" rule before adding a data fetch — most "like page X" needs are already in the current page's query.
  * Implement these principles in code through the `mui` skill's styling model.
