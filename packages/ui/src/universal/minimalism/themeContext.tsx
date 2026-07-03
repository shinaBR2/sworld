import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'sworld-theme-mode';

const isThemeMode = (value: unknown): value is ThemeMode =>
  value === 'light' || value === 'dark';

const readStoredMode = (): ThemeMode | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isThemeMode(stored) ? stored : null;
  } catch {
    // localStorage can throw (private mode, blocked cookies) — treat as absent.
    return null;
  }
};

const writeStoredMode = (mode: ThemeMode): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Ignore write failures — persistence is best-effort.
  }
};

interface ThemeContextValue {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}

const GlassmorphismThemeContextProvider = (props: ThemeProviderProps) => {
  const { children, defaultMode = 'light' } = props;
  // Hydrate from localStorage so the user's choice survives reloads, falling
  // back to defaultMode when nothing valid is stored.
  const [mode, setMode] = useState<ThemeMode>(
    () => readStoredMode() ?? defaultMode,
  );

  useEffect(() => {
    writeStoredMode(mode);
  }, [mode]);

  const toggleTheme = useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, []);

  const value = useMemo(
    () => ({
      mode,
      toggleTheme,
      setTheme,
    }),
    [mode, toggleTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

const useGlassmorphismTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error(
      'useGlassmorphismTheme must be used within a GlassmorphismThemeContextProvider',
    );
  }
  return context;
};

export { GlassmorphismThemeContextProvider, useGlassmorphismTheme };
export type { ThemeMode };
