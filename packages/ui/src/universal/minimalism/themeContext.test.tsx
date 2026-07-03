import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  GlassmorphismThemeContextProvider,
  useGlassmorphismTheme,
} from './themeContext';

const STORAGE_KEY = 'sworld-theme-mode';

const wrapper = ({ children }: { children: ReactNode }) => (
  <GlassmorphismThemeContextProvider>
    {children}
  </GlassmorphismThemeContextProvider>
);

describe('GlassmorphismThemeContextProvider persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('defaults to light when nothing is stored', () => {
    const { result } = renderHook(() => useGlassmorphismTheme(), { wrapper });
    expect(result.current.mode).toBe('light');
  });

  it('hydrates the initial mode from localStorage', () => {
    window.localStorage.setItem(STORAGE_KEY, 'dark');

    const { result } = renderHook(() => useGlassmorphismTheme(), { wrapper });

    expect(result.current.mode).toBe('dark');
  });

  it('ignores an invalid stored value and falls back to the default', () => {
    window.localStorage.setItem(STORAGE_KEY, 'purple');

    const { result } = renderHook(() => useGlassmorphismTheme(), { wrapper });

    expect(result.current.mode).toBe('light');
  });

  it('persists the mode to localStorage when toggled', () => {
    const { result } = renderHook(() => useGlassmorphismTheme(), { wrapper });

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.mode).toBe('dark');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  it('persists an explicit setTheme call', () => {
    const { result } = renderHook(() => useGlassmorphismTheme(), { wrapper });

    act(() => {
      result.current.setTheme('dark');
    });
    act(() => {
      result.current.setTheme('light');
    });

    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('light');
  });
});
