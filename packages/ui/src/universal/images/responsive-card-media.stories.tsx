import type { Meta, StoryObj } from '@storybook/react';
import { ResponsiveCardMedia } from './image'; // Adjust import path
import { Card, CardContent } from '@mui/material'; // Adjust import path as needed

/**
 * ResponsiveCardMedia is a wrapper around Material-UI's CardMedia component
 * that adds responsive image capabilities, particularly for Cloudinary URLs.
 *
 * ## Features
 * - Automatic srcSet generation for Cloudinary images
 * - Supports custom sizes and widths
 * - Maintains responsive design principles
 * - Fallback for non-Cloudinary images
 *
 * ## Usage
 * ```tsx
 * <ResponsiveCardMedia
 *   src="https://res.cloudinary.com/shinabr2/image/upload/v1670242747/Public/Images/TG5-1024x576.webp"
 *   alt="Description of image"
 *   sizes="(max-width: 600px) 300px, 600px"
 *   widths={[300, 600]}
 * />
 * ```
 */
const meta: Meta<typeof ResponsiveCardMedia> = {
  title: 'Universal/Images/ResponsiveCardMedia',
  component: ResponsiveCardMedia,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ResponsiveCardMedia>;

// Cloudinary URL story
export const CloudinaryImage: Story = {
  args: {
    src: 'https://res.cloudinary.com/shinabr2/image/upload/v1670242747/Public/Images/TG5-1024x576.webp',
    alt: 'Cloudinary Image',
    sx: { maxWidth: 400 },
  },
  render: args => (
    <Card sx={{ maxWidth: 400 }}>
      <ResponsiveCardMedia {...args} />
      <CardContent>
        <p>Responsive Cloudinary Image</p>
      </CardContent>
    </Card>
  ),
};

// Non-Cloudinary URL story
export const StandardImage: Story = {
  args: {
    src: 'https://picsum.photos/400/500',
    alt: 'Standard Image',
    sx: { maxWidth: 400 },
  },
  render: args => (
    <Card sx={{ maxWidth: 400 }}>
      <ResponsiveCardMedia {...args} />
      <CardContent>
        <p>Standard Image</p>
      </CardContent>
    </Card>
  ),
};

// Custom sizes and widths story
export const CustomSizesImage: Story = {
  args: {
    src: 'https://res.cloudinary.com/shinabr2/image/upload/v1670242747/Public/Images/TG5-1024x576.webp',
    alt: 'Custom Sizes Image',
    sizes: '(max-width: 600px) 300px, 600px',
    widths: [300, 600],
    sx: { maxWidth: 400 },
  },
  render: args => (
    <Card sx={{ maxWidth: 400 }}>
      <ResponsiveCardMedia {...args} />
      <CardContent>
        <p>Image with Custom Sizes</p>
      </CardContent>
    </Card>
  ),
};

// No source image story
export const NoSourceImage: Story = {
  args: {
    alt: 'No Source Image',
    sx: { maxWidth: 400 },
  },
  render: args => (
    <Card sx={{ maxWidth: 400 }}>
      <ResponsiveCardMedia {...args} />
      <CardContent>
        <p>No Source Image</p>
      </CardContent>
    </Card>
  ),
};
