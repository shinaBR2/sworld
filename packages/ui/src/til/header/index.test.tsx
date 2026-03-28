import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Header } from './index';

// Mock child components
vi.mock('../../universal/logo', () => ({
  default: ({ LinkComponent }: { LinkComponent: React.ComponentType }) => (
    <div data-testid="logo">
      <LinkComponent />
    </div>
  ),
}));

vi.mock('../../universal/site-choices', () => ({
  default: ({ activeSite, sites }: { activeSite: string; sites: any }) => (
    <div data-testid="site-choices">
      {activeSite} - {JSON.stringify(sites)}
    </div>
  ),
}));

describe('Header', () => {
  const mockSites = {
    listen: '/listen',
    watch: '/watch',
    play: '/play',
    til: '/til',
  };

  const MockLink = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );

  it('renders header structure correctly', () => {
    const { container } = render(
      <Header sites={mockSites} LinkComponent={MockLink} />,
    );

    // Verify AppBar structure
    const appBar = container.querySelector('.MuiAppBar-root');
    expect(appBar).toBeInTheDocument();
    expect(appBar).toHaveStyle('position: sticky');

    // Verify Toolbar layout
    const toolbar = container.querySelector('.MuiToolbar-root');
    expect(toolbar).toHaveStyle('justify-content: space-between');
  });

  it('passes correct props to child components', () => {
    const { getByTestId } = render(
      <Header sites={mockSites} LinkComponent={MockLink} />,
    );

    // Verify Logo component
    expect(getByTestId('logo')).toBeInTheDocument();

    // Verify SiteChoices component
    const siteChoices = getByTestId('site-choices');
    expect(siteChoices.textContent).toContain('til');
    expect(siteChoices.textContent).toContain(JSON.stringify(mockSites));
  });

  it('renders auth buttons correctly when not authenticated', () => {
    const loginMock = vi.fn();
    const logoutMock = vi.fn();

    const { getByText, queryByText } = render(
      <Header
        sites={mockSites}
        LinkComponent={MockLink}
        user={null}
        login={loginMock}
        logout={logoutMock}
      />,
    );

    expect(getByText('Login')).toBeInTheDocument();
    expect(queryByText('Logout')).not.toBeInTheDocument();
    expect(queryByText('Write')).not.toBeInTheDocument();
  });

  it('renders auth buttons correctly when authenticated', () => {
    const loginMock = vi.fn();
    const logoutMock = vi.fn();
    const mockUser = { name: 'Test User' };

    const { getByText, queryByText } = render(
      <Header
        sites={mockSites}
        LinkComponent={MockLink}
        user={mockUser as any}
        login={loginMock}
        logout={logoutMock}
      />,
    );

    expect(getByText('Logout')).toBeInTheDocument();
    expect(getByText('Write')).toBeInTheDocument();
    expect(queryByText('Login')).not.toBeInTheDocument();
  });
});
