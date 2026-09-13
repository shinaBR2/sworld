# GCS asset layout and credentials

## Assets live in GCP Cloud Storage

All media/assets are in GCS, in the bucket named by `gcp-bucket` in the CLI config (below).

Public URL = `https://storage.googleapis.com/<gcp-bucket>/<objectPath>`.

Layout:

- `videos/<userId>/<videoId>/…` (HLS: `playlist.m3u8` + segments/`init.mp4`/`.m4s`)
- `audios/<userId>/<file>.mp3`
- subtitles `videos/<userId>/<videoId>/<lang>.vtt`

## Credentials (already configured — reuse, don't ask)

- **`~/.sworld-cli/config.json`**: `gcp-key` (path to the service-account JSON — read the value from the config, don't hardcode a path), `gcp-bucket` (the GCS bucket), `hasura-endpoint` (the prod Hasura GraphQL URL), `hasura-secret` (admin), `user-id` (the account ops run as).
- GCS auth: `new Storage({ keyFilename })` with that `gcp-key`. `gcloud` ADC is NOT set up — always use the key file.
- **`apps/backend/.env`** also has: `GCP_STORAGE_BUCKET`, `HASURA_ADMIN_SECRET` + `HASURA_ENDPOINT`, Cloudinary, OpenAI, etc. It is gitignored, so a fresh clone or worktree has only `.env.example` — copy the real file in. `packages/core/.env` also has `HASURA_GRAPHQL_URL` + `HASURA_ADMIN_SECRET` for quick admin queries via curl.
