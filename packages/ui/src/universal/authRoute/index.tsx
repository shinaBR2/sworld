import { useAuthContext } from 'core/providers/auth';
import type React from 'react';
import type { ReactNode } from 'react';
import { LoginDialog } from '../dialogs/login';
import LoadingBackdrop from '../LoadingBackdrop';

interface AuthRouteProps {
  children: ReactNode;
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
  const { isSignedIn, isLoading, signIn } = useAuthContext();

  if (isLoading) {
    return <LoadingBackdrop message="Valuable things deserve waiting" />;
  }

  if (!isSignedIn) {
    return <LoginDialog onAction={signIn} />;
  }

  return <>{children}</>;
};

export { AuthRoute };
