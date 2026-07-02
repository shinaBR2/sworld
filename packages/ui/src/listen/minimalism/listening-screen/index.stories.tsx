import type { Meta, StoryObj } from '@storybook/react';
import type { listenQueryHooks } from 'core';
import { ListeningScreen } from './index';

type AudiosQueryRs = ReturnType<typeof listenQueryHooks.useLoadAudios>;

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

const allQueryRs = {
  isLoading: false,
  data: { audios, tags: [{ id: 't1', name: 'Chill' }] },
} as unknown as AudiosQueryRs;

const meta: Meta<typeof ListeningScreen> = {
  title: 'Listen/ListeningScreen',
  component: ListeningScreen,
  parameters: { layout: 'fullscreen' },
  args: {
    sites: { listen: '#', watch: '#', play: '#', til: '#' },
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
  },
};

export default meta;
type Story = StoryObj<typeof ListeningScreen>;

export const AllWithFeelings: Story = {
  args: {
    mode: 'all',
    collectionValue: 'all',
    queryRs: allQueryRs,
  },
};

export const PlaylistNoFeelings: Story = {
  args: {
    mode: 'playlist',
    collectionValue: 'p1',
    isLoading: false,
  },
};
