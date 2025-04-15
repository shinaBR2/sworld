import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from './index';

// Mock the Logo component
vi.mock('../../universal/logo', () => ({
  default: () => <div data-testid="mock-logo">Logo</div>,
}));

// Mock the ResponsiveAvatar component
vi.mock('../../universal/images/image', () => ({
  ResponsiveAvatar: ({ src, alt, ...props }: any) => (
    <div data-src={src} data-alt={alt} {...props}>
      Avatar
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
    onProfileClick: vi.fn(),
    user: null,
  };

  it('renders the logo', () => {
    render(<Header {...defaultProps} />);

    expect(screen.getByTestId('mock-logo')).toBeInTheDocument();
  });

  it('renders AccountCircle icon when user has no picture', () => {
    render(<Header {...defaultProps} user={{ ...mockUser, picture: undefined }} />);

    // AccountCircle should be in the document
    const accountIcon = document.querySelector('[data-testid="AccountCircleIcon"]');
    expect(accountIcon).toBeInTheDocument();

    // Avatar should not be in the document
    expect(screen.queryByTestId('mock-avatar')).not.toBeInTheDocument();
  });

  it('renders user avatar when user has a picture', () => {
    render(<Header {...defaultProps} user={mockUser} />);

    const avatar = screen.getByTestId('user-avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('data-src', mockUser.picture);
    expect(avatar).toHaveAttribute('data-alt', mockUser.name);
    // No need to check for data-testid="user-avatar" as we're already finding by that
  });

  // AccountCircle should not be in the document
  const accountIcon = document.querySelector('[data-testid="AccountCircleIcon"]');
  expect(accountIcon).not.toBeInTheDocument();
});
