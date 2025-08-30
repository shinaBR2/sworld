# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a personal monorepo called "sworld" built with Turborepo and pnpm workspaces. It contains multiple React applications and shared packages for personal productivity and entertainment.

## Essential Development Commands

### Prerequisites
- Node.js >= 22.14.0
- pnpm >= 9.4.0

### Core Development Commands
```bash
# Install all dependencies
pnpm install

# Run all apps in development mode
pnpm dev

# Run specific app with its dependencies
pnpm dev:main    # Main productivity app (finance, journal, library)
pnpm dev:listen  # Audio/music streaming app
pnpm dev:game    # Gaming platform (Phaser.js games)
pnpm dev:docs    # Docusaurus documentation site

# Build all packages and apps
pnpm build

# Run tests across all packages
pnpm test

# Lint all packages
pnpm lint

# Format code
pnpm format
```

### Working with Shared Packages
```bash
# Generate GraphQL types in core package
cd packages/core && pnpm codegen
cd packages/core && pnpm watch-codegen  # Watch mode

# Run UI component Storybook
cd packages/ui && pnpm storybook

# Build shared packages for development
cd packages/core && pnpm build
cd packages/ui && pnpm build
```

### Testing Commands
```bash
# Run tests with coverage
pnpm test

# Run tests for specific package
cd packages/core && pnpm test
cd packages/ui && pnpm test
```

## Architecture Overview

### Monorepo Structure
- **Turborepo**: Manages build caching, task orchestration, and dependencies
- **pnpm workspaces**: Package management and dependency resolution
- **Shared packages**: Core business logic and UI components
- **Multiple apps**: Independent applications sharing common packages

### Applications (`apps/`)
- **main** - Primary productivity application with finance tracking, journaling, and personal library features
- **game** - Gaming platform built with Phaser.js featuring multiple games (Bobble Dungeon, Evil Minds)
- **listen** - Audio/music streaming application
- **watch** - Video streaming/watching platform
- **docs** - Docusaurus documentation site
- **til** - "Today I Learned" blog/notes application
- **extension** - Browser extension (Chrome)

### Shared Packages (`packages/`)
- **core** - Central business logic package containing:
  - GraphQL client setup and generated types
  - Auth0 authentication providers
  - React Query setup and hooks
  - Error handling with Rollbar integration
  - Domain-specific hooks for finance, journal, listen, and watch features
- **ui** - UI component library built with:
  - Material-UI components and theming
  - Emotion styled components
  - React Error Boundary components
  - Charts (ECharts integration)
  - Video player components
- **tsconfig** - Shared TypeScript configurations
- **jest-dom-preset** - Jest testing presets

### Key Technologies
- **Frontend**: React 18, TypeScript, Material-UI, Emotion, Vite
- **Backend**: Firebase, GraphQL, Auth0 authentication
- **Testing**: Vitest (unit), Playwright (E2E), Storybook (components)
- **Gaming**: Phaser.js with Matter.js physics engine
- **Build Tools**: Turborepo, Vite, tsup (for packages)

## Development Workflow

### Environment Setup
- Environment variables are managed in `.env.development.local` at root
- Apps automatically receive env vars during development via pre-scripts
- Each app can have its own environment configuration

### GraphQL Development
1. Update queries/mutations in `packages/core/src/graphql/`
2. Run `pnpm codegen` in core package to generate TypeScript types
3. Use generated types in applications
4. Core package exports domain-specific hooks for different features

### Adding New Features
1. Determine if feature belongs in an existing app or needs a new one
2. Add shared business logic to `packages/core`
3. Add reusable UI components to `packages/ui`
4. Use generated GraphQL types and React Query hooks from core
5. Follow consistent patterns seen in existing apps

### Package Development
- Packages use tsup for building with ES modules and CommonJS support
- UI package includes Storybook for component development
- Core package handles GraphQL codegen and exports domain-specific functionality
- All packages export TypeScript declarations

### Code Style Guidelines
- ES modules only - no CommonJS syntax
- Async/await preferred over Promises
- Arrow functions only - no `function` keyword
- Named exports at bottom of files
- Interface definitions for method parameters when possible
- TypeScript strict mode enabled

### Build Pipeline (Turborepo)
- Tasks have dependency chains managed by Turborepo
- `dev` tasks depend on package builds (`^build`)
- Caching enabled for builds, tests, and linting
- Parallel execution where dependencies allow

### Testing Strategy
- Unit tests with Vitest in packages
- E2E tests with Playwright in applications
- Component testing with Storybook
- Coverage reporting enabled

## Important Files
- `turbo.json` - Turborepo task configuration and dependency management
- `pnpm-workspace.yaml` - Workspace package definitions
- `firebase.json` - Firebase hosting configuration
- `.env.development.local` - Environment variables (copied to apps during dev)

## Firebase Integration
- Apps are configured for Firebase hosting
- Authentication handled through Auth0 (not Firebase Auth)
- Core package manages Firebase integration details
