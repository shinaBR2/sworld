const graphqlErrors = (error: any) => {
  const errors = error?.response?.errors;
  return Array.isArray(errors)
    ? errors.map((error: any) => error?.extensions?.code)
    : [];
};

const isTokenExpired = (error: any) => {
  const errorCodes = graphqlErrors(error);
  return errorCodes.includes('invalid-jwt');
};

export { isTokenExpired };
