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

## Transformer pattern (MUST)

- ALWAYS have a transformer to convert server-side data into the format the frontend consumes.
- Transformers decouple the frontend from the API shape — when the API changes, only the transformer needs updating.
- Place transformers alongside their queries/mutations in `packages/core/src/<domain>/query-hooks` / `mutation-hooks`.

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
