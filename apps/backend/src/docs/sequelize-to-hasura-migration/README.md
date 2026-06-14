# Epic: Migrate backend off Sequelize → Hasura

**Goal.** Remove the last direct-to-Postgres data path from the backend. The
architecture says **Hasura is the data layer** (see the repo README), but a
pocket of code still talks to Postgres via **Sequelize**. Replace every
Sequelize read/write with a Hasura GraphQL operation, then delete `src/database/`
and drop the `sequelize` / `pg` / `pg-hstore` dependencies.

This folder is our "Linear" for this epic. Each sub-feature is a folder; each
micro-PR is one markdown file (a "ticket"). Pick any ticket whose **Blocked by**
is satisfied and ship it in one small PR.

**Status lives in the folder and file names** — `ls` the tree to see where
everything stands without opening a thing (see [Status](#status)).

---

## The problem (grounded in the current code)

Two data paths coexist. Hasura (`graphql-request` + `src/services/hasura/`) is
the correct one and is already used everywhere else (posts, share-videos, auth,
video bulk-insert / finalize / subtitle). Sequelize is the holdout.

| # | What | Where it lives today |
| - | ---- | -------------------- |
| 1 | Sequelize connection (`new Sequelize`, `authenticate()`, `sync()`). **`initialize()` is never called** — Sequelize connects lazily on first model use. | `src/database/index.ts` |
| 2 | Sequelize models for `videos` + `tasks`. | `src/database/models/video.ts`, `task.ts` |
| 3 | Query helpers: `getVideoById`, `getVideoMissingDuration`, `getVideoMissingThumbnail`, `updateVideoDuration`, `updateVideoThumbnail`. | `src/database/queries/videos.ts` |
| 4 | Query helpers: `createTask` (`findOrCreate`), `updateTaskStatus`, `completeTask`. | `src/database/queries/tasks.ts` |
| 5 | Six call sites consuming the above (see [Consumer map](#consumer-map)). | `utils/cloud-task.ts`, two `io/videos/routes/fix-*`, two `gateway/videos/routes/fix-videos-*`, `io/crawler/routes/crawl`. |
| 6 | `sequelize`, `pg`, `pg-hstore` dependencies. | `package.json` |

## The design (everything is already expressible in Hasura)

The existing Hasura schema already exposes every operation we need — **no Hasura
migration or metadata change is required**:

- **Reads** → `videos_by_pk` (getById) and `videos(where:)` (the two "missing"
  finders).
- **Writes** → `update_videos_by_pk` (duration / thumbnail), `update_tasks`
  (status / complete).
- **Upsert** (replaces Sequelize `findOrCreate`) → `insert_tasks_one` with
  `on_conflict: { constraint: tasks_task_id_key, update_columns: [] }`,
  `returning { id completed }`. On conflict it returns the existing row
  (including `completed`), preserving `cloud-task`'s early-return check.
- **Atomicity** → the current code wraps related writes in a Sequelize
  transaction. Replace each transaction with a **single combined mutation**
  (one document, multiple roots) — exactly the pattern already in
  `mutations/videos/finalize.ts` (task update + video update + notification in
  one request). Never split a former transaction into sequential Hasura calls.

### The one trap: the lost transaction in `cloud-task`

`createCloudTasks` today runs `createTask` → (external **GCP** `createTask`) →
`updateTaskStatus` inside one Sequelize transaction. The middle step is an
external side-effect that a DB transaction can't roll back anyway, so the
transaction was never fully sound. After migration there is no transaction across
the GCP call — but `createTask` is **idempotent** (the row is keyed by a `uuidv5`
of `entityType+entityId+type` and upserted via `on_conflict`), so a retried run
finds the existing `PENDING`/`completed` task and proceeds safely. This is the
intended behaviour; M1 documents it.

---

## Breakdown

| ID | Title | Repo | Blocked by | Blocks | Est |
| -- | ----- | ---- | ---------- | ------ | --- |
| **H1** | Add Hasura ops replacing all Sequelize queries (+ codegen) | backend | — | M1–M6 | M |
| **M1** | Migrate `cloud-task` to Hasura task ops (drop transaction) | backend | H1 | D1 | S |
| **M2** | Migrate `fix-duration` handler (combined mutation) | backend | H1 | D1 | S |
| **M3** | Migrate `fix-thumbnail` handler (combined mutation) | backend | H1 | D1 | S |
| **M4** | Migrate `crawler/crawl` to Hasura `completeTask` | backend | H1 | D1 | XS |
| **M5** | Migrate `fix-videos-duration` gateway route | backend | H1 | D1 | XS |
| **M6** | Migrate `fix-videos-thumbnail` gateway route | backend | H1 | D1 | XS |
| **M7** | Migrate `gateway/videos/routes/crawl` (task enums) | backend | H1 | D1 | XS |
| **M8** | Migrate `gateway/videos/routes/stream-to-storage` (task enums) | backend | H1 | D1 | XS |
| **M9** | Migrate `compute/videos/routes/convert` test (`completeTask`) | backend | H1 | D1 | XS |
| **D1** | Delete `src/database/` + drop `sequelize`/`pg`/`pg-hstore` | backend | M1–M9 | — | S |

> **M7–M9 added after the fact.** The original consumer map (below) only listed
> the call sites found when the epic was scoped. During the D1 readiness check we
> found three more files still importing from `src/database` — two that only use
> the task enums (`gateway/crawl`, `stream-to-storage`) and one test (`convert`)
> that mocks `completeTask`. Some arrived via the parallel reliability work. They
> are the same trivial import swaps as M4–M6 and must land before D1.

> **Why one foundation PR (H1) instead of several.** Adding a GraphQL operation
> regenerates the shared `src/services/hasura/generated-graphql/*` files. If two
> PRs each added operations, they'd guarantee a conflict there. Keeping **all**
> new operations + the single `pnpm codegen` run in H1 makes every migration PR
> (M1–M6) pure re-wiring — no new ops, no codegen — so they touch only their own
> handler file and are genuinely parallel-safe.

## Consumer map

| Sequelize helper | Call site | Migration ticket |
| ---------------- | --------- | ---------------- |
| `getVideoById`, `updateVideoDuration` | `apps/io/videos/routes/fix-duration/index.ts` | M2 |
| `getVideoById`, `updateVideoThumbnail` | `apps/io/videos/routes/fix-thumbnail/index.ts` | M3 |
| `getVideoMissingDuration` | `apps/gateway/videos/routes/fix-videos-duration/index.ts` | M5 |
| `getVideoMissingThumbnail` | `apps/gateway/videos/routes/fix-videos-thumbnail/index.ts` | M6 |
| `createTask`, `updateTaskStatus` | `utils/cloud-task.ts` | M1 |
| `completeTask` | `apps/io/crawler/routes/crawl/index.ts` | M4 |
| `completeTask` (folded into combined mutation) | the two `fix-*` handlers | M2, M3 |
| `TaskEntityType`, `TaskType` (enums) | `apps/gateway/videos/routes/crawl/index.ts` | M7 |
| `TaskEntityType`, `TaskType` (enums) | `apps/gateway/videos/routes/stream-to-storage/index.ts` | M8 |
| `completeTask` (test mock only) | `apps/compute/videos/routes/convert/index.test.ts` | M9 |

## Status

**Status is encoded in the folder and file names — no need to open anything.**
`ls` the tree and you see where every wave and ticket stands.

- **Folder** = the wave's rollup status: `NN.<status>.<name>/`.
- **File** = the ticket's status: `<ID>.<status>.<name>.md`.

Status tokens: `todo` → `wip` → `review` → `done` (plus `blocked`).

```bash
# every ticket's status, at a glance (no file reads):
find src/docs/sequelize-to-hasura-migration -name '*.md' ! -name README.md
# wave rollups:
ls src/docs/sequelize-to-hasura-migration
# what's left:
find src/docs/sequelize-to-hasura-migration -name '*.todo.*.md'
```

**To change status, `git mv` the file's token** (`H1.todo.…` → `H1.wip.…` →
`H1.review.…` → `H1.done.…`). The **filename is the single source of truth** —
there is deliberately *no* `Status:` field inside the file to drift out of sync.
When every ticket in a folder reaches a state, bump the **folder** token to
match. Drop the PR link into the ticket body when it goes to `review`.

## Dependency graph

```
                ┌── M1 (cloud-task)          ┐
                ├── M2 (fix-duration)        │
H1 (Hasura ops) ┼── M3 (fix-thumbnail)       ┼──► D1 (teardown)
                ├── M4 (crawler)             │
                ├── M5 (fix-videos-duration) │
                └── M6 (fix-videos-thumbnail)┘
```

## Parallel wave plan

- **Wave 0 — foundation (alone; owns all codegen):** `H1`
- **Wave 1 — after H1, fully parallel (disjoint handler files):**
  `M1` · `M2` · `M3` · `M4` · `M5` · `M6`
- **Wave 2 — after all of M1–M6:** `D1`

## File-ownership map (proves parallel safety)

No two parallel tickets touch the same file.

| File / area | Owner |
| ----------- | ----- |
| `src/services/hasura/queries/videos/index.ts` (new) | H1 |
| `src/services/hasura/mutations/videos/fixDuration.ts` (new, combined) | H1 |
| `src/services/hasura/mutations/videos/fixThumbnail.ts` (new, combined) | H1 |
| `src/services/hasura/mutations/tasks/index.ts` (new) | H1 |
| `src/services/hasura/generated-graphql/*` (regenerated) | H1 |
| `src/utils/cloud-task.ts` (+ test) | M1 |
| `src/apps/io/videos/routes/fix-duration/index.ts` (+ test) | M2 |
| `src/apps/io/videos/routes/fix-thumbnail/index.ts` (+ test) | M3 |
| `src/apps/io/crawler/routes/crawl/index.ts` (+ test) | M4 |
| `src/apps/gateway/videos/routes/fix-videos-duration/index.ts` (+ test) | M5 |
| `src/apps/gateway/videos/routes/fix-videos-thumbnail/index.ts` (+ test) | M6 |
| `src/database/**` (deleted), `package.json` deps | D1 |

> ⚠️ All new GraphQL operations and the `pnpm codegen` regeneration are owned
> **solely by H1**. M1–M6 only *import* the generated ops — they must **not**
> add operations or run codegen, which is what keeps them parallel-safe.

---

## Working conventions (same as the rest of the repo)

- **One ticket = one micro-PR.** Smallest reviewable + revertible change.
- **Foundation first.** H1 lands before any call-site migration.
- **No scope trimming** — ship a ticket's full scope or split it further first.
- **No new sequential Hasura calls** — replace a Sequelize transaction with one
  combined mutation, never two requests.
- **Mark progress** by renaming the ticket file's status token
  (`git mv …todo… …done…`) — the filename is the source of truth
  (see [Status](#status)); bump the folder token when the whole wave moves.
