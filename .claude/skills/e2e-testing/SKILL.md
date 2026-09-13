---
name: e2e-testing
description: The rules for this repo's Playwright e2e tests — locate by accessibility only, mock the server and test the frontend's behaviour against known data, and run headless like CI. Auto-triggers when writing or editing any spec or support file under an app's e2e/ directory.
user-invocable: false
---

* e2e-testing: writes and edits this repo's Playwright e2e specs so they prove the built frontend behaves correctly for a user.

* Rules
  * Each app's e2e suite exists to prove the built frontend behaves correctly for a user — the right page renders, a route change works, a click updates the screen — so keep specs lean and smoke-level, leaving detailed component states to Storybook.
  * Locate elements by accessibility only — `getByRole`, `getByLabel`, `getByText` — never a CSS class, `data-testid`, xpath, or DOM traversal, which bind the test to implementation detail.
  * When an element has no accessible handle, fix the component (prefer a native semantic element for its free role and keyboard behaviour; add an `aria-label` or `role` only when native semantics can't express it) rather than slapping a `role` on a generic `div`.
  * Assert exact values (`{ exact: true }`, `toHaveText`, `toHaveValue`); `code-conventions` owns the exact-vs-fuzzy matcher rule and it applies here unchanged.
  * The server is always mocked — a seeded fake auth session plus `page.route()` intercepts answering the app's queries with fixed data — and the test asserts the frontend does the right thing given known-correct data.
  * Never point a spec at a live backend, because whether the real server returns correct data is the backend's problem, not an e2e test's, and a live backend makes the test slow, flaky, and about the wrong layer.
  * When a write must change what a later read returns, make the mock stateful (update its state on the mutation) so the refetch sees the new value, since a static mock will fight optimistic updates.
  * Run headless by default, because CI runs headless and that is the environment that has to pass; a headed browser is only a debugging convenience, never the target.
  * Never run two e2e builds at once on the same machine — the preview server binds a fixed port and parallel runs collide.
  * Keep the mock constants in step with the e2e build's `VITE_*` values, because the fake session only works if its audience and client id match what the build baked in.
  * Run the suite through the app's own e2e script, which builds and serves the mock bundle itself, never a hand-started dev server.

* Steps
  * Build the spec against a real production bundle with fixed mock `VITE_*` values, served locally by the Playwright config — no deployed environment, no real backend.
  * Seed a well-formed fake Auth0 session into `localStorage` before any app script runs, so the app boots signed-in with no Auth0 network call.
  * Intercept the Hasura endpoint with `page.route()`, answering each query with deterministic data (a fixed fixture for a read-only spec, or data drawn from the mock's own state where a write must be reflected) and aborting external hosts (auth, error tracking) so a stray request can't flake the run.
