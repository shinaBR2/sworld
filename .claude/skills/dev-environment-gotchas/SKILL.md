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

**How to apply:** for bundle verification, run the app's `vite build` directly (with any env vars that gate conditional providers, e.g. `VITE_PUBLIC_POSTHOG_KEY`) or `turbo build --force`. Confirm the log shows a real build ("✓ built in …"), then serve the dist and drive it headlessly with Playwright to read the console for runtime errors (a throwaway probe script — see the `e2e-testing` skill if one exists for the exact pattern).

## Node version and package managers

- The whole workspace (`sworld`, `sworld-backend`, `sworld-hasura-v2`) runs **Node 24.18.0**, exact-pinned. Local: `nvm use 24`. If a non-interactive shell warns `Unsupported engine`, it's likely on the default alias — prefix with `source ~/.nvm/nvm.sh && nvm use 24.18.0`.
- **Pinning convention:** pin the **exact** version (`24.18.0`) in `.nvmrc`, Dockerfiles (`node:24.18.0-slim`, never the moving `node:24-slim` tag), and CI `actions/setup-node`. Keep `engines.node` as a **range** (`>=24`) — it's a floor, not a pin.
- **Package manager differs per repo:** `sworld` = pnpm workspace (`pnpm-lock.yaml`); `sworld-backend` and `sworld-hasura-v2` = **npm** (`package-lock.json`) — use `npm ci`/`npm outdated` there, not pnpm.
- **`apps/game` is a dead/frozen app** — still on Vite 6 (the rest of the frontend is on Vite 8) + Jest, deliberately excluded from the Node 24 migration, pinned to Node 22 in its CI workflows (`.github/workflows/live-game-fe.yml`). Jest survives only here; the rest of the frontend uses Vitest. Don't assume it's maintained or apply workspace-wide tooling changes to it without checking first.

## pnpm's dependency cooldown can freeze dep work for days

`pnpm-workspace.yaml` sets `minimumReleaseAge: 10080` (7 days, SWO-355). See the `supply-chain-security` skill for what this setting is, why it exists, and how to fix a cooldown block (`minimumReleaseAgeExclude`, never hand-editing the lockfile).

**The sworld-specific trap this skill exists to flag:** adding/changing ANY dependency triggers a broad re-resolve. If a recent toolchain bump pulled fresh packages (e.g. a major Vite upgrade), every re-resolve trips the cooldown on them (`ERR_PNPM_NO_MATURE_MATCHING_VERSION`) one package at a time until they age past 7 days — effectively freezing dependency work for a week after a big bump. Frozen installs (CI, `--frozen-lockfile`) are unaffected; only local re-resolves are.

## CodeGraph index lives at the workspace root

The CodeGraph index (`.codegraph/`) is initialized at the **workspace root** (`/Users/tranvanvuong/Projects/sworld`, not inside any single repo), so one graph covers all three repos — `sworld`, `sworld-backend`, `sworld-hasura-v2` — and cross-repo structural queries work. The workspace root isn't a git repo, so the index is machine-local; if `codegraph_*` tools ever report "not initialized," re-run `codegraph init -i` at the workspace root. Reach for `codegraph_*` first for structural questions (definitions, callers, impact) across any of the three repos — grep only for literal text.

## Don't defer error tracking for bundle size

Never lazy-load or defer Rollbar to shave initial bundle size, even under a Lighthouse/perf budget. Deferring error tracking creates a blind spot for init/first-paint crashes — exactly the errors most worth catching — and the bytes saved aren't worth losing that coverage. When trimming a bundle, cut elsewhere (chunking, vendor splitting, right-sizing the budget); treat Rollbar as load-bearing and eager.
