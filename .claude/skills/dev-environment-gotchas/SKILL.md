---
name: dev-environment-gotchas
description: Known traps in the sworld local dev/build tooling — stale package dists, turbo cache masking bundle changes, Node version pinning, pnpm's dependency cooldown, CodeGraph setup, and bundle-size vs error-tracking tradeoffs. Auto-triggers when a dev server fails to resolve a core/ui subpath, a build "works" but the change isn't visible, adding/upgrading a dependency, or trimming bundle size for perf.
user-invocable: false
---

# Dev Environment Gotchas

Symptoms in this repo that look like framework bugs but have a known, boring cause. Check here before assuming Vite, Turbo, or pnpm is broken.

## A shared package's dev-watch can gut its own build output

The shared packages (`core`, `ui`) build in a watch mode that wipes the output and rebuilds **only the root entry**, leaving every subpath export missing. Run that watch build directly — or trip it with a stray `turbo watch` — and an app's dev server then fails to resolve a subpath import from that package. It looks like a Vite resolver bug; it isn't. Rebuild the package and it's fixed.

## Some apps serve the shared packages from built output, not source

An app's dev server can resolve the shared packages through their published entry points — their **built output**, with no alias back to source. Editing the package source then does **not** show up through HMR; the browser keeps running the last build. The tell: a new log or behaviour never appears no matter how many times you restart. Rebuild the package's output first, then restart the dev server. Stale build output, not a caching fluke.

## Turbo's cache can mask a bundle verification

`turbo build` reporting a cache hit ("FULL TURBO" / "cached") can restore build output from **before** the change you're verifying — so a broken tree looks verified. When you're checking what a dependency or code change actually did to a built bundle, force a real build, confirm the log shows a real compile, then serve that output and drive it headlessly to read the console for runtime errors — a throwaway probe, deleted after use.

## Node and package managers

The monorepo pins an **exact** Node version everywhere (`.nvmrc`, Dockerfiles, CI) while keeping `engines.node` a floor, not a pin — match the pin locally or installs warn. It's a single pnpm workspace with one lockfile: reach for `pnpm` everywhere, including the backend and the Hasura data layer, never `npm`. Two traps silently no-op a command: one package's name doesn't match its directory, so a `--filter` built from the directory name matches nothing and does nothing (run that package's scripts from its own directory); and lint tooling is split, so a root lint says nothing about the two backend directories — lint those from their own directories. One app is dead and frozen on an old toolchain with no tests — don't apply a workspace-wide tooling change to it without checking first.

## pnpm's dependency cooldown can freeze dep work for days

A release cooldown makes pnpm refuse to *resolve* any version published inside the window; `supply-chain-security` owns the setting, its value, and why. Frozen installs (CI, `--frozen-lockfile`) are unaffected — only local re-resolves are. The trap: adding *any* dependency triggers a broad re-resolve that can trip the cooldown on recently-bumped packages, one at a time, until they age past the window — effectively freezing dependency work for days after a big toolchain bump. Wait it out, or add each vetted, intentionally-upgraded package to the cooldown's exclude list, re-running until none trips. **Never hand-edit the lockfile** to dodge it — let the tool own it.

## CodeGraph index lives at the workspace root

The CodeGraph index (`.codegraph/`) is initialized at the **workspace root** — the directory *containing* the `sworld` checkout, not inside it — so one graph covers everything under it. The workspace root isn't a git repo, so the index is machine-local; if `codegraph_*` tools ever report "not initialized," re-run `codegraph init -i` there. Reach for `codegraph_*` first for structural questions (definitions, callers, impact) — grep only for literal text.

**Read the path on every hit before trusting it.** The index spans sibling checkouts and every `.claude/worktrees/` worktree, so one symbol commonly returns many identical-looking results. Since the backend and data layer moved into the monorepo, the pre-move `sworld-backend` / `sworld-hasura-v2` checkouts still exist on disk and are still indexed — so a backend symbol returns hits under both `sworld/apps/backend/…` and the old `sworld-backend/…`, and only the first is live code. Take the `sworld/apps/…` hit (or the one inside the worktree you're working in); an edit made against an old path silently changes nothing.

## Don't defer error tracking for bundle size

Never lazy-load or defer Rollbar to shave initial bundle size, even under a Lighthouse/perf budget. Deferring error tracking creates a blind spot for init/first-paint crashes — exactly the errors most worth catching — and the bytes saved aren't worth losing that coverage. When trimming a bundle, cut elsewhere (chunking, vendor splitting, right-sizing the budget); treat Rollbar as load-bearing and eager.
