---
name: backend-architecture
description: The sworld backend architecture — four services (gateway, io, compute, hasura), the Hasura Event → Cloud Task → handler pipeline, task lifecycle, notification flow, and when to use Cloud Tasks vs direct actions. Auto-triggers when working in sworld-backend, planning backend features, touching Hasura Actions/Events, creating Cloud Task handlers, or designing any server-side video/audio processing flow.
user-invocable: false
---

# Backend Architecture

The backend is a single TypeScript codebase (`sworld-backend`) deployed as **four services** that share source but run different entry points. Three are custom Hono servers; the fourth is Hasura GraphQL Engine.

## The four services

| Service | Entry | Dockerfile | Role |
|---------|-------|------------|------|
| **gateway** | `src/gateway.ts` | `Dockerfile.gateway` | Receives Hasura Events/Actions, validates webhook signatures, routes to Cloud Tasks. Also handles direct synchronous Actions (set-thumbnail, auth, storage upload URLs). |
| **io** | `src/io.ts` | `Dockerfile.io` | Light I/O operations: byte-copy HLS streaming, platform imports, Playwright crawling. Includes Playwright + Chromium for crawlers. |
| **compute** | `src/compute.ts` | `Dockerfile.compute` | CPU-heavy ffmpeg work: video conversion (re-encode to fMP4 HLS). Same Docker image as gateway but different entry. |
| **hasura** | — | `sworld-hasura-v2/` | Hasura GraphQL Engine + Postgres. Owns the schema, permissions, event triggers, and action definitions. |

Gateway, io, and compute are deployed as separate Cloud Run services. They share a single codebase (`sworld-backend`) but each has its own entry point (different `CMD` in Dockerfile).

## The full pipeline: Hasura Event → video processing

Video ingestion flows through every service:

```
1. Hasura Event trigger fires (on videos row INSERT)
       ↓  POST to gateway webhook with Hasura signature
2. Gateway validates signature + schema, determines file type
       ↓  Creates GCP Cloud Task → io (HLS/import) or compute (convert)
3. io/compute handler processes the video
       ↓  finishVideoProcess() updates Hasura
4. Video row finalized + task completed + notification inserted
       ↓  Hasura subscription pushes to frontend
5. User sees "video ready" notification in real-time
```

### Step 2 detail: Gateway routing (`stream-to-storage`)

The gateway's `POST /videos/convert` handler (`src/apps/gateway/videos/routes/stream-to-storage/index.ts:33`) routes by file type:

| File type | Target service | Handler path | Queue |
|-----------|---------------|--------------|-------|
| `hls` (m3u8 URL) | io | `/videos/stream-hls-handler` | `stream-video` |
| `video` (mp4/mov/etc.) | compute | `/videos/convert-handler` | `convert-video` |
| Platform (YouTube/etc.) | io | `/videos/import-platform-handler` | `stream-video` |

Queues are defined in `src/utils/systemConfig.ts:9`. Service URLs come from env vars: `IO_SERVICE_URL` and `COMPUTE_SERVICE_URL`.

## Cloud Task mechanics

### Task creation (`src/utils/cloud-task.ts:62`)

1. Generate a deterministic task ID via `uuidv5(entityType + entityId + type, namespace)` — same inputs always produce the same task ID
2. **Insert/upsert** a row in the `tasks` table (`status: 'pending'`, `completed: false`) — if the same task already exists with `completed: true`, the function returns `null` (short-circuits, no re-enqueue)
3. Create the GCP Cloud Task with:
   - `httpRequest.url`: the target handler URL (io or compute)
   - `httpRequest.oidcToken`: service account + audience — GCP delivers the task with an OIDC token that authenticates to the target service
   - `httpRequest.headers['X-Task-ID']`: the task ID — the handler uses this to track completion
   - `dispatchDeadline: 1800s` (30 minutes)
4. Update task status to `in_progress`

### Task auth

The Cloud Task carries an OIDC token scoped to the target service URL (`audience`). GCP's task queue guarantees authenticity. The target io/compute handler needs no additional auth middleware — it trusts that only GCP Cloud Tasks can deliver requests to it. The handler just reads `X-Task-ID` from the header.

### Task lifecycle

```
pending (created in DB)
  → in_progress (GCP task created)
    → completed (finishVideoProcess on success)
    → (stays in_progress on permanent failure — withVideoFailureReport ACKs with 2xx so Cloud Tasks stops retrying; task row is never marked 'failed')
```

**`withVideoFailureReport`** (`src/middleware/reportVideoFailure/index.ts:57`):
- Applied ONLY to video-processing handlers (convert, stream-hls, import-platform)
- On terminal (non-retryable) error: calls `markVideoFailed` (updates video `status → 'failed'`, fires Slack alert), then returns 2xx to Cloud Tasks so it stops retrying
- On retryable error: re-throws (→ 5xx) so Cloud Tasks retries
- Do NOT apply to `fix-duration`/`fix-thumbnail` handlers — those run on already-`ready` videos

### Idempotency

The deterministic `task_id` (uuidv5) ensures the same logical task is never enqueued twice. If the task record already exists with `completed: true`, `createCloudTasks` returns `null` and no GCP task is created.

## Notification flow

### How users get notified

1. `finishVideoProcess` (`src/services/hasura/mutations/videos/finalize.ts:36`) runs a single Hasura mutation that atomically:
   - Updates the `tasks` row: `status → 'completed'`
   - Inserts a `notifications` row: `{ type: 'video-ready', entityId, entityType: 'video', user_id }`
   - Updates the `videos` row: `{ source, status: 'ready', thumbnailUrl, duration, sId }`

2. The `notifications` table has **subscription permissions** for the `user` role (`select` on subscription root, filtered `user_id = X-Hasura-User-Id`). See `sworld-hasura-v2/metadata/.../public_notifications.yaml:53`.

3. The frontend creates a Hasura **GraphQL subscription** on `notifications(where: { read_at: { _is_null: true } })`. When a new notification arrives, the UI shows it to the user (e.g. "Your video is ready").

4. `notifications` has a manual relationship to `videos` on `entity_id = id`, so frontend can subscribe with joined video data.

### The sId

`finishVideoProcess` generates a short ID (`nanoid(11)`) stored as `videos.sId`. This is used for short sharable URLs — separate from the UUID `id`.

## When to use Cloud Tasks vs direct handling

| Approach | When | Max duration | Example |
|----------|------|-------------|---------|
| **Cloud Task** | CPU-heavy work (ffmpeg encode/remux), long I/O (streaming many segments) | Up to 30min (`dispatchDeadline`) | convert, stream-hls, repair-fmp4 |
| **Direct synchronous Action** | Fast work that completes under 30s | 30s (Hasura Action timeout) | set-thumbnail (fallback), createSignedUploadUrl |
| **Direct mutation (frontend)** | Work the browser can do itself | Instant | Upload thumbnail frame captured from video element |

**The rule:** any ffmpeg work or multi-segment I/O MUST go through Cloud Tasks. Hasura Actions have a 30-second timeout, and Cloud Run cold starts alone can consume most of that. The `set-thumbnail` action is a documented fallback path — the primary thumbnail path is now a direct client-side capture + upload.

## Events vs Actions

| | Hasura Event | Hasura Action |
|---|---|---|
| **Trigger** | Automatic (on INSERT/UPDATE/DELETE) | User-initiated via GraphQL mutation |
| **Response** | None (fire-and-forget to webhook) | Must return a response to Hasura within 30s |
| **Auth** | `x-hasura-admin-secret` + webhook signature | Session user (`x-hasura-user-id`) |
| **Gateway handling** | `videosRouter` (validates webhook signature) | `videoActionsRouter` (validates user session) |
| **Examples** | convert, stream-hls, import-platform, notify-failure | setVideoThumbnailAtTime, createSignedUploadUrl |

For a new **user-initiated** heavy operation (like video repair):
1. Define a Hasura **Action** (returns a `task_id` to the frontend)
2. Action handler on **gateway** creates a Cloud Task (same pattern as `stream-to-storage`)
3. Cloud Task delivers to **compute** for the actual work
4. compute handler calls `finishVideoProcess` → notification → user gets notified

## Processing core architecture (ports & adapters)

The video processing logic follows a **ports & adapters** pattern (`src/services/videos/processing/types.ts:40`):

- **Core engines** (`processStream`, `repackageToFmp4`) are env-agnostic — all I/O goes through injected `deps` (StoragePort, HttpPort, ThumbnailPort, LoggerPort, RepackagePort)
- **Adapters** wire these ports to real implementations:
  - CLI adapter: GCS via service account key on disk, `fetch` with Referer headers
  - io/compute adapter: GCS via ADC (Application Default Credentials on Cloud Run), `fetchWithError`
- This makes the core unit-testable with mocks and reusable across CLI + server

## Adding a new video processing handler

The pattern for adding a new handler to the compute service:

1. **Schema** (`src/schema/videos/<feature>/`): zod schema for the Cloud Task payload + handler headers
2. **Handler** (`src/apps/compute/videos/routes/<feature>/`): business logic using existing core engines
3. **Router** (`src/apps/compute/videos/index.ts`): register `POST /<feature>-handler` with `withVideoFailureReport`
4. **Gateway route** (if user-initiated Action): schema + handler on `videoActionsRouter` that creates a Cloud Task → compute
5. **Hasura metadata** (`sworld-hasura-v2/metadata/actions.yaml`): define the Action + custom types

## Key files reference

| What | Path |
|------|------|
| Gateway entry | `src/gateway.ts` |
| io entry | `src/io.ts` |
| compute entry | `src/compute.ts` |
| Gateway video events router | `src/apps/gateway/videos/index.ts` |
| Gateway video actions router | `src/apps/gateway/videos-actions/index.ts` |
| Event → Cloud Task routing | `src/apps/gateway/videos/routes/stream-to-storage/index.ts` |
| Cloud Task creation | `src/utils/cloud-task.ts` |
| Task DB mutations | `src/services/hasura/mutations/tasks/index.ts` |
| Task enums | `src/services/hasura/mutations/tasks/constants.ts` |
| finishVideoProcess | `src/services/hasura/mutations/videos/finalize.ts` |
| markVideoFailed | `src/services/hasura/mutations/videos/markFailed.ts` |
| withVideoFailureReport | `src/middleware/reportVideoFailure/index.ts` |
| Queue config | `src/utils/systemConfig.ts` |
| Env config (service URLs) | `src/utils/envConfig.ts` |
| Compute videos router | `src/apps/compute/videos/index.ts` |
| io videos router | `src/apps/io/videos/index.ts` |
| Processing core types | `src/services/videos/processing/types.ts` |
| processStream (byte-copy) | `src/services/videos/processing/processStream.ts` |
| repackageToFmp4 (TS→fMP4) | `src/services/videos/processing/repackageToFmp4.ts` |
| convertToHLS (ffmpeg encode) | `src/services/videos/helpers/ffmpeg/index.ts` |
| convert handler (compute) | `src/services/videos/convert/handler.ts` |
| CLI scripts | `src/cli/stream-m3u8.ts`, `src/cli/convert.ts`, `src/cli/repair-fmp4.ts` |
| Hasura actions metadata | `sworld-hasura-v2/metadata/actions.yaml` |
| Hasura Event triggers | `sworld-hasura-v2/metadata/databases/sworld/tables/public_videos.yaml` |
| Notifications permissions | `sworld-hasura-v2/metadata/databases/sworld/tables/public_notifications.yaml` |
