import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type ThemeMode = 'light' | 'dark';

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
  const [mode, setMode] = useState<ThemeMode>(defaultMode);

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
