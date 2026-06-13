# B2 — `status→failed` event + `/videos/notify-failure` endpoint → Slack

**Repo:** sworld-hasura-v2 + sworld-backend
**Type:** feature
**Status:** todo
**Estimate:** M
**Blocked by:** F1, B3
**Blocks:** Z1
**Parallel-safe with:** A1, A2, A3, A4, C1, B1

> Split into two PRs (Hasura change is its own PR): **B2a** event trigger, **B2b** endpoint.

## Context

A `failed` video should alert the team in Slack with the reason. Consistent with
the architecture: Hasura emits the event, Hono handles it.

## Scope

**B2a (hasura PR):** new event trigger on `videos`, fires on **update** when
`status` becomes `'failed'` → `POST {MAIN_WEBHOOK_DOMAIN}/videos/notify-failure`
with the row (id, title, status, metadata.lastError). Signed like other triggers.

**B2b (backend PR):** new gateway route `/videos/notify-failure`:
- validate signature + zod body (id, title, lastError).
- Pin the `lastError` contract (shared by the Hasura trigger payload and the
  route's zod validator so they cannot drift):
  `lastError: { code: string; httpStatus?: number; message: string; at: string }`
  — these are exactly the operator-safe fields B1 produces.
- call `postToSlack` (B3) with a readable message: title, video id, error
  code/httpStatus/message, and a link/hint to retry (bump `retry_count`).

## Files to touch (ownership)

- `sworld-hasura-v2/metadata/databases/sworld/tables/public_videos.yaml` (event trigger)
- `src/apps/gateway/videos/routes/notify-failure/index.ts` (new)
- `src/schema/videos/notify-failure/index.ts` (new)
- `src/apps/gateway/videos/index.ts` (register the route — **B2 owns this edit**)

## Acceptance criteria

- [ ] Flipping a video to `status='failed'` fires exactly one webhook.
- [ ] The endpoint posts a Slack message containing the video id + error reason.
- [ ] Signature validation matches the other video webhooks.
- [ ] The trigger does **not** fire on `ready`/`processing` transitions.

## Test plan

- Locally set a video `status='failed'` → observe the Slack post (or mocked).

## Out of scope

- Producing the `failed` state (B1).
- Retrying (C1).
