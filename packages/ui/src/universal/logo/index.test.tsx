import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import Logo from './index';

const renderWithMode = (mode: 'light' | 'dark', ui: ReactNode) =>
  render(
    <ThemeProvider theme={createTheme({ palette: { mode } })}>
      {ui}
    </ThemeProvider>,
  );

const wordmarkPaths = (fill: string) =>
  document.querySelectorAll(`path[fill="${fill}"]`);

describe('Logo', () => {
  it('renders the SVG logo inside a home link', () => {
    renderWithMode('light', <Logo />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
    expect(
      screen.getByRole('img', { name: 'SWorld logo' }),
    ).toBeInTheDocument();
  });

  it('renders the wordmark in navy in light mode', () => {
    renderWithMode('light', <Logo />);

    expect(wordmarkPaths('#051544').length).toBeGreaterThan(0);
    expect(wordmarkPaths('#ece8f6').length).toBe(0);
  });

  it('renders the wordmark in a light fill in dark mode', () => {
    renderWithMode('dark', <Logo />);

    expect(wordmarkPaths('#ece8f6').length).toBeGreaterThan(0);
    expect(wordmarkPaths('#051544').length).toBe(0);
  });

  it('uses the provided LinkComponent when given', () => {
    const LinkComponent = ({
      to,
      children,
    }: {
      to: string;
      children: ReactNode;
    }) => (
      <a href={to} data-testid="custom-link">
        {children}
      </a>
    );

    renderWithMode('light', <Logo LinkComponent={LinkComponent} />);

    expect(screen.getByTestId('custom-link')).toHaveAttribute('href', '/');
    expect(
      screen.getByRole('img', { name: 'SWorld logo' }),
    ).toBeInTheDocument();
  });
});
