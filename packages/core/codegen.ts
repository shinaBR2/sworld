import type { CodegenConfig } from '@graphql-codegen/cli';

// TODO
// Get hasura admin secret from env
const config: CodegenConfig = {
  schema: [
    {
      'https://relieved-panther-58.hasura.app/v1/graphql': {
        headers: {
          'x-hasura-admin-secret':
            'W6OP2ZTd9CubvmoI0xjLzQlnd71f2JL7g5exoNJUfNU58gxeSRG6WX2x5K26yr5g',
        },
      },
    },
  ],
  documents: ['src/**/*.tsx'],
  ignoreNoDocuments: true,
  generates: {
    './src/graphql/': {
      preset: 'client',
      plugins: [],
    },
    // './schema.graphql': {
    //   plugins: ['schema-ast'],
    //   config: {
    //     includeDirectives: true,
    //   },
    // },
  },
};

export default config;
