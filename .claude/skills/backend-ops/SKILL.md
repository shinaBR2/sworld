---
name: backend-ops
description: How to perform sworld operational tasks from apps/backend in the sworld monorepo — GCS asset layout, operator CLIs, prod data access, and the recurring "create audios" ingestion task. Auto-triggers when uploading media, ingesting mp3/video files, touching prod data, or working in apps/backend/src/cli.
user-invocable: false
---

# Backend Ops

How to perform sworld operational tasks (create audios/videos, upload assets, touch prod data) from **`apps/backend`** in the sworld monorepo. This is separate from the `parallel-workflow` PR process — these are direct, already-authorized ops tasks, not feature work. Don't re-ask the user for credentials or access; they're already configured.

These CLIs are operator tools run straight from source with `tsx` — they don't go through the container images at all, so running one never waits on a backend deploy. They do read and write the **live** Hasura and GCS, though, so a command that depends on a new schema still needs that migration deployed first.

## Which account an op runs as

The CLIs that create rows (`audio.ts`, `convert.ts`, `stream-m3u8.ts`, `upload-subtitle.ts`) take the acting account from `user-id` in `~/.sworld-cli/config.json`, and `--user-id <user-id>` overrides it for a single run. Pass `--user-id` whenever the op should be owned by an account other than the configured one. `repair-fmp4.ts` is the exception — it reworks an existing video and takes the owner from the row, so it has no `--user-id`.

Account names and their ids are identity data: they belong in local machine config, not in a skill. This repo is public, so read them from the local config or ask the user — never hardcode one here or in a committed script. (Infrastructure identifiers like the bucket and Hasura endpoint below are already public and are fine to keep.)

## Assets live in GCP Cloud Storage

All media/assets are in GCS, bucket **`sworld-prod.appspot.com`**. Public URL = `https://storage.googleapis.com/sworld-prod.appspot.com/<objectPath>`.

Layout: `videos/<userId>/<videoId>/…` (HLS: `playlist.m3u8` + segments/`init.mp4`/`.m4s`), `audios/<userId>/<file>.mp3`, subtitles `videos/<userId>/<videoId>/<lang>.vtt`.

## Credentials (already configured — reuse, don't ask)

- **`~/.sworld-cli/config.json`**: `gcp-key` (path to the service-account JSON — read the value from the config, don't hardcode a path), `gcp-bucket` (the bucket named above), `hasura-endpoint` (`https://free-lamprey-59.hasura.app/v1/graphql`), `hasura-secret` (admin), `user-id` (the account ops run as — see above).
- GCS auth: `new Storage({ keyFilename })` with that `gcp-key`. `gcloud` ADC is NOT set up — always use the key file.
- **`apps/backend/.env`** also has: `GCP_STORAGE_BUCKET`, `HASURA_ADMIN_SECRET` + `HASURA_ENDPOINT`, Cloudinary, OpenAI, etc. It is gitignored, so a fresh clone or worktree has only `.env.example` — copy the real file in. `packages/core/.env` also has `HASURA_GRAPHQL_URL` + `HASURA_ADMIN_SECRET` for quick admin queries via curl.

## Reaching production data

Ops tasks reach prod data through Hasura, same as everything else — `hasura-architecture` owns that rule; follow it there rather than reasoning about it here.

- **Scripted reads/writes** — **Hasura admin** (endpoint + admin secret above) with GraphQL. Admin bypasses all row permissions, so use it for reads (dup checks) and writes (insert audios rows, link playlist_audios, etc.).
- **Anything interactive** — the **Hasura Console**.

## Operator CLIs in `apps/backend/src/cli/`

Run them from `apps/backend` (that's where `tsx` and the backend's dependencies resolve), via
`pnpm exec tsx src/cli/<name>.ts`. Discover each one's current flags from the CLI itself
(`… <name>.ts --help`) or the full docs in `src/cli/README.md` — the per-command *purposes* below are
stable, the exact flags aren't:

- **convert.ts** — local video file → fMP4 HLS, upload to GCS, create/finalize the `videos` row.
- **stream-m3u8.ts** — fix a failed video: process an `.m3u8` (master or media) → GCS, finalize an existing `videos` row. Also owns the shared CLI config (`config set`).
- **upload-subtitle.ts** — upload a `.vtt` (local or URL) → GCS, insert/update the `subtitles` row.
- **repair-fmp4.ts** — repackage a video's stored `.ts` → fMP4 (fixes garbled desktop-Chrome audio).
- **audio.ts** — publish a local `.mp3` to the listen library: no transcode, just upload verbatim to GCS + insert the `audios` row (a single file, or a whole folder). Handles dup-checking and filename metadata parsing itself — see below.

## Recurring task: "create audios"

The owner's most common recurring ops ask: they have local `.mp3` files and ask to "create new audios." Just run `audio.ts` on the file (or a whole folder — dry-run it first) as the intended acting account — don't explain the plumbing (GCS, CLI internals) unless asked; keep it simple. Its `--help` has the exact flags.

The CLI already handles the flow the owner cares about: `name`/`artist` parsed from the filename (`Title - Artist.mp3`); `artist_name` is NOT NULL, so a file with no parseable artist and no override is reported and skipped, not silently defaulted; `public: false` by default — only publish on explicit instruction, since publishing is an act of owning the database, not a user capability; an existing `(user_id, name)` is skipped as a dup; and a batch ends with a `Created / Skipped / Failed` tally. New rows are owned by the account passed as the acting user, falling back to the configured one.
