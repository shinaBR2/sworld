import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VideoSkeleton } from './skeleton';
import '@testing-library/jest-dom';

describe('VideoSkeleton', () => {
  it('renders the skeleton with correct attributes', () => {
    render(<VideoSkeleton />);

    // Check the card has aria-busy attribute
    const card = screen.getByRole('generic', { busy: true });
    expect(card).toBeInTheDocument();
  });
});
