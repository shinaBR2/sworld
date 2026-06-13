# A1 — Parse `metadata` in the shared video event schema

**Repo:** sworld-backend
**Type:** foundation (shared schema)
**Status:** todo
**Estimate:** S
**Blocked by:** F1
**Blocks:** A2, A3, A4
**Parallel-safe with:** B1, C1, B2

## Context

The HLS, convert, and platform handlers all derive from the shared
`videoDataSchema` in `schema/videos/convert/index.ts` (stream-hls and
import-platform `import { videoDataSchema }` from it). To pass headers into the
fetch layer, the event payload the trigger sends must be parsed for
`metadata.customRequestHeaders`. Doing it once, here, keeps A2/A3/A4 from each
editing this shared file.

## Scope

- Extend `videoDataSchema` with an optional `metadata` object:
  `metadata: z.object({ customRequestHeaders: z.record(z.string()).optional() }).nullable().optional()`.
- Surface `customRequestHeaders` through `transformEvent` so handlers receive a
  typed `customRequestHeaders?: Record<string,string>` in their `data`.
- Extend the per-handler `convertHandlerSchema` / re-exported shapes so the Cloud
  Task body carries the headers to the compute/io handlers.

## Files to touch (ownership)

- `src/schema/videos/convert/index.ts` (shared `videoDataSchema`, `transformEvent`, handler schema)

## Acceptance criteria

- [ ] A trigger payload with `metadata.customRequestHeaders` parses and exposes
      `customRequestHeaders` to the handler.
- [ ] A payload with `metadata: null` / absent still parses (backwards compatible).
- [ ] `pnpm type-check` clean; existing schema tests pass.

## Test plan

- Unit test `transformEvent` with and without `metadata.customRequestHeaders`.

## Out of scope

- Using the headers in any fetch (A2/A3/A4).
- The subtitle event schema (A3 owns its own schema file).
