---
name: architecture
description: Enforces frontend architecture patterns including server state management, data transformation, and GraphQL conventions. Auto-triggers when working with API calls, data fetching, react-query, GraphQL, or data transformations.
user-invocable: false
---

# Architecture Rules

## Server state management

- Server state MUST always be managed by **react-query** (TanStack Query).
- NEVER store server data in local state (`useState`) or a client store — use `useQuery` / `useMutation`.
- Client state stores are only for client-side UI state (modals, selections, sidebar open/closed, etc.).

## One page = one query = one transformer (MUST)

This is the most fundamental data-fetching rule in this codebase. Hasura exposes a **single** GraphQL endpoint where any number of root fields compose into one request — use that.

- **Exactly one query per page.** A page fires **one** Hasura request that returns **everything that page needs — no more, no less**. Never two hooks side by side on the same page (e.g. `useLoadAudios` + `useLoadPlaylists`); collapse their root fields (`audios`, `tags`, `playlist`, …) into a single query for that page.
- **Each page owns its query.** Two pages needing "playlists" do **not** each fetch through a shared page-level query built for the *other* page — each page owns the one query that selects exactly what it renders. Reuse happens at the **fragment** level (`packages/core/src/<domain>/query-hooks/fragments.ts`), never by pointing one page at another page's query. Shared fields → shared fragment; per-page selection → per-page query.
- **One transformer per query.** Each query owns its own transformer (via react-query `select` / the `useRequest` result), shaping that page's response into exactly the client model that page consumes. Do not reuse one transformer across queries.
- **Filter by role on Hasura, not in the query.** Do **not** encode authorization in the frontend query (e.g. `audios(where: { public: { _eq: true } })` for anonymous visitors). Write **one role-agnostic query** and vary only the token — attach it when signed in, omit it for anonymous so Hasura runs the `anonymous` role. Hasura's row permissions decide the rows each role may see; the query key includes the role so views never share a cache entry. A `where` that re-implements a permission is duplicated, drift-prone authorization living on the wrong side of the trust boundary (see *NEVER trust the frontend* below). A role-agnostic query is therefore the correct building block, not a smell — a single such query can legitimately back both the signed-in and anonymous rendering of the same page.

**Why:** the transformer is the single gate between server and client. One page → one query → one transformer means one place to look, one request on the wire, and one boundary to keep the frontend working regardless of what the backend does. Building a page around a query shaped for a *different* page couples them to one server shape and breaks this guarantee.

## Transformer pattern (MUST)

- ALWAYS have a transformer to convert server-side data into the format the frontend consumes.
- Transformers decouple the frontend from the API shape — when the API changes, only the transformer needs updating. The frontend must keep working regardless of the backend — the transformer is that gate.
- Place transformers alongside their queries/mutations in `packages/core/src/<domain>/query-hooks` / `mutation-hooks`. Each query has its **own** transformer — never share one across queries.

```ts
// Example: packages/core/src/<domain>/query-hooks/useProjectQuery.ts

// Transformer — converts API response to frontend model
function transformProject(raw: ProjectApiResponse): Project {
  return {
    id: raw.id,
    name: raw.project_name,
    status: raw.is_active ? 'active' : 'inactive',
    createdAt: new Date(raw.created_at),
  };
}

// Query — uses transformer in select
export function useProjectQuery(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProject(id),
    select: transformProject,
  });
}
```

## GraphQL conventions

- ALWAYS use the generated `graphql()` helper for GraphQL queries and mutations — never raw template literal strings. Operations are fed through `useRequest` / `useMutationRequest`.
- NEVER manually edit generated files (`generated/graphql.ts`, `generated/gql.ts`, `schema.graphql`) — always run `pnpm codegen` (in `packages/core`).
- All database operations go through Hasura. The backend (the separate `sworld-backend` repo) only handles Hasura Actions/Events.

## First principle: NEVER trust the frontend

- All validation, calculations, and business logic belong on the server.
- The frontend is a display and input layer only.
