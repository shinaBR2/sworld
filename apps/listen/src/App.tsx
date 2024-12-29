import * as React from 'react';
import { MinimalismThemeProvider } from 'ui/listen/minimalism';
import Home from './containers/minimalism/Home';

const App = () => {
  return (
    <MinimalismThemeProvider>
      <Home />
    </MinimalismThemeProvider>
  );
};

export default App;
