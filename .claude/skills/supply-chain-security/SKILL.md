---
name: supply-chain-security
description: >-
  Best-practice process for keeping JavaScript/Node supply-chain attacks low-impact when working
  on pnpm, npm, or yarn projects. Use this skill whenever installing, adding, updating, or pinning
  dependencies; running pnpm/npm/yarn install; resyncing or regenerating a lockfile; setting up a
  new Astro or Node project; auditing whether a project is safe from a compromised package; editing
  package.json or a lockfile; or whenever the user mentions supply-chain attacks, compromised npm
  packages, malicious postinstall scripts, pinning versions, or lockfile hygiene — even if they
  don't explicitly ask for a "safe install". Default to consulting this before running any install
  command so the safe procedure is followed rather than a blind re-resolve.
---

* supply-chain-security: keeps a compromised npm/pnpm/yarn package release a non-event rather than a credential leak, by making every install and lockfile change deliberate.

* Rules
  * The background — standing posture, threat model, why resolving (not having a project on disk) is the trigger, and why the blast radius is the whole user account — is in [`references/notes.md`](references/notes.md); the pnpm/npm/yarn config, cooldown values and version floors are in [`references/package-manager-config.md`](references/package-manager-config.md).
  * The whole game: carry as few dependencies as possible, don't resolve a freshly-compromised version, don't let dependency code execute unnecessarily, and keep credentials out of easy reach.
  * One lockfile, one package manager here — everything (every frontend app, the Hono backend `apps/backend`, the data layer `apps/hasura`, the shared packages) resolves through a single `pnpm-lock.yaml` at the repo root, pnpm only, no `package-lock.json` or `yarn.lock` anywhere, and the backend consumes `packages/core` as `core: workspace:*` not from the registry.
  * A second lockfile is a bug, not a state to maintain — if one appears under an app a bare `npm install`/`yarn` ran where it shouldn't, so delete it and re-resolve through pnpm at the root rather than keeping two in sync.
  * `npm ci` in a script, Dockerfile or workflow is stale — it cannot work without a `package-lock.json`, so treat any such step as left over from before the repos merged.
  * One lockfile means one blast radius — a compromised transitive dependency now reaches the frontends and the backend in the same install, so vetting matters more than when they were separate projects.
  * Carry the fewest dependencies you can — treat every new dependency as a standing liability, since the fewer packages pulled in, the smaller the attack surface and the fewer maintainer accounts that could reach your machine if compromised.
  * Exact-pin direct dependencies — no `^` or `~` in `package.json` (`"astro": "6.1.5"`, not `"^6.1.5"`), because a caret widens the constraint to any newer minor/patch, which is exactly what an attacker's new version exploits on a re-resolve.
  * Commit the lockfile — `pnpm-lock.yaml` (or `package-lock.json`/`yarn.lock`) records the exact resolved version and an integrity hash for every package including transitive ones, and since direct pins do nothing for transitive deps where most attacks land, the committed lockfile is the actual defence.
  * Install frozen by default (`pnpm install --frozen-lockfile`) — it reproduces locked versions, verifies hashes, and fails loudly if the lockfile would need to change instead of silently re-resolving; this is the single most important habit.
  * Keep dependency scripts off by default — pnpm 10+ does not run dependency lifecycle scripts (`postinstall` etc.) unless allowlisted via `onlyBuiltDependencies` in `package.json` (in pnpm 11 this is `allowBuilds`), and that list stays minimal, typically only build-needing native packages (e.g. `esbuild`, `sharp`).
  * Add a cooldown and make it long — pnpm's `minimumReleaseAge` refuses to resolve any freshly-published version, filtering out smash-and-grab campaigns at near-zero cost, so prefer the longest window you can tolerate (7 days / `10080` recommended, `1440` / 1 day the minimum worth setting); when you genuinely need a just-published fix, bypass the wait for that one package rather than lowering the global window, and note that frozen installs install exact locked versions regardless of age so a long cooldown never breaks a build.
  * Keep the package manager itself current and patched — during an install the CLI runs with your full user privileges so a bug in pnpm is as dangerous as one in a dependency, so stay on the latest patch of the 10.x line and upgrade the CLI the same way it was installed (`ls -l "$(which pnpm)"` to check).
  * An old pnpm undercuts the whole posture (no cooldown, unpatched CLI), so flag it and bump onto the latest 10.x before relying on the rest — a major-version jump if it is on pnpm 9 or older.
  * When vetting, if a candidate fails an early check, stop and don't install it.
  * Pin to the latest stable and safe version — the current well-maintained stable release exact-pinned, never a pre-release/`next`/beta tag or a stale old version; "current stable, a few days old" is the sweet spot.
  * Never pin to a deprecated or withdrawn version — take the maintainer-recommended one instead, and if that leaves a still-open advisory, judge whether it is actually reachable in your usage and document the decision rather than forcing a withdrawn release; sweep this across every version you pin, including transitive `overrides`, not just the top-level add.
  * Never "refresh" a lockfile by deleting it and reinstalling — that is a full re-resolve and the highest-risk single operation.
  * In a resync diff you want only `specifier:` lines changing (e.g. `^3.0.0` → `3.0.0`) with resolved `version:` fields untouched; if any resolved version actually moves, stop and investigate before committing.
  * `--frozen-lockfile` refusing to run while the lockfile is out of sync is it working correctly, not a reason to drop to a plain `pnpm install`.
  * The update moment is the one real exposure window, so make it observable (cooldown, narrow updates, diff review).
  * Deleting files does not un-leak anything already exfiltrated — tidying old/dormant projects removes accident risk, not active risk.
  * Mental model: pinned versions + committed lockfile + frozen installs mean a compromised release can't touch you until you choose to update, so make the update moment deliberate (cooldown + diff review) and keep credentials somewhere a rogue script can't read them.

* Steps
  * Vet a new dependency before `pnpm add` ever runs.
    1. Ask whether you actually need it — default to no, since a built-in (modern JS/Node, Web APIs) or a few lines of your own code often does the job.
    2. Check it for known issues before installing: npm page and GitHub repo (actively maintained or abandoned), open security advisories and recent issues (search the name alongside "vulnerability"/"compromised"/"malware", check GitHub Advisories and CVE feeds, and tools like Socket, Snyk or `pnpm audit`), whether the exact version is deprecated or withdrawn, and how large its transitive tree is.
       * `npm view <pkg>@<version> deprecated` (or `pnpm view`)
    3. Pin to the latest stable and safe version, exact-pinned.
    4. Add the single package exact-pinned, read the `git diff` of the lockfile to confirm only the expected packages appeared with no surprising new transitive or exotic (git/tarball) sources, then commit.
  * Audit or set up a project by walking the posture rules.
    * Review the dependency list for anything not critically needed; flag candidates for replacement with built-ins or removal.
    * Check `package.json` for `^`/`~` and offer to convert to exact pins.
    * `git ls-files | grep lock` — expect exactly one, `pnpm-lock.yaml` at the root.
    * Confirm `onlyBuiltDependencies` is present and minimal (in pnpm 11, `allowBuilds`).
    * `pnpm -v` — and check whether a cooldown is configured.
  * Resync an out-of-sync lockfile (e.g. after removing carets).
    1. `pnpm install --lockfile-only` — updates only the lockfile to match package.json; touches no node_modules, fetches nothing new.
    2. `git diff pnpm-lock.yaml` — inspect before trusting it.
    3. `git add pnpm-lock.yaml package.json && git commit -m "Pin dependencies exactly, resync lockfile"`
    4. `pnpm install --frozen-lockfile` — materialise node_modules from locked versions.
  * Day-to-day install (dev or deploy), always.
    * `pnpm install --frozen-lockfile`
  * Update dependencies deliberately.
    1. Ensure a cooldown is set (`minimumReleaseAge`) so a version planted minutes ago won't be picked up.
    2. Update narrowly — one package or a small group at a time, never a blanket `pnpm update`.
    3. Review the `git diff` of the lockfile before committing — what versions actually moved and whether any unexpected new transitive packages appeared.
    4. `pnpm install --frozen-lockfile` to confirm reproducibility, then commit.
  * If a compromise is suspected (a bad install may have already run).
    1. Rotate credentials reachable on the machine: npm/registry tokens (`~/.npmrc`), SSH keys, cloud CLI tokens (`~/.aws`, etc.), and any keys kept in `.env` files or exported in the shell config.
    2. Identify the suspect package/version and pin away from it in `package.json` + lockfile.
    3. Only then clean up `node_modules` and reinstall frozen from a known-good lockfile.
