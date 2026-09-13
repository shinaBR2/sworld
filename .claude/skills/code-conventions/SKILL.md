---
name: code-conventions
description: Enforces general code conventions and best practices. Auto-triggers when writing or editing any TypeScript/TSX files.
user-invocable: false
---

* code-conventions: applies the repo's general TypeScript/TSX conventions and best practices.

* Rules
  * The first five rules below — ES modules, async/await, arrow functions, named exports at the bottom, params in an interface — are the absolute style law, and this skill is where they live; nothing else in the repo restates them, since a second copy is how one of them quietly becomes wrong.
  * Use ES modules only — no CommonJS `require` / `module.exports`.
  * Use `async`/`await` wherever possible, not raw promise chains.
  * Use arrow functions only, never a `function` declaration (`const method = async () => …`).
  * Use named exports at the bottom of the file — no default exports, no inline `export const` — with the export statement the last thing in the file.
  * Put a method's params in an interface, so its signature stays on one line instead of many.
  * Biome enforces what it can; check the rest by eye, since these are exactly the rules an AI-generated diff slips past.
  * Avoid barrel files (an `index.ts` that re-exports) as much as possible.
  * Never add more re-exports to an existing barrel file — instead add a `// TODO: remove barrel file` comment so it can be cleaned up later.
  * Always import directly from the source file.
  * Never export something that isn't used elsewhere — move it to a shared file if reusable, drop the `export` if it's only used within the file.
  * Never put constants inside React components or helper functions.
  * Always place constants in a dedicated constants folder/file.
  * Keep pure logic out of components — extract calculations and business rules to a dedicated file so they can be unit-tested.
  * Use a Container/Presentational split for complex components: a Container owns state, hooks, and data fetching and passes everything down as props, while a Presentational component renders purely from props (no state, no hooks, no fetching), which lets Storybook drive it with mocked props; where these files live is `frontend-ui-architecture`.
  * Avoid cross-feature imports as much as possible.
  * When a cross-feature import is unavoidable, add a `// TODO: refactor cross-feature import` comment so it can be addressed later.
  * Name files camelCase (e.g. `envConfig.ts`, `useProjectData.ts`), except React component files which use PascalCase (e.g. `ProjectCard.tsx`, `SignUpFormUI.tsx`).
  * Name components PascalCase (e.g. `ProjectCard`, `SignUpForm`).
  * Prefix hook names with `use` (e.g. `useAuth`, `useProjectData`).
  * Pure logic MUST have unit tests in the same PR.
  * Always use exact assertions (`toBe`, `toEqual`, `toStrictEqual`, and framework equivalents like Playwright's `toHaveValue` / `toHaveAttribute`).
  * Never reach for a fuzzy matcher to dodge a value you could pin — approximation (`toBeCloseTo`) and comparison (`toBeGreaterThan`, `toBeLessThan`) hide the exact value, so write `expect(items).toHaveLength(3)`, never `toBeGreaterThan(0)`.
  * Use containment (`toContain`) only to assert one part of a value you deliberately don't pin whole (one width inside a generated `srcSet`, one class inside a framework-generated `className`), never to approximate a value you could match exactly.
  * Reserve any fuzzy matcher for genuinely non-deterministic values (timestamps, random IDs), never as a way to avoid a value you could know.

* Steps
  * When writing or editing any TypeScript/TSX file, apply every rule above.
  * Check by eye the rules Biome can't enforce, since an AI-generated diff is where they slip past.
