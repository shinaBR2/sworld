---
name: backend-ops
description: How to perform sworld operational tasks from apps/backend in the sworld monorepo — GCS asset layout, operator CLIs, direct prod DB access, and the recurring "create audios" ingestion task. Auto-triggers when uploading media, ingesting mp3/video files, touching prod data directly, or working in apps/backend/src/cli.
user-invocable: false
---

# Backend Ops

How to perform sworld operational tasks (create audios/videos, upload assets, touch prod data) from **`apps/backend`** in the sworld monorepo. This is separate from the `parallel-workflow` PR process — these are direct, already-authorized ops tasks, not feature work. Don't re-ask the user for credentials or access; they're already configured.

These CLIs are operator tools run straight from source with `tsx` — they don't go through the container images, so the unbuildable Dockerfiles and missing deploy pipeline (see `backend-architecture`) don't block them.

## Which account an op runs as

The CLIs that create rows (`audio.ts`, `convert.ts`, `stream-m3u8.ts`, `upload-subtitle.ts`) take the acting account from `user-id` in `~/.sworld-cli/config.json`, and `--user-id <user-id>` overrides it for a single run. Pass `--user-id` whenever the op should be owned by an account other than the configured one. `repair-fmp4.ts` is the exception — it reworks an existing video and takes the owner from the row, so it has no `--user-id`.

Account names and their ids are identity data: they belong in local machine config, not in a skill. This repo is public, so read them from the local config or ask the user — never hardcode one here or in a committed script. (Infrastructure identifiers like the bucket and Hasura endpoint below are already public and are fine to keep.)

## Assets live in GCP Cloud Storage

All media/assets are in GCS, bucket **`sworld-prod.appspot.com`**. Public URL = `https://storage.googleapis.com/sworld-prod.appspot.com/<objectPath>`.

Layout: `videos/<userId>/<videoId>/…` (HLS: `playlist.m3u8` + segments/`init.mp4`/`.m4s`), `audios/<userId>/<file>.mp3`, subtitles `videos/<userId>/<videoId>/<lang>.vtt`.

## Credentials (already configured — reuse, don't ask)

- **`~/.sworld-cli/config.json`**: `gcp-key` (path to the service-account JSON — read the value from the config, don't hardcode a path), `gcp-bucket` (`sworld-prod.appspot.com`), `hasura-endpoint` (`https://free-lamprey-59.hasura.app/v1/graphql`), `hasura-secret` (admin), `user-id` (the account ops run as — see above).
- GCS auth: `new Storage({ keyFilename })` with that `gcp-key`. `gcloud` ADC is NOT set up — always use the key file.
- **`apps/backend/.env`** also has: `GCP_STORAGE_BUCKET`, `HASURA_ADMIN_SECRET` + `HASURA_ENDPOINT`, `DATABASE_URL` (direct Postgres), Cloudinary, OpenAI, etc. It is gitignored, so a fresh clone or worktree has only `.env.example` — copy the real file in. `packages/core/.env` also has `HASURA_GRAPHQL_URL` + `HASURA_ADMIN_SECRET` for quick admin queries via curl.

## Talking to the production DB directly

- Via **Hasura admin** (endpoint + admin secret above) with GraphQL — admin bypasses all row permissions. Use for reads (dup checks) and writes (insert audios rows, link playlist_audios, etc.).
- Or Postgres directly via `DATABASE_URL`.

## Operator CLIs in `apps/backend/src/cli/`

Run them from `apps/backend` (that's where `tsx` and the backend's dependencies resolve):

```bash
cd apps/backend && pnpm exec tsx src/cli/<x>.ts …
```

- **convert.ts** — local video file → fMP4 HLS, upload to GCS, create/finalize the `videos` row (`--file`, `--title`, `--video-id`, `--playlist`, `--public`, `--dry-run`, `--user-id`).
- **stream-m3u8.ts** — fix a failed video: process an `.m3u8` (master or media) → GCS, finalize an existing `videos` row (`--url`/`--file`, `--video-id`, `--referer`, `--playlist`). Also owns the shared CLI config (`config set <key> <value>`).
- **upload-subtitle.ts** — upload a `.vtt` (local or URL) → GCS, insert/update `subtitles` row.
- **repair-fmp4.ts** — repackage a video's stored `.ts` → fMP4 (fixes garbled desktop-Chrome audio).
- **audio.ts** — publish a local `.mp3` to the listen library: no transcode, just upload verbatim to GCS + insert the `audios` row (`--file <path>` or `--dir <path>` for a whole folder, `--name`/`--artist` overrides, `--public`, `--dry-run`, `--skip-db`, `--user-id`). Handles dup-checking and filename metadata parsing itself — see below. Full CLI docs: `apps/backend/src/cli/README.md`.

## Recurring task: "create audios"

The owner's most common recurring ops ask: they have local `.mp3` files and ask to "create new audios." Just run `audio.ts` — don't explain the plumbing (GCS, CLI internals) unless asked; keep it simple.

```bash
cd apps/backend

# One file (name + artist parsed from "Title - Artist.mp3"):
pnpm exec tsx src/cli/audio.ts --file './Shape of You - Ed Sheeran.mp3' --user-id <user-id>

# A whole folder, dry-run first:
pnpm exec tsx src/cli/audio.ts --dir ./album --user-id <user-id> --dry-run
```

The CLI already handles the flow the owner cares about: `name`/`artist` parsed from the filename (`artist_name` is NOT NULL — a file with no parseable artist and no `--artist` is reported and skipped, not silently defaulted), `public: false` by default (add `--public` only if explicitly asked — publishing is an act of owning the database, not a user capability, so only flip it on explicit instruction), an existing `(user_id, name)` skipped as a dup, and a `Created / Skipped / Failed` tally on a batch. The new rows are owned by whichever account `--user-id` names, falling back to the configured one.
