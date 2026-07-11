import { getItems, removeItems } from 'core/universal/extension/storage';

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

const logout = async (): Promise<void> => {
  await removeItems([AUTH_TOKEN_KEY]);
};

export { getToken, isAuthenticated, logout };
