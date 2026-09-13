---
name: backend-ops
description: How to perform sworld operational tasks from apps/backend in the sworld monorepo — GCS asset layout, operator CLIs, prod data access, and the recurring "create audios" ingestion task. Auto-triggers when uploading media, ingesting mp3/video files, touching prod data, or working in apps/backend/src/cli.
user-invocable: false
---

* backend-ops: performing sworld operational tasks — media ingestion, asset uploads, and prod data access — directly from `apps/backend`.

* Rules
  * These are direct, already-authorised ops tasks, separate from the `parallel-workflow` PR process and not feature work, so never re-ask the user for credentials or access.
  * The operator CLIs run straight from source with `tsx` and never go through the container images, so running one never waits on a backend deploy.
  * The CLIs read and write the live Hasura and GCS, so a command that depends on a new schema still needs that migration deployed first.
  * The row-creating CLIs (`audio.ts`, `convert.ts`, `stream-m3u8.ts`, `upload-subtitle.ts`) take the acting account from `user-id` in `~/.sworld-cli/config.json`, and `--user-id <user-id>` overrides it for a single run.
  * Pass `--user-id` whenever the op should be owned by an account other than the configured one.
  * `repair-fmp4.ts` is the exception — it reworks an existing video and takes the owner from the row, so it has no `--user-id`.
  * Account names and their ids, the bucket, and the Hasura endpoint are config values read from the local config or the user — never hardcode one here or in a committed script, since the repo is public.
  * Reach prod data only through Hasura (`hasura-architecture` owns that rule): use the Hasura admin endpoint and secret — which bypasses all row permissions — for scripted reads (dup checks) and writes (insert audios rows, link playlist_audios), and the Hasura Console for anything interactive.
  * Run the operator CLIs from `apps/backend` via `pnpm exec tsx src/cli/<name>.ts`, discovering each one's current flags from `… <name>.ts --help` or `src/cli/README.md` rather than assuming them.
    * command purposes: [`references/operator-clis.md`](references/operator-clis.md)
  * Only publish an audio (`public: true`) on explicit instruction, since publishing is an act of owning the database, not a user capability.
  * For "create audios", run `audio.ts` on the file or folder as the intended acting account without explaining the plumbing unless asked — the CLI already parses `name`/`artist` from the filename (`Title - Artist.mp3`), reports and skips (never defaults) a file with no parseable artist and no override because `artist_name` is NOT NULL, defaults `public: false`, skips an existing `(user_id, name)` as a dup, ends a batch with a `Created / Skipped / Failed` tally, and owns new rows by the acting account falling back to the configured one.

* Steps
  1. In a fresh clone or worktree, copy the real `apps/backend/.env` in, since it's gitignored (only `.env.example` ships).
     * credentials + asset layout: [`references/gcs-and-credentials.md`](references/gcs-and-credentials.md)
  2. Pick the CLI and its acting account, passing `--user-id` when the owner should differ from the configured one.
     * command purposes: [`references/operator-clis.md`](references/operator-clis.md)
  3. Dry-run first when running against a whole folder, then run for real from `apps/backend`.
