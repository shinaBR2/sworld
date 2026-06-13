---
name: code-conventions
description: Enforces general code conventions and best practices. Auto-triggers when writing or editing any TypeScript/TSX files.
user-invocable: false
---

# Code Conventions

> **sworld's `CLAUDE.md` conventions take precedence where they differ:** ES modules only; arrow functions only (never `function` declarations); all exports named and placed at the **bottom** of the file. Anything below that conflicts defers to those rules.

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
- ALWAYS use exact assertions (`toBe`, `toEqual`, `toStrictEqual`).
- NEVER use fuzzy matchers (`toBeCloseTo`, `toContain`) when the exact value is known.
- Only use fuzzy matchers for genuinely non-deterministic values (timestamps, random IDs).
