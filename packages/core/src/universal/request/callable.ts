import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * For some reasons I got trouble with this:
 * - using this inside `apps/admin` works fine
 * - using this inside `apps/listen` throw an error
 *
 * The root cause is I need to call `initializeApp`
 * before call any Firebase service.
 * The thing is structure both apps are the same,
 * but when run dev + build:
 * - Admin call `initializeApp` before import helper from `core`
 * - Listen import helper from `core` first, then call `initializeApp`
 */

const functions = getFunctions();
const callable = (name: string, data: any) => {
  return httpsCallable(functions, name)(data);
};

export default callable;
