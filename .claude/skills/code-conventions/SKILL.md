---
name: code-conventions
description: Enforces general code conventions and best practices. Auto-triggers when writing or editing any TypeScript/TSX files.
user-invocable: false
---

# Code Conventions

## The style law

These five rules are absolute, and this skill is where they live. Nothing else in the repo restates them — a second copy is how one of them quietly becomes wrong.

- **ES modules only** — no CommonJS `require` / `module.exports`.
- **`async`/`await` wherever possible** — not raw promise chains.
- **Arrow functions only** — never a `function` declaration. `const method = async () => …`
- **Named exports, at the bottom of the file** — no default exports, no inline `export const`; the export statement is the last thing in the file.
- **Params go in an interface**, so a method's signature stays on one line instead of many.

Biome enforces what it can. The rest you check by eye — these are exactly the rules an AI-generated diff slips past.

## Barrel files

- AVOID barrel files (`index.ts` that re-exports) as much as possible.
- If an existing barrel file is found, do NOT add more re-exports. Instead, add a `// TODO: remove barrel file` comment so it can be cleaned up later.
- Always import directly from the source file.

## Exports

- NEVER export something that isn't used elsewhere. If it's reusable, move it to a shared file; if it's only used within the file, drop the `export`.

## Constants

- NEVER put constants inside React components or helper functions.
- ALWAYS place constants in a dedicated constants folder/file.

## Cross-feature imports

- AVOID cross-feature imports as much as possible.
- If a cross-feature import is unavoidable, add a `// TODO: refactor cross-feature import` comment so it can be addressed later.

## Control flow

- PREFER early return over deep nesting or else blocks.
- NEVER use complex inline ternaries like `a ? (b ? c : d) : e` — extract to a function with early returns.

## Naming conventions

- **File names**: camelCase preferred (e.g. `envConfig.ts`, `useProjectData.ts`). Exception: React component files use PascalCase (e.g. `ProjectCard.tsx`, `SignUpFormUI.tsx`)
- **Component names**: PascalCase (e.g. `ProjectCard`, `SignUpForm`)
- **Hook names**: always prefixed with `use` (e.g. `useAuth`, `useProjectData`)

## Testing

- Pure logic MUST have unit tests in the same PR.
- ALWAYS use exact assertions (`toBe`, `toEqual`, `toStrictEqual`, and framework equivalents like Playwright's `toHaveValue` / `toHaveAttribute`).
- NEVER use a fuzzy, range, or substring matcher when the exact value is known — approximation (`toBeCloseTo`), comparison (`toBeGreaterThan`, `toBeLessThan`), and containment (`toContain`) all hide the value you meant to assert. `expect(items).toHaveLength(3)` — not `toBeGreaterThan(0)`.
- Only use them for genuinely non-deterministic values (timestamps, random IDs) — never as a way to avoid pinning down a value you could know.
