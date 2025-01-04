---
sidebar_position: 1
---

# Add new workspace

The most challenge for this task is all about configurations, package manager, and especially the build tool.

## Apps

The current build tool for all workspaces inside the `apps` folder is Vite, so I will continue with it. There is no official guides for this so I noted this down for myself.

Steps:

- Create a new folder in `apps` and `cd` into it
- Run `pnpm init` to create a new package.json file, review it
- Update the `name` field of the new created package.json file
- Review the code below, and copy and paste this into new created package.json file, depends on the purpose of the new workspace, keep only needed packages
  ```
  "dependencies": {
    "core": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "ui": "workspace:*"
  },
  "devDependencies": {
    "@originjs/vite-plugin-commonjs": "^1.0.3",
    "@types/node": "^18.11.9",
    "@types/react": "^18.0.25",
    "@types/react-dom": "^18.0.8",
    "@vitejs/plugin-react": "^2.1.0",
    "eslint-config-custom": "workspace:*",
    "tsconfig": "workspace:*",
    "typescript": "^5.6.2",
    "vite": "^3.1.0",
  }
  ```
- Copy the below content into a new file `.eslintrc.js`
  ```
  module.exports = {
    root: true,
    extends: ["custom"],
  };
  ```
- And here for the `vite.config.ts`

  ```
  import react from "@vitejs/plugin-react";
  import { defineConfig } from "vite";
  import { viteCommonjs } from "@originjs/vite-plugin-commonjs";

  // https://github.com/vitejs/vite/issues/5308#issuecomment-1010652389
  export default defineConfig({
    plugins: [viteCommonjs(), react()],
  });
  ```

- Back to the root folder run `pnpm install`
- Add new `.env.development.local` file at the new created folder
