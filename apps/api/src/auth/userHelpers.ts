import { VerifiedRegistrationResponse } from '@simplewebauthn/server';
import { dbAddDoc, dbAddDocWithId, dbRead, dbUpdateDoc } from '../singleton/db';
import { Passkey, UserModel } from './types';
import {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/types';

const getUserPasskeys = async (userId: string): Promise<Passkey[]> => {
  const existingPasskeysSnapshot = await dbRead(`passkeys/${userId}/items`);

  // @ts-ignore
  if (!existingPasskeysSnapshot.exists) {
    return [];
  }
  // @ts-ignore
  const existingPasskeys = existingPasskeysSnapshot.data();

  return existingPasskeys;
};

const getUserPasskey = async (
  userId: string,
  passkeyId: string
): Promise<Passkey | undefined> => {
  const passkeySnapshot = await dbRead(`passkeys/${userId}/items/${passkeyId}`);

  // @ts-ignore
  if (!passkeySnapshot.exists) {
    return undefined;
  }

  // @ts-ignore
  const passkey = passkeySnapshot.data();

  return passkey;
};

const getUser = async (userId: string) => {
  return await dbRead(`users/${userId}`);
};

const setCurrentRegistrationOptions = async (
  userId: string,
  options: PublicKeyCredentialCreationOptionsJSON
) => {
  await dbUpdateDoc(`users/${userId}`, {
    passkeyRegistrationOptions: options,
  });
};

const setCurrentAuthenticationOptions = async (
  userId: string,
  options: PublicKeyCredentialRequestOptionsJSON
) => {
  const cleanOptions = JSON.parse(JSON.stringify(options));
  await dbUpdateDoc(`users/${userId}`, {
    passkeyAuthenticationOptions: cleanOptions,
  });
};

const saveNewPasskey = async (
  firebaseUserId: string,
  user: UserModel,
  verification: VerifiedRegistrationResponse
) => {
  const { passkeyRegistrationOptions } = user;
  const { registrationInfo } = verification;

  const {
    // @ts-ignore
    credential,
    // @ts-ignore
    credentialDeviceType: deviceType,
    // @ts-ignore
    credentialBackedUp: backedUp,
  } = registrationInfo;

  const newPasskey: Passkey = {
    // `user` here is from Step 2
    user,
    // Created by `generateRegistrationOptions()` in Step 1
    webAuthnUserID: passkeyRegistrationOptions.user.id,
    // A unique identifier for the credential
    id: credential.id,
    // The public key bytes, used for subsequent authentication signature verification
    publicKey: credential.publicKey,
    // The number of times the authenticator has been used on this site so far
    counter: credential.counter,
    // How the browser can talk with this credential's authenticator
    transports: credential.transports,
    // Whether the passkey is single-device or multi-device
    deviceType,
    // Whether the passkey has been backed up in some way
    backedUp,
  };

  await dbAddDocWithId(
    `passkeys/${firebaseUserId}/items`,
    credential.id,
    newPasskey
  );
};

const saveUpdatedCounter = async (
  firebaseUserId: string,
  passkeyId: string,
  counter: number
) => {
  await dbUpdateDoc(`passkeys/${firebaseUserId}/items/${passkeyId}`, {
    counter,
  });
};

export {
  getUser,
  getUserPasskeys,
  getUserPasskey,
  setCurrentRegistrationOptions,
  setCurrentAuthenticationOptions,
  saveNewPasskey,
  saveUpdatedCounter,
};
