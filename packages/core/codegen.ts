import type { CodegenConfig } from '@graphql-codegen/cli';

const hasuraUrl = process.env.HASURA_GRAPHQL_URL as string;
const hasuraAdminSecret = process.env.HASURA_ADMIN_SECRET as string;

const config: CodegenConfig = {
  schema: [
    {
      [hasuraUrl]: {
        headers: {
          'x-hasura-admin-secret': hasuraAdminSecret,
        },
      },
    },
  ],
  documents: ['src/**/*.{ts,tsx}'],
  ignoreNoDocuments: true,
  generates: {
    './src/graphql/': {
      preset: 'client',
      config: {
        documentMode: 'string',
      },
      presetConfig: {
        fragmentMasking: { unmaskFunctionName: 'getFragmentData' },
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
