import React, { FC, useContext, useMemo, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithRedirect,
  signOut as gSignOut,
} from "firebase/auth";
import firebaseApp from "../firebase";

const provider = new GoogleAuthProvider();

interface ContextProps {
  user: User | null | undefined;
  isLoading: boolean;
  isSignedIn: boolean;
  signIn: () => void;
  signOut: () => void;
}

interface Props {
  children: React.ReactNode;
}

const auth = getAuth(firebaseApp);

const AuthContext = React.createContext<ContextProps>({
  user: undefined,
  isLoading: true,
  isSignedIn: false,
  signIn: () => {},
  signOut: () => {},
});

const useAuthContext = () => useContext(AuthContext);

const AuthProvider: FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>();
  const [isAdmin, setIsAdmin] = useState(false);
  const isLoading = user === undefined;

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      const uid = user.uid;
      console.log(`Signed in: ${uid}`);

      if (auth.currentUser) {
        const tokenResult = await auth.currentUser.getIdTokenResult();

        console.log(`tokenResult: ${tokenResult.claims.admin}`);

        if (!!tokenResult.claims.admin) {
          setIsAdmin(true);
        }
      }

      setUser(user);
    } else {
      console.log(`Signed out`);

      setUser(null);
    }
  });

  const signIn = async () => {
    await signInWithRedirect(auth, provider);
  };

  const signOut = async () => {
    return await gSignOut(auth);
  };

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      isSignedIn: !isLoading && !!user && isAdmin,
      signIn,
      signOut,
    }),
    [user, isLoading, isAdmin]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export { AuthProvider, useAuthContext };
