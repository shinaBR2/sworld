import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FullWidthContainer } from './index';

describe('FullWidthContainer', () => {
  it('renders children correctly', () => {
    render(
      <FullWidthContainer>
        <div data-testid="test-child">Test Content</div>
      </FullWidthContainer>,
    );

    const childElement = screen.getByTestId('test-child');
    expect(childElement).toBeInTheDocument();
    expect(childElement.textContent).toBe('Test Content');
  });

  it('applies custom styles when provided', () => {
    const customSx = {
      padding: '20px',
    };

    const { container } = render(
      <FullWidthContainer sx={customSx}>
        <div>Test Content</div>
      </FullWidthContainer>,
    );

    // Get the Box component (first child of container)
    const boxElement = container.firstChild;

    // Check that the custom styles are applied
    // Note: We're checking the inline style attribute here
    expect(boxElement).toHaveStyle('padding: 20px');

    // Also verify the default styles are still applied
    expect(boxElement).toHaveStyle('display: flex');
    expect(boxElement).toHaveStyle('flex-direction: column');
    expect(boxElement).toHaveStyle('min-height: 100vh');
  });

  it('renders with default styles when no sx prop is provided', () => {
    const { container } = render(
      <FullWidthContainer>
        <div>Test Content</div>
      </FullWidthContainer>,
    );

    const boxElement = container.firstChild;

    // Verify default styles are applied
    expect(boxElement).toHaveStyle('display: flex');
    expect(boxElement).toHaveStyle('flex-direction: column');
    expect(boxElement).toHaveStyle('min-height: 100vh');
  });
});
