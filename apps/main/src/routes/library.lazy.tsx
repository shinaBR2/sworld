import { createLazyFileRoute } from '@tanstack/react-router';
import React from 'react';
import { AuthRoute } from 'ui/universal/authRoute';

const LibraryPage = () => {
  return <div>Library Page</div>;
};

export const Route = createLazyFileRoute('/library')({
  component: () => {
    return (
      <AuthRoute>
        <LibraryPage />
      </AuthRoute>
    );
  },
});
