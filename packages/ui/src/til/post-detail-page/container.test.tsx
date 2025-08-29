import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PostDetailPageContainer } from './container';

describe('PostDetailPageContainer', () => {
  it('renders with maxWidth md and children content', () => {
    const { container } = render(
      <PostDetailPageContainer>
        <div data-testid="test-child">Test Content</div>
      </PostDetailPageContainer>,
    );

    // Verify container maxWidth
    const muiContainer = container.querySelector('.MuiContainer-maxWidthMd');
    expect(muiContainer).toBeInTheDocument();

    // Verify children rendering
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeVisible();
  });
});
