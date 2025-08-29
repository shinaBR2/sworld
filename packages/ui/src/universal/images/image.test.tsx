import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  generateCloudinarySrcSet,
  isCloudinaryUrl,
  ResponsiveAvatar,
  ResponsiveCardMedia,
  ResponsiveImage,
} from './image';

describe('isCloudinaryUrl', () => {
  it('should return false for invalid URLs', () => {
    const url = '';

    expect(isCloudinaryUrl(url)).toBe(false);
  });
  it('should return true for valid Cloudinary URLs', () => {
    const validUrl =
      'https://res.cloudinary.com/shinabr2/image/upload/v1670242747/Public/Images/TG5-1024x576.webp';
    expect(isCloudinaryUrl(validUrl)).toBe(true);
  });

  it('should return false for non-Cloudinary URLs', () => {
    const urls = [
      'https://example.com/image.jpg',
      'https://cloudinary.com/not-upload/image.jpg',
      'https://res.cloudinary.com/image.jpg', // missing /upload/
      '',
    ];

    urls.forEach((url) => {
      expect(isCloudinaryUrl(url)).toBe(false);
    });
  });
});

describe('generateCloudinarySrcSet', () => {
  it('should generate correct srcSet for Cloudinary URL with version', () => {
    const url =
      'https://res.cloudinary.com/shinabr2/image/upload/v1670242747/Public/Images/TG5-1024x576.webp';
    const widths = [400, 800];

    const expected = [
      'https://res.cloudinary.com/shinabr2/image/upload/f_auto,q_auto,w_400/v1670242747/Public/Images/TG5-1024x576.webp 400w',
      'https://res.cloudinary.com/shinabr2/image/upload/f_auto,q_auto,w_800/v1670242747/Public/Images/TG5-1024x576.webp 800w',
    ].join(',\n    ');

    expect(generateCloudinarySrcSet(url, widths)).toBe(expected);
  });

  it('should generate correct srcSet for Cloudinary URL without version', () => {
    const url =
      'https://res.cloudinary.com/shinabr2/image/upload/Public/Images/TG5-1024x576.webp';
    const widths = [400, 800];

    const expected = [
      'https://res.cloudinary.com/shinabr2/image/upload/f_auto,q_auto,w_400/Public/Images/TG5-1024x576.webp 400w',
      'https://res.cloudinary.com/shinabr2/image/upload/f_auto,q_auto,w_800/Public/Images/TG5-1024x576.webp 800w',
    ].join(',\n    ');

    expect(generateCloudinarySrcSet(url, widths)).toBe(expected);
  });

  it('should handle invalid width values gracefully', () => {
    const url = 'https://res.cloudinary.com/shinabr2/image/upload/v1/test.jpg';
    expect(() => generateCloudinarySrcSet(url, [])).not.toThrow();
    expect(() => generateCloudinarySrcSet(url, [-100, 0])).not.toThrow();
    expect(() =>
      generateCloudinarySrcSet(url, [Number.MAX_SAFE_INTEGER]),
    ).not.toThrow();
  });
});

describe('ResponsiveImage Component', () => {
  it('should render with srcSet for Cloudinary URLs', () => {
    const url =
      'https://res.cloudinary.com/shinabr2/image/upload/v1670242747/Public/Images/TG5-1024x576.webp';
    render(<ResponsiveImage src={url} alt="Test image" />);

    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('src', url);
    expect(img).toHaveAttribute('srcSet');
    expect(img.getAttribute('srcSet')).toContain('w_400');
  });

  it('should render without srcSet for non-Cloudinary URLs', () => {
    const url = 'https://example.com/image.jpg';
    render(<ResponsiveImage src={url} alt="Test image" />);

    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('src', url);
    expect(img).not.toHaveAttribute('srcSet');
  });

  it('should pass through additional props', () => {
    render(
      <ResponsiveImage
        src="https://example.com/image.jpg"
        alt="Test image"
        className="custom-class"
        imgProps={{
          id: 'test-id',
        }}
      />,
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveClass('custom-class');
    expect(img).toHaveAttribute('id', 'test-id');
  });

  it('should use custom widths when provided', () => {
    const url =
      'https://res.cloudinary.com/shinabr2/image/upload/v1670242747/Public/Images/TG5-1024x576.webp';
    const customWidths = [300, 600];

    render(
      <ResponsiveImage src={url} alt="Test image" widths={customWidths} />,
    );

    const img = screen.getByAltText('Test image');
    const srcSet = img.getAttribute('srcSet') || '';

    expect(srcSet).toContain('w_300');
    expect(srcSet).toContain('w_600');
    expect(srcSet).not.toContain('w_400');
  });
});

describe('ResponsiveCardMedia Component', () => {
  const cloudinaryUrl =
    'https://res.cloudinary.com/shinabr2/image/upload/v1/test-image.jpg';
  const nonCloudinaryUrl = 'https://example.com/image.jpg';

  it('should render with srcSet for Cloudinary URLs', () => {
    render(<ResponsiveCardMedia src={cloudinaryUrl} alt="Cloudinary Image" />);

    const cardMedia = screen.getByAltText('Cloudinary Image');

    // Verify srcSet is generated for Cloudinary URLs
    expect(cardMedia.getAttribute('srcSet')).toBeTruthy();
  });

  it('should render without srcSet for non-Cloudinary URLs', () => {
    render(
      <ResponsiveCardMedia src={nonCloudinaryUrl} alt="Non-Cloudinary Image" />,
    );

    const cardMedia = screen.getByAltText('Non-Cloudinary Image');

    // Verify no srcSet for non-Cloudinary URLs
    expect(cardMedia).not.toHaveAttribute('srcSet');
  });

  it('should use custom sizes and widths when provided', () => {
    const customSizes = '(max-width: 768px) 80px';
    const customWidths = [80, 160];

    render(
      <ResponsiveCardMedia
        src={cloudinaryUrl}
        alt="Custom Card Media"
        sizes={customSizes}
        widths={customWidths}
      />,
    );

    const cardMedia = screen.getByAltText('Custom Card Media');

    // Verify sizes and srcSet
    expect(cardMedia).toHaveAttribute('sizes', customSizes);

    const srcSet = cardMedia.getAttribute('srcSet') || '';
    expect(srcSet).toContain('w_80');
    expect(srcSet).toContain('w_160');
  });

  it('should pass through additional props', () => {
    const dataTestId = 'card-media-test';
    render(
      <ResponsiveCardMedia
        src={nonCloudinaryUrl}
        alt="Props Card Media"
        data-testid={dataTestId}
        className="custom-class"
      />,
    );

    const cardMedia = screen.getByTestId(dataTestId);

    // Verify additional props are passed
    expect(cardMedia).toHaveClass('custom-class');
  });

  it('should handle undefined or empty src gracefully', () => {
    render(<ResponsiveCardMedia src="" alt="Empty Card Media" />);

    const cardMedia = screen.getByAltText('Empty Card Media');

    // Basic rendering check
    expect(cardMedia).toBeInTheDocument();

    // Verify no srcSet or sizes attributes
    expect(cardMedia).not.toHaveAttribute('srcSet');
    expect(cardMedia).not.toHaveAttribute('sizes');
  });
});

describe('ResponsiveAvatar Component', () => {
  const cloudinaryUrl =
    'https://res.cloudinary.com/shinabr2/image/upload/v1/test-image.jpg';
  const nonCloudinaryUrl = 'https://example.com/image.jpg';

  it('should render with srcSet for Cloudinary URLs', () => {
    render(<ResponsiveAvatar src={cloudinaryUrl} alt="Cloudinary Avatar" />);

    const avatar = screen.getByAltText('Cloudinary Avatar');

    // Verify srcSet is generated for Cloudinary URLs
    expect(avatar.getAttribute('srcSet')).toBeTruthy();
    expect(avatar.getAttribute('srcSet')).toContain('w_40');
    expect(avatar.getAttribute('srcSet')).toContain('w_80');
    expect(avatar.getAttribute('srcSet')).toContain('w_120');
  });

  it('should render without srcSet for non-Cloudinary URLs', () => {
    render(
      <ResponsiveAvatar src={nonCloudinaryUrl} alt="Non-Cloudinary Avatar" />,
    );

    const avatar = screen.getByAltText('Non-Cloudinary Avatar');

    // Verify no srcSet for non-Cloudinary URLs
    expect(avatar).not.toHaveAttribute('srcSet');
  });

  it('should use custom sizes and widths when provided', () => {
    const customSizes = '(max-width: 768px) 80px';
    const customWidths = [80, 160];

    render(
      <ResponsiveAvatar
        src={cloudinaryUrl}
        alt="Custom Avatar"
        sizes={customSizes}
        widths={customWidths}
      />,
    );

    const avatar = screen.getByAltText('Custom Avatar');

    // Verify sizes and srcSet
    expect(avatar).toHaveAttribute('sizes', customSizes);

    const srcSet = avatar.getAttribute('srcSet') || '';
    expect(srcSet).toContain('w_80');
    expect(srcSet).toContain('w_160');
    expect(srcSet).not.toContain('w_40');
  });

  it('should pass through additional props', () => {
    render(
      <ResponsiveAvatar
        src={nonCloudinaryUrl}
        alt="Props Avatar"
        className="custom-class"
        variant="rounded"
        data-testid="avatar-test"
      />,
    );

    const avatar = screen.getByTestId('avatar-test');

    // Verify additional props are passed
    expect(avatar).toHaveClass('custom-class');
    expect(avatar).toHaveClass('MuiAvatar-rounded');
  });

  it('should handle undefined or empty src gracefully', () => {
    const { container } = render(<ResponsiveAvatar alt="Empty Avatar" />);

    /**
     * By default mui will render an avatar
     */
    const avatar = container.querySelector('.MuiAvatar-root');

    // Basic rendering check
    expect(avatar).toBeInTheDocument();

    // Verify no srcSet or sizes attributes
    expect(avatar).not.toHaveAttribute('srcSet');
    expect(avatar).not.toHaveAttribute('sizes');
  });
});
