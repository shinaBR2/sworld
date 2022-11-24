---
sidebar_position: 1
---

# Monorepo setup problems

I get started with [Turborepo kitchen sink example](https://github.com/vercel/turbo/tree/main/examples/kitchen-sink) and chose to use [pnpm](https://pnpm.io/cli/install) as my package manager.
Some detailed environment:

- NodeJS LTS v18.12.0
- pnpm version 7.14.1

Problems occurred since I can not run `pnpm run build` or `pnpm run dev` easily through the dependencies are not resolved correctly.

# Investigation and fix

Assuming that I use the [Turborepo kitchen sink example](https://github.com/vercel/turbo/tree/main/examples/kitchen-sink) example.

Here are my steps:

- Remove the `pnpm-lock.yaml` and `node_modules` at the root folder, and re-install `pnpm install`
- Create a new file `pnpm-workspace.yaml` in the root folder with the following content
  ```
  packages:
  - "apps/*"
  - "packages/*"
  ```
- Go to all repositories in the monorepo, update all the `package.json` files "dependencies" and "devDependencies" from "_" to "workspace:_".
- Add new `files` option in the `packages/tsconfig/package.json`
  ```
  "files": ["base.json", "nextjs.json", "react-library.json", "vite.json"]
  ```
- Go to `packages/logger` and install `@types/node`: `pnpm install @types/node -D`
- Update the `packages/logger/tsconfig.json` file in the `compilerOptions` section
  ```
      {
    "compilerOptions": {
  -    "lib": ["ES2015"],
  +    "lib": ["ES2015", "DOM"],
      "module": "CommonJS",
      "outDir": "./dist",
  -    "rootDir": "./src"
  +    "rootDir": "./src",
  +    "types": ["node", "jest"]
    },
  ```

Now I can run `pnpm run dev`/`pnpm run build`, the detailed commit: https://github.com/shinaBR2/shinabr2-world/commit/0b546a1a38734f7da238fe97502be2226a427e4b
