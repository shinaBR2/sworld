import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const app = initializeApp();

const functionsBuilder = functions.region("asia-south1");
const logger = functions.logger;
const https = functionsBuilder.https;
const functionAuth = functionsBuilder.auth;
const onRequest = https.onRequest;
const onCall = https.onCall;

const adminAuth = getAuth(app);

export { logger, functionAuth, adminAuth, onRequest, onCall };
