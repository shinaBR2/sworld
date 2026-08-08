---
name: e2e-testing
description: The rules for this repo's Playwright e2e tests — locate by accessibility only, mock the server and test the frontend's behaviour against known data, and run headless like CI. Auto-triggers when writing or editing any spec or support file under an app's e2e/ directory.
user-invocable: false
---

# E2E Testing

E2E specs live under an app's `e2e/` directory (`apps/main/e2e/`, `apps/listen/e2e/`) and run on Playwright. They exist to prove one thing: **the built frontend behaves correctly for a user** — the right page renders, a route change works, a click updates what's on screen. Keep them lean and smoke-level; detailed component states belong in Storybook, which is faster and closer to the component.

Three rules hold for every spec.

## 1. Locate by accessibility, nothing else

Query only what the user can perceive: `getByRole`, `getByLabel`, `getByText`. Never a CSS class, `data-testid`, xpath, or DOM traversal — those bind the test to implementation detail and break on any refactor that doesn't change behaviour.

If an element has no accessible handle, **fix the component** — give it an `aria-label` or a `role` — then select it. The test drives accessibility into the app; it never works around a missing handle.

Assert exact values (`{ exact: true }`, `toHaveText`, `toHaveValue`). `code-conventions` owns the exact-vs-fuzzy matcher rule and it applies here unchanged.

## 2. Mock the server; test the frontend, not the data

The server is always mocked — a seeded fake auth session plus `page.route()` intercepts that answer the app's queries with fixed data. The test then asserts the frontend does the right thing **given known-correct data**.

Whether the real server returns correct data is the backend's problem, not an e2e test's. Never point a spec at a live backend: it makes the test slow, flaky, and about the wrong layer. If a write must change what a later read returns, make the mock stateful (update its state on the mutation) so the refetch sees the new value — a static mock will fight optimistic updates.

## 3. Headless, the way CI runs

Run headless by default — CI runs headless, so that's the environment that has to pass. A headed browser is only ever a debugging convenience, never the target. Don't run two e2e builds at once on the same machine: the preview server binds a fixed port and parallel runs collide.

## How a spec is wired

The build under test is a real production bundle built with fixed mock `VITE_*` values and served locally by the Playwright config — no deployed environment, no real backend:

- **Auth is seeded, not performed.** A well-formed fake Auth0 session is written into `localStorage` before any app script runs, so the app boots signed-in with no Auth0 network call.
- **The API is intercepted.** `page.route()` on the Hasura endpoint returns a fixed fixture per query; external hosts (auth, error tracking) are aborted so a stray request can't flake the run.
- **Keep the mock constants in step with the e2e build's `VITE_*` values** — the fake session only works if its audience and client id match what the build baked in.

Run the suite through the app's own e2e script, which builds and serves the mock bundle itself. Don't point it at a hand-started dev server — that isn't the mock build the specs depend on.
