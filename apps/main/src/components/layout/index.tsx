import { useAuthContext } from 'core/providers/auth';
import type React from 'react';
import { useState } from 'react';
import { SettingsPanel } from 'ui/main/home-page/settings';
import { FullWidthContainer } from 'ui/universal/containers/full-width';
import { Header } from 'ui/universal/header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  const { children } = props;
  const { user, signIn, signOut } = useAuthContext();
  const [settingsOpen, toggleSettings] = useState<boolean>(false);

  const onProfileClick = () => {
    if (user) {
      toggleSettings(true);
    } else {
      signIn();
    }
  };

  return (
    <FullWidthContainer>
      <Header user={user} onAvatarClick={onProfileClick} />
      <SettingsPanel
        open={settingsOpen}
        toggle={toggleSettings}
        actions={{ logout: signOut }}
      />
      {children}
    </FullWidthContainer>
  );
};

export { Layout };
