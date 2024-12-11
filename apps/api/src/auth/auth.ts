import { onCall } from '../singleton';
import * as registrationHelpers from './registrationPasskeyHelpers';
import * as authenticationHelpers from './authenticationPasskeyHelpers';
import { saveNewPasskey } from './userHelpers';
import { AppError } from '../singleton/request';

const generatePasskeyRegistrationOptions = onCall(async ({ data }) => {
  try {
    const { userId } = data;
    const options = await registrationHelpers.generateOptions(userId);

    if (!options) {
      throw AppError('Failed to generate options');
    }

    return options;
  } catch (error) {
    console.error('Error generating registration options:', error);
    throw AppError('Internal server error');
  }
});

const verifyPasskeyRegistration = onCall(async request => {
  try {
    const { userId: firebaseUserId, credential: userCredential } = request.data;
    const { isVerified, verification, user } = await registrationHelpers.verify(
      firebaseUserId,
      userCredential
    );

    if (!isVerified || !verification) {
      throw AppError('Verification failed');
    }

    await saveNewPasskey(firebaseUserId, user, verification);

    return {
      success: true,
      message: 'Registration successful',
    };
  } catch (error) {
    console.error('Error in registration verification:', error);
    throw AppError('Internal server error');
  }
});

const generatePasskeyAuthenticationOptions = onCall(async ({ data }) => {
  try {
    const { userId } = data;
    const options = await authenticationHelpers.generateOptions(userId);

    if (!options) {
      console.error('Failed to generate options:');
      throw AppError('Failed to generate options');
    }

    return options;
  } catch (error) {
    console.error('Error generating authentication options:', error);
    throw AppError('Internal server error');
  }
});

const verifyPasskeyAuthentication = onCall(async ({ data }) => {
  try {
    const { userId: firebaseUserId, credential: userCredential } = data;
    const { isVerified } = await authenticationHelpers.verify(
      firebaseUserId,
      userCredential
    );

    if (!isVerified) {
      throw AppError('Verification failed');
    }

    return {
      success: true,
      message: 'Authentication successful',
    };
  } catch (error) {
    console.error('Error in authentication verification:', error);
    throw AppError('Internal server error');
  }
});

export {
  generatePasskeyRegistrationOptions,
  verifyPasskeyRegistration,
  generatePasskeyAuthenticationOptions,
  verifyPasskeyAuthentication,
};
