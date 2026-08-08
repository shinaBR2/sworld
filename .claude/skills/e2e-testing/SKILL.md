---
name: e2e-testing
description: Enforces Playwright E2E conventions — canonical locators, semantic selectors, cross-page input→navigate→consume flow, exact assertions, dynamic mocks — and how to debug a runtime-only browser error by driving a headless Playwright probe. Auto-triggers when writing or editing any *.spec.ts file under e2e/ or its helpers/mocks, or when reaching for Playwright to read the browser console for a bug with no build/lint signal.
user-invocable: false
---

# E2E Testing Conventions

Playwright E2E specs live under an app's `e2e/` directory (e.g. `apps/main/e2e/`). They cover **user journeys that interact with APIs** (fully mocked via `page.route()`): routing, auth, cross-component flows. Keep them lean — critical paths only. Component-level regression (form validation, edge cases, error states) belongs in **Storybook play functions**, not E2E (E2E has an ~8min CI timeout and is slower).

## 1. Locators — import from `e2e/locators/`, never hand-roll

The canonical locator source is the app's **`e2e/locators/`** directory. Import the finder that matches the element's **role/semantics**; do NOT write locators inline in specs.

**Choose the locator by the element's role, not by DOM convenience** — an editable input row, a read-only display row, and a table row are different roles and get different finders, each in its own module so the call site communicates intent.

When a target lacks a semantic handle, **fix the component** (add an `aria-label`/`role`), then select it — never fall back to CSS-structure selectors (`div:has(> button[aria-label=...])`), `input[value="..."]`, xpath ancestor walks, or `data-testid`. If you meet an old locator built that way, migrate it to a semantic `e2e/locators/` finder rather than copying the pattern into a new spec.

## 2. Semantic selectors only

- Query by what the **user perceives**: `getByRole`, `getByLabel`, `getByText`. Never `data-testid` or CSS class selectors (`.MuiStack-root`, `.recharts-*`, `div:has(> ...)`).
- If a target lacks a semantic handle, **fix the component** — add an `aria-label` (or `role`) to the component, then select it. Never work around it in the test with `data-testid`, `.locator('..')`, or DOM traversal. Tests drive a11y adoption, they don't cement bad patterns.
- Calculated/derived display values get `role="status"` + `aria-label` so they're both announceable and reliably targetable: `getByRole('status', { name: 'Total duration' })`.
- MUI Selects already expose `aria-label` (e.g. `Status`, `Category`) — use those.

## 3. Exact assertions, always

- Pass `{ exact: true }` to `getByText` / `getByLabel` name & presence checks **from the first draft**. Bare `getByText('Chapter One')` substring-matches and collides with accessible-name text like an svg `titleAccess="Chapter One bookmark"` → strict-mode violation. Treat bare `getByText('Name')` as a smell.
- Assert **exact values** — `code-conventions` owns the exact-vs-fuzzy matcher rule; it applies here unchanged, with Playwright's own exact matchers (`toHaveValue`, `toHaveAttribute`).
- In metric cards, assert **both the label and the value** — don't use the label only as a container anchor.
- Reuse the app's real formatters (`formatDate`, `formatNumber`, etc.) and named seed constants for expected values — no magic strings.

## 4. Cross-page = input → navigate → consume

A cross-page spec must **follow the doc's steps literally**: navigate to each input tab, verify the seeded/entered data renders there, *then* navigate to the consuming tab and assert the derived values. A spec that skips the input tabs and only asserts on the final view is a display test, not a cross-page test — it doesn't prove the pipeline.

- **Container-first scoping:** find the container (`findSectionByRegion`, a `tabpanel`, etc.) first, then locate inside it. Never bare page-level `page.getByText(...)`.
- Cover **100% of inputs** that affect a calculated output — every input field that changes the result needs a case.
- Reference pattern: follow an existing cross-page journey already in the app's `e2e/` tree.

## 5. Mocks — dynamic, no response-waiting

- Use **dynamic/stateful mocks** that mutate their state when a mutation fires (e.g. `setStatus('read')`), so query refetches return the new data — just like the real server. Static mocks overwrite optimistic updates with stale data and cause races.
- **Don't `waitForResponse`** for optimistic-rendering assertions — the point is the UI updates without the round-trip. Assert on the resulting UI state instead.
- Read the actual constants file for exact enum values — never guess.

## 6. Structure & helpers

- One folder per journey, colocating that journey's spec with its mocks.
- Put shared domain seeds, constants, and generic cross-domain helpers where the app's `e2e/` tree already keeps them — reuse the existing home, don't invent a parallel one.

## 7. Running & CI

- Run the suite through the app's **Playwright config**, which builds the mock-env preview and serves it itself. Don't point the tests at the ad-hoc dev server — it may be serving another worktree's code, and it isn't built with the mock env the specs depend on.
- Run the formatter on every touched file before pushing — the CI quality gate fails on unformatted code.
- **Never run multiple E2E builds/tests in parallel** — the preview server binds a fixed port, so parallel runs collide and flake. When fixing several E2E PRs, build/test sequentially, one worktree at a time.
- **Don't auto-rerun a flaky E2E failure** when it cancelled at an infra/setup step (`Install Playwright OS dependencies`, runner allocation, network) and the PR doesn't touch test code — that's noise, not a real failure.

## 8. Debugging a runtime-only browser error

When a bug only shows in the browser console (not in any build/lint log) and the Claude Chrome extension isn't connected, drive Playwright headlessly to read the console yourself instead of guessing — it's already a dep. Pattern (a throwaway `probe.mjs` inside the app dir so `@playwright/test` resolves; `pnpm exec playwright install chromium` first):

```js
import { chromium } from '@playwright/test';
const b = await chromium.launch(); const p = await b.newPage();
const errs = [];
p.on('pageerror', e => errs.push(e.message));
p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
await p.goto('http://localhost:3001/', { waitUntil: 'load', timeout: 30000 });
await p.waitForTimeout(4000); await b.close();
console.log('MATCH=', errs.filter(e => /createTheme/i.test(e)).length, 'TOTAL=', errs.length);
```

**Always reproduce the baseline first** — run the probe against the broken state and confirm it detects the error — before trusting a "0 errors" result on a fix. Delete the probe file before committing. This technique is often used to confirm dist/HMR-staleness bugs, where a change silently doesn't take effect in the running dev server.
