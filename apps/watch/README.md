# React + TypeScript + Vite

This app uses React + TypeScript + Vite. Linting and formatting are handled by Biome (replacing ESLint/Prettier across the monorepo).

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Linting and formatting (Biome)

The repository is configured with Biome at the root (`biome.json`). Use the root scripts:

```bash
pnpm run lint        # biome check .
pnpm run format      # biome format --write
```

You can also run these within this package if local scripts exist, but prefer the root scripts for consistency.

## Type checking

Run TypeScript type checks from the root or app-specific scripts (if defined):

```bash
pnpm run typecheck:main   # example for another app
```

For this app, Vite and TS are configured via the local `tsconfig.*.json` files and root `tsconfig` package.

## Development

Start development servers via Turborepo filters from the root to ensure proper dependency graph boot:

```bash
pnpm run dev --filter=watch
```

Or use any dedicated dev scripts defined in the monorepo root (see `package.json`).
