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

**Before adding a new query or hook, read the existing query's fragments first.** Hasura nested relationships often already return what you need — e.g. a video-listing query that embeds `user_video_histories { last_watched_at, progress_seconds }` already has everything a "continue watching" derived view needs; that's a client-side filter/sort on the existing result, not a second fetch. Only add a query when the field is genuinely absent from the page's current selection.

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

## Data layer: schema changes, codegen, and deploy

Schema and permission changes live in the sibling **`sworld-hasura-v2`** repo (migrations + metadata), never here.

- **Merging a `sworld-hasura-v2` PR auto-deploys to Hasura Cloud (prod).** This happens through Hasura Cloud's GitHub integration, **not** a GitHub Actions workflow — there is no deploy job in `.github/workflows` (only lint), so it's easy to assume merging is inert. It isn't: **merging a Hasura PR applies the migration + metadata to production.**
- **ALWAYS run `pnpm codegen` against LOCAL Hasura** (`localhost:8030`), never against Cloud. Local is the only environment where you control exactly which migrations/metadata are applied — apply your schema change locally first (`hasura migrate apply` / `hasura metadata apply`), then codegen introspects it. This keeps generated types in sync with the schema you're building against and avoids picking up unrelated Cloud drift.
- **Sequence merges across repos.** A frontend query/mutation on a new table/column only works at runtime once the Hasura PR is merged (→ auto-deployed to prod). Land the data-layer PR (and let it deploy) before any frontend PR that reads/writes the new shape goes live.

**Frontend deploy targets aren't uniform across apps.** The `main` app's real production domain (`shinabr2.com`) is served by **Cloudflare Pages**, with its own build pipeline and env vars configured in the Cloudflare dashboard (not this repo). The GitHub Actions "Deploy Live Main Frontend" workflow deploys to a separate Firebase target (`sworld-prod.web.app`) that is **not** treated as prod. The two can serve different bundles. When told the main app is broken "on prod," check `shinabr2.com`, not the Firebase URL — and compare `assets/*.js` hashes before reasoning about what's actually deployed where. Other apps (listen, watch, til, docs, game) deploy via Firebase Hosting preview channels per PR (see `parallel-workflow`'s CI loop for the known quota-429 failure mode).

## First principle: NEVER trust the frontend

- All validation, calculations, and business logic belong on the server.
- The frontend is a display and input layer only.
