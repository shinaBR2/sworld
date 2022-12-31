import { FieldValue } from "firebase-admin/firestore";
import * as functions from "firebase-functions";
import { HttpsError } from "firebase-functions/v1/auth";

const functionConfig = {
  region: "asia-south1",
};
const functionBuilder = functions.region(functionConfig.region);

// https://softwareengineering.stackexchange.com/questions/305250/should-i-use-http-status-codes-to-describe-application-level-events
const AppError = (message: string) => new HttpsError("ok", message);

const onRequest = functionBuilder.https.onRequest;
const onCall = functionBuilder.https.onCall;
const onAdminCall = (handler: (data: any) => void) => {
  return onCall((data, context) => {
    // Check context
    const { auth } = context;

    if (!auth) {
      throw AppError("Require sign in");
    }

    const { token } = auth;

    console.log(`token: ${JSON.stringify(token)}`);
    const isAdmin = token.admin === true;

    if (!isAdmin) {
      throw AppError("Require admin privilege");
    }

    return handler(data);
  });
};

const getTimeStamp = () => FieldValue.serverTimestamp();

export { onAdminCall, onCall, onRequest, AppError, getTimeStamp };
