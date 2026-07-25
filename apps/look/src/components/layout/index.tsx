import { Link, useLocation } from '@tanstack/react-router';
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
//
// Active state is derived from the path rather than Link's activeOptions because
// each section spans two routes: Photos covers the timeline (/) and the open
// lightbox (/photo/$photoId), Albums covers the list (/albums) and a single
// album (/album/$albumId). A single `to` can't match both without also matching
// the other section.
const Nav = () => {
  const { pathname } = useLocation();
  const photosActive = pathname === '/' || pathname.startsWith('/photo/');
  const albumsActive = pathname === '/albums' || pathname.startsWith('/album/');

  return (
    <>
      <Link
        to="/"
        style={photosActive ? NAV_LINK_ACTIVE_STYLE : NAV_LINK_STYLE}
      >
        Photos
      </Link>
      <Link
        to="/albums"
        style={albumsActive ? NAV_LINK_ACTIVE_STYLE : NAV_LINK_STYLE}
      >
        Albums
      </Link>
    </>
  );
};

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
