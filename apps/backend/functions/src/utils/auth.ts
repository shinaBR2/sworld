import pw from "a-promise-wrapper";
import { CallableContext } from "firebase-functions/v1/https";
import { adminAuth } from "../singleton";
import { getUserFromContext } from "./request";

const isAdmin = async (context: CallableContext) => {
  const user = getUserFromContext(context);

  if (!user) {
    return false;
  }

  const { uid } = user;

  const { data: userRecord, error } = await pw(adminAuth.getUser(uid));

  if (error) {
    // TODO refactor
    throw new Error();
  }

  const { customClaims } = userRecord;

  return customClaims && customClaims.admin === true;
};

export { isAdmin };
