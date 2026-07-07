import type { Meta, StoryObj } from '@storybook/tanstack-react';
import { GlassmorphismProvider } from '../../../universal/minimalism';
import { ListeningScreen } from './index';

const audios = [
  {
    id: '1',
    name: 'Reimei',
    source: '',
    thumbnailUrl: '',
    artistName: 'Maon Kurosaki',
    audio_tags: [],
  },
];

const meta: Meta<typeof ListeningScreen> = {
  title: 'Listen/ListeningScreen',
  component: ListeningScreen,
  parameters: { layout: 'fullscreen' },
  // The shared Header's ThemeToggleButton reads the glassmorphism theme context.
  decorators: [
    (Story) => (
      <GlassmorphismProvider>
        <Story />
      </GlassmorphismProvider>
    ),
  ],
  args: {
    sites: { main: '#', listen: '#', watch: '#', til: '#' },
    user: null,
    onSignIn: () => {},
    onLogout: () => {},
    playlists: [
      { id: 'p1', title: 'Hakuoki' },
      { id: 'p2', title: 'OST' },
    ],
    onSelectCollection: () => {},
    onCreate: () => {},
    audios,
    isLoading: false,
    activeAudioId: '',
    onAudioChange: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof ListeningScreen>;

export const AllWithFeelings: Story = {
  args: {
    mode: 'all',
    collectionValue: 'all',
    feelings: [{ id: 't1', name: 'Chill' }],
  },
};

export const PlaylistNoFeelings: Story = {
  args: {
    mode: 'playlist',
    collectionValue: 'p1',
  },
};
