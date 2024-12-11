import { FieldValue } from 'firebase-admin/firestore';
import {
  HttpsError,
  onRequest,
  onCall,
  HttpsFunction,
} from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { Request, Response } from 'express';

setGlobalOptions({ region: 'asia-south1', maxInstances: 50 });

// https://softwareengineering.stackexchange.com/questions/305250/should-i-use-http-status-codes-to-describe-application-level-events
const AppError = (message: string) => {
  throw new HttpsError('ok', message);
};

const onRequestWithCors = (
  handler: (req: Request, res: Response) => Promise<void>
): HttpsFunction => {
  return onRequest({ cors: true }, handler);
};
const onAdminCall = (handler: (data: any) => void) => {
  return onCall((request, context) => {
    // Check context
    const { auth } = request;

    if (!auth) {
      throw AppError('Require sign in');
    }

    const { token } = auth;

    console.log(`token: ${JSON.stringify(token)}`);
    const isAdmin = token.admin === true;

    if (!isAdmin) {
      throw AppError('Require admin privilege');
    }

    return handler(request.data);
  });
};

const getTimeStamp = () => FieldValue.serverTimestamp();

export {
  onAdminCall,
  onCall,
  onRequest,
  onRequestWithCors,
  AppError,
  getTimeStamp,
};
