import React, { FC, useContext, useMemo, useState } from 'react';
import { FirebaseOptions, initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as gSignOut,
} from 'firebase/auth';

const provider = new GoogleAuthProvider();

interface ContextProps {
  user: User | null | undefined;
  isAdmin: boolean;
  isLoading: boolean;
  isSignedIn: boolean;
  signIn: () => void;
  signOut: () => void;
}

interface Props {
  children: React.ReactNode;
  firebaseConfig: FirebaseOptions;
}

// const auth = getAuth(firebaseApp);

const AuthContext = React.createContext<ContextProps>({
  user: undefined,
  isAdmin: false,
  isLoading: true,
  isSignedIn: false,
  signIn: () => {},
  signOut: () => {},
});

const useAuthContext = () => useContext(AuthContext);

const AuthProvider: FC<Props> = ({ firebaseConfig, children }) => {
  const [user, setUser] = useState<User | null>();
  const [isAdmin, setIsAdmin] = useState(false);
  const isLoading = user === undefined;
  const firebaseApp = initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);

  onAuthStateChanged(auth, async user => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      const uid = user.uid;

      if (auth.currentUser) {
        const tokenResult = await auth.currentUser.getIdTokenResult();

        const { admin, email } = tokenResult.claims;
        const isAmin = !!admin || email == 'admin@shinabr2.com';

        if (isAmin) {
          setIsAdmin(true);
        }
      }

      setUser(user);
    } else {
      setUser(null);
    }
  });

  const signIn = async () => {
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    return await gSignOut(auth);
  };

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      isSignedIn: !isLoading && !!user,
      isAdmin,
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
