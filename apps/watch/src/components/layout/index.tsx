import { Link, useNavigate } from '@tanstack/react-router';
import { Auth } from 'core';
import type React from 'react';
import { lazy, Suspense, useState } from 'react';
import { FullPageContainer } from 'ui/universal/containers/full-page';
import { Header } from 'ui/universal/header';
import { SettingsPanel } from 'ui/watch/home-page/settings';
import { appConfig } from '../../config';
import { clearStandaloneCache } from '../../standalone-mode';

const Notifications = lazy(() => import('ui/watch/notifications'));

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  const { children } = props;
  const authContext = Auth.useAuthContext();
  const { signOut, user } = authContext;
  const navigate = useNavigate();
  const [settingOpen, toggleSetting] = useState<boolean>(false);
  const { sites } = appConfig;

  return (
    <FullPageContainer>
      <Header
        LinkComponent={Link}
        user={user}
        onAvatarClick={() => toggleSetting(true)}
        siteChoices={{ activeSite: 'watch', sites }}
        actions={
          <Suspense fallback={null}>
            <Notifications LinkComponent={Link} />
          </Suspense>
        }
      />
      <SettingsPanel
        open={settingOpen}
        toggle={toggleSetting}
        actions={{
          // Clear the boot cache on sign-out so the next account on this browser
          // starts from the default instead of inheriting this account's mode.
          logout: () => {
            clearStandaloneCache();
            signOut();
          },
          manage: user ? () => navigate({ to: '/manage' }) : undefined,
        }}
      />
      {children}
    </FullPageContainer>
  );
};

export { Layout };
