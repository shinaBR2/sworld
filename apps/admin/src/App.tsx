import React from 'react';
import Router from './routes';
import ThemeProvider from './theme';
import ScrollToTop from './components/scroll-to-top';

export default function App() {
  return (
    <ThemeProvider>
      <ScrollToTop />
      <Router />
    </ThemeProvider>
  );
}
