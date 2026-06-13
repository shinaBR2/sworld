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

# Supply-chain-safe dependency handling

This skill captures a standing posture for npm-ecosystem projects so that a compromised package
release becomes a non-event rather than a credential leak. It is pnpm-first (the primary tooling
here), with npm/yarn equivalents in `references/package-manager-config.md`.

## The threat model (why this matters)

The attack almost always follows one shape:

1. An attacker compromises a maintainer's account (phished token, leaked credential).
2. They publish a **new** malicious version of a popular package. Registry versions are immutable —
   they can't overwrite an existing version, only add a new one (e.g. push `1.2.4` over `1.2.3`).
3. Victims who **resolve and execute** that new version get hit. Detection is usually fast (hours to
   a few days), so the blast window is narrow — but real.

Two facts that drive every rule below:

- **Resolving is the trigger, not having a project on disk.** Malicious code is inert sitting in a
  `node_modules` folder. It runs only when something runs it: an install that fires a lifecycle
  script, or a build/dev/import of the compromised module. A dormant old project is not a live risk.
- **The blast radius is the whole user account, not the project.** When code does execute it runs as
  a Node process with the user's permissions and no filesystem sandbox. The "current project" folder
  isolates nothing. It can read `~/.ssh`, the npm token in `~/.npmrc`, `~/.aws/credentials`, browser
  data, and walk the home directory hoovering up every `.env` file across all projects. Note: a
  bare `process.env` only contains what the shell exported; `.env` _files_ are stolen by reading
  them off disk, which the same code can do anywhere it has read access.

So the whole game is: **carry as few dependencies as possible, don't resolve a freshly-compromised
version, don't let dependency code execute unnecessarily, and keep credentials out of easy reach.**
The cheapest defence of all is the dependency you never add — every package is both its own attack
surface and a doorway to its entire transitive tree.

## The standing posture (what every project should have)

Aim for all of these. Most are one-time setup.

1. **Carry the fewest dependencies you can.** Treat every new dependency as a standing liability, not
   a convenience. The fewer packages a project pulls in, the smaller its attack surface and the fewer
   maintainer accounts that, if compromised, could reach your machine. Before adding anything, run the
   vetting checklist below.
2. **Exact-pin direct dependencies.** No `^` or `~` in `package.json`. `"astro": "6.1.5"`, not
   `"^6.1.5"`. A caret widens the constraint to any newer minor/patch, which is exactly what an
   attacker's new version exploits on a re-resolve.
3. **Commit the lockfile.** `pnpm-lock.yaml` (or `package-lock.json` / `yarn.lock`) records the exact
   resolved version _and an integrity hash_ for every package, including transitive ones. Direct pins
   in `package.json` do nothing for transitive deps — the lockfile is what pins those, and most
   attacks land deep in the tree. The committed lockfile is the actual defence.
4. **Install frozen by default.** Use `pnpm install --frozen-lockfile`. It reproduces locked versions,
   verifies hashes, and **fails loudly** if the lockfile would need to change — instead of silently
   re-resolving. This is the single most important habit.
5. **Keep dependency scripts off by default.** pnpm 10+ does not run dependency lifecycle scripts
   (`postinstall` etc.) unless allowlisted via `onlyBuiltDependencies` in `package.json`. Keep that
   list minimal — typically only build-needing native packages (e.g. `esbuild`, `sharp`). This closes
   the most common code-execution path outright.
6. **Add a cooldown, and make it long.** pnpm's `minimumReleaseAge` (in `pnpm-workspace.yaml`) refuses
   to resolve any version published less than N minutes ago. Compromised releases are almost always
   spotted and yanked within hours to a couple of days, so a cooldown filters out the smash-and-grab
   campaigns at near-zero cost. Prefer the **longest window you can tolerate: 7 days (`10080`) is the
   recommended conservative default** — it clears essentially every smash-and-grab incident on record,
   and you almost never need a release in its first week. `1440` (1 day) is the minimum worth setting;
   pnpm 11 enables `1440` by default. When you genuinely need a just-published fix, bypass the wait for
   that one package (`minimumReleaseAgeExclude`) rather than lowering the global window. Requires
   pnpm ≥ 10.16. Note: frozen installs (CI/deploy) install exact _locked_ versions regardless of age,
   so a long cooldown never breaks a build — it only governs the moment you deliberately resolve.
7. **Keep the package manager itself current and patched.** The CLI isn't just plumbing — during an
   install it runs with your full user privileges and writes across the filesystem, so a bug _in pnpm_
   is as dangerous as a bug in a dependency. pnpm has shipped real CLI advisories — for example
   scoped-bin-name **path traversal / arbitrary file write** outside `node_modules/.bin`
   (GHSA-xpqm-wm3m-f34h, fixed in **10.28.1**) and **command injection** via environment-variable
   substitution in an `.npmrc` `tokenHelper` (CVE-2025-69262), with further CLI advisories patched
   across the 10.29+ releases through 2026. So:
   - **Don't anchor on a fixed floor — stay on the latest 10.x patch.** Below `10.16` you can't set the
     cooldown at all; `10.28.1` closed the path-traversal escapes; later 10.x patches close further CLI
     advisories. The rule is the latest patch of your major line, not a single "safe" version.
   - **Target: the latest pnpm 10.x (10.34.x at time of writing).** This is the stable, safe choice for
     most repos. It already gives you lifecycle-scripts-off-by-default, the cooldown (≥ 10.16) and the
     path-traversal fixes (≥ 10.28.1), and it runs on **Node ≥ 18.12** — so you get the whole posture
     without touching your Node floor. Don't reach for pnpm 11 just for the security fixes; 10.x has them.
   - **pnpm 11 is gated on Node 22.** The current major requires **Node 22+** (engines: `node >= 22.13`) and renames
     `onlyBuiltDependencies` → `allowBuilds`. It ships the cooldown, lifecycle-script blocking and
     exotic-subdep blocking _on by default_, but adopting it means committing the whole repo — CI,
     contributors, and `engines.node` — to a Node 22+ floor. That's a deliberate, separate decision, not
     a security necessity (10.x already closes the known holes). Move to 11 only once that floor is in
     place, repo by repo via `"packageManager": "pnpm@11.x"` after a build-check — never by flipping a
     global switch across every project at once.
   - Upgrade the CLI **the same way it was installed** — check first with `ls -l "$(which pnpm)"`
     (`npm i -g pnpm@10` for an npm-global install; the standalone installer or `corepack` otherwise).

If a project is on pnpm < 10.16 the cooldown isn't available, and older 10.x patches carry known CLI
advisories — flag it and bump to the latest 10.x patch before relying on this posture.

## Procedures

### Before adding a new dependency (vet it first)

The highest-leverage moment is _before_ `pnpm add` ever runs. Work through this; if a candidate fails
an early step, stop — don't install it.

1. **Do you actually need it?** Default to no. Can a built-in (modern JS/Node, Web APIs) or a few
   lines of your own code do the job? A one-function helper rarely justifies pulling in a package and
   its whole transitive tree. The strongest defence against a supply-chain attack is simply not being
   downstream of the compromised package.
2. **Check it for known issues before installing.** Don't install blind. Look at:
   - The npm page and GitHub repo: is it actively maintained (recent commits/releases), or abandoned?
     Abandoned-but-popular packages are prime hijack targets.
   - Open security advisories and recent issues — search the package name alongside terms like
     "vulnerability", "compromised", or "malware", and check advisory databases (GitHub Advisories,
     the relevant CVE feeds). Tools like Socket, Snyk or `pnpm audit` surface known-bad versions and
     risky behaviours (install scripts, network/filesystem access).
   - Whether the exact version is **deprecated or withdrawn**: `npm view <pkg>@<version> deprecated`
     (or `pnpm view`). Advisories sometimes name a "patched" version the maintainers later pulled as a
     _bad release_ (npm then shows a deprecation like "Bad release. Please use X instead"). Never pin
     to a deprecated version — take the maintainer-recommended one instead; if that leaves a still-open
     advisory, judge whether it is actually reachable in your usage and document the decision rather
     than forcing a withdrawn release. Sweep this across **every version you pin, including transitive
     `overrides`** — not just the top-level add.
   - How much it drags in: a package with a huge transitive tree multiplies your exposure. Prefer
     lean, few- or zero-dependency packages over convenience bundles.
3. **Pin to the latest _stable and safe_ version — not bleeding edge, not abandoned.** Choose the
   current well-maintained stable release, exact-pinned, rather than a pre-release/`next`/beta tag or
   a stale old version. With a cooldown configured (see standing posture), a version planted minutes
   ago won't resolve anyway — but still prefer one that has been out long enough to have been looked
   at. "Current stable, a few days old" is the sweet spot.
4. **Add it deliberately and review what came in.** Add the single package exact-pinned, then read the
   `git diff` of the lockfile: confirm only the expected packages appeared and no surprising new
   transitive dependencies or exotic (git/tarball) sources crept in. Then commit.

### Auditing or setting up a project

Walk the standing-posture list above. Concretely:

- Review the dependency list for anything not critically needed — every package removed is attack
  surface removed. Flag candidates for replacement with built-ins or removal.
- Check `package.json` for `^`/`~` and offer to convert to exact pins.
- Confirm a lockfile exists and is committed (`git ls-files | grep lock`).
- Confirm `onlyBuiltDependencies` is present and minimal (in pnpm 11 this is `allowBuilds`).
- Check pnpm version (`pnpm -v`) and whether a cooldown is configured.

### Resyncing an out-of-sync lockfile (e.g. after removing carets)

Removing a caret _narrows_ the constraint to a version that is usually already locked, so nothing
should re-resolve — but verify rather than trust. Never "refresh" a lockfile by deleting it and
reinstalling; that is a full re-resolve and the highest-risk single operation.

```bash
# 1. Update ONLY the lockfile to match package.json. Touches no node_modules, fetches nothing new.
pnpm install --lockfile-only

# 2. Inspect before trusting it.
git diff pnpm-lock.yaml
```

In the diff you want **only `specifier:` lines** changing (e.g. `^3.0.0` → `3.0.0`), with resolved
`version:` fields untouched. That confirms a pure pin-tightening with no version movement. If any
resolved version actually moves, stop and investigate before committing.

```bash
# 3. Clean diff → commit.
git add pnpm-lock.yaml package.json
git commit -m "Pin dependencies exactly, resync lockfile"

# 4. Materialise node_modules from locked versions (works now that lockfile is in sync).
pnpm install --frozen-lockfile
```

`--frozen-lockfile` will refuse to run while the lockfile is out of sync — that is it working
correctly. The one non-frozen sync above is what gets you straight; frozen is the default afterward.

### Day-to-day install (dev or deploy)

```bash
pnpm install --frozen-lockfile
```

Always. If it fails, the lockfile is out of sync — resolve that deliberately (see above) rather than
dropping to a plain `pnpm install`.

### Updating dependencies deliberately

The update moment is the one real exposure window, so make it observable:

1. Ensure a cooldown is set (`minimumReleaseAge`) so a version planted minutes ago won't be picked up.
2. Update narrowly — prefer one package or a small group at a time over a blanket `pnpm update`.
3. Review the `git diff` of the lockfile before committing. Look at what versions actually moved and
   whether any unexpected new transitive packages appeared.
4. Then commit, and `pnpm install --frozen-lockfile` to confirm reproducibility.

### If a compromise is suspected (a bad install may have already run)

Deleting files does **not** un-leak anything already exfiltrated. The meaningful actions are:

1. **Rotate credentials** that were reachable on the machine: npm/registry tokens (`~/.npmrc`), SSH
   keys, cloud CLI tokens (`~/.aws`, etc.), and any keys kept in `.env` files or exported in the
   shell config.
2. Identify the suspect package/version and pin away from it in `package.json` + lockfile.
3. Only then clean up `node_modules` and reinstall frozen from a known-good lockfile.
   Tidying old/dormant projects is fine hygiene, but it removes accident risk, not active risk.

## Quick reference

| Goal                                                                              | Command                          |
| --------------------------------------------------------------------------------- | -------------------------------- |
| Reproduce locked versions safely (default)                                        | `pnpm install --frozen-lockfile` |
| Resync lockfile to package.json, no install                                       | `pnpm install --lockfile-only`   |
| Inspect what changed before trusting it                                           | `git diff pnpm-lock.yaml`        |
| Check pnpm version (≥ 10.16 for cooldown, ≥ 10.28.1 for the path-traversal fixes) | `pnpm -v`                        |

**Mental model in one line:** pinned versions + committed lockfile + frozen installs mean a
compromised release can't touch you until you choose to update — so make the update moment
deliberate (cooldown + diff review) and keep credentials somewhere a rogue script can't read them.

For npm and yarn equivalents, exact cooldown config, and pnpm version-by-version behaviour, see
`references/package-manager-config.md`.
