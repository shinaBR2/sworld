import type { BrowserContext, Page } from '@playwright/test';

// The journal pages are auth-gated (Auth0) and read from Hasura. This harness
// makes both deterministic and network-free so the flow can be exercised in CI
// without a real backend:
//   - seedAuth() writes a fake but well-formed @@auth0spajs@@ localStorage cache
//     so the app boots signed-in (getAccessTokenSilently + getUser resolve from
//     cache, no Auth0 network).
//   - mockJournalApi() intercepts the Hasura GraphQL endpoint and answers the
//     two journal queries with a fixed entry.
//
// The build under test is produced by `build:e2e` with fixed VITE_* values, so
// these constants MUST match that build's config (audience === hasura url,
// clientId, and the default Auth0 scope).
const CLIENT_ID = 'e2e-client-id';
const HASURA_URL = 'https://hasura.e2e.local/v1/graphql';
const AUDIENCE = HASURA_URL;
const SCOPE = 'openid profile email';
const USER_ID = '00000000-0000-0000-0000-000000000001';

// A fixed entry, date-independent so the test never depends on "today". The
// list mock always returns it; clicking it navigates to /journal/<date>, and
// the by-date mock echoes whatever date is requested.
const MOCK_ENTRY = {
  id: '11111111-1111-1111-1111-111111111111',
  user_id: USER_ID,
  date: '2026-07-04',
  content: 'E2E smoke: the journal flow renders end to end.',
  mood: 'happy',
  tags: ['e2e', 'smoke'],
  createdAt: '2026-07-04T08:00:00+00:00',
  updatedAt: '2026-07-04T08:00:00+00:00',
};

// Seeds a fake Auth0 session into the context's localStorage before any app
// script runs. The shapes mirror @auth0/auth0-spa-js@2's localStorage cache:
// a wrapped token entry keyed `@@auth0spajs@@::<clientId>::<audience>::<scope>`
// and an id-token entry keyed `@@auth0spajs@@::<clientId>::@@user@@`.
const seedAuth = async (context: BrowserContext) => {
  await context.addInitScript(
    ({ clientId, audience, scope, userId }) => {
      const b64url = (obj: unknown) =>
        btoa(JSON.stringify(obj))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
      const nowSec = Math.floor(Date.now() / 1000);
      const exp = nowSec + 86400;
      const header = { alg: 'RS256', typ: 'JWT' };
      const makeJwt = (payload: Record<string, unknown>) =>
        `${b64url(header)}.${b64url(payload)}.sig`;

      // The app parses the Hasura claims out of this access token (getClaims),
      // so it must carry the `https://hasura.io/jwt/claims` namespace.
      const accessToken = makeJwt({
        iss: 'https://auth.e2e.local/',
        aud: audience,
        sub: 'auth0|e2e',
        iat: nowSec,
        exp,
        'https://hasura.io/jwt/claims': {
          'x-hasura-default-role': 'user',
          'x-hasura-allowed-roles': ['user'],
          'x-hasura-user-id': userId,
        },
      });

      const idPayload = {
        iss: 'https://auth.e2e.local/',
        aud: clientId,
        sub: 'auth0|e2e',
        iat: nowSec,
        exp,
        name: 'E2E User',
        email: 'e2e@e2e.local',
        picture: 'https://e2e.local/avatar.png',
      };
      const idToken = makeJwt(idPayload);

      // Mirror auth0-spa-js decodeToken: `claims` is the full payload plus the
      // raw token; `user` is the payload minus the reserved OIDC claims.
      const reserved = new Set([
        'iss',
        'aud',
        'exp',
        'nbf',
        'iat',
        'jti',
        'azp',
        'nonce',
        'auth_time',
        'at_hash',
        'c_hash',
        'acr',
        'amr',
        'sub_jwk',
        'cnf',
      ]);
      const claims: Record<string, unknown> = { __raw: idToken };
      const user: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(idPayload)) {
        claims[key] = value;
        if (!reserved.has(key)) {
          user[key] = value;
        }
      }
      const [encHeader, encPayload, encSignature] = idToken.split('.');
      const decodedToken = {
        encoded: {
          header: encHeader,
          payload: encPayload,
          signature: encSignature,
        },
        header,
        claims,
        user,
      };

      const PREFIX = '@@auth0spajs@@';
      const tokenKey = `${PREFIX}::${clientId}::${audience}::${scope}`;
      const idKey = `${PREFIX}::${clientId}::@@user@@`;

      localStorage.setItem(
        tokenKey,
        JSON.stringify({
          body: {
            client_id: clientId,
            access_token: accessToken,
            id_token: idToken,
            scope,
            expires_in: 86400,
            token_type: 'Bearer',
            audience,
            decodedToken,
          },
          expiresAt: exp,
        }),
      );
      localStorage.setItem(
        idKey,
        JSON.stringify({ id_token: idToken, decodedToken }),
      );
    },
    { clientId: CLIENT_ID, audience: AUDIENCE, scope: SCOPE, userId: USER_ID },
  );
};

// Intercepts the Hasura GraphQL endpoint and answers the journal queries. Also
// aborts the external auth/error hosts so a cache miss or a stray Rollbar send
// can never make the test flaky.
const mockJournalApi = async (page: Page) => {
  await page.route(/auth\.e2e\.local|rollbar\.com/, (route) => route.abort());

  await page.route(HASURA_URL, (route) => {
    const body = route.request().postData() ?? '';

    if (body.includes('GetJournalsByMonth')) {
      return route.fulfill({
        json: {
          data: {
            journals: [MOCK_ENTRY],
            happy_aggregate: { aggregate: { count: 1 } },
            neutral_aggregate: { aggregate: { count: 0 } },
            sad_aggregate: { aggregate: { count: 0 } },
            oldest_aggregate: [{ date: MOCK_ENTRY.date }],
          },
        },
      });
    }

    if (body.includes('GetJournalByDate')) {
      let date = MOCK_ENTRY.date;
      try {
        date = JSON.parse(body).variables?.date ?? date;
      } catch {
        // keep the default date
      }
      return route.fulfill({
        json: { data: { journals: [{ ...MOCK_ENTRY, date }] } },
      });
    }

    return route.fulfill({ json: { data: {} } });
  });
};

export { mockJournalApi, MOCK_ENTRY, seedAuth };
