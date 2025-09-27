import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { webcrypto } from 'crypto';
import { getCurrentLogger } from 'src/utils/logger';
import { EXPECTED_ORIGINS, EXPECTED_RP_IDS, RP_ID, RP_NAME } from './config';
// import { dbRead } from '../singleton/db';
import {
  getUser,
  getUserPasskeys,
  setCurrentRegistrationOptions,
} from './userHelpers';

// @ts-expect-error
if (!global.crypto) global.crypto = webcrypto;

const generateOptions = async (userId: string) => {
  const logger = getCurrentLogger();
  // (Pseudocode) Retrieve the user from the database
  // after they've logged in
  // TODO implement
  const userSnapshot = {};
  // const userSnapshot = await dbRead(`users/${userId}`);

  // @ts-expect-error
  if (!userSnapshot.exists) {
    return undefined;
  }
  // @ts-expect-error
  const user = userSnapshot.data();
  // logger.info('user data', user);
  // logger.info('user data key', user.ref.id);

  // const user: UserModel = getUserFromDB(loggedInUserId);
  // (Pseudocode) Retrieve any of the user's previously-
  // registered authenticators
  const userPasskeys = await getUserPasskeys(userId);
  logger.info('userPasskeys', userPasskeys);

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: user.username,
    // Don't prompt users for additional information about the authenticator
    // (Recommended for smoother UX)
    attestationType: 'none',
    // Prevent users from re-registering existing authenticators
    excludeCredentials: userPasskeys.map((passkey) => ({
      id: passkey.id,
      // Optional
      transports: passkey.transports,
    })),
    // See "Guiding use of authenticators via authenticatorSelection" below
    authenticatorSelection: {
      // Defaults
      residentKey: 'preferred',
      userVerification: 'preferred',
      // Optional
      authenticatorAttachment: 'platform',
    },
  });

  // (Pseudocode) Remember these options for the user
  await setCurrentRegistrationOptions(userId, options);

  return options;
};

const verify = async (userId: string, credential: any) => {
  const logger = getCurrentLogger();
  const isVerified = false;
  const userSnapshot = await getUser(userId);

  // @ts-expect-error
  if (!userSnapshot.exists) {
    return {
      isVerified,
    };
  }

  // @ts-expect-error
  const user = userSnapshot.data();
  logger.info('user data', user);
  const { passkeyRegistrationOptions: currentOptions } = user;

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: currentOptions.challenge,
      expectedOrigin: EXPECTED_ORIGINS,
      expectedRPID: EXPECTED_RP_IDS,
    });
  } catch (error) {
    logger.error(error);
    return {
      isVerified,
    };
  }

  return {
    isVerified: verification.verified,
    verification,
    user,
  };
};

export { generateOptions, verify };
