import { Link } from '@tanstack/react-router';
import { Auth } from 'core';
import type { ReactNode } from 'react';
import { FullPageContainer } from 'ui/universal/containers/full-page';
import { Header } from 'ui/universal/header';

interface LayoutProps {
  children: ReactNode;
}

const NAV_LINK_STYLE = { textDecoration: 'none', color: 'inherit' };
const NAV_LINK_ACTIVE_STYLE = { ...NAV_LINK_STYLE, fontWeight: 700 };

// Timeline ↔ albums nav, rendered in the shared Header's actions slot. These are
// route declarations (they name the app's paths), so they live in the app, not
// in packages/ui; the chrome around them is the shared Header component.
const Nav = () => (
  <>
    <Link
      to="/"
      activeOptions={{ exact: true }}
      style={NAV_LINK_STYLE}
      activeProps={{ style: NAV_LINK_ACTIVE_STYLE }}
    >
      Photos
    </Link>
    <Link
      to="/albums"
      style={NAV_LINK_STYLE}
      activeProps={{ style: NAV_LINK_ACTIVE_STYLE }}
    >
      Albums
    </Link>
  </>
);

const Layout = (props: LayoutProps) => {
  const { children } = props;
  const { user, signOut } = Auth.useAuthContext();

  return (
    <FullPageContainer>
      <Header
        LinkComponent={Link}
        user={user}
        onAvatarClick={signOut}
        actions={<Nav />}
      />
      {children}
    </FullPageContainer>
  );
};

export { Layout };
