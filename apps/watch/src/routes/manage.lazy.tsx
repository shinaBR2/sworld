import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuthContext } from 'core/providers/auth';
import { useEffect } from 'react';
import { LoadingBackdrop } from 'ui/universal';
import { ManageScreen } from 'ui/watch/manage';
import { appConfig } from '../config';
import { clearStandaloneCache } from '../standalone-mode';

const Content = () => {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();

  return (
    <ManageScreen
      sites={appConfig.sites}
      user={user}
      onLogout={() => {
        clearStandaloneCache();
        signOut();
      }}
      onNavigateSettings={() => navigate({ to: '/settings' })}
    />
  );
};

const Manage = () => {
  const { isLoading, user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: '/' });
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return <LoadingBackdrop message="Valuable things deserve waiting" />;
  }

  if (!user) {
    return null;
  }

  return <Content />;
};

export const Route = createLazyFileRoute('/manage')({
  component: Manage,
});
