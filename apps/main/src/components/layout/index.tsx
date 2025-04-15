import { FullWidthContainer } from 'ui/universal/containers/full-width';
import React from 'react';
import { Header } from 'ui/main/header';
import { useAuthContext } from 'core/providers/auth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  const { children } = props;
  const { user, signIn } = useAuthContext();
  const onProfileClick = () => {
    if (user) {
      return;
    } else {
      signIn();
    }
  };

  return (
    <FullWidthContainer>
      <Header user={user} onProfileClick={onProfileClick} />
      {children}
    </FullWidthContainer>
  );
};

export { Layout };
