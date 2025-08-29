import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react';

import hooks from 'core';
import theme from '../theme';

const { useSAudioPlayer } = hooks;

import MusicWidget from './music-widget';

const audioList = [
  {
    id: 'uuid-1',
    src: 'https://res.cloudinary.com/shinabr2/video/upload/v1667828415/Public/Music/Japanese/Attack-on-Titan-Opening-1-Feuerroter-Pfeil-und-Bogen-Full-128-Linked-Horizon_1.mp3',
    name: 'Guren No Yumiya',
    artistName: 'Linked Horizon',
    image:
      'https://res.cloudinary.com/shinabr2/image/upload/v1667828561/Public/Images/artworks-000141088556-xy2nav-t500x500.jpg',
  },
  {
    id: 'uuid-2',
    src: 'https://res.cloudinary.com/shinabr2/video/upload/v1667831555/Public/Music/Japanese/Shinzou_wo_Sasageyo__-_Linked_Horizon.mp3',
    name: 'Shinzo wo Sasageyo',
    artistName: 'Linked Horizon',
    image:
      'https://res.cloudinary.com/shinabr2/image/upload/v1667828561/Public/Images/artworks-000141088556-xy2nav-t500x500.jpg',
  },
];

const meta: Meta<typeof MusicWidget> = {
  title: 'Music widget',
  component: MusicWidget,
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof MusicWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

// Render function to handle the hook
const render: Story['render'] = (args) => {
  const hookResult = useSAudioPlayer({
    audioList: args.audioList,
    index: 0,
  });
  const props = {
    ...args,
    hookResult,
  };

  return <MusicWidget {...props} />;
};

export const Basic: Story = {
  args: {
    audioList,
  },
  render,
};
