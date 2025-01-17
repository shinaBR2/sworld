import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import type LogRocket from 'logrocket';
import { getClaims, initLogRocket, transformUser } from './helpers';
import { CustomUser, LogRocketConfig } from './types';

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
  cookieDomain: string;
}

interface Props {
  config: Auth0Config;
  logRocketConfig?: LogRocketConfig;
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextValue>({
  isSignedIn: false,
  isLoading: true,
  user: null,
  isAdmin: false,
  signIn: () => {},
  signOut: () => {},
  getAccessToken: async () => '',
});

const AuthContextProvider: FC<{
  logRocketConfig?: LogRocketConfig;
  children: React.ReactNode;
}> = ({ logRocketConfig, children }) => {
  const {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    user: auth0User,
    getAccessTokenSilently,
  } = useAuth0();

  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<CustomUser | null>(null);
  const [logRocket, setLogRocket] = useState<typeof LogRocket | null>(null);

  useEffect(() => {
    let mounted = true;

    if (logRocketConfig) {
      initLogRocket(logRocketConfig).then(logRocketInstance => {
        if (mounted) {
          setLogRocket(logRocketInstance);
        }
      });
    }

    return () => {
      mounted = false;
    };
  }, [logRocketConfig]);

  useEffect(() => {
    if (isSignedIn && logRocket && user?.id) {
      try {
        logRocket.identify(user.id, {
          name: user.name || '',
          email: user.email || '',
        });
      } catch (error) {
        console.error('Failed to identify user in LogRocket:', error);
      }
    }
  }, [isSignedIn, logRocket, user]);

  useEffect(() => {
    /**
     * This check will run once when the component mounts
     * It will check if the user has a valid session and refresh it if needed
     * THIS MADE SSO WORKS
     */
    const checkAuth = async () => {
      try {
        // This will refresh the auth state if a valid session exists
        const token = await getAccessTokenSilently();
        const claims = getClaims(token);

        if (claims) {
          /**
           * This was a bit confusing at first,
           * but the 'x-hasura-default-role' is ACTUALLY the role of current signed in user
           * and not the "default" role for ALL users
           * See how the claims set in Auth0 dasboard > Actions > Library > Hasura syncs
           * This claims can NOT be changed
           */
          setIsAdmin(claims['x-hasura-default-role'] === 'admin');

          const userId = claims['x-hasura-user-id'];
          setIsSignedIn(true);
          setUser(transformUser(userId, auth0User));
        }
      } catch (error) {
        console.error('Session validation failed:', error);
      }
    };

    if (isAuthenticated && !isLoading) {
      checkAuth();
    }
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

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
    user,
    isAdmin,
    signIn: loginWithRedirect,
    signOut: handleSignOut,
    getAccessToken: getAccessTokenSilently,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

const AuthProvider: FC<Props> = ({ config, logRocketConfig, children }) => {
  return (
    <Auth0Provider
      domain={config.domain}
      clientId={config.clientId}
      authorizationParams={{
        audience: config.audience,
        redirect_uri: config.redirectUri,
      }}
      cookieDomain={config.cookieDomain}
      cacheLocation="localstorage"
    >
      <AuthContextProvider logRocketConfig={logRocketConfig}>
        {children}
      </AuthContextProvider>
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

// For some packages/ui usage
export { type CustomUser, type AuthContextValue };
export { AuthProvider, useAuthContext };
