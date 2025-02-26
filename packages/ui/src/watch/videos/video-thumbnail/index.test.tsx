import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VideoThumbnail } from './index';
import { defaultThumbnailUrl } from '../../../universal/images/default-thumbnail';

describe('VideoThumbnail', () => {
  it('should render with provided source', () => {
    const testSrc = 'https://example.com/thumbnail.jpg';
    const testTitle = 'Test Video';

    render(<VideoThumbnail src={testSrc} title={testTitle} />);

    const image = screen.getByRole('img', { name: testTitle });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', testSrc);
  });

  it('should render with default thumbnail when src is not provided', () => {
    const testTitle = 'Test Video Without Thumbnail';

    render(<VideoThumbnail title={testTitle} />);

    const image = screen.getByRole('img', { name: testTitle });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', defaultThumbnailUrl);
  });

  it('should render with default thumbnail when src is empty string', () => {
    const testTitle = 'Empty Src Test';

    render(<VideoThumbnail src="" title={testTitle} />);

    const image = screen.getByRole('img', { name: testTitle });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', defaultThumbnailUrl);
  });
});
