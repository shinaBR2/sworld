import * as React from "react";
import { ListenUI } from "ui";
import Home from "./containers/minimalism/Home";

const { MinimalismThemeProvider } = ListenUI.Minimalism;

const App = () => {
  return (
    <MinimalismThemeProvider>
      <Home />
    </MinimalismThemeProvider>
  );
};

export default App;
