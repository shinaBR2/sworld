const hasuraConfig = {
  url: import.meta.env.VITE_HASURA_GRAPHQL_URL as string,
  codegenToken: import.meta.env.VITE_CODEGEN_TOKEN as string,
};

export { hasuraConfig };
