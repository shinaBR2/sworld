# Infra / hosting — boundary 5 (who can reach the backend)

The network, IAM, secrets, and CI layer. Most enforcement lives in the hosting / CDN / Hasura
consoles, **not** the repo — so this layer is mostly **needs-verification** and **hardening**, with
one genuinely high-severity check (committed secrets). Don't manufacture CRITICALs from defaults you
can't see; say what to confirm in the console.

## How it's wired (live, from the repo)

- **Topology:** Frontends (Cloudflare Pages, each app its own project) → Hasura Cloud → the Hono backend
  → back to Hasura via the admin secret. Postgres sits behind Hasura; the backend never talks to it
  directly. All three layers are **one repo** now — frontends under `apps/<app>`, the backend under
  `apps/backend`, Hasura metadata and migrations under `apps/hasura` — but they still deploy to
  three separate places, so "same repo" does **not** mean "same trust zone".
- **Deploy:** Cloudflare Pages builds and deploys each frontend from its own pipeline on merge to
  main; Hasura Cloud applies metadata from its GitHub integration. **The backend's container build
  and deploy pipeline is mid-rework** — the old per-repo deploy workflows are gone and the
  replacement isn't in place yet. Don't describe backend deploy mechanics as though they exist, and
  don't infer them from leftover files.
- **Secrets:** backend / Hasura runtime env (set in their consoles) + CI secrets. Only `.example`
  templates are committed. Note the backend's `envConfig.ts` does **not** validate at boot (see
  `hono-backend.md`), so a missing secret shows up at request time, not startup.
- **Container:** the `apps/backend/Dockerfile.*` files are **stale** — they still `COPY
  package-lock.json` and `npm ci`, from before the repos merged onto a single root `pnpm-lock.yaml`,
  so they can't build as written. Treat them as pending work, not as evidence of how the runtime
  image is built; a finding about their contents is about a file nobody deploys.

## The invocation model — get this right

A backend host typically applies **two independent gates**: network *ingress* (who can reach the
URL) and *IAM* (does the caller hold an invoke permission). Confirm whether the deploy constrains
either; many setups leave the service publicly invokable.

Here's the part a naive review gets wrong: **Hasura runs on a different host, so it cannot present
the backend host's identity token.** For Hasura to call the backend at all, the backend must accept
unauthenticated (IAM-wise) requests — i.e. it is *intentionally* publicly invokable. That's not a
misconfiguration; it's the consequence of the architecture. The real authentication happens at the
**application layer**: the `x-webhook-signature` header (boundary 2, `hono-backend.md`).

So the review question is **not** "why is this publicly invokable?" — it's:

- [ ] Is the signature gate robust and on every route? (That's where the security actually lives —
      review it in `hono-backend.md`, and weight it heavily *because* the network is open by design.)
- [ ] *Hardening:* could ingress still be tightened (e.g. internal networking + a load balancer, or
      an allow-list of Hasura's egress IPs) to shrink the attack surface in front of the signature
      check? Worth raising as defence-in-depth — **not** as a vuln, and not launch-blocking.

## Checks

- [ ] **No committed secrets — the one high-severity infra check.** Scan `.env*` (real values, not
      `.example`), `*.json` service-account keys, `BEGIN PRIVATE KEY`, connection strings with
      embedded passwords. Today only templates are committed. A committed secret is genuinely
      **Critical** — rotate immediately (don't just delete; git history retains it).
- [ ] **One repo = one blast radius.** Frontends, backend and data layer now share a checkout, a CI
      runner and a root `pnpm-lock.yaml`. A compromised dependency or a workflow with too-broad
      permissions reaches all three at once, where it used to reach one. Check that workflow
      `permissions:` blocks are least-privilege and that any deploy credential is scoped to its own
      target. The dependency half of this belongs to the `supply-chain-security` skill — send it there
      rather than re-deriving lockfile rules here.
- [ ] **CI auth to the host — long-lived deploy key vs federated CI credentials.** A long-lived
      static key/JSON credential is a standing credential that can leak; **federated CI credentials**
      (OIDC, e.g. GitHub Actions → cloud provider) issue short-lived, run-scoped tokens with no key
      to manage. This is the documented best practice (≈15-min setup), **not** over-engineering. But
      be honest on severity: it's **hardening whose blast radius is prod-deploy access** — a powerful
      *chain amplifier* if the repo/CI is compromised, not an exploit on its own. Not launch-blocking.
      If a static key stays, confirm least-privilege scopes (only what the deploy needs) and a
      rotation schedule.
- [ ] **Non-root container.** No `USER` directive → runs as root. Worth fixing, but calibrate
      against the container runtime: if instances run in a sandbox, the marginal risk of in-container
      root is lower than on shared/raw infra. **Low** hardening — and while the Dockerfiles are being
      reworked, raise it as an input to that work rather than as a live finding.
- [ ] **Secret hygiene & transport.** Secrets from the host's console / secret manager, not the repo;
      rotation for `WEBHOOK_SIGNATURE`/`HASURA_ADMIN_SECRET`/`HASHNODE_WEBHOOK_SECRET`/vendor keys
      documented; all hops HTTPS (the host and Hasura terminate TLS).
- [ ] **Public surfaces.** `/hz` (health) and any external webhook endpoint are intentionally public —
      confirm `/hz` leaks nothing useful and the webhook verifies its signature constant-time.
- [ ] **Local-only credentials aren't production.** The `postgrespassword` in
      `apps/hasura/docker-compose.yaml` is the dev stack — never a production finding.

## Traps specific to us

- **"Publicly invokable" is not automatically a finding here.** It's forced by Hasura running on a
  different host that can't present the backend host's identity. Flagging it as a vuln is the infra
  equivalent of the `filter: {}` false positive — it reads a default without the architecture.
  Review the signature gate instead.
- **Absence ≠ safety, but absence ≠ breach either.** Ingress/IAM/prod-env/Postgres-SSL/network
  config live in the host consoles. A silent repo means **needs-verification**, not "fine" *and* not
  "Critical". Name what to check in the console and label confidence honestly.
- **Static deploy key as a chain link.** Low on its own; a strong amplifier combined with a repo/CI
  compromise. Write it up as a chain enabler in the Hardening section, with that framing.

## Can't be verified from the repo

Host IAM bindings and ingress, real prod env vars, Postgres SSL/connection config, network peering,
Hasura's exposure, deploy-key rotation. Lead every finding here with its confidence label.

**Sources:** [Federated CI credentials — OIDC for GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
