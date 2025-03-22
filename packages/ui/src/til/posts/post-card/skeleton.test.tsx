import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SkeletonPostCard } from './skeleton';

describe('SkeletonPostCard', () => {
  it('renders the skeleton with correct attributes', () => {
    render(<SkeletonPostCard />);

    const card = screen.getByRole('generic', { busy: true });
    expect(card).toBeInTheDocument();
    expect(card).toBeVisible();
  });
});
