import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SkeletonPostMetadata } from './metadata-skeleton';

describe('SkeletonPostMetadata', () => {
  it('renders the skeleton with correct attributes', () => {
    render(<SkeletonPostMetadata sx={{ padding: 2 }} />);

    // Check the card has aria-busy attribute
    const card = screen.getByRole('generic', { busy: true });
    expect(card).toBeInTheDocument();
    expect(card).toBeVisible();
  });
});
