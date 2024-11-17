import { initializeApp } from 'firebase/app';
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from 'firebase/functions';

const apiKey = import.meta.env.VITE_API_KEY;
const authDomain = import.meta.env.VITE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_PROJECT_ID;
const storageBucket = import.meta.env.VITE_STORAGE_BUCKET;
const messagingSenderId = import.meta.env.VITE_MESSAGING_SENDER_ID;
const appId = import.meta.env.VITE_APP_ID;
const measurementId = import.meta.env.VITE_MEASUREMENT_ID;
const useEmulatorCloudFunctions = import.meta.env
  .VITE_USE_EMULATOR_CLOUD_FUNCTIONS;
const region = 'asia-south1';

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId,
};

const firebaseApp = initializeApp(firebaseConfig);
const functions = getFunctions(firebaseApp, region);

if (useEmulatorCloudFunctions == 'true') {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

const callable = (name: string, data: any) => {
  return httpsCallable(functions, name)(data);
};

export { callable, firebaseConfig };

export default firebaseApp;
