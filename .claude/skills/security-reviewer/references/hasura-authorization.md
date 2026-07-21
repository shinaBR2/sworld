# Hasura authorisation — boundary 1 (what you can touch)

Hasura is the data layer: **all** database access goes through it, so its permission metadata *is*
our authorisation model. This is the highest-leverage layer — and the easiest one to get *wrong* in
a review, because Hasura's model is subtler than "every table needs a row filter." Read this before
flagging anything here; a confident-but-wrong Hasura finding is how a row-filter-only read can
produce a CRITICAL that wasn't (see "The `filter: {}` false positive" below).

## How it's wired (live)

- Metadata lives **in this repo** at `apps/hasura/metadata/databases/sworld/tables/` — one YAML per
  table, each with per-role permissions for `select`/`insert`/`update`/`delete`. Migrations sit
  alongside under `apps/hasura/migrations/`. (The old `sworld-hasura-v2` repo is the
  pre-consolidation copy — don't read permissions from it.)
- **Roles:** `anonymous` (unauthenticated — several content tables intentionally expose read-only
  `select` access, e.g. `public_audios.yaml`, `public_videos.yaml`; `anonymous` must never appear
  in an `insert`/`update`/`delete` permission block — flag that as a real finding, not hardening),
  `user` (every authenticated user), and `vip` (elevated non-admin, currently permissioned on a
  couple of tables, e.g. `public_crawl_requests.yaml`). Role comes from the validated JWT
  (`auth0-and-jwt.md`). `manager` is referenced as a role concept at the JWT/allowed-roles layer
  but currently has no explicit permissions on any table in the metadata — verify with a
  fresh `grep -rl "role: manager" apps/hasura/metadata/` before treating a `manager`-specific finding as live
  (see also the `manager` checklist item below, which describes what to check once it does gain
  permissions).
- Writes to most domain tables go through the **backend with the admin secret**, not direct
  user-role mutations — so many tables are `select`-only for `user`.

## The model you must understand first

A `select` permission has **two** independent controls, and you have to read them *together*:

1. **The row `filter`** — which rows match (`{}` = all rows).
2. **Root-field visibility** — `query_root_fields` and `subscription_root_fields`. These decide
   whether the table is queryable at the **top level** at all:
   - absent / `null` → all root fields exposed (`select`, `select_by_pk`, `select_aggregate`).
   - `[]` (empty array) → **no root fields**: the table is reachable **only through a relationship**
     from another table. (Hasura feature since v2.8; the documented way to make a table
     relationship-only.)

When you query through a relationship, Hasura applies permission filters at the SQL level and you
can only reach child rows **via a parent you were allowed to see** — the parent's filter plus the
foreign-key join constrain which children come back.

So the question is never "does this table have a row filter?" It's:

> **For each table + role, is the combination of (root-field exposure × row filter × all
> relationship paths) sound?**

Two sound configurations, and the one real leak:

| Root fields | Row filter | Verdict |
|-------------|-----------|---------|
| Exposed (non-empty) | Scoped to `X-Hasura-User-Id` (direct or via a membership relationship) | ✅ Normal entry-point table (e.g. `projects`). |
| `[]` (relationship-only) | `filter: {}` | ✅ **Deliberate, correct pattern** — gated by its filtered parent. *Verify the access graph (below).* |
| **Exposed (non-empty)** | **`{}` on a non-reference table** | 🚩 **Real cross-tenant leak** — anyone can query all rows at the root. This is the genuine bug to hunt. |

## The `filter: {}` false positive (read this)

Child tables are commonly scoped the second way. A child table (e.g. `child_items.yaml`, and any
siblings hanging off the same parent) may have:

```yaml
select_permissions:
  - role: user
    permission:
      filter: {}                 # all rows…
      query_root_fields: []      # …but NOT queryable at the root…
      subscription_root_fields: []
```

while its parent `projects.yaml` is the gated entry point:

```yaml
filter:
  _or:
    - { _and: [ {is_demo: {_eq: true}}, {is_visible: {_eq: true}} ] }
    - members: { _and: [ {is_active: {_eq: true}}, {role: {user_id: {_eq: X-Hasura-User-Id}}} ] }
query_root_fields: [select, select_by_pk, select_aggregate]
```

`query { childItems { id } }` returns **nothing** for the `user` role — there is no root field. You
can only reach the children via `projects { childItems }`, and `projects` is membership-scoped. The
`filter: {}` is intentional: once you've legitimately traversed in, it means "no *additional*
filter," because the parent already did the gating. Hasura's own docs recommend exactly this — "if
root fields are disabled then you may want to simplify the row filter permissions by giving it …
access to all rows."

**A naive audit will flag every such `filter: {}` table as a CRITICAL cross-tenant leak and
recommend adding a membership filter to each one. That is wrong** — it reads the row filter without
the root-field config. Don't repeat it. When you see `filter: {}`, the very next thing you read is
`query_root_fields`.

## But it is not *automatically* safe — verify the access graph

Hasura's docs add the real caveat: a relationship-only table with `filter: {}` can still leak if
there's **another** way in. So for each such table, confirm:

- [ ] **Every inbound relationship** originates from a table whose own filter is properly scoped. A
      `filter: {}` child reached from an *unfiltered* exposed parent is a leak through the back door.
- [ ] **No mutation `returning` vector.** If the `user` role has `insert`/`update`/`delete` on the
      table, its mutation `returning` output can surface rows. (Usually moot here — these tables are
      `select`-only for `user`; writes go through the backend's admin role. Confirm that holds for
      the table in question.)
- [ ] Root fields really are `[]`, not `null`/absent. `null` means fully exposed — then `filter: {}`
      *is* the leak.

## The rest of the Hasura checklist

- [ ] **Entry-point tables** (root fields exposed: `projects`, `users`, …) have a row filter that
      scopes to `X-Hasura-User-Id` or a membership relationship — these are where a missing/`{}`
      filter is a *real* leak.
- [ ] **Sensitive columns** (e.g. `hasura_role`, internal flags) are column-restricted for `user`.
- [ ] **`manager` scope** is its actual job, not a global backdoor. As of writing `manager` has no
      explicit table permissions (see "Roles" above) — this item is forward-looking: the moment a
      table grants `manager` anything, re-verify with `grep -rl "role: manager" metadata/` and check
      its filter isn't `{}` on `users`/financial tables.
- [ ] **Production hardening** (judge against the deployed/production Hasura, *not*
      `apps/hasura/docker-compose.yaml`):
  - **Introspection** (`graphql_schema_introspection.yaml`): leaving it on lets an *authenticated*
    user enumerate the schema. The data is still behind permissions, so this is **information
    disclosure / hardening, not a data breach** — it speeds up an attacker mapping the API, and only
    bites in combination with an actual access-control gap. Disable for `user` in prod; don't inflate
    it to CRITICAL on its own.
  - **Rate / depth limits** (`api_limits.yaml` empty): a DoS / abuse-resistance hardening item, not a
    confidentiality bug. Worth setting (depth ~10, per-role rate limit); **not launch-blocking**.
  - **`HASURA_GRAPHQL_DEV_MODE`** must be `false` in prod (leaks error internals). `"true"` in the
    local compose file is fine — only a finding if prod has it on.
  - Console off in prod; admin secret strong and never shipped to the SPA.
- [ ] **Actions** (`apps/hasura/metadata/actions.yaml`): each is permissioned to the right role.
      Hasura does **not** apply row permissions to action *arguments* — the backend must authorise
      (see `hono-backend.md`). An action exposed to `user` that accepts arbitrary IDs is only as safe
      as the backend's own ownership check.
- [ ] **Action headers.** Actions set `X-Hasura-Action` and `Content-Type`, and no shared-secret
      header — so nothing in the Action path proves to the backend that the call came from Hasura.
      Pair this with the "what authenticates the Action routers?" check in `hono-backend.md`; the two
      halves only make sense read together.
- [ ] **`forward_client_headers: true`** is set on every Action. That relays the *caller's* headers
      to the backend, so any header the browser can set arrives at the handler. Harmless while the
      backend reads identity only from `session_variables` — a privilege-escalation path the moment a
      handler trusts an inbound header. Check both ends before judging.

## Business invariant: `public` is owner-only, on every content table

"Public" is an act of owning the database, not a user capability. Only the admin secret / direct DB
access (i.e. `shinabr2`, the DB owner) may set a content row's `public` flag — **no** non-admin role
(`user`, `vip`, or any future role) may write a publicity field, on **any** content table, on insert
or update. `select` is unaffected — reading publicity is fine for everyone. Covered today: `audios`,
`playlist`, `videos`. Enforced by omitting `public` from the non-admin `insert`/`update` column
allowlists — flag it as a finding if a new content table's non-admin permission includes `public` in
either list. Codegen introspects as **admin** (keeps `public` in generated types), so this invariant
never shows up as a frontend type change — the only place it's visible is the metadata YAML itself.

**Verification recipe (no live-Hasura test needed for this):** role-simulate with curl —
`x-hasura-admin-secret` + `x-hasura-role: user` (or `vip`) attempting to set `public` on
insert/update — expect a Hasura validation error (`field 'public' not found in type:
..._insert_input` / `..._set_input`). That response *is* the guard; don't add a live-Hasura
regression test for this static metadata fact — the data layer's PR check (`hasura-pr.yml`) runs
eslint only, over the TypeScript tests and configs, and never reads `metadata/` or `migrations/`. So
nothing in CI validates permission YAML, and the role-suite needs a live Hasura endpoint it doesn't
have. A live test here is a rabbit hole, not a safety net; the flip side is that **a permission
regression will not be caught by CI** — metadata changes need a human read.

## Severity calibration for this layer

- **Real leak (High/Critical):** an *exposed-root-field* table with a missing or `{}` filter holding
  user/financial data; a sensitive column readable by the wrong role; a relationship-only table
  reachable via an unfiltered back-door path.
- **Hardening (Low/Medium):** introspection on, no rate/depth limits, dev-mode you can't confirm
  against prod. Label these **needs-verification** or **defence-in-depth** — don't dress them up as
  breaches.

## Can't be verified from the repo

Production Hasura env (introspection, dev-mode, depth limits, JWT config, admin secret) and
whether deployed metadata matches what's committed. Treat prod-only settings as assumptions to
confirm, not findings to assert.

**Sources:** [Root Field Visibility](https://hasura.io/docs/2.0/auth/authorization/permissions/disabling-root-fields/) ·
[Row-level permissions](https://hasura.io/docs/2.0/auth/authorization/permissions/row-level-permissions/) ·
[Disable introspection](https://hasura.io/docs/2.0/security/disable-graphql-introspection/)
