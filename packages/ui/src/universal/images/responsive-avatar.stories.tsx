import type { Meta, StoryObj } from '@storybook/react';
import { ResponsiveAvatar } from './image'; // Adjust import path

/**
 * ResponsiveAvatar is a wrapper around Material-UI's Avatar component
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
 * <ResponsiveAvatar
 *   src="https://example.com/image.jpg"
 *   alt="Description of avatar"
 *   sizes="(max-width: 600px) 40px, 80px"
 *   widths={[40, 80]}
 * />
 * ```
 */
const meta: Meta<typeof ResponsiveAvatar> = {
  title: 'Universal/Images/ResponsiveAvatar',
  component: ResponsiveAvatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A responsive avatar component with built-in Cloudinary support.',
      },
    },
  },
  argTypes: {
    src: {
      control: 'text',
      description: 'Source URL of the avatar image',
    },
    alt: {
      control: 'text',
      description: 'Alternative text for the avatar',
    },
    sizes: {
      control: 'text',
      description: 'Sizes attribute for responsive images (especially useful for Cloudinary)',
      defaultValue: undefined,
    },
    widths: {
      control: 'array',
      description: 'Array of widths to generate srcSet for Cloudinary images',
      defaultValue: [40, 80, 120],
    },
    variant: {
      control: 'select',
      options: ['circular', 'rounded', 'square'],
      description: 'Shape of the avatar',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ResponsiveAvatar>;

// Cloudinary URL story
export const CloudinaryImage: Story = {
  name: 'Cloudinary Avatar',
  args: {
    src: 'https://res.cloudinary.com/shinabr2/image/upload/v1670242747/Public/Images/TG5-1024x576.webp',
    alt: 'Cloudinary Avatar',
    variant: 'circular',
  },
  render: args => (
    <div
      style={{
        width: 400,
        border: '1px solid #ddd',
        padding: 16,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <ResponsiveAvatar {...args} />
    </div>
  ),
};

// Non-Cloudinary URL story
export const StandardImage: Story = {
  name: 'Standard Avatar',
  args: {
    src: 'https://picsum.photos/400/500',
    alt: 'Standard Avatar',
    variant: 'rounded',
  },
  render: args => (
    <div
      style={{
        width: 400,
        border: '1px solid #ddd',
        padding: 16,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <ResponsiveAvatar {...args} />
    </div>
  ),
};

// Variants story
export const AvatarVariants: Story = {
  name: 'Avatar Variants',
  render: args => (
    <div
      style={{
        width: 400,
        border: '1px solid #ddd',
        padding: 16,
        display: 'flex',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <ResponsiveAvatar
        {...args}
        src="https://res.cloudinary.com/shinabr2/image/upload/v1670242747/Public/Images/TG5-1024x576.webp"
        alt="Circular Avatar"
        variant="circular"
      />
      <ResponsiveAvatar
        {...args}
        src="https://res.cloudinary.com/shinabr2/image/upload/v1670242747/Public/Images/TG5-1024x576.webp"
        alt="Rounded Avatar"
        variant="rounded"
      />
      <ResponsiveAvatar
        {...args}
        src="https://res.cloudinary.com/shinabr2/image/upload/v1670242747/Public/Images/TG5-1024x576.webp"
        alt="Square Avatar"
        variant="square"
      />
    </div>
  ),
};

// Custom sizes story
export const CustomSizesAvatar: Story = {
  name: 'Custom Sizes Avatar',
  args: {
    src: 'https://res.cloudinary.com/shinabr2/image/upload/v1670242747/Public/Images/TG5-1024x576.webp',
    alt: 'Custom Sizes Avatar',
    sizes: '(max-width: 600px) 40px, 80px',
    widths: [40, 80],
    variant: 'rounded',
  },
  render: args => (
    <div
      style={{
        width: 400,
        border: '1px solid #ddd',
        padding: 16,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <ResponsiveAvatar {...args} />
    </div>
  ),
};

// No source image story
export const NoSourceAvatar: Story = {
  name: 'No Source Avatar',
  args: {
    alt: 'No Source Avatar',
  },
  render: args => (
    <div
      style={{
        width: 400,
        border: '1px solid #ddd',
        padding: 16,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <ResponsiveAvatar {...args} />
    </div>
  ),
};
