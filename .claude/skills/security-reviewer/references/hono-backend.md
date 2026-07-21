# Hono backend — boundaries 2 & 3 (business-logic trust)

The Hono backend lives **in this repo** at `apps/backend`, as a workspace package like any app. It
exists to handle Hasura Events and Actions plus a few external webhooks. It holds two trust
boundaries — it must verify that a request *really* came from Hasura (boundary 2), and it wields the
admin secret that bypasses all row permissions, so it must authorise callers *itself* before using
it (boundary 3).

Because it is in-repo, you can read the backend, the Hasura metadata (`apps/hasura`) and the
frontends in one checkout — trace an Action from its metadata definition straight into the handler
that serves it, rather than assuming across a repo boundary. Its dependencies come from the single
root `pnpm-lock.yaml`, and it consumes `packages/core` as `core: workspace:*` — not from npm.

## How it's wired (live)

- **Three services, not one server.** `src/gateway.ts`, `src/io.ts` and `src/compute.ts` each build
  their own Hono app and mount per-feature routers from `src/apps/{gateway,io,compute}/…`. `/hz` is
  the public health route on each. (The service split and Cloud Task pipeline are the
  `backend-architecture` skill's subject — this file covers only the trust boundaries.)
- **Boundary 2 — webhook signature.** `src/utils/validators/validateHasuraSignature/` reads the
  `x-webhook-signature` header and compares it to `envConfig.webhookSignature`. It is applied per
  router, e.g. `videosRouter.use('*', validateHasuraSignature())` in
  `src/apps/gateway/videos/index.ts`. The external Hashnode webhook has its own, stronger validator
  (below).
- **Most routers are *not* behind that signature.** Repo-wide, `validateHasuraSignature` is mounted
  in exactly one place (`apps/gateway/videos`), and `apps/gateway/hashnode` has its own validator —
  those two are the only gated routers in the whole backend. Everything else mounts only Zod:
  `apps/gateway/{auth,storage,videos-actions}`, and **every** router on the io and compute services.
  The Action routers take the caller's identity from the request body's
  `session_variables['x-hasura-user-id']`; `videos-actions/index.ts` documents this as deliberate —
  Actions are "authenticated by the caller's session" rather than by the webhook secret. Read that
  claim critically (see Traps), and don't assume the io/compute services are private just because
  they sit behind Cloud Tasks — establish what enforces that.
- **Boundary 3 — admin client.** `src/services/hasura/client.ts` sends `x-hasura-admin-secret`
  (`envConfig.hasuraAdminSecret`) on every call. Persistence goes through typed `graphql()` codegen —
  variables are parameters, never string-interpolated.
- **Input validation:** Zod schemas under `src/schema/**`, applied by `honoValidateRequest`
  (`src/utils/validators/request.ts`) and `validateHeaders`.
- **Secrets & logging:** `src/utils/envConfig.ts` is a plain read of `process.env` — it does **not**
  fail-fast on missing values, so an unset secret surfaces as a runtime `undefined`, not a boot
  error. `src/utils/logger/` (pino) sets a `redact` list. `AppError` (`src/utils/schema.ts`) shapes
  the client-facing error payload.
- **Ambient middleware:** body limit, request id, Sentry, and `hono-rate-limiter` — the limiter is
  keyed on the `x-webhook-signature` header, not on client IP.

## What good looks like

- **Constant-time secret comparison.** Compare shared secrets with `crypto.timingSafeEqual`, not
  `===`/`!==`. The in-repo reference pattern is
  `src/utils/validators/validateHashnodeSignature/validator.ts`: HMAC-SHA256 over
  `timestamp.payload`, compared with `timingSafeEqual`, plus a freshness window on the timestamp so a
  captured signature can't be replayed later. Measure the Hasura validator against it.
- **Authorise before admin access.** Because the admin secret bypasses row permissions, every handler
  must prove the `session_variables` user is allowed to touch the target *before* the admin client
  reads or mutates it. Hasura does **not** apply row filters to action inputs — a `user`-scoped action
  receiving an arbitrary id is only safe if the backend checks ownership. This is the most important
  backend check: find the ownership assertion for each mutating handler.
- **Identity only from attested `session_variables`.** Never read role/user-id from a client-settable
  header — and remember `session_variables` are only attested if something proved the request came
  from Hasura.

## Checks

- [ ] Every Event/webhook route is behind signature verification — none mounted raw. `/hz` is the
      only intended public route; confirm it leaks nothing useful.
- [ ] Signature comparisons are constant-time (`timingSafeEqual`), matching the Hashnode validator.
      The Hasura signature validator uses `===` as of writing — re-read it before writing anything up,
      then report it as the timing-oracle lead it is (Low on its own: guessing a whole secret through
      a network timing side-channel is slow and noisy).
- [ ] For each router mounted **without** the signature middleware, name what actually authenticates
      it. If the answer is only "the body carries `session_variables`", that body is attacker-supplied
      and every ownership check downstream is checking an id the caller chose.
- [ ] Each admin-secret mutation/read is preceded by an explicit ownership/authorisation check on the
      `session_variables` user. List the handlers; flag any that act on a client-supplied id without one.
- [ ] All action inputs are Zod-validated before use; no raw SQL, query-string building,
      `exec`/`spawn`/`eval`.
- [ ] Errors return only `AppError`'s safe message; no stack or system message reaches the client, and
      `AppError` metadata never carries a secret — the response payload is built by hand, so audit it
      separately from the logger's `redact` list.
- [ ] Missing or blank secrets fail **closed**. `envConfig` doesn't validate, so an unset
      `WEBHOOK_SIGNATURE` yields `undefined`; confirm the validator rejects the request rather than
      comparing two empty values. A misconfigured deploy must not open the gate.
- [ ] Rate limiting keyed on the signature header rather than the caller: everyone without the header
      shares one bucket, and anyone varying it gets a fresh one. Abuse-resistance **hardening**, not a
      confidentiality bug.
- [ ] CORS: none configured today (server-to-server). If added, it must be an explicit origin
      allow-list, never `*` with credentials.
- [ ] *Hardening — error detail persisted to the DB.* If a handler writes `error.stack` to a table it
      leaks internal paths and framework versions to anyone who can later read that row. Store
      `error.message`. **Low** — info-disclosure to an already-permissioned reader.

## Traps specific to us

- **The validator inconsistency.** One signature check uses `timingSafeEqual` with a replay window;
  the other uses `===`. When one place in a codebase does it right and another doesn't, the odd one
  out is the finding — and the strong one is the fix template, so the remediation is cheap.
- **"Actions are authenticated by the session" is an assumption, not a mechanism.** A code comment
  saying a router is session-authenticated does not make it so. Trace the request end to end: does
  anything between the internet and the handler verify it came from Hasura? If not, a stranger can
  POST the same JSON with any `x-hasura-user-id` they like. Verify before asserting in either
  direction — the gate may sit in front of the service (ingress rules, an unpublished URL) rather than
  in code, and "I can't see one" is **needs-verification**, not "confirmed".
- **Session-variable trust is only as good as Hasura.** Where the signature *is* enforced, the backend
  trusts `session_variables` implicitly. That's correct *if* Hasura always sets them from the JWT and
  never lets a client inject them — state the assumption, and confirm no Action is configured to pass
  through client-supplied session variables.
- **Admin secret = keys to the kingdom.** It bypasses every Hasura row permission. A handler that
  mutates purely on its input, with no ownership check, turns a `user`-role action into arbitrary
  cross-tenant writes. Trace authorisation, not just validation — Zod proves the input is
  *well-formed*, not that the caller is *allowed*.

## Why the signature gate is load-bearing

The backend is internet-reachable **by design**: Hasura Cloud runs elsewhere and can't present the
backend host's identity, so host/network IAM can't be the gate (see `references/infra-cloud-run.md`).
That's not a hole to flag — it means boundary 2's signature check is the *primary* authentication
standing between the public internet and the admin-secret client. Weight it accordingly: constant-time
comparison, present on every route that needs it, and a secret with real entropy that is rotated.

## Can't be verified from the repo

The actual `WEBHOOK_SIGNATURE` / `HASURA_ADMIN_SECRET` / `HASHNODE_WEBHOOK_SECRET` values, their
entropy and rotation cadence, live in the deploy consoles. The backend's container build and deploy
pipeline are **mid-rework**, so don't infer deploy-time or ingress behaviour from what is currently in
the repo. Flag all of these as needs-verification rather than asserting on them.
