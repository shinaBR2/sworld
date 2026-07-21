// import { onCall } from '../singleton';
import * as registrationHelpers from './registrationPasskeyHelpers';
import * as authenticationHelpers from './authenticationPasskeyHelpers';
import { saveNewPasskey } from './userHelpers';

// const generatePasskeyRegistrationOptions = onCall(async ({ data }) => {
//   try {
//     const { userId } = data;
//     const options = await registrationHelpers.generateOptions(userId);

//     if (!options) {
//       throw new Error("Failed to generate options");
//     }

//     return options;
//   } catch (error) {
//     logger.error("Error generating registration options:", error);
//     throw new Error("Internal server error");
//   }
// });

// const verifyPasskeyRegistration = onCall(async (request) => {
//   try {
//     const { userId: firebaseUserId, credential: userCredential } = request.data;
//     const { isVerified, verification, user } = await registrationHelpers.verify(
//       firebaseUserId,
//       userCredential
//     );

//     if (!isVerified || !verification) {
//       throw new Error("Verification failed");
//     }

//     await saveNewPasskey(firebaseUserId, user, verification);

//     return {
//       success: true,
//       message: "Registration successful",
//     };
//   } catch (error) {
//     logger.error("Error in registration verification:", error);
//     throw new Error("Internal server error");
//   }
// });

// const generatePasskeyAuthenticationOptions = onCall(async ({ data }) => {
//   try {
//     const { userId } = data;
//     const options = await authenticationHelpers.generateOptions(userId);

//     if (!options) {
//       logger.error("Failed to generate options:");
//       throw new Error("Failed to generate options");
//     }

//     return options;
//   } catch (error) {
//     logger.error("Error generating authentication options:", error);
//     throw new Error("Internal server error");
//   }
// });

// const verifyPasskeyAuthentication = onCall(async ({ data }) => {
//   try {
//     const { userId: firebaseUserId, credential: userCredential } = data;
//     const { isVerified } = await authenticationHelpers.verify(
//       firebaseUserId,
//       userCredential
//     );

//     if (!isVerified) {
//       throw new Error("Verification failed");
//     }

//     return {
//       success: true,
//       message: "Authentication successful",
//     };
//   } catch (error) {
//     logger.error("Error in authentication verification:", error);
//     throw new Error("Internal server error");
//   }
// });

// export {
//   generatePasskeyRegistrationOptions,
//   verifyPasskeyRegistration,
//   generatePasskeyAuthenticationOptions,
//   verifyPasskeyAuthentication,
// };
