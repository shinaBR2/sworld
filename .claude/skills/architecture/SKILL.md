---
name: architecture
description: Enforces frontend architecture patterns including server state management, data transformation, and GraphQL conventions. Auto-triggers when working with API calls, data fetching, react-query, GraphQL, or data transformations.
user-invocable: false
---

# Architecture Rules

This skill covers the **data path** — how server data is fetched, transformed, and consumed. For **where** frontend code lives — which package and folder new code belongs in — see `frontend-ui-architecture`. Placement is that skill's job; data flow is this one's. The structural anatomy and the deploy model are facts, not decisions, so they live in references (`references/architecture.md`, `references/deployment-model.md`); this skill points at them rather than restating them.

## Server state management

- Server state MUST always be managed by **react-query** (TanStack Query).
- NEVER store server data in local state (`useState`) or a client store — use `useQuery` / `useMutation`.
- Client state stores are only for client-side UI state (modals, selections, sidebar open/closed, etc.).

## One page = one query = one transformer (MUST)

This is the most fundamental data-fetching rule in this codebase. Hasura exposes a **single** GraphQL endpoint where any number of root fields compose into one request — use that.

- **Exactly one query per page.** A page fires **one** Hasura request that returns **everything that page needs — no more, no less**. Never two hooks side by side on the same page (e.g. `useLoadAudios` + `useLoadPlaylists`); collapse their root fields (`audios`, `tags`, `playlist`, …) into a single query for that page.
- **Each page owns its query.** Two pages needing "playlists" do **not** each fetch through a shared page-level query built for the *other* page — each page owns the one query that selects exactly what it renders. Reuse happens at the **fragment** level (a shared fragments module in the domain's query-hooks), never by pointing one page at another page's query. Shared fields → shared fragment; per-page selection → per-page query.
- **One transformer per query.** Each query owns its own transformer (via react-query `select` / the `useRequest` result), shaping that page's response into exactly the client model that page consumes. Do not reuse one transformer across queries.
- **Filter by role on Hasura, not in the query.** Do **not** encode authorization in the frontend query (e.g. `audios(where: { public: { _eq: true } })` for anonymous visitors). Write **one role-agnostic query** and vary only the token — attach it when signed in, omit it for anonymous so Hasura runs the `anonymous` role. Hasura's row permissions decide the rows each role may see; the query key includes the role so views never share a cache entry. A `where` that re-implements a permission is duplicated, drift-prone authorization living on the wrong side of the trust boundary (see *NEVER trust the frontend* below). A role-agnostic query is therefore the correct building block, not a smell — a single such query can legitimately back both the signed-in and anonymous rendering of the same page.

**Why:** the transformer is the single gate between server and client. One page → one query → one transformer means one place to look, one request on the wire, and one boundary to keep the frontend working regardless of what the backend does. Building a page around a query shaped for a *different* page couples them to one server shape and breaks this guarantee.

**Before adding a new query or hook, read the existing query's fragments first.** Hasura nested relationships often already return what you need — e.g. a video-listing query that embeds a viewer's watch-history relationship already has everything a "continue watching" derived view needs; that's a client-side filter/sort on the existing result, not a second fetch. Only add a query when the field is genuinely absent from the page's current selection.

## Transformer pattern (MUST)

- ALWAYS have a transformer to convert server-side data into the format the frontend consumes.
- Transformers decouple the frontend from the API shape — when the API changes, only the transformer needs updating. The frontend must keep working regardless of the backend — the transformer is that gate.
- Place each transformer alongside its query/mutation in the domain's query-hooks / mutation-hooks (the package homes are `references/repo-map.md`). Each query has its **own** transformer — never share one across queries.

```ts
// A transformer converts the API response to the frontend model,
// and the query uses it in react-query's `select`:
function transformProject(raw: ProjectApiResponse): Project {
  return {
    id: raw.id,
    name: raw.project_name,
    status: raw.is_active ? 'active' : 'inactive',
    createdAt: new Date(raw.created_at),
  };
}

export function useProjectQuery(id: string) {
  return useQuery({ queryKey: ['project', id], queryFn: () => fetchProject(id), select: transformProject });
}
```

## GraphQL conventions

- ALWAYS use the generated `graphql()` helper for GraphQL queries and mutations — never raw template literal strings. Operations are fed through `useRequest` / `useMutationRequest`.
- NEVER manually edit generated GraphQL output — the typed `graphql()` client and the introspected `schema.graphql` are owned by codegen. Change the source operation or the schema and re-run codegen; never hand-edit what it produces.
- All database operations go through Hasura. The backend only handles Hasura Actions/Events (`backend-architecture`).

## Data layer: schema changes and codegen

Schema and permission changes live in **`apps/hasura`** (migrations + metadata), never in a frontend app or the shared core package.

- **ALWAYS run codegen against LOCAL Hasura, never against Cloud.** Local is the only environment where you control exactly which migrations/metadata are applied — apply your schema change locally first, then codegen introspects it. This keeps generated types in sync with the schema you're building against and avoids picking up unrelated Cloud drift. (The codegen command and where it runs are `parallel-workflow`'s.)
- **Sequence the merges.** A frontend query/mutation on a new table/column only works at runtime once the schema change is merged and live (merge = deploy — `references/deployment-model.md`). Land the data-layer PR before any frontend PR that reads/writes the new shape goes live. Now that both live in one repo, nothing *stops* you committing them together — the runtime ordering is the reason not to; splitting them is `micro-prs`' rule.

## First principle: NEVER trust the frontend

- All validation, calculations, and business logic belong on the server.
- The frontend is a display and input layer only.
