import Card from '@mui/material/Card';
import type { Meta, StoryObj } from '@storybook/tanstack-react';
import { BlurImage } from '.';

const meta: Meta<typeof BlurImage> = {
  title: 'Look/BlurImage',
  component: BlurImage,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <Card
        sx={{
          position: 'relative',
          width: 300,
          aspectRatio: '1 / 1',
          overflow: 'hidden',
        }}
      >
        <Story />
      </Card>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BlurImage>;

export const WithThumbnail: Story = {
  args: {
    src: 'https://picsum.photos/seed/look-blur/600/600',
    alt: 'Sample photo',
    blurHash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
  },
};

export const PlaceholderOnly: Story = {
  args: {
    src: 'https://picsum.photos/seed/look-blur-slow/600/600?delay=3',
    alt: 'Loading photo',
    blurHash: 'LKN]Rv%2Tw=w]~RBVZRi};RPxuwH',
  },
};

export const NoBlurHash: Story = {
  args: {
    src: 'https://picsum.photos/seed/look-no-hash/600/600',
    alt: 'Photo without a blur hash',
  },
};
