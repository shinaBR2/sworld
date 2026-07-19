# AGENTS.md

Context for AI agents working in **sworld** — a personal Turborepo + pnpm monorepo of several web apps and shared packages. The how-to-code conventions live in `.claude/skills/` and trigger automatically by task; this file is the always-on context around them.

## Hard gate: plan before code — always

**You must NOT write a single line of code, propose implementation solutions, or suggest specific APIs/libraries until these steps are done:**

1. Load the `product-planning` skill and work through the concept with the user — interrogate motivation, constraints, and edge cases until shared understanding is reached
2. Create tracker subtask(s) via `writing-task-specs`
3. Get explicit user approval on the plan

Only after step 3 is complete may you write code. No proto, no scaffold, no "here's a quick implementation" — the plan comes first, always.

## Mandatory gates — never skip either loop

Two loops gate every change; neither is optional. Each is a skill that owns its own steps — this is the always-on reminder that they exist and are mandatory, not a restatement of them.

- **Loop A — Self-review, before creating a PR.** Never skip it. Owned by `parallel-workflow` (step 11).
- **Loop B — CI, after creating a PR and before merging.** Run the `ci-loop` skill and drive the PR to settled; never merge unless the user explicitly authorized it for that PR. Owned by `ci-loop`.

## How we work

You are part of this project and you own the code you ship. Be confident, be accountable, and be precise about what you're doing and why. The aim of everything below is one thing — the most confidence we can have in the product.

**First principles before code.** Don't write a line until the concept is genuinely clear. If the idea, the edge cases, or the downstream impact aren't thought through, that's a stop signal — not something to figure out as you go. Question assumptions, surface what's unclear, and stress-test the design before committing to it.

**Plan deeply, then ship fast.** Speed comes from the quality of the planning, not from cutting corners. Invest the time up front — think, iterate, pressure-test — then break the work into tracker issues and micro-PRs (see the `writing-task-specs`, `micro-prs`, and `parallel-workflow` skills). Deep planning is what makes fast, direct-to-main work safe.

**Default to less.** Before adding, ask whether you can delete or extend instead, and whether the platform already solves it — can an existing pattern, package, or tool do this for us? No cleverness for its own sake, no abstractions until there are 3+ real uses, no new dependencies without justification. Boring and proven beats clever; the most maintainable solution wins.

Every change should answer four questions:

1. Does it make the codebase simpler?
2. Does it help us ship faster?
3. Does it improve the user experience?
4. Can we delete code instead of adding it?

## The apps & packages

### Applications (`apps/`)

- **docs** — Docusaurus documentation site with technical guides and blog posts
- **game** — Phaser.js gaming platform with multiple games (Bobble Dungeon, Evil Minds)
- **listen** — Audio/music streaming application
- **main** — Main application with finance, journal, and library features
- **til** — "Today I Learned" blog/notes application
- **watch** — Video streaming/watching application

### Shared packages (`packages/`)

- **core** — Core business logic: GraphQL operations (`graphql()` + `useRequest`/`useMutationRequest`), Auth0, React Query, and error handling. Data hooks live under `packages/core/src/<domain>/{query-hooks,mutation-hooks}`.
- **ui** — UI component library using Material-UI and Emotion (+ Storybook)
- **tsconfig** — Shared TypeScript configurations
- **jest-dom-preset** — Jest testing presets

### Backend & data layer (sibling repos)

These live **outside** this pnpm workspace, as separate repos next to `sworld/`:

- **sworld-backend** — Hono backend handling Hasura Actions / Events (custom business logic triggered by Hasura).
- **sworld-hasura-v2** — Hasura GraphQL + Postgres: migrations, metadata, and permissions — the data layer the frontend queries.

When work spans the backend or schema, the change lands in those repos, not here.

## Tech Stack

- **Frontend:** React 18, TypeScript, Material-UI, Emotion, Vite, TanStack Router
- **Data:** GraphQL via Hasura, Auth0 for auth, React Query for server state
- **Backend:** Hono (Hasura Actions/Events) on the sibling `sworld-backend` repo
- **Testing:** Vitest, Playwright, Jest, Storybook
- **Build:** Turborepo, pnpm, tsup
- **Gaming:** Phaser.js, Matter.js physics
- **Package Manager:** pnpm (>=10.34.3) · **Node:** >=24

## Where knowledge lives

**Skills** (`.claude/skills/`) — task-triggered conventions. They fire automatically, but reach for them deliberately too:

- _Code:_ `code-conventions`, `react`, `mui`, `architecture`, `mutation-data-flow`, `error-handling`, `e2e-testing`, `design-principles`
- _Workflow:_ `parallel-workflow`, `ci-loop`, `cleanup`, `micro-prs`, `pr-descriptions`, `writing-task-specs`, `self-review`, `product-planning`, `plain-english`, `analyze`, `task-tracker`
- _Meta / quality:_ `grill-me`, `skill-creator`, `thermo-nuclear-code-quality-review`, `security-reviewer`, `supply-chain-security`
- _Architecture:_ `frontend-ui-architecture`, `hasura-architecture`, `backend-architecture`
- _Ops:_ `backend-ops`, `dev-environment-gotchas`

**Tasks & requirements** — the source of truth for work is the **task tracker**, and a **project is an app** (Til, Watch, Listen, Game, Docs, Main — Main covers the main app's finance, journal, and library areas): every issue belongs to one. Bugs and small features are single issues; a large feature is a **parent issue** (with sub-issues) inside the app's project, its description + a concept document holding the spec, with blocking relations encoding the dependency waves. The `task-tracker` skill owns *which* tracker this is and every command; `writing-task-specs` owns how to author the specs; `parallel-workflow` owns how an issue's state moves as work ships.

## Development Commands

```bash
pnpm install        # Install dependencies
pnpm dev            # Run all apps in development mode
pnpm dev:main       # Run a specific app + auto-reload its package deps (turbo watch)
pnpm dev:listen     # …also: dev:game, dev:watch, dev:til, dev:docs, dev:extension
pnpm build          # Build all packages and apps
pnpm test           # Run tests across all packages
pnpm lint           # Lint (Biome)
pnpm format         # Format (Biome)
```

App-specific `dev:*` commands use `turbo watch`, so changes in `packages/core` or `packages/ui` auto-rebuild and hot-reload the app — no manual restart needed.

Per-package:

```bash
cd packages/core && pnpm codegen   # Regenerate GraphQL types (also: pnpm watch-codegen)
cd packages/ui   && pnpm storybook # Component development
```

## Common Workflows

- **Before any work touching sworld-backend or sworld-hasura-v2** — load the `backend-architecture` skill. It documents the full service architecture, Cloud Task pipeline, task lifecycle, notification flow, and event vs action patterns. Do not reason about the backend without it.
- **Before designing a new mutation/Action, or reasoning about concurrent writes or data validation** — load the `hasura-architecture` skill. It covers the single-gateway rule, when a write needs a concurrency-safe database pattern, and the three validation layers.
- **Code exploration — always use CodeGraph first, not grep.** The CodeGraph index at the workspace root covers all three repos. Use `codegraph query` for structural questions (definitions, callers, impact). Use grep **only** for literal string/text searches, never for finding where a symbol is defined or used.
- **Adding a feature** — identify which app(s) change; decide where the code lives (`frontend-ui-architecture`); run the relevant `dev:*` command; make changes; run `pnpm lint` and `pnpm test` before committing.
- **Working with GraphQL** — update operations in `packages/core`, run `pnpm codegen`, use the generated types in apps.
- **Adding UI components** — all UI lives in `packages/ui` (placement per `frontend-ui-architecture`): create it there, export from `packages/ui/src/index.tsx`, build, then import in apps.

## Code style

The style law lives in the `code-conventions` skill, which auto-triggers on any TypeScript/TSX write or edit — the moment the rules apply.

## Key directories

```text
apps/<app>/src/         # per-app source (routes/, components/, config)
packages/core/src/      # graphql/, providers/ (auth, query), <domain>/{query-hooks,mutation-hooks}
packages/ui/src/        # shared MUI + Emotion components (+ Storybook)
```
