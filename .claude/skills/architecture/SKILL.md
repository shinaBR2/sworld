---
name: architecture
description: Enforces frontend architecture patterns including server state management, data transformation, and GraphQL conventions. Auto-triggers when working with API calls, data fetching, react-query, GraphQL, or data transformations.
user-invocable: false
---

# Architecture Rules

The **data path** — how server data is fetched, transformed, and consumed.
Placement (which package/folder) is `frontend-ui-architecture`; the structural
anatomy is a fact in `.claude/references/architecture.md`.

## Server state

Server state is **react-query** (TanStack Query), always — `useQuery` /
`useMutation`, never `useState` or a client store. Client stores hold UI state
only (modals, selections, sidebar open/closed).

## One page = one query = one transformer

The core data-fetching rule. Hasura is a single GraphQL endpoint, so any page's
fields compose into one request.

- **One query per page** — one request returning exactly what the page needs,
  no more. Never two hooks side by side; collapse their root fields into one.
- **Each page owns its query** — never point a page at another page's query.
  Reuse at the **fragment** level, not the query level. Before adding a query,
  check the existing one's fragments — a nested relationship often already
  returns what you need, so a derived view is a client-side filter, not a
  second fetch.
- **One transformer per query** — never shared across queries.
- **Role-agnostic query, vary the token** — never encode authorization in the
  query (no `where: { public: { _eq: true } }`). Write one query; attach the
  token when signed in, omit it for anonymous. Hasura's row permissions decide
  the rows, and the role is part of the query key. A `where` that re-implements
  a permission is authorization on the wrong side of the trust boundary.

## Transformers

Every query's transformer is react-query's `select`, turning the API shape into
the client model. The full rule — where it lives, that it's the client's source
of truth, that it's tested on its own — is `mutation-data-flow` layer 1. Mutation
*input* is the mirror image (`select` doesn't apply): action-specific payload
builders shape it, also `mutation-data-flow`.

## GraphQL

- Use the generated `graphql()` helper, never raw template strings; operations
  run through `useRequest` / `useMutationRequest`.
- Never hand-edit codegen output — change the source operation or schema and
  re-run codegen.

## Schema changes and codegen

Schema + permissions live in `apps/hasura` (`hasura-architecture`), never in a
frontend app or core.

- **Run codegen against LOCAL Hasura, never Cloud** — apply your migration
  locally, then codegen introspects it, so types match the schema you're
  building and pick up no Cloud drift.
- **The data-layer PR lands before the frontend PR that uses the new shape** —
  the query only works once the schema is live; `dependency-analysis` owns why
  the two ship as separate, ordered PRs.

## Never trust the frontend

The frontend shapes payloads and derives values for display only, never for
enforcement. All authoritative validation and business rules live on the server;
what enforces this is `hasura-architecture`.
