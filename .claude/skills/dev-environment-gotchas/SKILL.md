---
name: dev-environment-gotchas
description: Known traps in the sworld local dev/build tooling — stale package dists, turbo cache masking bundle changes, Node version pinning, pnpm's dependency cooldown, CodeGraph setup, and bundle-size vs error-tracking tradeoffs. Auto-triggers when a dev server fails to resolve a core/ui subpath, a build "works" but the change isn't visible, adding/upgrading a dependency, or trimming bundle size for perf.
user-invocable: false
---

* dev-environment-gotchas: recognises the local dev/build traps in this repo that look like framework bugs but have a known, boring cause, so you check here before assuming Vite, Turbo, or pnpm is broken.

* Rules
  * a shared package's (`core`, `ui`) watch build wipes the output and rebuilds only the root entry, leaving every subpath export missing, so an app's dev server then fails to resolve a subpath import from that package — rebuild the package to fix it, and don't trip the watch with a stray `turbo watch`.
  * some apps serve the shared packages from their built output with no alias back to source, so editing package source never shows through HMR (a new log or behaviour never appears no matter how often you restart) — rebuild the package's output first, then restart the dev server.
  * `turbo build` reporting a cache hit ("FULL TURBO" / "cached") can restore build output from before the change you're verifying, so a broken tree looks verified — never trust a cache hit when verifying what a change did to a bundle (run the real-build probe in Steps).
  * the monorepo pins an exact Node version everywhere (`.nvmrc`, Dockerfiles, CI) while keeping `engines.node` a floor not a pin — match the pin locally or installs warn.
  * it's a single pnpm workspace with one lockfile, so reach for `pnpm` everywhere including the backend and the Hasura data layer, never `npm`.
  * one package's name doesn't match its directory, so a `--filter` built from the directory name matches nothing and silently no-ops — run that package's scripts from its own directory.
  * lint tooling is split, so a root lint says nothing about the two backend directories — lint those from their own directories.
  * one app is dead and frozen on an old toolchain with no tests — don't apply a workspace-wide tooling change to it without checking first.
  * pnpm's release cooldown refuses to resolve any version published inside the window (`supply-chain-security` owns the setting, its value, and why) while frozen installs (CI, `--frozen-lockfile`) are unaffected, and adding any dependency triggers a broad re-resolve that can trip the cooldown on recently-bumped packages one at a time — wait it out or add each vetted, intentionally-upgraded package to the cooldown's exclude list re-running until none trips, and never hand-edit the lockfile to dodge it.
  * the CodeGraph index (`.codegraph/`) is machine-local and initialized at the monorepo root (the `sworld` checkout) so one graph covers the whole product (frontend apps, `apps/backend`, `apps/hasura`, every package), so if `codegraph_*` tools report "not initialized" re-initialize it there (discover the exact init command from the tool's own help), and reach for `codegraph_*` first for structural questions (definitions, callers, impact), grep only for literal text.
  * read the path on every CodeGraph hit before trusting it, since the index spans every `.claude/worktrees/` worktree and one symbol returns many identical-looking results — take the hit inside the worktree you're working in, as an edit made against another worktree's copy silently changes nothing.
  * never lazy-load or defer Rollbar to shave initial bundle size, even under a Lighthouse/perf budget, because deferring error tracking blinds you to init/first-paint crashes — cut bundle elsewhere (chunking, vendor splitting, right-sizing the budget) and treat Rollbar as load-bearing and eager.

* Steps
  1. Force a real build, not a cache hit.
  2. Confirm the log shows a real compile.
  3. Serve that output and drive it headlessly to read the console for runtime errors.
  4. Delete the throwaway probe after use.
