import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/tanstack-react';
import type { TransformedPhoto } from 'core/look/query-hooks/types';
import type { LinkComponentType } from '../../photos/types';
import { PhotoTimelineContainer } from '.';

const MockLink: LinkComponentType = ({ to, children, style }) => (
  <a href={to} style={style}>
    {children}
  </a>
);

// Spread a large set across several months so the virtualized, month-grouped
// layout is visible — only the on-screen rows should be in the DOM.
const MONTHS = [
  '2023-06',
  '2023-05',
  '2023-04',
  '2023-03',
  '2023-02',
  '2023-01',
];

const makePhotos = (count: number): TransformedPhoto[] =>
  Array.from({ length: count }, (_, index) => {
    const month = MONTHS[index % MONTHS.length];
    const day = String((index % 27) + 1).padStart(2, '0');
    return {
      id: `photo-${index}`,
      source: `https://picsum.photos/seed/look-${index}/1200/1200`,
      mediumUrl: `https://picsum.photos/seed/look-${index}/1200/1200`,
      thumbnailUrl: `https://picsum.photos/seed/look-${index}/400/400`,
      blurHash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
      width: 1200,
      height: 1200,
      takenAt: `${month}-${day}T10:00:00Z`,
      slug: `photo-${index}`,
    };
  });

const meta: Meta<typeof PhotoTimelineContainer> = {
  title: 'Look/PhotoTimelineContainer',
  component: PhotoTimelineContainer,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <Stack sx={{ height: '100vh' }}>
        <Story />
      </Stack>
    ),
  ],
  args: { LinkComponent: MockLink },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PhotoTimelineContainer>;

export const Populated: Story = {
  args: {
    queryRs: { photos: makePhotos(240), isLoading: false, error: null },
  },
};

export const Loading: Story = {
  args: {
    queryRs: { photos: [], isLoading: true, error: null },
  },
};

export const Empty: Story = {
  args: {
    queryRs: { photos: [], isLoading: false, error: null },
  },
};
