import { Avatar, AvatarProps } from '@mui/material';
import CardMedia from '@mui/material/CardMedia';
import React from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  // Optional: Allow custom sizes if needed
  sizes?: string;
  // Optional: Allow forcing certain widths
  widths?: number[];
  // Optional: Add any other img attributes
  imgProps?: React.ImgHTMLAttributes<HTMLImageElement>;
}

const generateCloudinarySrcSet = (
  url: string,
  widths: number[] = [400, 800, 1200]
): string => {
  try {
    // Find the position of /upload/ in the URL
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return '';

    // Split URL into base and path parts
    const baseUrl = url.substring(0, uploadIndex);

    // Extract version and remaining path
    const afterUpload = url.substring(uploadIndex + '/upload/'.length);
    const versionMatch = afterUpload.match(/^v\d+\//);
    const version = versionMatch ? versionMatch[0] : ''; // includes the trailing slash
    const imagePath = versionMatch
      ? afterUpload.substring(versionMatch[0].length)
      : afterUpload;

    // Generate srcSet for each width
    return widths
      .map(width => {
        const transformedUrl = `${baseUrl}/upload/f_auto,q_auto,w_${width}/${version}${imagePath}`;
        return `${transformedUrl} ${width}w`;
      })
      .join(',\n    ');
  } catch (error) {
    console.error('Error generating Cloudinary srcSet:', error);
    return '';
  }
};

const isCloudinaryUrl = (url: string): boolean => {
  if (!url) {
    return false;
  }
  return url.includes('cloudinary.com') && url.includes('/upload/');
};

const ResponsiveImage = ({
  src,
  alt,
  className = '',
  sizes = '(max-width: 768px) 400px, (max-width: 1200px) 800px, 1024px',
  widths = [400, 800, 1200],
  imgProps = {},
  ...rest
}: ResponsiveImageProps) => {
  const isCloudinary = isCloudinaryUrl(src);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      sizes={isCloudinary ? sizes : undefined}
      srcSet={isCloudinary ? generateCloudinarySrcSet(src, widths) : undefined}
      {...imgProps}
      {...rest}
    />
  );
};

// Optional: Add component for Material UI CardMedia
interface ResponsiveCardMediaProps extends ResponsiveImageProps {
  component?: 'img'; // Lock to img for proper responsive behavior
  sx?: Record<string, any>;
}

const ResponsiveCardMedia = ({
  src,
  alt,
  className,
  sizes,
  widths,
  sx = {},
  ...props
}: ResponsiveCardMediaProps) => {
  return (
    <CardMedia
      component="img"
      image={src}
      alt={alt}
      className={className}
      sizes={isCloudinaryUrl(src) ? sizes : undefined}
      srcSet={
        isCloudinaryUrl(src) ? generateCloudinarySrcSet(src, widths) : undefined
      }
      sx={{
        width: '100%',
        height: 'auto',
        aspectRatio: '16/9',
        objectFit: 'cover',
        ...sx,
      }}
      {...props}
    />
  );
};

interface ResponsiveAvatarProps extends AvatarProps {
  sx?: Record<string, any>;
  widths?: number[];
}

const ResponsiveAvatar = ({
  src,
  alt,
  className,
  sizes,
  widths = [40, 80, 120],
  ...props
}: ResponsiveAvatarProps) => {
  const safeSrc = src ?? '';
  const srcSet = isCloudinaryUrl(safeSrc)
    ? generateCloudinarySrcSet(safeSrc, widths)
    : undefined;

  return (
    <Avatar
      src={src}
      alt={alt}
      className={className}
      sizes={isCloudinaryUrl(src!) ? sizes : undefined}
      srcSet={srcSet}
      {...props}
    />
  );
};

export {
  generateCloudinarySrcSet,
  isCloudinaryUrl,
  ResponsiveImage,
  ResponsiveCardMedia,
  ResponsiveAvatar,
};
