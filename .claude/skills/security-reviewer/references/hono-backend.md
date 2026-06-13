# Hono backend — boundaries 2 & 3 (business-logic trust)

The Hono backend (sibling repo `sworld-backend`) exists for one reason: to handle Hasura
Actions/Events and a few external webhooks. It holds two trust boundaries — it must verify that a
request *really* came from Hasura (boundary 2), and it wields the admin secret that bypasses all row
permissions, so it must authorise callers *itself* before using it (boundary 3).

## How it's wired (live)

- Entry: `sworld-backend`'s `src/server.ts` mounts per-feature routers (e.g. `projects`, `share`,
  `uploads`, `users`, `notifications`, `email`, `webhooks`). `/health` is public.
- **Boundary 2 — `hasuraAuth` middleware** (`src/middleware/hasuraAuth.ts`): compares the inbound
  `X-Hasura-Signature` header to `HASURA_BACKEND_SIGNATURE`. Applied to all Action/Event routes.
  `cronAuth` does the same for `X-Cron-Secret`.
- **User identity** (`src/middleware/hasuraSession.ts`): reads `x-hasura-user-id` from the request
  body's `session_variables` (which Hasura populates from the verified JWT) and validates it is a
  positive integer.
- **Boundary 3 — admin client** (`src/hasura/client.ts`): sends `x-hasura-admin-secret` on every
  call. All persistence goes through typed `graphql()` codegen — variables are parameters, not
  string-interpolated.
- **Input validation:** Zod `.safeParse()` at each router (e.g. `projects/createProject/router.ts`,
  `share/inviteShare/schema.ts`).
- **Secrets & logging:** `src/envConfig.ts` fail-fast validates required env at boot.
  `src/lib/logger.ts` (pino) redacts `password`/`secret`/`token`/`authorization`/
  `x-hasura-admin-secret`. `src/lib/errors/appError.ts` returns only a safe message +
  code to the client; system messages and stack traces stay server-side.

## What good looks like

- **Constant-time secret comparison.** Compare shared secrets with `crypto.timingSafeEqual`, not
  `===`/`!==`. The webhook Basic-auth verifier (`src/webhooks/.../verifyBasicAuth.ts`) does this
  correctly — it's the reference pattern. Any secret/signature check that uses `!==` is a
  timing-oracle lead (the `hasuraAuth`/`cronAuth` middleware are the places to check).
- **Authorise before admin access.** Because the admin secret bypasses row permissions, every
  handler must prove the `session_variables` user is allowed to touch the target *before* the admin
  client reads/mutates it. Hasura does **not** apply row filters to action inputs — a `user`-scoped
  action receiving an arbitrary `projectId` is only safe if Hono checks ownership. This is the most
  important Hono check: find the ownership assertion for each mutating handler.
- **Identity only from `session_variables`.** Never read role/user-id from a client-settable header.
  The body's `session_variables` are Hasura-attested; an inbound header is attacker-controlled.

## Checks

- [ ] Every Action/Event/webhook route is behind signature/secret verification — none mounted raw.
      `/health` is the only intended public route; confirm it leaks nothing useful.
- [ ] Signature/secret comparisons are constant-time (`timingSafeEqual`), matching `verifyBasicAuth.ts`.
- [ ] Each admin-secret mutation/read is preceded by an explicit ownership/authorisation check on the
      `session_variables` user. List the handlers; flag any that act on a client-supplied ID without one.
- [ ] User identity is taken from `session_variables`, never request headers.
- [ ] All action inputs are Zod-validated before use; no raw SQL, query-string building, `exec`/`spawn`/`eval`.
- [ ] Errors return only `AppError`'s safe message; no stack/system message reaches the client.
- [ ] `AppError` metadata never carries a secret (e.g. `{ cause: err.toString() }` where `err` holds
      a token). Redaction covers logs, but the response `extensions` are constructed by hand — audit them.
- [ ] CORS: none today (server-to-server). If added, it must be an explicit origin allow-list, never
      `*` with credentials.
- [ ] *Hardening — error detail persisted to the DB.* If a handler writes `error.stack` to a table
      (e.g. an `email_outbox` failure column), it leaks internal paths/framework versions to anyone who
      can later read that row. Store `error.message`, not the stack. **Low** — info-disclosure to an
      already-permissioned reader, not an external exploit.
- [ ] *Consistency — Zod on every boundary.* Every router should `safeParse` its input. A handler that
      type-casts instead (a payment/webhook route may be the known exception) breaks the
      validate-at-the-boundary pattern; worth closing for consistency even where validation happens
      downstream. **Low**, but real — uniform input validation is cheap defence.

## Traps specific to us

- **The `verifyBasicAuth` inconsistency.** One secret check uses `timingSafeEqual`; the signature/
  cron checks use `!==`. That inconsistency is the tell — when one place in a codebase does it right
  and another doesn't, the odd one out is the finding.
- **Session-variable trust is only as good as Hasura.** Hono trusts `session_variables` implicitly.
  That's correct *if* Hasura always sets them from the JWT and never lets a client inject them. The
  assumption lives at boundary 1/2 — state it, and confirm no action is configured to pass through
  client-supplied session variables.
- **Admin secret = keys to the kingdom.** It bypasses every Hasura row permission. A handler that
  mutates based purely on its input, with no ownership check, turns a `user`-role action into
  arbitrary cross-tenant writes. Trace authorisation, not just validation — Zod proves the input is
  *well-formed*, not that the caller is *allowed*.

## Why the signature gate is load-bearing

The backend is internet-reachable **by design**: Hasura runs on a different host and can't present
the backend host's identity, so host/network IAM can't be the gate (see
`references/infra-cloud-run.md`). That's not a hole to flag — it means boundary 2's
`X-Hasura-Signature` check is the *primary* authentication standing between the public internet and
the admin-secret client. So weight it accordingly: constant-time comparison, present on every
Action/Event route, and a secret with real entropy that's rotated. These checks earn their
importance precisely *because* the network in front of them is open on purpose.

## Can't be verified from the repo

The actual `HASURA_BACKEND_SIGNATURE`/`CRON_SECRET` values, their entropy, and rotation cadence live
in the host/Hasura consoles. Flag those as needs-verification rather than asserting on them.
