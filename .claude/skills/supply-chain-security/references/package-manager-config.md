# Package-manager config and version notes

Read this when configuring cooldowns, frozen installs, or script controls on a specific package
manager, or when checking what a given pnpm version gives you by default.

**This repo is pnpm-only** — one root `pnpm-lock.yaml` for every app and package. The npm and yarn
sections below are reference material for *other* projects; nothing here uses them, and a
`package-lock.json` or `yarn.lock` appearing in this repo is a mistake to remove, not a config to
tune.

## What this repo already has

Verified against the checked-in config — check these files before changing anything, and update this
list if they move:

| Setting | Value | Where |
|---|---|---|
| Package manager | `pnpm@10.34.3`, `engines.pnpm >= 10.34.3` | root `package.json` |
| Workspace members | `apps/*`, `packages/*` — the backend and data layer included | `pnpm-workspace.yaml` |
| Cooldown | `minimumReleaseAge: 10080` (7 days) | `pnpm-workspace.yaml` |
| Cooldown exclusions | the vite/rolldown build toolchain + `postcss`, each with a written reason | `pnpm-workspace.yaml` |
| Lifecycle scripts | `onlyBuiltDependencies: []` — **nothing** may run install scripts | `pnpm-workspace.yaml` |
| Security overrides | pinned-forward transitive versions | `pnpm.overrides` in root `package.json` |

Two notes that bite in practice:

- The 7-day cooldown blocks *any* local re-resolve while a recently-bumped package is still young.
  Add a targeted `minimumReleaseAgeExclude` entry with a comment explaining why — never lower the
  global window and never hand-edit the lockfile.
- `onlyBuiltDependencies: []` is an empty allowlist, not a missing one. Adding a dependency that
  demands a build script is a decision to make deliberately, with a reason recorded next to it.

## pnpm

### Frozen installs

`pnpm install --frozen-lockfile` reproduces locked versions and fails if the lockfile would change.
pnpm uses frozen mode automatically when `CI=true`. For local discipline, set it explicitly:

```yaml
# .npmrc  (or pnpm-workspace.yaml settings)
frozen-lockfile=true
```

### Cooldown — `minimumReleaseAge`

Delays resolving any version published within the window (value in **minutes**). Most malicious
versions are detected and yanked within hours, so the delay filters out smash-and-grab campaigns.

```yaml
# pnpm-workspace.yaml
minimumReleaseAge: 1440 # 1 day; use 10080 for a week
minimumReleaseAgeExclude: # let security-critical packages bypass the wait
  - '@types/*'
```

Version notes:

- Added in **pnpm 10.16.0**. Not available on earlier versions (e.g. 10.14.x) — upgrade to use it.
- In **pnpm 11**, `minimumReleaseAge` defaults to `1440` (1 day) — on without configuration. Opt out
  with `minimumReleaseAge: 0`.
- `minimumReleaseAgeStrict` (default `false`) falls back to an older version that meets the age
  requirement rather than failing the install. Set `true` to make a too-new-only situation hard-fail.

### Lifecycle script controls — `onlyBuiltDependencies`

pnpm 10+ does **not** run dependency lifecycle scripts (`preinstall`/`install`/`postinstall`) by
default. Only packages you allowlist may run build scripts:

```json
// package.json
"pnpm": {
  "onlyBuiltDependencies": ["esbuild", "sharp"]
}
```

Keep the list as short as possible — usually just native packages that genuinely need a build step.
Use `pnpm approve-builds` to review what is requesting script execution.

### Block exotic subdeps

`blockExoticSubdeps` (default `true` in pnpm 11) stops transitive dependencies resolving from
non-registry sources like git repos or direct tarball URLs — a path attackers use to hide code.

```yaml
# pnpm-workspace.yaml
blockExoticSubdeps: true
```

### Recommended pnpm baseline

Target the **latest pnpm 10.x** (10.34.x at time of writing). It runs on **Node ≥ 18.12** and already
gives you lifecycle-scripts-off-by-default, the `minimumReleaseAge` cooldown (≥ 10.16) and the
path-traversal fixes (≥ 10.28.1) — the full posture without a Node-floor bump. Pin it explicitly via
`"packageManager": "pnpm@10.34.x"` and `engines.pnpm`, and upgrade the global CLI the same way it was
installed (`npm i -g pnpm@10` for an npm-global install; the standalone installer or `corepack` otherwise).

pnpm 11 turns the cooldown and exotic-subdep blocking on by default, but requires **Node ≥ 22.13** and
renames `onlyBuiltDependencies` → `allowBuilds`. Move to it only after committing the repo to a Node 22+
floor (CI, contributors, `engines.node`) — it's a convenience upgrade on top of an already-safe 10.x, not
a security necessity.

## npm

- **Exact pins:** install with `npm install --save-exact <pkg>`, or set `save-exact=true` in `.npmrc`.
- **Frozen install:** `npm ci` — installs strictly from `package-lock.json` and fails on mismatch.
  Always prefer `npm ci` over `npm install` in CI/deploys.
- **Cooldown:** npm has no native release-age setting. Use Renovate or Dependabot cooldowns for
  automated updates (Renovate's `minimumReleaseAge`, formerly `stabilityDays`), or apply a cooldown
  at the package-manager layer by switching to pnpm.
- **Scripts:** `npm install --ignore-scripts`, or set `ignore-scripts=true` in `.npmrc`, to block
  lifecycle scripts. Note this also blocks your own project's scripts, so apply with care.

## yarn

- **Exact pins:** `yarn config set save-exact true`, or `yarn add --exact <pkg>`.
- **Frozen install:** `yarn install --immutable` (Yarn Berry) fails if `yarn.lock` would change.
- **Cooldown:** Yarn Berry supports duration strings, but a parsing bug (yarnpkg/berry#6942, #6991)
  dropped the day suffix (e.g. `7d`) on some settings; newer releases parse durations correctly, so the
  behaviour depends on your Yarn version and the specific setting. Verify on your version, or pass the
  value in minutes where supported / rely on Renovate/Dependabot cooldowns instead.
- **Scripts:** `enableScripts: false` in `.yarnrc.yml` disables build scripts globally.

## Renovate / Dependabot (automated update bots)

If updates are automated, the cooldown belongs in the bot config so it never auto-merges a version
inside the detection window:

- **Renovate:** `minimumReleaseAge` (e.g. `"3 days"`); the `config:best-practices` preset sets a
  3-day minimum for npm. Add explicit rules to let genuine security fixes bypass the wait.
- **Dependabot:** configure a cooldown / scheduled delay so freshly published versions age before a
  PR is opened.
