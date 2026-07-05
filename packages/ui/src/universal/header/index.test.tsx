import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Header } from './index';

vi.mock('../logo', () => ({
  default: () => <div data-testid="mock-logo">Logo</div>,
}));

vi.mock('../images/image', () => ({
  ResponsiveAvatar: ({
    src,
    alt,
    ...props
  }: {
    src?: string;
    alt?: string;
    [key: string]: unknown;
  }) => (
    <div data-src={src} data-alt={alt} {...props}>
      Avatar
    </div>
  ),
}));

vi.mock('../minimalism', () => ({
  ThemeToggleButton: () => (
    <div data-testid="mock-theme-toggle">Theme Toggle</div>
  ),
}));

vi.mock('../site-choices', () => ({
  default: ({ activeSite }: { activeSite: string }) => (
    <div data-testid="mock-site-choices" data-active-site={activeSite}>
      Site Choices
    </div>
  ),
}));

describe('Header', () => {
  const mockUser = {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    picture: 'https://example.com/avatar.jpg',
  };

  const defaultProps = {
    onAvatarClick: vi.fn(),
    user: null,
  };

  it('renders the logo and theme toggle', () => {
    render(<Header {...defaultProps} />);

    expect(screen.getByTestId('mock-logo')).toBeInTheDocument();
    expect(screen.getByTestId('mock-theme-toggle')).toBeInTheDocument();
  });

  it('renders AccountCircle icon when user has no picture', () => {
    render(
      <Header {...defaultProps} user={{ ...mockUser, picture: undefined }} />,
    );

    const accountIcon = document.querySelector(
      '[data-testid="AccountCircleIcon"]',
    );
    expect(accountIcon).toBeInTheDocument();
    expect(screen.queryByTestId('user-avatar')).not.toBeInTheDocument();
  });

  it('renders user avatar when user has a picture', () => {
    render(<Header {...defaultProps} user={mockUser} />);

    const avatar = screen.getByTestId('user-avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('data-src', mockUser.picture);
    expect(avatar).toHaveAttribute('data-alt', mockUser.name);

    const accountIcon = document.querySelector(
      '[data-testid="AccountCircleIcon"]',
    );
    expect(accountIcon).not.toBeInTheDocument();
  });

  it('calls onAvatarClick when the avatar is clicked', () => {
    const onAvatarClick = vi.fn();
    render(
      <Header
        {...defaultProps}
        user={mockUser}
        onAvatarClick={onAvatarClick}
      />,
    );

    fireEvent.click(screen.getByTestId('user-avatar'));

    expect(onAvatarClick).toHaveBeenCalledTimes(1);
  });

  it('calls onAvatarClick when the account icon is clicked', () => {
    const onAvatarClick = vi.fn();
    render(
      <Header
        {...defaultProps}
        user={{ ...mockUser, picture: undefined }}
        onAvatarClick={onAvatarClick}
      />,
    );

    fireEvent.click(screen.getByTestId('AccountCircleIcon'));

    expect(onAvatarClick).toHaveBeenCalledTimes(1);
  });

  it('does not render the site switcher when no config is passed', () => {
    render(<Header {...defaultProps} />);

    expect(screen.queryByTestId('mock-site-choices')).not.toBeInTheDocument();
  });

  it('renders the site switcher next to the logo when config is passed', () => {
    render(
      <Header
        {...defaultProps}
        siteChoices={{
          activeSite: 'watch',
          sites: {
            main: 'https://main.example.com',
            listen: 'https://listen.example.com',
            watch: 'https://watch.example.com',
            til: 'https://til.example.com',
          },
        }}
      />,
    );

    const switcher = screen.getByTestId('mock-site-choices');
    expect(switcher).toBeInTheDocument();
    expect(switcher).toHaveAttribute('data-active-site', 'watch');
  });

  it('renders slot content between the theme toggle and the avatar', () => {
    render(
      <Header
        {...defaultProps}
        user={mockUser}
        actions={<div data-testid="slot-content">Extra</div>}
      />,
    );

    const toggle = screen.getByTestId('mock-theme-toggle');
    const slot = screen.getByTestId('slot-content');
    const avatar = screen.getByTestId('user-avatar');

    // Node.DOCUMENT_POSITION_FOLLOWING (4) means the argument follows in the DOM.
    expect(
      toggle.compareDocumentPosition(slot) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      slot.compareDocumentPosition(avatar) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
