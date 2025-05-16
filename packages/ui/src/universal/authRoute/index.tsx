import { useAuthContext } from 'core/providers/auth';
import React, { ReactNode } from 'react';
import LoadingBackdrop from '../LoadingBackdrop';
import { LoginDialog } from '../dialogs/login';

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
