import * as React from "react";
import { ListenUI } from "ui";
// import { AuthProvider } from "./providers/auth";
import Home from "./containers/minimalism/Home";

const { MinimalismThemeProvider } = ListenUI.Minimalism;

const App = () => {
  return (
    // <AuthProvider>
    <MinimalismThemeProvider>
      <Home />
    </MinimalismThemeProvider>
    // </AuthProvider>
  );
};

export default App;
