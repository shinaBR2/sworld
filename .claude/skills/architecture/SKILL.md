---
name: architecture
description: Enforces frontend architecture patterns including server state management, data transformation, and GraphQL conventions. Auto-triggers when working with API calls, data fetching, react-query, GraphQL, or data transformations.
user-invocable: false
---

* architecture: shapes the frontend data path — how server data is fetched, transformed, and consumed.

* Rules
  * placement — which package or folder code lives in — belongs to `frontend-ui-architecture`, not here, and the structural anatomy of the data path is a fact in `.claude/references/architecture.md`.
  * server state is always react-query (TanStack Query) via `useQuery` / `useMutation`, never `useState` or a client store.
  * client stores hold UI state only — modals, selections, sidebar open/closed.
  * one query per page: because Hasura is a single GraphQL endpoint any page's fields compose into one request, so return exactly what the page needs and no more, never two hooks side by side — collapse their root fields into one.
  * each page owns its query and never points at another page's query; reuse at the fragment level, not the query level, and before adding a query check the existing one's fragments — a nested relationship often already returns what you need — since a derived view is a client-side filter, not a second fetch.
  * one transformer per query, never shared across queries.
  * keep the query role-agnostic and vary the token — never encode authorization in the query (no `where: { public: { _eq: true } }`); attach the token when signed in, omit it for anonymous, let Hasura's row permissions decide the rows (the role is part of the query key), and treat a `where` that re-implements a permission as authorization on the wrong side of the trust boundary.
  * every query's transformer is react-query's `select`, turning the API shape into the client model — the full rule (where it lives, that it's the client's source of truth, that it's tested on its own) is `mutation-data-flow` layer 1.
  * mutation input is the mirror image where `select` doesn't apply: action-specific payload builders shape it — also `mutation-data-flow`.
  * use the generated `graphql()` helper, never raw template strings, and run operations through `useRequest` / `useMutationRequest`.
  * never hand-edit codegen output — change the source operation or schema and re-run codegen.
  * schema and permissions live in `apps/hasura` (`hasura-architecture`), never in a frontend app or core.
  * the frontend shapes payloads and derives values for display only, never for enforcement; all authoritative validation and business rules live on the server, enforced by `hasura-architecture`.

* Steps
  1. Apply your migration to local Hasura first.
  2. Run codegen against that local Hasura, never Cloud, so types match the schema you're building and pick up no Cloud drift.
  3. Land the data-layer PR before the frontend PR that uses the new shape — the query only works once the schema is live.
     * why they ship as separate, ordered PRs: `dependency-analysis`
