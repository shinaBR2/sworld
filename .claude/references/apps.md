# Apps — the product roster

The single home for **which apps exist** and what each one is.
Any skill that needs the app list points here instead of restating it — a copied
list drifts, and this one already had: the old hardcoded lists were missing
`Look` and `Tooling`.

Two rosters sit close together; keep them straight:

- **Product apps** — the user-facing surfaces. Each has a folder under `apps/`
  (the folder map is `references/repo-map.md`) and usually a Linear project.
- **Linear projects** — the tracker's containers. `task-tracker` owns the
  "a project is an app" model; the roster below is the list that model ranges
  over, with the two documented exceptions called out.

## The apps

| App | What it is |
|-----|-----------|
| Main | The main app — its finance, journal, and library areas |
| Listen | Audio / music |
| Watch | Video |
| Til | "Today I learned" notes |
| Look | Image / video viewer |
| Game | Games |
| Docs | Documentation site |
| Extension | Browser extension |

## Two things that aren't a product app

- **Tooling** — a Linear project with **no app folder**. It's the container for
  tooling / skills / infra work (this reference was written under it). It is the
  one documented exception to `task-tracker`'s "a project is an app" model: a
  project that is not an app.
- **Backend & data layer** — `apps/backend` (the Hono backend) and `apps/hasura`
  (migrations + metadata) are part of the product but not *product apps*, and have
  no Linear project of their own. `backend-architecture` owns the `apps/backend`
  layout; `hasura-architecture` owns `apps/hasura` (matching `references/repo-map.md`).
