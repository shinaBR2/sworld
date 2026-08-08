# Apps — the product roster

The single home for **which apps exist**, what each one is, and where it ships.
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

| App | What it is | Ships to |
|-----|-----------|----------|
| Main | The main app — its finance, journal, and library areas | Cloudflare Pages (`shinabr2.com`) |
| Listen | Audio / music | Cloudflare Pages |
| Watch | Video | Cloudflare Pages |
| Til | "Today I learned" notes | Cloudflare Pages |
| Look | Image / video viewer | Cloudflare Workers (`wrangler`) |
| Game | Games | not deployed |
| Docs | Documentation site | not deployed |
| Extension | Browser extension | a browser store (outside the frontend deploy model) |

The *deploy targets* are the fact; the deploy *model* (merge = deploy, no
staging, each Cloudflare site's pipeline lives in the dashboard, not the repo)
is owned by `references/deployment-model.md`.

## Two things that aren't a product app

- **Tooling** — a Linear project with **no app folder**. It's the container for
  tooling / skills / infra work (this reference was written under it). It is the
  one documented exception to `task-tracker`'s "a project is an app" model: a
  project that is not an app.
- **Backend & data layer** — `apps/backend` (the Hono backend) and `apps/hasura`
  (migrations + metadata) are shipped surfaces but not *product apps*, and have
  no Linear project of their own. `backend-architecture` owns their layout.
