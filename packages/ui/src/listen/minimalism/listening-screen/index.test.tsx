import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ListeningScreen } from './index';

// Stub the heavy children; this test covers ListeningScreen's own wiring
// (mode-driven feeling filter, and opening the create dialog from the select).
vi.mock('../header', () => ({ Header: () => <div>Header</div> }));
vi.mock('../home/settings', () => ({
  SettingsPanel: () => <div>SettingsPanel</div>,
}));
vi.mock('../home/audio-list', () => ({
  AudioList: () => <div>AudioList</div>,
}));
vi.mock('../home/feeling-list', () => ({
  FeelingList: () => <div>FeelingList</div>,
}));
vi.mock('../collection-select', () => ({
  CollectionSelect: (props: { value: string; onCreateNew: () => void }) => (
    <div>
      <span>collection:{props.value}</span>
      <button type="button" onClick={props.onCreateNew}>
        new
      </button>
    </div>
  ),
}));

const baseProps = {
  sites: { listen: '', watch: '', play: '', til: '' },
  user: null,
  onSignIn: vi.fn(),
  onLogout: vi.fn(),
  playlists: [{ id: 'p1', title: 'Hakuoki' }],
  onSelectCollection: vi.fn(),
  onCreate: vi.fn(),
  audios: [],
  isLoading: false,
};

describe('ListeningScreen', () => {
  it('shows the feeling filter in All mode', () => {
    render(
      <ListeningScreen
        {...baseProps}
        mode="all"
        collectionValue="all"
        feelings={[]}
      />,
    );

    expect(screen.getByText('FeelingList')).toBeInTheDocument();
    expect(screen.getByText('collection:all')).toBeInTheDocument();
  });

  it('hides the feeling filter in playlist mode', () => {
    render(
      <ListeningScreen
        {...baseProps}
        mode="playlist"
        collectionValue="p1"
        isLoading={false}
      />,
    );

    expect(screen.queryByText('FeelingList')).not.toBeInTheDocument();
    expect(screen.getByText('collection:p1')).toBeInTheDocument();
  });

  it('opens the create dialog from the select New action', () => {
    render(
      <ListeningScreen
        {...baseProps}
        mode="all"
        collectionValue="all"
        feelings={[]}
      />,
    );

    expect(screen.queryByText('New playlist')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'new' }));
    expect(screen.getByText('New playlist')).toBeInTheDocument();
  });
});
