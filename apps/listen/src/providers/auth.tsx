import React, { FC, useContext, useMemo, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import firebaseApp from "../firebase";

interface ContextProps {
  user: User | null | undefined;
  isLoading: boolean;
}

interface Props {
  children: React.ReactNode;
}

const auth = getAuth(firebaseApp);

const AuthContext = React.createContext<ContextProps>({
  user: undefined,
  isLoading: true,
});

const useAuthContext = () => useContext(AuthContext);

const AuthProvider: FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>();
  const isLoading = user === undefined;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      const uid = user.uid;
      console.log(`Signed in`);

      setUser(user);
    } else {
      console.log(`Signed out`);

      setUser(null);
    }
  });

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
    }),
    [user, isLoading]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export { AuthProvider, useAuthContext };
