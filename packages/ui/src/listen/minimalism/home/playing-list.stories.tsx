import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import PlayingList from './playing-list';

const meta: Meta<typeof PlayingList> = {
  title: 'Listen/Home/PlayingList',
  component: PlayingList,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <Box width={'600px'}>
        <Story />
      </Box>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PlayingList>;

export const Loaded: Story = {
  render: () => {
    const [currentId, setCurrentId] = useState('uuid-1');

    const handleItemSelect = (id: string) => {
      setCurrentId(id);
    };

    return (
      <PlayingList
        audioList={[
          {
            id: 'uuid-1',
            src: 'https://example.com/song.mp3',
            name: 'Unravel',
            image:
              'https://res.cloudinary.com/shinabr2/image/upload/v1670242747/Public/Images/TG5-1024x576.webp',
            artistName: 'TK',
          },
          {
            id: 'uuid-2',
            src: 'https://example.com/song.mp3',
            name: 'Unity',
            image:
              'https://res.cloudinary.com/shinabr2/image/upload/v1672487897/Public/Images/GOSICK.jpg',
            artistName: 'Lisa Komine',
          },
        ]}
        currentId={currentId}
        onItemSelect={handleItemSelect}
      />
    );
  },
};

export const Empty: Story = {
  render: () => {
    return <PlayingList audioList={[]} currentId="" onItemSelect={() => {}} />;
  },
};
