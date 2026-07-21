import type { CodegenConfig } from '@graphql-codegen/cli';
import { envConfig } from '../../utils/envConfig';

const hasuraUrl = envConfig.hasuraEndpoint as string;
const hasuraAdminSecret = envConfig.hasuraAdminSecret as string;

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
  documents: ['src/services/hasura/**/*.{ts,tsx}'],
  ignoreNoDocuments: true,
  generates: {
    './src/services/hasura/generated-graphql/': {
      preset: 'client',
      config: {
        documentMode: 'string',
      },
      presetConfig: {
        fragmentMasking: { unmaskFunctionName: 'getFragmentData' },
      },
    },
    './src/services/hasura/schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true,
      },
    },
  },
};

export default config;
