# Security review — illustrations and report shape

## The request flow across the five boundaries

Everything lives in **one repo** — the frontends, the Hono backend (`apps/backend`) and the Hasura
metadata/migrations (`apps/hasura`) are all workspace packages of the same monorepo, on one root
`pnpm-lock.yaml`. A review can read every layer without leaving the checkout.

```
Browser SPA ──Auth0 JWT (Bearer)──▶ Hasura ──admin secret (bypasses RLS)──▶ Postgres
 (apps/<app>)                    (apps/hasura)
                                      │
                                      └──x-webhook-signature──▶ Hono
External webhooks ──signature header────────────────────────▶ (apps/backend)
```

## Report shape

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
