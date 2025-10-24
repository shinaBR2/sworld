# sworld - Personal Monorepo Project

## Project Overview

A personal monorepo containing multiple applications and shared packages built with Turborepo and pnpm workspaces.

## Architecture

### Applications (`apps/`)

- **docs** - Docusaurus documentation site with technical guides and blog posts
- **game** - Phaser.js gaming platform with multiple games (Bobble Dungeon, Evil Minds)
- **listen** - Audio/music streaming application
- **main** - Main application with finance, journal, and library features
- **til** - "Today I Learned" blog/notes application
- **watch** - Video streaming/watching application

### Shared Packages (`packages/`)

- **core** - Core business logic with GraphQL, Auth0, React Query, and error handling
- **ui** - UI component library using Material-UI and Emotion
- **tsconfig** - Shared TypeScript configurations
- **jest-dom-preset** - Jest testing presets

## Tech Stack

- **Frontend:** React 18, TypeScript, Material-UI, Emotion, Vite
- **Backend:** Firebase, GraphQL, Auth0
- **Testing:** Vitest, Playwright, Jest
- **Build:** Turborepo, pnpm, tsup
- **Gaming:** Phaser.js, Matter.js physics
- **Package Manager:** pnpm (>=9.4.0)
- **Node Version:** >=22.14.0

## Development Commands

### How Dev Commands Work

All app-specific dev commands (e.g., `pnpm dev:watch`, `pnpm dev:listen`) use `turbo watch` which provides:

- **Automatic dependency tracking**: Changes in `packages/core` or `packages/ui` automatically trigger rebuilds
- **Smart caching**: Only rebuilds what changed
- **Parallel execution**: Runs multiple tasks efficiently
- **Hot reload**: Apps automatically reload when dependencies update

This means you don't need to manually restart your dev server when modifying shared packages!

### Root Level Commands

```bash
# Install dependencies
pnpm install

# Run all apps in development mode
pnpm dev

# Run specific app with dependencies (uses turbo watch for auto-reload)
pnpm dev:listen     # Listen app + auto-reload dependencies
pnpm dev:game       # Game app + auto-reload dependencies
pnpm dev:main       # Main app + auto-reload dependencies
pnpm dev:watch      # Watch app + auto-reload dependencies
pnpm dev:til        # TIL app + auto-reload dependencies
pnpm dev:docs       # Documentation site + auto-reload dependencies
pnpm dev:extension  # Extension app + auto-reload dependencies

# Build all packages and apps
pnpm build

# Run tests across all packages
pnpm test

# Lint all packages
pnpm lint

# Format code
pnpm format
```

### Individual Package Commands

Navigate to specific package directory and run:

```bash
# For core package
cd packages/core
pnpm codegen        # Generate GraphQL types
pnpm watch-codegen  # Watch mode for GraphQL codegen

# For ui package
cd packages/ui
pnpm storybook      # Run Storybook
pnpm build-storybook # Build Storybook
```

## Key Files & Configurations

- `turbo.json` - Turborepo configuration with build pipelines
- `pnpm-workspace.yaml` - Workspace configuration
- `firebase.json` - Firebase configuration
- `.env.development.local` - Environment variables (copied to apps during dev)

## Testing

- **Unit Tests:** Vitest for packages
- **E2E Tests:** Playwright for applications
- **Component Tests:** Storybook for UI components
- Test files located in `test/` directories or alongside source files

## Code Generation

- GraphQL codegen in `packages/core` generates types from GraphQL schema
- Route trees auto-generated for TanStack Router applications

## Common Workflows

### Adding New Features

1. Identify which app(s) need changes
2. Check if shared functionality belongs in `core` or `ui` packages
3. Run relevant dev command to start development server
4. Make changes and test locally
5. Run `pnpm lint` and `pnpm test` before committing

### Working with GraphQL

1. Update GraphQL queries/mutations in `packages/core`
2. Run `pnpm codegen` to generate types
3. Use generated types in applications

### Adding UI Components

1. Create components in `packages/ui`
2. Export from `packages/ui/src/index.tsx`
3. Build package: `pnpm build` in ui directory
4. Import and use in applications

### Environment Setup

- Copy `.env.development.local` to app directories when needed
- Firebase configuration in `firebase.json`
- Each app has its own environment variables

## Deployment

- Build all packages: `pnpm build`
- Individual apps have their own deployment configurations
- Firebase hosting for web applications

## Code style

- Always use ES modules
- Always use async/await syntax if possible
- Never use `function`, always use arrow function like `const method = async () => `
- All exports MUST be named export and should be at the bottom
- Should have an interface for the method as much as possible to let the method definition in the same line rather than params with many lines.
