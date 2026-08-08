# Infrastructure — the platforms that run the product

The single home for **which external platforms host the product and how they're
wired**. Facts only. A skill that needs to know *what runs where* points here
instead of restating it.

Keep three neighbours straight:

- The **app roster** (which apps exist and what each is) is `references/apps.md`;
  which app runs on which platform is this file's tables below.
- The **deploy model** (merge = deploy, what triggers each deploy) is
  `references/deployment-model.md`.
- This file owns the **platforms themselves** — the accounts, services, regions,
  and how they authenticate to each other.

## Cloudflare — frontend hosting

Two products, split by app. The per-app roster is `references/apps.md`; the
platform facts are here.

| Kind | Project / script | Serves |
|------|------------------|--------|
| **Pages** | `sworld` | main (`shinabr2.com`) |
| **Pages** | `watch` | Watch |
| **Pages** | `listen` | Listen |
| **Pages** | `til` | Til |
| **Workers** | `look` | Look — the only user-facing app on Workers |
| **Workers** | `sworld-posthog-reverse-proxy` | infra, not an app — a reverse proxy for PostHog analytics |

Each site's **build pipeline and env vars live in the Cloudflare dashboard, not
in the repo** — nothing under `.github/workflows` builds or deploys a frontend
app.

## Hasura Cloud — the data layer

Hasura GraphQL Engine + its Postgres, run as **Hasura Cloud**. It is the only
thing that talks to Postgres (the single-gateway rule is owned by the
`hasura-architecture` skill). Schema + permissions come from `apps/hasura`
(migrations + metadata).

## Google Cloud — backend, async work, storage

| Service | Role | Key facts |
|---------|------|-----------|
| **Cloud Run** | runs the three Hono backend services | region `asia-southeast1`; each service is a separate Cloud Run service off one image/codebase |
| **Cloud Tasks** | the async work queue between backend services | **no local emulator** — a task is never delivered on a dev machine, which is why the full pipeline is only testable post-merge (the `backend-architecture` skill owns that consequence) |
| **GCS** | media asset storage | source + processed HLS output; layout owned by `backend-ops` |

**How the GCP pieces authenticate:**

- A Cloud Task is delivered to its target handler carrying an **OIDC token**
  scoped to that service's URL — so the io/compute handlers need no auth
  middleware of their own; only GCP can deliver to them.
- Deploys authenticate to GCP via **Workload Identity Federation (WIF)** — no
  long-lived service-account key in CI.

## GitHub Actions — CI and backend deploy execution

GitHub Actions runs CI for everything and is where the **backend** deploy
happens. Frontend (Cloudflare) and the data layer (Hasura Cloud) deploy
*outside* Actions, through their own platform integrations. What each merge
actually triggers is owned by `references/deployment-model.md`.
