import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SkeletonPostContent } from './content-skeleton';

describe('SkeletonPostContent', () => {
  it('renders skeleton elements', () => {
    render(<SkeletonPostContent />);

    // Check skeleton elements are rendered
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
