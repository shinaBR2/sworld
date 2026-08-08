# Architecture — how the system is put together

The single home for the **structural facts** of the system: what the pieces are
and how they connect. Facts only — the *decisions* you make while working in each
area live in the matching skill (`architecture` for the frontend data path,
`backend-architecture`, `hasura-architecture`, `frontend-ui-architecture`).

For the current file layout and entry points, ask **codegraph** (the live index);
this reference deliberately keeps no file map. The top-level folder homes are
`references/repo-map.md`.

## The whole product in one shape

One repo, three layers:

- **Frontend** — React SPAs that only display and take input. All UI lives in
  `packages/ui`; shared data logic in `packages/core`.
- **Data layer** — Hasura is the *only* thing that talks to Postgres. Every app,
  service, and script reaches data through Hasura's GraphQL API.
- **Backend** — `apps/backend`, one codebase, deployed as three Hono services
  plus Hasura (below).

## The backend: three Hono services + Hasura

One TypeScript codebase, three services that **share source but boot from
different entry points**, plus Hasura as the fourth "service."

| Service | Workload |
|---------|----------|
| **gateway** | the front door — receives Hasura Events/Actions, validates signatures/sessions, routes work onward as Cloud Tasks, and handles fast synchronous Actions itself |
| **io** | light-but-long I/O — byte-copy streaming, platform imports, headless crawling |
| **compute** | CPU-heavy ffmpeg — encode/remux to fMP4 HLS (same image as gateway, different entry) |
| **hasura** | GraphQL Engine + Postgres — schema, permissions, event triggers, action definitions |

The split is by **workload, not feature** — the io-vs-compute placement call is a
decision the `backend-architecture` skill owns.

## The ingestion pipeline

The spine every heavy backend flow follows:

```
Hasura Event (row change)
  → gateway  (validate signature, decide file type)
    → Cloud Task  (carries the work across the service boundary)
      → io / compute handler  (does the work)
        → finalize: one atomic Hasura mutation
             (task completed + row → ready + notification inserted)
          → frontend subscription pushes "it's ready"
```

No handler talks to the browser directly; the result always arrives via a
Hasura subscription on notifications.

## The processing core is environment-agnostic (ports & adapters)

The core engines take all I/O through injected dependencies (storage, http,
thumbnail, logger). Adapters wire those to reality — a CLI adapter
(service-account key on disk) and a server adapter (Cloud Run's ambient
credentials). This keeps the core unit-testable with mocks and reusable across
the CLI and the servers.
