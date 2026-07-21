# Publishing is owner-only (exclusive requirement)

> Audience: AI agents maintaining this repo. This is a hard business invariant —
> treat it as a constraint on any change you make, not a suggestion.

## Invariant

**"Public" is an act of owning the database, not a capability of any user tier.**
Only the owner (shinabr2), acting via the admin secret / direct DB — which
bypasses all row & column permissions — may set anything `public`. **No Hasura
`user` or `vip` role may write a publicity/visibility field, on any table.**

Publishing is a deliberate, manual, owner-only act. The apps are publish-nothing
clients: users create/organise *private* content only; making something public
is done out-of-band by the owner (admin). This holds regardless of tier — `vip`
is still a user, not the DB owner.

## How it is enforced (and where)

For every content table, `public` is **omitted** from the `columns` list of the
`user` (and `vip`, where present) `insert_permissions` / `update_permissions` in
`metadata/databases/sworld/tables/`. Hasura then builds the per-role
`*_insert_input` / `*_set_input` from those lists, so `public` does not exist for
those roles and any attempt to set it is rejected at schema validation. This is a
**write-only** restriction — `select` perms are left exactly as they are. (Where
`public` is already selectable — `audios`, `playlist` — it stays readable;
`videos` never exposed `public` via `select`, and this rule doesn't change that.)
Each `public` column is `NOT NULL DEFAULT false`, so rows created by a
non-admin role land private with no way to override.

| Table | `public` writable by user/vip? | Enforced in |
|-------|--------------------------------|-------------|
| `audios` | no (removed from `user` insert+update) | `public_audios.yaml` (SWO-405) |
| `playlist` | no (removed from `user` insert+update) | `public_playlist.yaml` (SWO-409) |
| `videos` | no (removed from `user` **and** `vip` insert) | `public_videos.yaml` (SWO-409) |

No session variables, no custom check, no role split — publicity is simply not a
non-admin-writable column.

## Verifying enforcement

The invariant is a static fact of the metadata above — `public` is not in the
non-admin `insert`/`update` `columns`. Confirm it directly in the table YAML, or
exercise it against a running Hasura by simulating a role with the admin secret
(`x-hasura-role: user` or `vip`):

```bash
EP=http://localhost:8030/v1/graphql   # local; use the deployed endpoint for prod
SEC=<admin-secret>
UID=<any-user-id>

# user INSERT playlist with public -> rejected: field 'public' not found in type: 'playlist_insert_input'
curl -s "$EP" -H "x-hasura-admin-secret: $SEC" -H "x-hasura-role: user" -H "x-hasura-user-id: $UID" \
  -H 'content-type: application/json' \
  --data '{"query":"mutation { insert_playlist_one(object:{title:\"x\",slug:\"x\",site:\"listen\",public:true}){ id } }"}'

# user UPDATE playlist _set public -> rejected: field 'public' not found in type: 'playlist_set_input'
curl -s "$EP" -H "x-hasura-admin-secret: $SEC" -H "x-hasura-role: user" -H "x-hasura-user-id: $UID" \
  -H 'content-type: application/json' \
  --data '{"query":"mutation { update_playlist(where:{id:{_eq:\"00000000-0000-0000-0000-000000000000\"}}, _set:{public:true}){ affected_rows } }"}'

# vip INSERT video with public -> rejected: field 'public' not found in type: 'videos_insert_input'
curl -s "$EP" -H "x-hasura-admin-secret: $SEC" -H "x-hasura-role: vip" -H "x-hasura-user-id: $UID" \
  -H 'content-type: application/json' \
  --data '{"query":"mutation { insert_videos_one(object:{title:\"x\",slug:\"x\",video_url:\"z\",public:true}){ id } }"}'

# admin can still set public on all tables (no error) — owner publish path intact
curl -s "$EP" -H "x-hasura-admin-secret: $SEC" -H 'content-type: application/json' \
  --data '{"query":"mutation { update_playlist(where:{id:{_eq:\"00000000-0000-0000-0000-000000000000\"}}, _set:{public:true}){ affected_rows } }"}'
```

(No automated test: the repo's `tests/` are live-Hasura role suites that CI does
not currently run — `pr.yml` runs only lint — and a live introspection/mutation
test of this static metadata fact is brittle. The metadata column lists plus this
recipe are the guard.)

## If you are changing content permissions

- **Do NOT add `public` to any non-admin `insert`/`update` column list.** That
  silently re-opens self-publishing and breaks this invariant. It applies to any
  new content table too, not just the three above.
- Don't change the `select` lists as part of enforcing this — it's a write-only
  restriction. (`public` is selectable on `audios`/`playlist`; `videos` does not
  expose it via `select`, by existing design — leave that as-is.)
- If the product ever needs a user tier to publish, that is a **new decision**,
  not a metadata tweak: update this doc and design the real gate (who, under what
  condition). Do not "just add the column back".
- The owner publishes via admin/direct DB (e.g. the `audio.ts` / `convert.ts`
  CLIs in `sworld-backend` use the admin secret). No frontend path writes
  `public` on any content table.

## Related

- Principle owner: Linear SWO-404. Enforcement: SWO-405 (audios), SWO-409
  (playlist + videos).
- The apps are publish-nothing clients — no audio/playlist/video create or update
  mutation in the frontend sends `public` (the Listen playlist create input's
  `public` field is unused and tracked for removal in SWO-410).
