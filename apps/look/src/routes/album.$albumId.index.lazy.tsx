import { createLazyFileRoute } from '@tanstack/react-router';

// An album with no photo open. The grid lives in the album layout route, so this
// leaf renders nothing — its only job is to be the match for `/album/$albumId`
// that leaves the viewer <Outlet /> empty.
export const Route = createLazyFileRoute('/album/$albumId/')({
  component: () => null,
});
