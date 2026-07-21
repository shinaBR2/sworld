---
name: dev-environment-gotchas
description: Known traps in the sworld local dev/build tooling — stale package dists, turbo cache masking bundle changes, Node version pinning, pnpm's dependency cooldown, CodeGraph setup, and bundle-size vs error-tracking tradeoffs. Auto-triggers when a dev server fails to resolve a core/ui subpath, a build "works" but the change isn't visible, adding/upgrading a dependency, or trimming bundle size for perf.
user-invocable: false
---

# Dev Environment Gotchas

Symptoms in this repo that look like framework bugs but have a known, boring cause. Check here before assuming Vite/Turbo/pnpm is broken.

## `core`/`ui` dev-watch gutting dist

`packages/core` and `packages/ui`'s `dev` script is `tsup ... --watch`, while `tsup.config.ts` has `clean: true` and a full `src/**/*.ts` entry glob. Running the dev script directly (or via a stray `turbo watch`) wipes `dist/` and rebuilds **only the root entry**, leaving `dist/providers/…`, `dist/<domain>/query-hooks/…`, etc. missing.

**Symptom:** an app dev server fails with `Failed to resolve import "core/providers/auth"` (or any `core`/`ui` subpath) — looks like a Vite resolver bug, isn't. Check `find packages/core/dist -name index.mjs | wc -l` (healthy ≈ 58, gutted = 1) and run `pnpm --filter core build` (or `--filter ui`).

## Listen dev serves `ui`/`core` from dist, not source

`apps/listen`'s vite dev server resolves `ui` and `core` through their package.json `exports`, which point to `./dist/` — there is **no** `resolve.alias` to source in `apps/listen/vite.config.ts`. Editing `packages/ui/src/**` or `packages/core/src/**` does **not** show up via HMR; the browser keeps running the last-built `dist`.

**To live-verify a `packages/ui`/`packages/core` source change in the listen app:** rebuild the dist first, then restart the dev server —
```
pnpm exec turbo run build --filter=ui   # or --filter=listen to chain core→ui→listen
pkill -f "vite --port 3001"
rm -rf apps/listen/node_modules/.vite
cd apps/listen && pnpm exec vite --port 3001 --force
```
Tell: a new `console.log`/behavior never appears no matter how many times you restart — that's stale dist, not a caching fluke.

## Turbo cache can mask a bundle verification

Don't trust `pnpm exec turbo build` output that reports a cache hit ("FULL TURBO" / "cached") when verifying what a dependency or code change actually did to a built bundle — turbo restores `dist/` from cache when its input hash matches, which can be a dist built **before** the change under test, making a broken tree look verified.

**How to apply:** for bundle verification, run the app's `vite build` directly (with any env vars that gate conditional providers, e.g. `VITE_PUBLIC_POSTHOG_KEY`) or `turbo build --force`. Confirm the log shows a real build ("✓ built in …"), then serve the dist and drive it headlessly with Playwright to read the console for runtime errors: launch a browser, register `page.on('console'/'pageerror')` handlers, navigate to the served dist, and check what got logged — a throwaway script deleted after use, not a checked-in test.

## Node version and package managers

- The whole monorepo — frontend apps, `apps/backend`, `apps/hasura`, and every package — runs **Node 24.18.0**, exact-pinned. Local: `nvm use 24`. If a non-interactive shell warns `Unsupported engine`, it's likely on the default alias — prefix with `source ~/.nvm/nvm.sh && nvm use 24.18.0`.
- **Pinning convention:** pin the **exact** version (`24.18.0`) in `.nvmrc`, Dockerfiles (`node:24.18.0-slim`, never the moving `node:24-slim` tag), and CI `actions/setup-node`. Keep `engines.node` as a **range** (`>=24`) — it's a floor, not a pin.
- **One package manager, one lockfile.** Everything is a single pnpm workspace with one root `pnpm-lock.yaml`. There is no `package-lock.json` and no `npm ci` — reach for `pnpm`, `pnpm --filter <pkg> …`, `pnpm outdated -r` everywhere, including in `apps/backend` and `apps/hasura`. The backend gets `core` as `workspace:*` off the local source, not from npm.
- **`apps/hasura` is the one package whose name doesn't match its directory** — it's still `sworld-hasura-v2`. `pnpm --filter` on a name that matches nothing exits 0 with "No projects matched", so a filter built from the directory name silently does nothing. Run its scripts from the directory (`cd apps/hasura && pnpm run lint`).
- **Lint tooling is split, and the root config skips the two backend directories.** `biome.json` at the root excludes `apps/backend` and `apps/hasura`, so a root `pnpm lint` says nothing about either. `apps/backend` has its own `biome.json` and `lint` script; `apps/hasura` uses eslint. Lint those from their own directories.
- **`apps/game` is a dead/frozen app** — still on Vite 6 (the rest of the frontend is on Vite 8), deliberately excluded from the Node 24 migration, and no longer deployed anywhere. It has no tests at all — unit tests everywhere else in the workspace run on Vitest. Don't assume it's maintained or apply workspace-wide tooling changes to it without checking first.

## pnpm's dependency cooldown can freeze dep work for days

`pnpm-workspace.yaml` sets a release cooldown (`minimumReleaseAge`) — pnpm refuses to *resolve* any version published more recently than the window. `supply-chain-security` owns the setting, its value, and why it exists. The gotcha here: frozen installs (CI, `--frozen-lockfile`) are unaffected — only local re-resolves are.

**The sworld-specific trap:** adding/changing ANY dependency triggers a broad re-resolve. If a recent toolchain bump pulled fresh packages (e.g. a major Vite upgrade), every re-resolve trips the cooldown on them (`ERR_PNPM_NO_MATURE_MATCHING_VERSION`) — one package at a time, since pnpm only reports the next blocked package per run — until they age past 7 days, effectively freezing dependency work for a week after a big bump.

**Fixes, in order:** wait it out; add each vetted, intentionally-upgraded package to `minimumReleaseAgeExclude:` in `pnpm-workspace.yaml`, re-running and repeating until no package trips the cooldown (pnpm surfaces them one at a time — there's no single command that lists them all up front); or a one-off `pnpm install --config.minimumReleaseAge=0` for a genuinely urgent unblock (still drags collateral re-resolve churn). **Never hand-edit `pnpm-lock.yaml`** to dodge this — let the tool own the lockfile.

## CodeGraph index lives at the workspace root

The CodeGraph index (`.codegraph/`) is initialized at the **workspace root** — the directory *containing* the `sworld` checkout, not inside it — so one graph covers everything under it. The workspace root isn't a git repo, so the index is machine-local; if `codegraph_*` tools ever report "not initialized," re-run `codegraph init -i` there. Reach for `codegraph_*` first for structural questions (definitions, callers, impact) — grep only for literal text.

**Read the path on every hit before trusting it.** The index spans sibling checkouts and every `.claude/worktrees/` worktree, so one symbol commonly returns many identical-looking results. Since the backend and data layer moved into the monorepo, the pre-move `sworld-backend` / `sworld-hasura-v2` checkouts still exist on disk and are still indexed — so a backend symbol returns hits under both `sworld/apps/backend/…` and the old `sworld-backend/…`, and only the first is live code. Take the `sworld/apps/…` hit (or the one inside the worktree you're working in); an edit made against an old path silently changes nothing.

## Don't defer error tracking for bundle size

Never lazy-load or defer Rollbar to shave initial bundle size, even under a Lighthouse/perf budget. Deferring error tracking creates a blind spot for init/first-paint crashes — exactly the errors most worth catching — and the bytes saved aren't worth losing that coverage. When trimming a bundle, cut elsewhere (chunking, vendor splitting, right-sizing the budget); treat Rollbar as load-bearing and eager.
