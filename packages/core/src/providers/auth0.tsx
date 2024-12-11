import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { Auth0Provider, useAuth0, User } from '@auth0/auth0-react';

interface CustomUser {
  id: string;
  email?: string | undefined;
  name?: string | undefined;
  picture?: string | undefined;
}

// Define what claims we expect from Auth0
interface HasuraClaims {
  'x-hasura-default-role': string;
  'x-hasura-allowed-roles': string[];
  'x-hasura-user-id': string;
}

interface AuthContextValue {
  isSignedIn: boolean;
  isLoading: boolean;
  user: CustomUser | null;
  isAdmin: boolean;
  signIn: () => void;
  signOut: () => void;
  getAccessToken: () => Promise<string>;
}

interface Auth0Config {
  domain: string;
  clientId: string;
  audience: string;
  redirectUri: string;
}

interface Props {
  config: Auth0Config;
  children: React.ReactNode;
}

// Create context with a default value that matches our type
const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

/**
 * Custom hook to decode and extract claims from a JWT token
 * @param getToken Function to retrieve the access token
 * @returns Object containing the decoded claims and any error
 */
const useTokenClaims = (getToken: () => Promise<string>) => {
  const [claims, setClaims] = useState<HasuraClaims | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchClaims = useCallback(async () => {
    try {
      const token = await getToken();
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const namespace = 'https://hasura.io/jwt/claims';

      if (tokenPayload[namespace]) {
        setClaims(tokenPayload[namespace] as HasuraClaims);
        setError(null);
      } else {
        throw new Error('No Hasura claims found in token');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch claims')
      );
      setClaims(null);
    }
  }, [getToken]);

  return { claims, error, fetchClaims };
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
  if (!auth0User?.sub) return null;

  return {
    id,
    email: auth0User.email,
    name: auth0User.name,
    picture: auth0User.picture,
  };
};

const AuthContextProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    isAuthenticated: isSignedIn,
    isLoading,
    loginWithRedirect,
    logout,
    user: auth0User,
    getAccessTokenSilently,
  } = useAuth0();

  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState('');
  const { claims, error, fetchClaims } = useTokenClaims(getAccessTokenSilently);

  // Effect to handle role-based authentication
  useEffect(() => {
    if (isSignedIn && !isLoading) {
      fetchClaims();
    }
  }, [isSignedIn, isLoading, fetchClaims]);

  // Effect to update admin status based on claims
  useEffect(() => {
    if (claims) {
      setIsAdmin(claims['x-hasura-default-role'] === 'admin');
      setUserId(claims['x-hasura-user-id']);
    }
  }, [claims]);

  const handleSignOut = useCallback(() => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }, [logout]);

  const contextValue: AuthContextValue = {
    isSignedIn,
    isLoading,
    user: transformUser(userId, auth0User),
    isAdmin,
    signIn: loginWithRedirect,
    signOut: handleSignOut,
    getAccessToken: getAccessTokenSilently,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

const AuthProvider: FC<Props> = ({ config, children }) => {
  return (
    <Auth0Provider
      domain={config.domain}
      clientId={config.clientId}
      authorizationParams={{
        audience: config.audience,
        redirect_uri: config.redirectUri,
      }}
    >
      <AuthContextProvider>{children}</AuthContextProvider>
    </Auth0Provider>
  );
};

/**
 * Custom hook to access authentication context
 * @throws Error if used outside of AuthProvider
 * @returns AuthContextValue
 */
const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
};

export { AuthProvider, useAuthContext };
