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

# Stack security review

A repeatable, stack-aware security review for a product that holds sensitive user data. The goal is
**durable, high confidence in our security posture** — not a checkbox pass. Use it to review a diff,
a single layer, or the whole stack.

## Why this exists — the threat model

Three ideas drive everything below.

1. **Defence-in-depth.** No single layer is the only gate. Auth0 proves *who* you are; Hasura
   decides *what you can touch*; Hono guards the *business-logic* boundary; the SPA is display-only
   and trusts nothing. A review asks, at every layer, "if the layer above failed, does this one
   still hold?"
2. **AI-assisted vulnerability chaining.** Attackers — increasingly with AI help — chain small,
   individually-minor weaknesses into real exploits. **Review for chains, not just isolated bugs.**
   The most valuable output is often a multi-step path, not a single line.
3. **Calibrate to real, in-context exploitability — this is what makes the review trusted.** Before
   you write a finding, name the *actual* exploit path through *this* stack. If you can't, it's
   hardening, not a vulnerability — say so. A confident-but-wrong "CRITICAL" is worse than a missed
   "Low": it burns the reviewer's credibility and wastes an engineer's day. Our own first audit
   flagged ~20 Hasura tables as a CRITICAL cross-tenant leak; they were a deliberate, correct pattern
   (see "Known false positives"). Understand the platform deeply enough to tell a real hole from a
   scary-looking config, and separate **real vulnerabilities** from **defence-in-depth hardening** in
   every report.

A weakness rarely stays local — but neither does a false alarm. Trace where it reaches, and be
honest about whether it reaches anywhere at all.

## The stack and its five trust boundaries

Everything below lives in **one repo** — the frontends, the Hono backend (`apps/backend`) and the
Hasura metadata/migrations (`apps/hasura`) are all workspace packages of the same monorepo, on one
root `pnpm-lock.yaml`. A review can read every layer without leaving the checkout.

```
Browser SPA ──Auth0 JWT (Bearer)──▶ Hasura ──admin secret (bypasses RLS)──▶ Postgres
  (apps/<app>)                   (apps/hasura)   │
                                                 └──x-webhook-signature──▶ Hono
External webhooks ──signature header─────────────────────────────────────▶ (apps/backend)
```

| # | Boundary | Mechanism | The core question |
|---|----------|-----------|-------------------|
| 1 | Browser ↔ Hasura | Auth0 JWT, validated by Hasura via JWKS; `x-hasura-role` / `x-hasura-user-id` come from JWT claims | Is every row scoped to the caller's identity, and does role come only from the verified token? |
| 2 | Hasura ↔ Hono | Shared secret in the `x-webhook-signature` header | Does every Hono route that needs it verify it, **constant-time**, before doing anything? |
| 3 | Hono ↔ Hasura | `x-hasura-admin-secret` — **bypasses all row-level permissions** | Does Hono authorise the caller *before* using admin access to read/mutate? |
| 4 | SPA bundle | Vite build — everything shipped is public | Is anything secret sitting behind a `VITE_` prefix or in client code? |
| 5 | Backend host ingress / IAM | Host networking + IAM (Hono is internet-reachable **by design** — Hasura Cloud is off-host) | The gate is the signature (boundary 2), not IAM — so: is it robust, and are any secrets committed? |

Keep these straight — most real findings are a confusion *between* boundaries (e.g. trusting a
client-supplied header as if it were a Hasura-set session variable).

## Scope: review live code only

Review the live stack, all of it inside this repo: the frontend apps under `apps/<app>`, the shared
`packages/core` / `packages/ui`, the Hono backend under `apps/backend`, and the Hasura metadata and
migrations under `apps/hasura`. The old `sworld-backend` / `sworld-hasura-v2` repos are the
pre-consolidation copies — never review or cite them; they are not what deploys.

Dependencies are **out of scope here**: one root `pnpm-lock.yaml` covers every app and package,
including the backend, and the `supply-chain-security` skill owns that whole layer (pinning,
lockfile hygiene, cooldown, lifecycle scripts). Point at it rather than re-deriving it.

**Ignore — and never report findings against — dead or unmaintained code.** If a path predates the
current architecture, isn't maintained, and isn't deployed, its patterns are *not* how the live
system behaves; when a finding depends on dead code, discard it. Note that live JWT claims are minted
by an **Auth0 Post-Login Action** (configured in the Auth0 tenant, not in this repo), so don't infer
how roles are issued from any in-repo claim-shaping code.

## How to run a review

1. **Scope it.** A branch/diff, one layer, or the full stack. For a diff, map each changed file to
   its layer and the boundary it sits on.
2. **Go layer by layer.** Work the checklist below; open the matching `references/` file for the
   depth and the known traps on that layer.
3. **Trace the chains.** For each weakness, ask: what does this unlock *combined* with another
   finding? Write the chain down — that's the part a generic review misses.
4. **Verify before asserting — name the exploit path.** For every finding, state the concrete steps
   an attacker takes through *this* stack. If you can't trace one, it's hardening, not a vuln. Rule
   out the cheap ways to be wrong: dead code (below), config that only applies to local
   docker-compose rather than production Hasura Cloud, a Hasura `filter: {}` whose root fields are
   disabled (`references/hasura-authorization.md`), or a layer that's intentionally open because a
   *different* layer is the gate (e.g. Hono is reachable from the internet by design — the signature
   is the gate, not host IAM). Label every finding's confidence: **confirmed** (you traced the path),
   **needs-verification** (likely, but depends on host / Auth0 / prod state not in the repo), or
   **defence-in-depth** (not exploitable now, but removes a layer). Then check it against the **Known
   false positives** list before you write it down.
5. **Report** using the output format at the end, keeping real vulnerabilities and hardening separate.

## Per-layer checklist

Each line is a check; the reference file has the *why*, the correct pattern in our code, and the
specific traps. Don't just pattern-match — understand the boundary.

### Auth0 & JWT → `references/auth0-and-jwt.md`
- [ ] Roles and `x-hasura-user-id` come only from the **verified JWT**, never a client-supplied header.
- [ ] Hasura validates the JWT via JWKS (issuer, audience, expiry, signature) — not a static shared key.
- [ ] Token storage and refresh in the SPA match the SDK's safe defaults; logout clears identity everywhere.
- [ ] No authorisation decision is made from claims decoded **client-side** (they're display-only there).

### Hasura authorisation → `references/hasura-authorization.md`
- [ ] Read each `select` permission as **(root-field exposure × row filter)** together. A `filter: {}`
      with `query_root_fields: []` is the deliberate relationship-only pattern, **not** a leak; a `{}`
      filter on a table whose root fields are *exposed* is the real leak. (Don't flag `filter: {}` on sight — read `query_root_fields` next.)
- [ ] Entry-point (root-exposed) tables scope rows to `x-hasura-user-id` or a stakeholder relationship.
- [ ] Relationship-only tables are gated on every inbound path (filtered parents; no mutation `returning` vector).
- [ ] Sensitive columns (roles, internal flags, tokens) are column-restricted per role.
- [ ] **Production hardening** (not launch-blocking, label needs-verification): introspection restricted, query depth + rate limits, `dev_mode` off, no unintended unauthenticated role.
- [ ] Action permissions don't hand a role more than it should reach; Hono re-authorises action inputs.

### Hono backend → `references/hono-backend.md`
- [ ] Every route that a shared secret is meant to gate verifies it **constant-time** (`crypto.timingSafeEqual`) — not `===`/`!==`. The Hashnode webhook validator is the in-repo reference pattern; the Hasura one is not.
- [ ] Each router is mounted behind the gate it needs. Action routers deliberately skip the webhook signature — establish what *does* authenticate them before concluding either way.
- [ ] User identity is read from Hasura-set `session_variables`, never from a client-controllable header.
- [ ] Admin-secret calls to Hasura are preceded by an explicit authorisation/ownership check.
- [ ] Inputs are validated (Zod) before use; no raw SQL, dynamic query strings, or shelling out.
- [ ] Errors and logs never leak secrets, stack traces, or internal detail to the client (redaction in place).
- [ ] CORS, if present, is an explicit allow-list — not a wildcard with credentials.

### Frontend SPA → `references/frontend-spa.md`
- [ ] No secret behind a `VITE_` prefix or in client code (admin secret, client *secret*, service keys). Public values (Auth0 clientId/domain/audience, API URLs, publishable analytics keys) are fine.
- [ ] No XSS sink: `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, or `javascript:` URLs fed untrusted input.
- [ ] A Content-Security-Policy is set (the main gap today); other headers (`X-Frame-Options`, `nosniff`, HSTS) present.
- [ ] Tokens/PII aren't hand-written to `localStorage`/logs outside the Auth0 SDK's managed cache.

### Infra / backend host → `references/infra-cloud-run.md`
- [ ] Hono being internet-reachable is **by design** (Hasura Cloud is off-host, can't present the host's identity) — so the real check is that the `X-Hasura-Signature` gate is robust (boundary 2), not "why no IAM". Tightening ingress is hardening, not a vuln.
- [ ] **No committed secrets** — the one genuinely high-severity infra check. Scan `.env*` (real values), service-account JSON, private keys, connection strings. Only `.example` templates in git.
- [ ] CI auth uses short-lived/federated credentials rather than long-lived static deploy keys: a real hardening item — severity tracks the key's blast radius (prod deploy). Not launch-blocking; not over-engineering.
- [ ] Container non-root (`USER`): good practice; marginal in a sandboxed runtime — Low hardening.
- [ ] Secrets injected via the host's secret manager / deploy config; rotation documented.

## Known trap patterns (grounded in this codebase)

Fast greps to start a sweep — each maps to a checklist item above. **A hit is a *lead*, not a
verdict** — every one has a benign explanation in this stack, so confirm against the reference file
and the false-positives list before writing it up.

- Secret/signature compared with `===`/`!==` instead of `crypto.timingSafeEqual` (boundary 2).
- `filter: {}` on a `select` permission — then **immediately read `query_root_fields`**: `[]` = the safe relationship-only pattern; exposed = a real lead (boundary 1).
- `import.meta.env.VITE_` on anything that looks like a secret; the literal admin secret anywhere under an app's `src` (boundary 4).
- `dangerouslySetInnerHTML`, `.innerHTML =`, `eval(`, `new Function(` with non-constant input.
- `x-hasura-admin-secret` used in a Hono handler with no preceding ownership/authorisation check (boundary 3).
- A route reading `x-hasura-role` / `x-hasura-user-id` from request **headers** rather than the Hasura-provided `session_variables` body (boundary 1↔2 confusion → privilege escalation).
- A router mounted with no signature middleware that still trusts `session_variables` from the body — the body is only Hasura-attested if *something* proved the request came from Hasura (boundary 2).
- Hasura metadata hardening (judge against **production**, not local): introspection on, empty `api_limits.yaml`, `HASURA_GRAPHQL_DEV_MODE: "true"`.

## Known false positives in this stack

These have all been flagged before and are **not** vulnerabilities. Check here before you cry wolf —
this list is the distilled memory of corrections from engineers who know the stack.

- **`filter: {}` on a child table with `query_root_fields: []`.** The deliberate relationship-only
  pattern — gated by its filtered parent. *Real* only if root fields are exposed, or an inbound
  relationship comes from an unfiltered parent. See `references/hasura-authorization.md`.
- **Hono / a webhook being publicly invokable on the backend host.** By design — Hasura Cloud is
  off-host and can't present the host's identity, so the signature / auth header is the
  intended gate. Review the gate's robustness, not the public reachability.
- **Local `apps/hasura/docker-compose.yaml` settings** (`postgrespassword`, `DEV_MODE: "true"`, permissive CORS).
  That's the dev stack. Only a finding if the same holds in production Hasura Cloud / the backend host.
- **Dead code.** Unmaintained, undeployed paths are not how the live system behaves. Anything read
  from them (e.g. code hard-coding a role) does not reflect production.
- **Auth0 `cacheLocation: localstorage` + public `VITE_AUTH0_*` values.** Standard SPA config; the
  clientId/domain/audience are designed to be public. The token-in-localStorage *chain* matters only
  alongside an actual XSS sink — which is why CSP is hardening, not an active hole today.
- **Introspection / rate limits / non-root container / static deploy key.** Real hardening items, but
  information-disclosure / abuse-resistance / blast-radius concerns — **not** confidentiality
  breaches. Report them as hardening with honest severity, never as CRITICAL on their own.

## Output format

Produce a report in this shape. Keep it scannable; lead with impact.

```
# Security review — <scope>

## Summary
<2–3 sentences: overall posture read, and counts by severity>

## Vulnerabilities <only findings with a real, traced exploit path>
### [CRITICAL|HIGH] <short title>
- **Layer / boundary:** <Auth0 | Hasura | Hono | Frontend | Infra> · boundary <#>
- **Location:** <file:line, or "production Hasura Cloud config — not in repo">
- **What & why it matters here:** <the weakness, in concrete terms — whose data, which boundary>
- **Exploit path:** <the concrete steps an attacker takes through this stack; what it unlocks alone and chained>
- **Confidence:** <confirmed | needs-verification>
- **Fix:** <concrete, minimal remediation>

## Attack chains
<1–3 multi-step paths combining findings into real impact — the part a generic review misses.
Number the steps and name the findings they use.>

## Hardening <defence-in-depth — real improvements, but no traced exploit path today>
<MEDIUM/LOW items kept deliberately separate so they're never mistaken for breaches: introspection,
rate/depth limits, CSP, non-root container, federated CI credentials. One line each: what it is, why
it helps, honest severity. Say plainly if none are launch-blocking.>

## Checked and OK
<what you verified and found sound — including config that *looks* alarming but is correct (the
relationship-only `filter: {}`, by-design public Hono, etc.), so the review is auditable.>
```

**Severity — anchored to a traced path, not how scary it looks:**
- **Critical** — unauthenticated or cross-tenant access to user data, or exposure of a secret that grants it (admin secret, signature, deploy key) — with the path demonstrated.
- **High** — an authenticated user can reach data/actions outside their scope; a trust boundary is effectively unenforced.
- **Medium / Low → the Hardening section, not Vulnerabilities.** A missing defence-in-depth layer with no current exploit path (CSP, introspection, rate limits, non-root, federated CI credentials). Real and worth doing; not a breach. If you're tempted to mark one CRITICAL/HIGH, you must be able to write its exploit path — if you can't, it's hardening.

End every review with a plain-spoken bottom line: is the posture sound, and what one or two things
most move our confidence. Don't hedge, and don't inflate — if it's solid, say so; if a chain is
real, name it; if something only *looks* dangerous, explain why it isn't.
