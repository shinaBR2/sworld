# Supply-chain background and quick reference

The narrative behind the rules — the standing posture, the threat model, and a command
cheat-sheet. Read this for the *why*; the rules and steps in `SKILL.md` are the *what*.

## The standing posture (what every project should have)

This skill captures a standing posture for npm-ecosystem projects so that a compromised package
release becomes a non-event rather than a credential leak. It is pnpm-first (the primary tooling
here), with npm/yarn equivalents in `package-manager-config.md` for other projects. Aim for all of
the posture rules; most are one-time setup.

## In this repo

**One lockfile, one package manager.** Everything — every frontend app, the Hono backend
(`apps/backend`), the data layer (`apps/hasura`) and the shared packages — resolves through a single
`pnpm-lock.yaml` at the repo root. pnpm is the only package manager: there is no
`package-lock.json` and no `yarn.lock` anywhere, and the backend consumes `packages/core` as
`core: workspace:*` rather than from the registry.

Three consequences worth holding on to:

- **A second lockfile is a bug, not a state to maintain.** If one appears under an app, it means a
  bare `npm install`/`yarn` ran somewhere it shouldn't have. Delete it and re-resolve through pnpm at
  the root — don't try to keep two in sync.
- **`npm ci` in a script, Dockerfile or workflow is stale.** It cannot work without a
  `package-lock.json`. Treat any such step as left over from before the repos merged.
- **One lockfile means one blast radius.** A compromised transitive dependency now reaches the
  frontends *and* the backend in the same install, so the vetting checklist matters more than
  it did when they were separate projects.

The live settings (cooldown, exclusions, lifecycle scripts, pinned pnpm version) are recorded in
`package-manager-config.md` — read them there rather than restating them.

## The threat model (why this matters)

The attack almost always follows one shape:

1. An attacker compromises a maintainer's account (phished token, leaked credential).
2. They publish a **new** malicious version of a popular package. Registry versions are immutable —
   they can't overwrite an existing version, only add a new one (e.g. push `1.2.4` over `1.2.3`).
3. Victims who **resolve and execute** that new version get hit. Detection is usually fast (hours to
   a few days), so the blast window is narrow — but real.

Two facts that drive every rule:

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

## Quick reference

| Goal                                                                              | Command                          |
| --------------------------------------------------------------------------------- | -------------------------------- |
| Reproduce locked versions safely (default)                                        | `pnpm install --frozen-lockfile` |
| Resync lockfile to package.json, no install                                       | `pnpm install --lockfile-only`   |
| Inspect what changed before trusting it                                           | `git diff pnpm-lock.yaml`        |
| Check pnpm version (floors in `package-manager-config.md`)                        | `pnpm -v`                        |

**Mental model in one line:** pinned versions + committed lockfile + frozen installs mean a
compromised release can't touch you until you choose to update — so make the update moment
deliberate (cooldown + diff review) and keep credentials somewhere a rogue script can't read them.

For npm and yarn equivalents, exact cooldown config, and pnpm version-by-version behaviour, see
`package-manager-config.md`.
