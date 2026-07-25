import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/tanstack-react';
import type { TransformedPhoto } from 'core/look/query-hooks/types';
import type { LinkComponentType } from '../types';
import { PhotoCard } from '.';

const MockLink: LinkComponentType = ({ to, children, style }) => (
  <a href={to} style={style}>
    {children}
  </a>
);

const mockPhoto: TransformedPhoto = {
  id: 'photo-1',
  type: 'image',
  source: 'https://picsum.photos/seed/look-card/1200/1200',
  mediumUrl: 'https://picsum.photos/seed/look-card/1200/1200',
  thumbnailUrl: 'https://picsum.photos/seed/look-card/400/400',
  blurHash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
  width: 1200,
  height: 1200,
  duration: null,
  takenAt: '2023-03-15T10:00:00Z',
  slug: 'a-sample-photo',
};

const meta: Meta<typeof PhotoCard> = {
  title: 'Look/PhotoCard',
  component: PhotoCard,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <Stack sx={{ width: 260 }}>
        <Story />
      </Stack>
    ),
  ],
  args: { photo: mockPhoto },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PhotoCard>;

export const Static: Story = {};

export const AsLink: Story = {
  args: {
    LinkComponent: MockLink,
    linkProps: {
      to: '/photo/a-sample-photo',
      params: { photoId: 'a-sample-photo' },
    },
  },
};
