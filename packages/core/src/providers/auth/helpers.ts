import { User } from '@auth0/auth0-react';
import { CustomUser, LogRocketConfig } from './types';
import type LRLogRocket from 'logrocket';

interface HasuraClaims {
  'x-hasura-default-role': string;
  'x-hasura-allowed-roles': string[];
  'x-hasura-user-id': string;
}

const getClaims = (token: string): HasuraClaims | null => {
  try {
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const namespace = 'https://hasura.io/jwt/claims';

    if (tokenPayload[namespace]) {
      return tokenPayload[namespace] as HasuraClaims;
    } else {
      throw new Error('No Hasura claims found in token');
    }
  } catch (err) {
    return null;
  }
};

const initLogRocket = async (
  config: LogRocketConfig
): Promise<typeof LRLogRocket | null> => {
  const { appId, rootHostname } = config;
  try {
    const LogRocket = (await import('logrocket')).default;
    LogRocket.init(appId, {
      rootHostname,
    });
    return LogRocket;
  } catch (error) {
    console.error('Failed to initialize LogRocket:', error);
    return null;
  }
};

/**
 * Transforms Auth0 user object into our custom user format
 * @param auth0User The user object from Auth0
 * @returns CustomUser object
 */
const transformUser = (
  id: string,
  auth0User: User | undefined
): CustomUser | null => {
  if (!id || !auth0User?.sub) return null;

  return {
    id,
    email: auth0User.email,
    name: auth0User.name,
    picture: auth0User.picture,
  };
};

export { getClaims, initLogRocket, transformUser };
