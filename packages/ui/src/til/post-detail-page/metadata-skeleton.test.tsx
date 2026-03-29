import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SkeletonPostMetadata } from './metadata-skeleton';

describe('SkeletonPostMetadata', () => {
  it('renders skeleton elements', () => {
    render(<SkeletonPostMetadata />);

    // Check skeleton elements are rendered
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
