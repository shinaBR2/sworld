import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PostContent } from './content';

describe('PostContent', () => {
  it('renders children content within a Card component', () => {
    const { container } = render(
      <PostContent>
        <div data-testid="test-child">Test Content</div>
      </PostContent>,
    );

    // Verify Card structure using MUI's root class
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();

    // Verify child content rendering
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeVisible();
  });
});
