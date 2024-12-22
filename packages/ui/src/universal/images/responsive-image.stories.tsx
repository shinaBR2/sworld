import type { Meta, StoryObj } from '@storybook/react';
import { ResponsiveImage } from './image'; // Adjust import path
import { Box } from '@mui/material'; // Adjust import path as needed

/**
 * ResponsiveImage is a versatile image component with built-in
 * responsive image capabilities, particularly optimized for Cloudinary URLs.
 *
 * ## Features
 * - Automatic srcSet generation for Cloudinary images
 * - Supports custom sizes and widths
 * - Flexible styling options
 * - Fallback for non-Cloudinary images
 *
 * ## Usage
 * ```tsx
 * <ResponsiveImage
 *   src="https://example.com/image.jpg"
 *   alt="Description of image"
 *   sizes="(max-width: 600px) 300px, 600px"
 *   widths={[300, 600]}
 *   className="custom-image-class"
 * />
 * ```
 */
const meta: Meta<typeof ResponsiveImage> = {
  title: 'Universal/Images/ResponsiveImage',
  component: ResponsiveImage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible responsive image component with Cloudinary optimization.',
      },
    },
  },
  argTypes: {
    src: {
      control: 'text',
      description: 'Source URL of the image',
    },
    alt: {
      control: 'text',
      description: 'Alternative text for the image',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class for the image',
    },
    sizes: {
      control: 'text',
      description:
        'Sizes attribute for responsive images (especially useful for Cloudinary)',
      defaultValue: undefined,
    },
    widths: {
      control: 'array',
      description: 'Array of widths to generate srcSet for Cloudinary images',
      defaultValue: undefined,
    },
    imgProps: {
      control: 'object',
      description: 'Additional props to pass to the underlying img element',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ResponsiveImage>;

// Cloudinary URL story
export const CloudinaryImage: Story = {
  name: 'Cloudinary Image',
  args: {
    src: 'https://res.cloudinary.com/shinabr2/image/upload/v1670242747/Public/Images/TG5-1024x576.webp',
    alt: 'Cloudinary Responsive Image',
    className: 'max-w-full',
  },
  render: args => (
    <Box sx={{ border: '1px solid #ddd' }}>
      <ResponsiveImage {...args} />
      <Box px={2}>
        <p>Responsive Cloudinary Image with automatic srcSet generation</p>
      </Box>
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates a Cloudinary image with automatic responsive capabilities.',
      },
    },
  },
};

// Non-Cloudinary URL story
export const StandardImage: Story = {
  name: 'Standard Image',
  args: {
    src: 'https://picsum.photos/400/500',
    alt: 'Standard Image',
    className: 'max-w-full',
  },
  render: args => (
    <Box sx={{ border: '1px solid #ddd' }}>
      <ResponsiveImage {...args} />
      <Box px={2}>
        <p>Standard image without Cloudinary-specific optimizations</p>
      </Box>
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows how the component handles non-Cloudinary image URLs.',
      },
    },
  },
};

// Custom sizes and widths story
export const CustomSizesImage: Story = {
  name: 'Custom Sizes Image',
  args: {
    src: 'https://res.cloudinary.com/shinabr2/image/upload/v1670242747/Public/Images/TG5-1024x576.webp',
    alt: 'Custom Sizes Image',
    sizes: '(max-width: 600px) 300px, 600px',
    widths: [300, 600],
    className: 'max-w-full',
  },
  render: args => (
    <Box sx={{ border: '1px solid #ddd' }}>
      <ResponsiveImage {...args} />
      <Box px={2}>
        <p>Image with custom sizes and srcSet generation</p>
      </Box>
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Illustrates how to use custom sizes and widths for more precise responsive behavior.',
      },
    },
  },
};

// Image with additional props
export const ImageWithAdditionalProps: Story = {
  name: 'Image with Additional Props',
  args: {
    src: 'https://res.cloudinary.com/shinabr2/image/upload/v1670242747/Public/Images/TG5-1024x576.webp',
    alt: 'Image with Props',
    className: 'max-w-full',
    imgProps: {
      loading: 'lazy',
      decoding: 'async',
    },
  },
  render: args => (
    <Box sx={{ border: '1px solid #ddd' }}>
      <ResponsiveImage {...args} />
      <p>Image with additional img element props</p>
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates passing additional props to the underlying img element.',
      },
    },
  },
};

// No source image story
export const NoSourceImage: Story = {
  name: 'No Source Image',
  args: {
    alt: 'No Source Image',
  },
  render: args => (
    <Box sx={{ border: '1px solid #ddd' }}>
      <ResponsiveImage {...args} />
      <Box px={2}>
        <p>Handling scenario with no image source</p>
      </Box>
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates the component's behavior when no source is provided.",
      },
    },
  },
};
