# Audio publicity is owner-only (exclusive requirement)

> Audience: AI agents maintaining this repo. This is a hard business invariant —
> treat it as a constraint on any change you make, not a suggestion.

## Invariant

**Only the owner (shinabr2), acting directly against the database, may set
`audios.public`. The `user` role must NEVER be able to publish an audio — not on
insert, not on update.**

There is intentionally **no in-app path** to publish an audio. Publishing is a
deliberate, manual, owner-only act performed via the admin secret / direct DB
(admin bypasses all row & column permissions). The listen app is a
publish-nothing client: users create/organise *private* audios and playlists
only.

## How it is enforced (and where)

`metadata/databases/sworld/tables/public_audios.yaml`:

- **`insert_permissions` (role `user`)** — `public` is **omitted** from `columns`.
  New user-created rows fall back to the DB default `public = false` (the column
  is `NOT NULL DEFAULT false`), so they land private with no way to override.
- **`update_permissions` (role `user`)** — `public` is **omitted** from `columns`.
  Hasura builds `audios_set_input` for the user role from this list, so the field
  does not exist for that role and any attempt to `_set` it is rejected at schema
  validation.
- **`select_permissions`** — `public` stays readable (both `anonymous` and
  `user`). Reading publicity is fine; only *writing* it is restricted.

That is the whole mechanism. No session variables, no custom check, no role
split — publicity is simply not a user-writable column.

## Verifying enforcement

The invariant is a static fact of the metadata above — `public` is not in the
user-role `insert`/`update` `columns`. Confirm it directly in
`public_audios.yaml`, or exercise it against a running Hasura by simulating the
`user` role with the admin secret (`x-hasura-role: user`):

```bash
EP=http://localhost:8030/v1/graphql   # local; use the deployed endpoint for prod
SEC=<admin-secret>
UID=6ff27fda-03e8-4dcd-949b-f1328f955065   # any user id

# user INSERT with public  -> rejected: field 'public' not found in type: 'audios_insert_input'
curl -s "$EP" -H "x-hasura-admin-secret: $SEC" -H "x-hasura-role: user" -H "x-hasura-user-id: $UID" \
  -H 'content-type: application/json' \
  --data '{"query":"mutation { insert_audios_one(object:{name:\"x\",artistName:\"y\",source:\"z\",public:true}){ id } }"}'

# user UPDATE _set public -> rejected: field 'public' not found in type: 'audios_set_input'
curl -s "$EP" -H "x-hasura-admin-secret: $SEC" -H "x-hasura-role: user" -H "x-hasura-user-id: $UID" \
  -H 'content-type: application/json' \
  --data '{"query":"mutation { update_audios(where:{id:{_eq:\"00000000-0000-0000-0000-000000000000\"}}, _set:{public:true}){ affected_rows } }"}'

# admin UPDATE public still works (affected_rows, no error) — owner publish path intact
curl -s "$EP" -H "x-hasura-admin-secret: $SEC" -H 'content-type: application/json' \
  --data '{"query":"mutation { update_audios(where:{id:{_eq:\"00000000-0000-0000-0000-000000000000\"}}, _set:{public:true}){ affected_rows } }"}'
```

(No automated test: the repo's `tests/` are live-Hasura role suites that CI does
not currently run — `pr.yml` runs only lint — and a live introspection/mutation
test of this static metadata fact is brittle. The metadata column lists plus this
recipe are the guard.)

## If you are changing audio permissions

- **Do NOT add `public` to the user-role `insert`/`update` column lists.** That
  silently re-opens self-publishing and breaks this invariant.
- Keep `public` in the `select` lists — read access is intended.
- If the product ever needs users to publish, that is a **new decision**, not a
  metadata tweak: update this doc and design the real gate (who, under what
  condition). Do not "just add the column back".
- The owner publishes via admin/direct DB (e.g. the `audio.ts` CLI in
  `sworld-backend` uses the admin secret). Nothing in the frontend writes to the
  `audios` table.

## Related

- Parent requirement: Linear SWO-404. Enforcement change: SWO-405.
- Frontend audit (SWO-406, cancelled): the listen app has no audio insert/update
  mutation at all — only `playlist` / `playlist_audios` mutations — so there was
  never a UI path to publish. Enforcement is entirely server-side, here.
