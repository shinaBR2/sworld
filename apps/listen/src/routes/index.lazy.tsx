import { createLazyFileRoute } from '@tanstack/react-router';
import React from 'react';
import Home from '../containers/minimalism/Home';

export const Route = createLazyFileRoute('/')({
  component: () => {
    return <Home />;
  },
});
