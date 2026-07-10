import {
  getItems,
  removeItems,
  setItem,
} from 'core/universal/extension/storage';
import { config } from '../../config';
import { hasuraConfig } from '../../envConfig';

const AUTH_TOKEN_KEY = 'auth0Token';

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') {
    return true;
  }
  return Date.now() >= payload.exp * 1000;
};

const getToken = async (): Promise<string | null> => {
  const result = await getItems([AUTH_TOKEN_KEY]);
  return result[AUTH_TOKEN_KEY] ?? null;
};

const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  if (!token) {
    return false;
  }
  return !isTokenExpired(token);
};

const startPairing = async (): Promise<{
  userCode: string;
  verificationUri: string;
}> => {
  const extensionId = chrome.runtime.id;

  const response = await fetch(hasuraConfig.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        mutation CreateDeviceRequest($input: CreateDeviceRequestInput!) {
          createDeviceRequest(input: $input) {
            success
            data {
              userCode
              verificationUri
            }
          }
        }
      `,
      variables: {
        input: {
          extensionId,
        },
      },
    }),
  });

  const json = await response.json();

  if (json.errors) {
    throw new Error(
      json.errors[0]?.message ?? 'Failed to create device request',
    );
  }

  const result = json.data?.createDeviceRequest;

  if (!result?.success || !result?.data) {
    throw new Error(
      result?.error?.message ?? 'Failed to create device request',
    );
  }

  return {
    userCode: result.data.userCode,
    verificationUri: result.data.verificationUri,
  };
};

const pollForDeviceToken = async (
  deviceCode: string,
  interval: number,
  expiresIn: number,
): Promise<void> => {
  const startTime = Date.now();
  const timeout = expiresIn * 1000;

  while (Date.now() - startTime < timeout) {
    const response = await fetch(`${config.backendUrl}/auth/device/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceCode }),
    });

    const json = await response.json();

    if (json.data?.token) {
      await setItem(AUTH_TOKEN_KEY, json.data.token);
      return;
    }

    const status = json.message ?? json.error;

    if (status === 'authorization_pending') {
      await new Promise((resolve) => setTimeout(resolve, interval * 1000));
      continue;
    }

    if (status === 'access_denied') {
      throw new Error('access_denied');
    }

    if (status === 'expired_token') {
      throw new Error('expired_token');
    }

    await new Promise((resolve) => setTimeout(resolve, interval * 1000));
  }

  throw new Error('expired_token');
};

const logout = async (): Promise<void> => {
  await removeItems([AUTH_TOKEN_KEY]);
};

export { getToken, isAuthenticated, startPairing, pollForDeviceToken, logout };
