import { CallableContext } from "firebase-functions/v1/https";

const getUserFromContext = (context: CallableContext) => {
  const { auth } = context;

  if (!auth) {
    return null;
  }

  return auth;
};

export { getUserFromContext };
