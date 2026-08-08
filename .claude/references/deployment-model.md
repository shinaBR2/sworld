# Deployment model — merging is deploying

The single home for **how code reaches production**. Facts only. The platforms
themselves are `references/infrastructure.md`; this file owns *what a merge
does*.

## The one rule: merge = deploy

There are **only two environments — local and production.** No staging, no
promote step, no manual deploy. **Merging into `main` ships to production**, so
treat every merge as a release.

## What each merge triggers

| Change under | Deploys to | Via | The trap |
|--------------|-----------|-----|----------|
| a frontend app | Cloudflare (Pages, or Workers for Look) | the site's own Cloudflare pipeline | nothing in `.github/workflows` does this — the repo looks like it doesn't deploy the frontend, but Cloudflare does |
| `apps/hasura` | Hasura Cloud (migrations + metadata) | Hasura Cloud's GitHub integration | the `hasura-pr` workflow only **lints**, so a merge *looks* inert — it isn't |
| `apps/backend` | Cloud Run | three `backend-prod-*` GitHub Actions workflows (test → Docker build/push → WIF auth → `gcloud run deploy`) | a **broken image reaches prod on merge**, so validate anything image-level in a locally-built image first |

A backend merge ships a service when it touches that service's code *or* shared
backend source, its Dockerfile, `package.json`, `packages/core`, or the root
lockfile.

Validating "in a locally-built image" means **both** a `docker build` **and** a
`docker run` that exercises the change (a binary on `PATH`, the service booting,
a real conversion). A green build only proves the layers assemble; it says
nothing about whether the container boots or the changed behaviour works at
runtime.

Not every app deploys: **Game** and **Docs** aren't wired to any deploy, and the
browser **Extension** ships to a browser store — outside this merge = deploy model.

## Two consequences worth carrying

- **The frontend "Live" checks verify, they don't deploy.** They run against the
  already-live site (Playwright/Argos/Lighthouse budgets). A red one means
  **production is bad**, not that a deploy failed — and they don't wait for
  Cloudflare to finish publishing, so they can measure the *previous* release.
- **To know what's actually live, compare the `assets/*.js` hashes.** A
  dashboard, a green workflow, and the running site can all disagree.
