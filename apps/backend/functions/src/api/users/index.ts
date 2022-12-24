import pw from "a-promise-wrapper";
import { adminAuth, onCall } from "../../singleton";
import { isAdmin } from "../../utils/auth";

const setAdmin = onCall(async (data, context) => {
  const isAdminRole = await isAdmin(context);

  if (!isAdminRole) {
    // TODO refactor
    throw new Error();
  }

  const { uid } = data;
  const customClaim = { admin: true };
  const { error } = await pw(adminAuth.setCustomUserClaims(uid, customClaim));

  if (error) {
    // TODO https://firebase.google.com/docs/functions/callable-reference#response_format_status_codes
    throw new Error();
  }

  return "Success";
});

export { setAdmin, getUser };
