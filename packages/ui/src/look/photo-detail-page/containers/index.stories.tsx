import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/tanstack-react';
import type { TransformedPhoto } from 'core/look/query-hooks/types';
import { useState } from 'react';
import { PhotoLightbox } from '.';

const makePhotos = (count: number): TransformedPhoto[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `photo-${index}`,
    type: 'image',
    source: `https://picsum.photos/seed/look-${index}/1600/1200`,
    mediumUrl: `https://picsum.photos/seed/look-${index}/1200/900`,
    thumbnailUrl: `https://picsum.photos/seed/look-${index}/400/300`,
    blurHash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
    width: 1600,
    height: 1200,
    duration: null,
    takenAt: '2023-03-15T10:00:00Z',
    slug: `photo-${index}`,
  }));

const photos = makePhotos(6);

// A stateful harness so the story exercises open/close and ←/→ navigation.
const LightboxHarness = () => {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <Stack sx={{ p: 3, gap: 2 }}>
      <Button variant="contained" onClick={() => setActiveId(photos[0].id)}>
        Open lightbox
      </Button>
      <PhotoLightbox
        photos={photos}
        activeId={activeId ?? photos[0].id}
        open={activeId !== null}
        onClose={() => setActiveId(null)}
        onActiveIdChange={setActiveId}
      />
    </Stack>
  );
};

const meta: Meta<typeof PhotoLightbox> = {
  title: 'Look/PhotoLightbox',
  component: PhotoLightbox,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PhotoLightbox>;

export const Interactive: Story = {
  render: () => <LightboxHarness />,
};

export const OpenOnLast: Story = {
  render: () => {
    const [activeId, setActiveId] = useState(photos[photos.length - 1].id);
    return (
      <PhotoLightbox
        photos={photos}
        activeId={activeId}
        open
        onClose={() => undefined}
        onActiveIdChange={setActiveId}
      />
    );
  },
};
