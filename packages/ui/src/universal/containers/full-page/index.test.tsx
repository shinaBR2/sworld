import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FullPageContainer } from './index';

describe('FullPageContainer', () => {
  it('renders with default full-viewport styles', () => {
    const { container } = render(<FullPageContainer>Test Content</FullPageContainer>);

    const stackElement = container.firstChild as HTMLElement;
    expect(stackElement).toHaveStyle({
      minHeight: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden',
    });
  });

  it('merges custom sx styles with defaults', () => {
    const { container } = render(<FullPageContainer sx={{ margin: 2 }}>Content</FullPageContainer>);

    const stackElement = container.firstChild as HTMLElement;
    expect(stackElement).toHaveStyle('margin: 16px');
  });

  it('renders children content correctly', () => {
    render(
      <FullPageContainer>
        <div data-testid="test-child">Child Content</div>
      </FullPageContainer>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeVisible();
  });
});
