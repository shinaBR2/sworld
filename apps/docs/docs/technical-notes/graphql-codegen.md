---
sidebar_position: 12
---

# Using graphql codegen with Turborepo

Nothing worked the first time I set up graphql codegen according to [the official document](https://the-guild.dev/graphql/codegen/docs/guides/react-query#prerequisites)

After a few hours of deep diving, I finally figured it out.

## Unclear `document` in the codegen config file

According to the official document, they said just put this "SIMPLE" configuration file and everything would just work.

```javascript
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'https://graphql.org/graphql/',
  documents: ['src/**/*.tsx'],
  ignoreNoDocuments: true,
  generates: {
    './src/graphql/': {
      preset: 'client',
      config: {
        documentMode: 'string',
      },
    },
    './schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true,
      },
    },
  },
};

export default config;
```

And because we have this post, that means nothing ever worked. The problem is I write all graphql query/mutation in separate hooks, in .ts files. It has many benefits compared to writing GraphQL queries/mutations in a React component .tsx file. The issue is this line in the config:

```javascript
documents: ['src/**/*.tsx'],
```

At first, I had no clue what we were doing or what this line meant. The more fancy documentation with less honest words makes developers more confused, like me. Okay, that's fine; people prefer the fancy way rather than being truly efficient. Later, I figured out that this line tells the codegen CLI: "when any changes occur in files defined here, generate the TypeScript types for me". Here's the truly simple fix:

```javascript
documents: ['src/**/*.{ts,tsx}'],
```

## Environment variables

I struggled for a long time trying to pass environment variables into packages/\*. This is because I started working with Turbo repo from version 1, and at that time, we couldn't simply read environment variables from a `.env` file, regardless of Vite, dotenv, or whatever.
Luckily, now we can use `@dotenvx/dotenvx` and finally pass environment variables from `.env` for local development. This is important because I need to use the Hasura Admin secret to run codegen.
Now everything is straightforward: just put the `.env` file into the `packages/core` and we're good to go.

```json
// packages/core/package.json
"scripts": {
  "codegen": "dotenvx run -- graphql-codegen --config codegen.ts",
  "watch-codegen": "dotenvx run -- graphql-codegen --config codegen.ts --watch",
},
```
