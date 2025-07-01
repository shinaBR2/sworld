import { createLazyFileRoute } from '@tanstack/react-router';
import React from 'react';

export const Route = createLazyFileRoute('/library/books/$bookId')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/library/$bookId"!</div>;
}
