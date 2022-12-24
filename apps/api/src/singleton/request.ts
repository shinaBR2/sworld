import { FieldValue } from "firebase-admin/firestore";
import * as functions from "firebase-functions";

const functionConfig = {
  region: "asia-south1",
};
const functionBuilder = functions.region(functionConfig.region);

const onRequest = functionBuilder.https.onRequest;
const onCall = functionBuilder.https.onCall;

const getTimeStamp = () => FieldValue.serverTimestamp();

export { onCall, onRequest, getTimeStamp };
