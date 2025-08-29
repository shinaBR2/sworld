import { useAuthContext } from 'core/providers/auth';
import type React from 'react';
import { Header } from 'ui/main/header';
import { FullWidthContainer } from 'ui/universal/containers/full-width';

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
