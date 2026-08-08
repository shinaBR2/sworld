# Repository map — where code lives

The single home for the repo's shape and its top-level folder map. This is the
positive form of the "no hardcoded paths in a skill" rule: a skill
that needs to say *where* something lives points here instead of hardcoding the
path, because a path copied into several skills drifts.

## One repo, one lockfile, pnpm only

The whole product is **one repository** — every frontend app, the shared
packages, the Hono backend, and the Hasura data layer. There is one
`pnpm-lock.yaml` at the repo root; **pnpm is the only package manager — never
`npm`**, no per-app lockfile, no `npm ci`. `pnpm-workspace.yaml` at the root
defines the workspace and `turbo.json` drives the task graph.

## The map

| Path | What lives there | Owning skill |
|------|------------------|--------------|
| `apps/<app>/` | one folder per product app (the roster is `references/apps.md`) | — |
| `apps/backend/` | the Hono backend — services, Action/Event handlers, operator CLIs | `backend-architecture` (internals), `backend-ops` (ops) |
| `apps/hasura/` | the data layer — migrations + metadata (schema, permissions) | `architecture` / `hasura-architecture` |
| `packages/ui/` | **all** shared UI | `frontend-ui-architecture` |
| `packages/core/` | shared data — queries, mutations, hooks, transformers | `architecture` / `mutation-data-flow` |
| `packages/tsconfig/` | shared TypeScript config | — |
| `.claude/skills/`, `.claude/references/` | these skills and the references they point at | `skill-creator` |
| `.claude/worktrees/` | per-issue worktrees | `parallel-workflow` / `task-tracker` (naming) |

The paths above are the map. The *conventions* about what goes where inside a
package are each owned by a skill (listed): the `universal/` vs `<app>/` split
across `packages/ui` and `packages/core`, and the frontend data sub-paths
(`core/<domain>/query-hooks`, `mutation-hooks`), stay with their owning skill —
this reference only fixes the top-level homes.
