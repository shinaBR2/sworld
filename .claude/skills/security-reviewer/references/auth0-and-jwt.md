# Auth0 & JWT — boundary 1 (identity)

How we prove *who* a caller is. Auth0 issues a JWT; Hasura trusts it; everything downstream
inherits that identity. If this boundary is wrong, every row permission below it is built on sand.

## How it's wired (live)

- **SPA SDK:** `@auth0/auth0-react`. Provider configured in
  `apps/<app>/src/lib/auth/AuthProvider.tsx` from `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`,
  `VITE_AUTH0_AUDIENCE` (all legitimately public — see `references/frontend-spa.md`).
- **Token acquisition:** `getAccessTokenSilently()`, registered globally so the GraphQL client can
  attach it (`apps/<app>/src/lib/api/hasuraClient.ts`). Refresh tokens enabled; cache in
  `localStorage` (the SDK's standard SPA mode).
- **Attachment:** `Authorization: Bearer <token>` on HTTP, and via WebSocket `connectionParams`
  for subscriptions.
- **The claims:** the JWT carries Hasura claims under the `https://hasura.io/jwt/claims` namespace
  — `x-hasura-user-id`, `x-hasura-default-role`, `x-hasura-allowed-roles`. **These are minted by an
  Auth0 Post-Login Action in the Auth0 tenant, not by code in this repo.** You cannot audit the
  claim-minting logic from the repo — treat it as a documented assumption to verify in Auth0.
- **Validation:** Hasura validates the token via JWKS (`HASURA_GRAPHQL_JWT_SECRET` pointing at
  Auth0's JWKS URL). See `references/hasura-authorization.md`.

## What good looks like

- Authorisation identity (`x-hasura-user-id`, role) is established **only** from a JWT whose
  signature, issuer (`iss`), audience (`aud`), and expiry Hasura has verified via JWKS.
- The SPA decodes the JWT only to *display* state (e.g. show the user's role in the UI). Decoded
  client-side claims are never a security decision — the browser can forge them; only Hasura's
  server-side validation counts. `apps/<app>/src/lib/auth/helpers.ts` decodes claims; confirm
  every use is cosmetic.
- Logout clears identity everywhere it leaked: Auth0 session **and** any analytics identity
  (`tracker.reset()` in `AuthProvider.tsx`), so a shared machine doesn't carry identity across users.

## Checks

- [ ] Hasura's JWT config validates signature **and** `aud` **and** `iss` **and** expiry — not just
      signature. A missing audience check lets a token minted for another Auth0 API be replayed here.
- [ ] `x-hasura-allowed-roles` / `x-hasura-default-role` are set by the Auth0 Action from a trusted
      source (the DB `hasura_role`), so a user can't request a role they shouldn't have via
      `x-hasura-role`. Hasura only honours a requested role if it's in the token's allowed list — so
      the allowed list in the token is the real gate. Verify what the Action puts there.
- [ ] No code path establishes identity from a request **header** the client controls (e.g. reading
      `x-hasura-user-id` off an inbound header). Identity must come from the validated token (browser
      side) or Hasura-set `session_variables` (Hono side).
- [ ] Token lifetime is sane; refresh-token rotation is on; access tokens aren't unusually long-lived.
- [ ] `offline_access` / refresh tokens in `localStorage` are an accepted SPA trade-off **only**
      because there's no XSS sink to steal them — which is why the CSP gap (frontend ref) matters here.

## Traps specific to us

- **Dead-code mirage.** Old/abandoned backend code may exist that looks authoritative — e.g. a
  claims helper that hard-codes the role to `user`. If it's **dead** (a superseded backend), the
  live claims still come from the Auth0 Action. Any finding like "the manager role is unreachable
  because claims hard-code `user`" is reading dead code — discard it and instead verify the Auth0
  Action.
- **Client-decoded claims used as a gate.** If a component decodes the JWT and gates a *sensitive*
  action on a claim (rather than relying on Hasura to reject the operation), that's a real bug — the
  browser can mint any claim it likes. The server must independently enforce.
- **Role escalation via `x-hasura-role`.** A user can ask Hasura to act as any role in their token's
  `x-hasura-allowed-roles`. If the Auth0 Action ever puts `manager` in a normal user's allowed list,
  that user becomes a manager. The allowed-roles array is the crown jewel — trace what fills it.

## Can't be verified from the repo

The Auth0 Post-Login Action, the tenant's token lifetimes, MFA/connection settings, and the exact
JWKS config live in the Auth0 dashboard. Flag these as **needs-verification** and state the
assumption the rest of the review depends on (e.g. "assumes the Action sets `allowed_roles` from the
DB `hasura_role` and nothing else").
