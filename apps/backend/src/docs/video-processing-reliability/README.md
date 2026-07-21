# Epic: Video processing reliability (custom headers · monitoring · retry)

**Goal.** Make the backend process hotlink-protected video/subtitle sources in
prod (Cloud Run), surface failures in Slack, and retry a failed job by editing
one row — so the manual local CLI (`src/cli/`) becomes a fallback, not the only
option.

This folder is our "Linear" for this epic. Each sub-feature is a folder; each
micro-PR is one markdown file (a "ticket"). Pick any ticket whose **Blocked by**
is satisfied and ship it in one small PR.

**Status lives in the folder and file names** — `ls` the tree to see where
everything stands without opening a thing (see [Status](#status)).

---

## The problem (grounded in the current code)

| # | Problem | Where it lives today |
| - | ------- | -------------------- |
| 1 | Outbound fetches send **no custom headers** (no UA, no Referer) → 403 on hotlink-protected CDNs. | `fetchWithError` accepts `RequestInit` but callers pass nothing: `services/videos/helpers/m3u8/helpers.ts`, `services/videos/helpers/subtitle/index.ts`, `services/videos/helpers/file/index.ts`. |
| 2 | Failures are **invisible** — `TaskStatus.FAILED` is defined but never written, no `Sentry.init`, no Slack. The video just stays `processing`, `source: null`. | `database/models/task.ts` (enum only), `middleware/errorHandler/`. |
| 3 | **No ergonomic retry / trigger.** The `video_on_created` trigger has `enable_manual: true` + 3 retries, but a 403 is `shouldRetry: false`, and re-firing repeats the same headerless request. | `sworld-hasura-v2` metadata, `apps/gateway/videos/routes/stream-to-storage`. |

## The design (one `metadata` column carries both directions)

`videos.metadata jsonb` is **input and output**:

```jsonc
{
  // INPUT — retry hints the backend reads before fetching
  "customRequestHeaders": { "Referer": "https://phimnhua.online/" },
  // OUTPUT — failure record the backend writes on terminal error
  "lastError": { "code": "CLIENT_ERROR", "httpStatus": 403, "message": "...", "at": "2026-..." }
}
```

- **Headers:** every outbound fetch sends a **default browser User-Agent** always,
  merged with `metadata.customRequestHeaders`.
- **Monitoring:** on terminal failure write `status='failed'` + `metadata.lastError`,
  then a Hasura event on `status → failed` calls a Hono endpoint that posts to Slack.
- **Retry:** set `metadata.customRequestHeaders` and bump a dedicated **`retry_count`**
  column; an `update` event scoped to `retry_count` re-enqueues processing.

### The one trap: loop safety

`finishVideoProcess` writes `source/status/thumbnailUrl/duration/sId` back to the
row. So the retry trigger must fire on a column the backend **never** writes —
hence a dedicated **`retry_count`** (the "when"), separate from `metadata` (the
"what"). The update-event watches `retry_count` only.

---

## Breakdown

| ID | Title | Repo | Blocked by | Blocks | Est |
| -- | ----- | ---- | ---------- | ------ | --- |
| **F1** | Add `metadata` + `retry_count` columns | hasura | — | A1, B1, B2, C1 | S |
| **A0** | `buildRequestHeaders` util (default UA + merge) | backend | — | A2, A3, A4 | XS |
| **A1** | Parse `metadata` in shared video event schema | backend | F1 | A2, A3, A4 | S |
| **A2** | Thread headers through HLS path | backend | A0, A1 | Z1 | M |
| **A3** | Thread headers through subtitle path | backend | A0, A1 | Z1 | S |
| **A4** | Thread headers through convert (mp4) path | backend | A0, A1 | Z1 | M |
| **B1** | Write `status='failed'` + `metadata.lastError` on error | backend | F1 | B2, Z1 | S |
| **B2** | `status→failed` event + `/videos/notify-failure` endpoint | hasura + backend | F1, B3 | Z1 | M |
| **B3** | Slack client util | backend | — | B2 | XS |
| **C1** | `retry_count` update-event → re-enqueue | hasura | F1 | Z1 | S |
| **R1** | Segment/subtitle fetch resilience (retry + source-error handling) | backend | — (shares files w/ A2, A3) | Z1 | S |
| **Z1** | End-to-end verification | backend | A2, B1, B2, C1, R1 | — | S |

> **R1 added from field experience** (X-Files batches): a dropped segment crashed
> the whole job because source-stream errors aren't handled and there's no
> per-segment retry — the same flaws already fixed in `src/cli/stream-m3u8.ts`.
> R1 shares files with A2/A3, so fold it into those PRs or sequence right after.

## Status

**Status is encoded in the folder and file names — no need to open anything.**
`ls` the tree and you see where every wave and ticket stands.

- **Folder** = the wave's rollup status: `NN.<status>.<name>/`
  (e.g. `01.todo.custom-request-headers/`).
- **File** = the ticket's status: `<ID>.<status>.<name>.md`
  (e.g. `A0.todo.build-request-headers-util.md`).

Status tokens: `todo` → `wip` → `review` → `done` (plus `blocked`).

```bash
# every ticket's status, at a glance (no file reads):
find src/docs/video-processing-reliability -name '*.md' ! -name README.md
# wave rollups:
ls src/docs/video-processing-reliability
# what's left:
find src/docs/video-processing-reliability -name '*.todo.*.md'
```

**To change status, `git mv` the file's token** (e.g. `A0.todo.…` → `A0.wip.…` →
`A0.review.…` → `A0.done.…`). The **filename is the single source of truth** —
there is deliberately *no* `Status:` field inside the file to drift out of sync.
When every ticket in a folder reaches a state, bump the **folder** token to match
(it's the rollup). Drop the PR link into the ticket body when it goes to `review`.

## Dependency graph

```
F1 ──┬── A1 ──┬── A2 ─┐
     │        ├── A3 ─┤
     │        └── A4 ─┤
     ├── B1 ──────────┤
     ├── C1 ──────────┤
     └── B2 ──────────┤      A0 ──► A2,A3,A4      B3 ──► B2
                      └──► Z1
```

## Parallel wave plan

- **Wave 0 — start now, in parallel (no deps, disjoint files):** `F1` · `A0` · `B3`
- **Wave 1 — after F1:** `A1` · `B1` · `C1` · `B2` (B2 also needs B3)
- **Wave 2 — after A0 + A1, fully parallel (disjoint files):** `A2` · `A3` · `A4`
- **Wave 3:** `Z1`

## File-ownership map (proves parallel safety)

No two parallel tickets touch the same file.

| File / area | Owner |
| ----------- | ----- |
| `sworld-hasura-v2` migration + `videos` columns | F1 |
| `sworld-hasura-v2` `videos` `status→failed` event trigger | B2 |
| `sworld-hasura-v2` `videos` `retry_count` update event | C1 |
| `src/utils/http/buildRequestHeaders.ts` (new) | A0 |
| `src/schema/videos/convert/index.ts` (shared `videoDataSchema`) | A1 |
| `src/services/videos/helpers/m3u8/*`, `apps/io/videos/routes/stream-hls/*`, `schema/videos/stream-hls/*` | A2 |
| `src/services/videos/helpers/subtitle/*`, `apps/gateway/videos/routes/subtitle-created/*`, `schema/videos/subtitle-created/*` | A3 |
| `src/services/videos/helpers/file/*`, `helpers/thumbnail/*`, `services/videos/convert/handler.ts` | A4 |
| `src/services/hasura/mutations/videos/markFailed.ts` (new) + central error wrapper | B1 |
| `src/services/.../slack.ts` (new) | B3 |
| `apps/gateway/videos/routes/notify-failure/*` (new) + router registration | B2 |

> ⚠️ `src/schema/videos/convert/index.ts` (the shared `videoDataSchema`) is owned
> **solely by A1**. A2/A4 only *consume* the parsed `customRequestHeaders` in their
> own handlers/helpers and must **not** edit the schema — which is why they are
> sequenced strictly after A1 (a hard dependency), not parallel with it. With that
> sequencing, A2/A3/A4 touch disjoint files and are safe to run in parallel.

---

## Working conventions (same as Feasly)

- **One ticket = one micro-PR.** Smallest reviewable + revertible change.
- **Schema first.** F1 lands before anything that reads the columns.
- **Hasura changes are their own PRs** (F1, B2-trigger, C1).
- **No scope trimming** — ship a ticket's full scope or split it further first.
- **Mark progress** by renaming the ticket file's status token
  (`git mv …todo… …done…`) — the filename is the source of truth (see
  [Status](#status)); bump the folder token when the whole wave moves.
