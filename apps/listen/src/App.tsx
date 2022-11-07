import * as React from "react";
import "./App.css";
import { AuthProvider } from "./providers/auth";
import Home from "./containers/minimalism/Home";

const App = () => {
  return (
    <AuthProvider>
      <Home />
    </AuthProvider>
  );
};

export default App;
