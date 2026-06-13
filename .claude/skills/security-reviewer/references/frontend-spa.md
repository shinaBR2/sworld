# Frontend SPA — boundary 4 (everything shipped is public)

The `apps/<app>` frontends are Vite/React 18 SPAs. The build is downloaded and readable by anyone,
so the frontend is a **display and input layer only** — it enforces nothing and holds no secret.
Review it for two things: what it *leaks* (secrets, tokens) and what it lets an attacker *inject* (XSS).

## How it's wired (live)

- Env via `import.meta.env.VITE_*`, surfaced through `apps/<app>/src/lib/constants/config.ts`.
  **Every `VITE_`-prefixed value is bundled into client JS and is public.**
- Auth0 + token flow: `references/auth0-and-jwt.md`. Tokens live in the Auth0 SDK's `localStorage`
  cache; the GraphQL client attaches them as `Bearer` (`apps/<app>/src/lib/api/hasuraClient.ts`).
- Build: `vite.config.ts` sets `sourcemap: false` for production (no source maps shipped).
- Hosting headers: the host's static-headers config (e.g. a `_headers` file) sets `X-Frame-Options:
  DENY`, `X-Content-Type-Options: nosniff`, HSTS, `Referrer-Policy` — but **no Content-Security-Policy**.

## The VITE_ split — public vs leak

**Legitimately public** (safe to ship): `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`,
`VITE_AUTH0_AUDIENCE`, `VITE_API_URL`, `VITE_HASURA_URL`, `VITE_APP_*`, `VITE_POSTHOG_KEY` (a
publishable client key), `VITE_INTERCOM_APP_ID`, help/URL config. Auth0 *clientId* and *domain* are
designed to be public; the SPA OAuth flow doesn't use a client secret.

**Would be a leak** (must never be `VITE_`): the Hasura **admin secret**, an Auth0 **client
secret**, any backend shared secret, service-account keys, DB credentials, email/payment-provider
API keys. These belong only in the backend/Hasura server env. The admin secret correctly
appears *only* in `apps/<app>/codegen.ts`, which runs in Node at build time via
`process.env.HASURA_ADMIN_SECRET` — it is **not** `VITE_`-prefixed and never reaches the bundle.

## Checks

- [ ] Inventory every `import.meta.env.VITE_*` use and every `VITE_` var in `.env*`. Each value is
      public — confirm none is a secret. The litmus test: "would I paste this in a public Slack?"
- [ ] The literal admin secret / any server secret never appears under `apps/<app>/src`. Build-time
      use in `codegen.ts` via non-`VITE_` `process.env` is fine.
- [ ] No XSS sink fed untrusted input: `dangerouslySetInnerHTML`, `.innerHTML =`, `eval`,
      `new Function`, or an `href`/`src` that could become a `javascript:` URL. React escapes by
      default — these are the ways out of that safety. Calibrate the hit: the known `.innerHTML` in
      the `main.tsx` root-mount error fallback fires only when the whole React tree fails to mount,
      with a string from JS internals (not user input) — a **Low**, fix-to-`textContent` item, not an
      exploitable XSS. A sink fed *user/URL* input is a different severity entirely.
- [ ] Reflected values (query params, hash, path) are mapped through a safe lookup, not rendered raw.
      An auth callback route that maps the `error` param through a table — good pattern.
- [ ] *Hardening:* a **Content-Security-Policy** is set. The primary XSS defence is not adding sinks
      in the first place (above) — CSP is the **backstop** that limits damage if one slips in or a
      third-party script is compromised. It matters here because tokens live in `localStorage`, so an
      injected script could read one. But with no XSS sink today, this is **defence-in-depth, not an
      active hole** — report it as hardening, not a breach.
- [ ] Tokens/PII aren't hand-written to `localStorage`/`sessionStorage`/`console` outside the Auth0
      SDK cache. Analytics `identify` calls send only id/email/name, gated to production.
- [ ] Production source maps stay off (`sourcemap: false`) so internal structure isn't shipped.

## Traps specific to us

- **"It's just a config value."** A `VITE_` var feels like server config but ships to every browser.
  The danger is the *future* leak — someone adds `VITE_SOME_API_KEY` for convenience and it's public
  the moment it builds. Treat any new `VITE_` var as a publication decision.
- **No-XSS-today is a moving target.** The bundle is clean now, but every new
  `dangerouslySetInnerHTML` (e.g. to render rich text / markdown / a chart label from user input)
  reopens the path to the `localStorage` token. Pair any such addition with sanitisation *and* lean
  on CSP as the backstop.
- **The token-storage chain.** `localStorage` token + no CSP + a future XSS = full account takeover.
  None of the three is alarming alone; the chain is the finding. This is the canonical frontend
  chain to write up.

## Can't be verified from the repo

Whether the production host actually serves the `_headers` file and any CSP, the real
`VITE_POSTHOG_KEY`/`VITE_INTERCOM_APP_ID` values in the hosting dashboard, and third-party script
provenance (PostHog/Intercom/Auth0 CDNs). Confirm headers against a live response.
