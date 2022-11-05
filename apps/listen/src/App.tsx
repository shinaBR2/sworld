import * as React from "react";
import "./App.css";
import { CounterButton, NewTabLink } from "ui";
import { AuthProvider } from "./providers/auth";

const App = () => {
  return (
    <AuthProvider>
      <div className="container">
        <h1 className="title">Listen</h1>
        <CounterButton />
        <p className="description">
          Built With{" "}
          <NewTabLink href="https://turborepo.org/">Turborepo</NewTabLink> +{" "}
          <NewTabLink href="https://vitejs.dev/">Vite</NewTabLink>
        </p>
      </div>
    </AuthProvider>
  );
};

export default App;
