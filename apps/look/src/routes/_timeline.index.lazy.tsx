import { createLazyFileRoute } from '@tanstack/react-router';

// The timeline with no photo open. The grid lives in the layout route, so this
// leaf renders nothing — its only job is to be the match for `/` that leaves the
// viewer <Outlet /> empty.
export const Route = createLazyFileRoute('/_timeline/')({
  component: () => null,
});
