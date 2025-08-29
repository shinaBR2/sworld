import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LandingCard } from './index';

// Mock the styled components
vi.mock('./styled', () => ({
  StyledCard: ({ children }: any) => (
    <div data-testid="styled-card">{children}</div>
  ),
  IconContainer: ({ children, customColor }: any) => (
    <div data-testid="icon-container" data-color={customColor}>
      {children}
    </div>
  ),
  IconTypography: ({ children, customColor }: any) => (
    <div data-testid="icon-typography" data-color={customColor}>
      {children}
    </div>
  ),
  TitleTypography: ({ children }: any) => (
    <div data-testid="title-typography">{children}</div>
  ),
  DescriptionTypography: ({ children }: any) => (
    <div data-testid="description-typography">{children}</div>
  ),
  CardContentBox: ({ children }: any) => (
    <div data-testid="card-content-box">{children}</div>
  ),
}));

describe('LandingCard', () => {
  const defaultProps = {
    icon: '🚀',
    title: 'Test Title',
  };

  it('renders with basic props', () => {
    render(<LandingCard {...defaultProps} />);

    expect(screen.getByTestId('styled-card')).toBeInTheDocument();
    expect(screen.getByTestId('icon-container')).toBeInTheDocument();
    expect(screen.getByTestId('icon-typography')).toBeInTheDocument();
    expect(screen.getByTestId('title-typography')).toBeInTheDocument();
    expect(screen.getByText('🚀')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders with description when provided', () => {
    render(<LandingCard {...defaultProps} description="Test Description" />);

    expect(screen.getByTestId('description-typography')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(<LandingCard {...defaultProps} />);

    expect(
      screen.queryByTestId('description-typography'),
    ).not.toBeInTheDocument();
  });

  it('applies custom color when provided', () => {
    render(<LandingCard {...defaultProps} color="#ff0000" />);

    const iconContainer = screen.getByTestId('icon-container');
    const iconTypography = screen.getByTestId('icon-typography');

    expect(iconContainer.getAttribute('data-color')).toBe('#ff0000');
    expect(iconTypography.getAttribute('data-color')).toBe('#ff0000');
  });

  it('renders as external link when isExternal is true', () => {
    render(
      <LandingCard
        {...defaultProps}
        isExternal={true}
        to="https://example.com"
      />,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders with custom LinkComponent when provided', () => {
    const MockLinkComponent = ({ to, children }: any) => (
      <a data-testid="custom-link" href={to}>
        {children}
      </a>
    );

    render(
      <LandingCard
        {...defaultProps}
        LinkComponent={MockLinkComponent}
        to="/test-path"
      />,
    );

    const customLink = screen.getByTestId('custom-link');
    expect(customLink).toHaveAttribute('href', '/test-path');
  });

  it('renders without link when neither isExternal nor LinkComponent is provided', () => {
    render(<LandingCard {...defaultProps} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByTestId('custom-link')).not.toBeInTheDocument();
  });
});
