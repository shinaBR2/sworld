import type { CodegenConfig } from '@graphql-codegen/cli';
import { hasuraConfig } from './envConfig';

const hasuraUrl = hasuraConfig.url;
const token = hasuraConfig.codegenToken;

const config: CodegenConfig = {
  schema: [
    {
      [hasuraUrl]: {
        headers: {
          authorization: `Bearer ${token}`,
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
    './src/schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true,
      },
    },
  },
};

export default config;
