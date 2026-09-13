---
name: security-reviewer
description: >-
  Stack-aware security & vulnerability reviewer for this codebase — tuned to our actual
  stack: Auth0 (authentication), Hasura (authorisation, in-repo at `apps/hasura`), the Hono backend
  (in-repo at `apps/backend`), Vite/React SPA (frontend), and Postgres — all one monorepo, so a
  review can read every layer. Use whenever asked to review security, audit for
  vulnerabilities, check for security weaknesses or misconfigurations, threat-model a change, or
  assess the security posture of the app — and reach for it proactively when touching anything on a
  trust boundary: authentication, Auth0/JWT claims, Hasura permissions or metadata, role
  assignment, webhook/Action/Event handlers, the admin secret, secrets/env vars (especially
  VITE_-prefixed), CORS, or deploy config. This is the stack-specific complement to the
  generic built-in `security-review` command: that one reviews an arbitrary diff with generic
  rules; this one knows how our five trust boundaries are wired and what traps live in each.
---

* security-reviewer: a repeatable, stack-aware security review of this monorepo's five trust boundaries that gives durable, high confidence in the posture by separating real, traced vulnerabilities from defence-in-depth hardening — usable on a diff, a single layer, or the whole stack.

* Rules
  * Treat no single layer as the only gate — Auth0 proves *who* you are, Hasura decides *what you can touch*, Hono guards the *business-logic* boundary, and the SPA is display-only and trusts nothing — so at every layer ask "if the layer above failed, does this one still hold?"
  * Review for chains, not just isolated bugs — attackers, increasingly with AI help, chain small, individually-minor weaknesses into real exploits, and the most valuable output is often a multi-step path rather than a single line.
  * Calibrate every finding to real, in-context exploitability: name the *actual* exploit path through *this* stack before writing it up, and if you can't, it's hardening not a vulnerability — a confident-but-wrong "CRITICAL" burns credibility and wastes an engineer's day (our first audit flagged ~20 Hasura tables as a CRITICAL cross-tenant leak that were a deliberate, correct pattern), so separate real vulnerabilities from defence-in-depth hardening in every report.
  * Keep the five boundaries straight — most real findings are a confusion *between* them, such as trusting a client-supplied header as if it were a Hasura-set session variable.
  * The five trust boundaries, each with its mechanism and the core question it forces (request flow diagram in [`references/examples.md`](references/examples.md)):
    * Browser ↔ Hasura — Auth0 JWT validated by Hasura via JWKS, with `x-hasura-role` / `x-hasura-user-id` from JWT claims: is every row scoped to the caller's identity, and does role come only from the verified token?
    * Hasura ↔ Hono — shared secret in the `x-webhook-signature` header: does every Hono route that needs it verify it, constant-time, before doing anything?
    * Hono ↔ Hasura — `x-hasura-admin-secret`, which bypasses all row-level permissions: does Hono authorise the caller *before* using admin access to read/mutate?
    * SPA bundle — a Vite build where everything shipped is public: is anything secret sitting behind a `VITE_` prefix or in client code?
    * Backend host ingress / IAM — host networking + IAM, with Hono internet-reachable by design because Hasura Cloud is off-host: the gate is the signature (boundary 2) not IAM, so is it robust and are any secrets committed?
  * Review only live code inside this repo — the frontend apps under `apps/<app>`, the shared `packages/core` / `packages/ui`, the Hono backend under `apps/backend`, and the Hasura metadata and migrations under `apps/hasura`.
  * Never review or cite the old `sworld-backend` / `sworld-hasura-v2` repos — they are the pre-consolidation copies and are not what deploys.
  * Dependencies are out of scope here — one root `pnpm-lock.yaml` covers every app and package including the backend, and the `supply-chain-security` skill owns that whole layer, so point at it rather than re-deriving it.
  * Ignore, and never report findings against, dead or unmaintained code — if a path predates the current architecture, isn't maintained, and isn't deployed, its patterns are not how the live system behaves, so discard any finding that depends on it.
  * Don't infer how roles are issued from any in-repo claim-shaping code — live JWT claims are minted by an Auth0 Post-Login Action configured in the Auth0 tenant, not in this repo.
  * Auth0 & JWT checks (why, correct pattern, and traps in [`references/auth0-and-jwt.md`](references/auth0-and-jwt.md)):
    * Roles and `x-hasura-user-id` come only from the verified JWT, never a client-supplied header.
    * Hasura validates the JWT via JWKS (issuer, audience, expiry, signature) — not a static shared key.
    * Token storage and refresh in the SPA match the SDK's safe defaults, and logout clears identity everywhere.
    * No authorisation decision is made from claims decoded client-side (they're display-only there).
  * Hasura authorisation checks (details in [`references/hasura-authorization.md`](references/hasura-authorization.md)):
    * Read each `select` permission as (root-field exposure × row filter) together — a `filter: {}` with `query_root_fields: []` is the deliberate relationship-only pattern and not a leak, while a `{}` filter on a table whose root fields are *exposed* is the real leak, so don't flag `filter: {}` on sight but read `query_root_fields` next.
    * Entry-point (root-exposed) tables scope rows to `x-hasura-user-id` or a stakeholder relationship.
    * Relationship-only tables are gated on every inbound path (filtered parents; no mutation `returning` vector).
    * Sensitive columns (roles, internal flags, tokens) are column-restricted per role.
    * Production hardening (not launch-blocking, label needs-verification): introspection restricted, query depth + rate limits, `dev_mode` off, no unintended unauthenticated role.
    * Action permissions don't hand a role more than it should reach, and Hono re-authorises action inputs.
  * Hono backend checks (details in [`references/hono-backend.md`](references/hono-backend.md)):
    * Every route that a shared secret is meant to gate verifies it constant-time (`crypto.timingSafeEqual`), not `===`/`!==` — the Hashnode webhook validator is the in-repo reference pattern, the Hasura one is not.
    * Each router is mounted behind the gate it needs — only two routers in the backend carry a signature check at all, so for every other one establish what *does* authenticate it before concluding either way.
    * User identity is read from Hasura-set `session_variables`, never from a client-controllable header.
    * Admin-secret calls to Hasura are preceded by an explicit authorisation/ownership check.
    * Inputs are validated (Zod) before use, with no raw SQL, dynamic query strings, or shelling out.
    * Errors and logs never leak secrets, stack traces, or internal detail to the client (redaction in place).
    * CORS, if present, is an explicit allow-list — not a wildcard with credentials.
  * Frontend SPA checks (details in [`references/frontend-spa.md`](references/frontend-spa.md)):
    * No secret behind a `VITE_` prefix or in client code (admin secret, client *secret*, service keys), while public values (Auth0 clientId/domain/audience, API URLs, publishable analytics keys) are fine.
    * No XSS sink: `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, or `javascript:` URLs fed untrusted input.
    * A Content-Security-Policy is set (the main gap today), and other headers (`X-Frame-Options`, `nosniff`, HSTS) are present.
    * Tokens/PII aren't hand-written to `localStorage`/logs outside the Auth0 SDK's managed cache.
  * Infra / backend host checks (details in [`references/infra-cloud-run.md`](references/infra-cloud-run.md)):
    * Hono being internet-reachable is by design (Hasura Cloud is off-host and can't present the host's identity), so the real check is that the signature gate is robust (boundary 2) not "why no IAM", and tightening ingress is hardening not a vuln.
    * No committed secrets — the one genuinely high-severity infra check — so scan `.env*` (real values), service-account JSON, private keys, and connection strings, with only `.example` templates in git.
    * CI auth uses short-lived/federated credentials rather than long-lived static deploy keys — a real hardening item whose severity tracks the key's blast radius (prod deploy), not launch-blocking and not over-engineering.
    * Container non-root (`USER`) is good practice but marginal in a sandboxed runtime — Low hardening.
    * Secrets are injected via the host's secret manager / deploy config, with rotation documented.
  * A grep hit from the trap patterns is a *lead*, not a verdict — each has a benign explanation in this stack and maps to a checklist item above, so confirm against the reference file and the false-positives list before writing it up:
    * Secret/signature compared with `===`/`!==` instead of `crypto.timingSafeEqual` (boundary 2).
    * `filter: {}` on a `select` permission — then immediately read `query_root_fields`: `[]` is the safe relationship-only pattern, exposed is a real lead (boundary 1).
    * `import.meta.env.VITE_` on anything that looks like a secret, or the literal admin secret anywhere under an app's `src` (boundary 4).
    * `dangerouslySetInnerHTML`, `.innerHTML =`, `eval(`, `new Function(` with non-constant input.
    * `x-hasura-admin-secret` used in a Hono handler with no preceding ownership/authorisation check (boundary 3).
    * A route reading `x-hasura-role` / `x-hasura-user-id` from request headers rather than the Hasura-provided `session_variables` body (boundary 1↔2 confusion → privilege escalation).
    * A router mounted with no signature middleware that still trusts `session_variables` from the body — the body is only Hasura-attested if *something* proved the request came from Hasura (boundary 2).
    * Hasura metadata hardening judged against production not local: introspection on, empty `api_limits.yaml`, `HASURA_GRAPHQL_DEV_MODE: "true"`.
  * Check the known false positives before crying wolf — these have all been flagged before and are not vulnerabilities, and this list is the distilled memory of corrections from engineers who know the stack:
    * `filter: {}` on a child table with `query_root_fields: []` is the deliberate relationship-only pattern gated by its filtered parent — real only if root fields are exposed or an inbound relationship comes from an unfiltered parent (see [`references/hasura-authorization.md`](references/hasura-authorization.md)).
    * Hono / a webhook being publicly invokable on the backend host is by design — Hasura Cloud is off-host and can't present the host's identity, so the signature / auth header is the intended gate, and you review the gate's robustness not the public reachability.
    * Local `apps/hasura/docker-compose.yaml` settings (`postgrespassword`, `DEV_MODE: "true"`, permissive CORS) are the dev stack, and are only a finding if the same holds in production Hasura Cloud / the backend host.
    * Dead code — unmaintained, undeployed paths are not how the live system behaves, and anything read from them (e.g. code hard-coding a role) does not reflect production.
    * Auth0 `cacheLocation: localstorage` + public `VITE_AUTH0_*` values are standard SPA config, with clientId/domain/audience designed to be public, and the token-in-localStorage *chain* matters only alongside an actual XSS sink — which is why CSP is hardening not an active hole today.
    * Introspection / rate limits / non-root container / static deploy key are real hardening items but are information-disclosure / abuse-resistance / blast-radius concerns, not confidentiality breaches, so report them as hardening with honest severity and never as CRITICAL on their own.
  * Label every finding's confidence: confirmed (you traced the path), needs-verification (likely, but depends on host / Auth0 / prod state not in the repo), or defence-in-depth (not exploitable now, but removes a layer).
  * Severity is anchored to a traced path, not how scary it looks:
    * Critical — unauthenticated or cross-tenant access to user data, or exposure of a secret that grants it (admin secret, signature, deploy key), with the path demonstrated.
    * High — an authenticated user can reach data/actions outside their scope, or a trust boundary is effectively unenforced.
    * Medium / Low go to the Hardening section, not Vulnerabilities — a missing defence-in-depth layer with no current exploit path (CSP, introspection, rate limits, non-root, federated CI credentials) is real and worth doing but not a breach, and if you're tempted to mark one CRITICAL/HIGH you must be able to write its exploit path, or else it's hardening.
  * End every review with a plain-spoken bottom line — is the posture sound, and what one or two things most move our confidence — without hedging or inflating: if it's solid say so, if a chain is real name it, and if something only *looks* dangerous explain why it isn't.

* Steps
  1. Scope the review as a branch/diff, one layer, or the full stack, mapping each changed file to its layer and the boundary it sits on.
  2. Go layer by layer through the boundary checks, opening the matching reference file for each.
     * [`references/auth0-and-jwt.md`](references/auth0-and-jwt.md)
     * [`references/hasura-authorization.md`](references/hasura-authorization.md)
     * [`references/hono-backend.md`](references/hono-backend.md)
     * [`references/frontend-spa.md`](references/frontend-spa.md)
     * [`references/infra-cloud-run.md`](references/infra-cloud-run.md)
  3. Trace the chains — for each weakness, ask what it unlocks combined with another finding, and write the chain down.
  4. Verify before asserting by naming the concrete exploit path through this stack, ruling out the cheap ways to be wrong (the false positives above and each layer's reference file), and labelling the finding's confidence.
  5. Report using the shape in references, keeping real vulnerabilities and hardening separate.
     * [`references/examples.md`](references/examples.md)
