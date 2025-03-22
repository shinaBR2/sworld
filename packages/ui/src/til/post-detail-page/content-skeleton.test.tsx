import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SkeletonPostContent } from './content-skeleton';

describe('SkeletonPostContent', () => {
  it('indicates loading state with aria-busy', () => {
    render(<SkeletonPostContent />);

    const card = screen.getByRole('generic', { busy: true });
    expect(card).toHaveAttribute('aria-busy', 'true');
    expect(card).toBeVisible();
  });
});
