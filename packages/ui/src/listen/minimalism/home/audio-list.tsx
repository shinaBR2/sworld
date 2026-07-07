import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import hooks from 'core';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useIsMobile } from '../../../universal/responsive';
import MusicWidget from '../music-widget';
import { MusicWidgetSkeleton } from '../music-widget/music-widget-skeleton';
import { PlayingListSkeleton } from './playing-list-skeleton';

const { useSAudioPlayer } = hooks;

const NoItem = () => {
  return <Typography variant="body2">No audios found</Typography>;
};

interface AudioListProps {
  // Only `isLoading` is read here, so accept any loading-bearing result —
  // this lets both the home (useLoadHome) and a playlist feed the player.
  queryRs: { isLoading: boolean };
  list: unknown[];
  activeFeelingId: string;
  // The playing track as an id, mirrored to the URL. `activeAudioId` seeds the
  // player's index; `onAudioChange` reports the current track's id back up.
  activeAudioId: string;
  onAudioChange: (id: string) => void;
}

const toAudioItem = (item: any) => {
  const tags = Array.isArray(item.audio_tags) ? item.audio_tags : [];

  return {
    ...item,
    src: item.source,
    image: item.thumbnailUrl,
    tagIds: tags.map((t: { tag_id: string }) => t.tag_id),
  };
};

const PlayingList = lazy(() => import('./playing-list'));

const Content = (props: AudioListProps) => {
  const {
    list: originalList,
    activeFeelingId,
    activeAudioId,
    onAudioChange,
  } = props;
  // TODO
  // memorize on parent
  const list = useMemo(() => {
    return originalList
      .map((i) => toAudioItem(i))
      .filter(
        (i) => !activeFeelingId || i.tagIds.indexOf(activeFeelingId) > -1,
      );
  }, [originalList, activeFeelingId]);

  // Which track is selected, as a position in `list`. The player is driven by
  // this state directly (not by the URL), so selecting/advancing behaves
  // exactly as before; the URL is mirrored alongside it below. Seeded from the
  // URL so a deep link (`?audio=<id>`) opens on that track; a missing/stale id
  // falls back to the first.
  const [index, setIndex] = useState(() => {
    const found = list.findIndex((a) => a.id === activeAudioId);

    return found < 0 ? 0 : found;
  });

  const isMobile = useIsMobile();

  const hookResult = useSAudioPlayer({
    audioList: list,
    index,
  });
  const { getControlsProps, playerState } = hookResult;
  const { isPlay, currentIndex } = playerState;
  const { onPlay } = getControlsProps();

  // `lastSyncedId` is the track id the player and the URL currently agree on.
  // Comparing against this ref — not the `activeAudioId` prop, which lags a
  // render — is what keeps the two directions from fighting: a URL write we
  // made ourselves is recognised and never fed back into the player, so a
  // shuffle round-trip (where the player's flat index and the hook's permuted
  // index differ) can't oscillate. The player owns its position; the URL follows.
  const [engaged, setEngaged] = useState(false);
  const lastSyncedId = useRef(activeAudioId);

  // Engage on first playback so a page the user only loaded (never played)
  // keeps a clean URL — nothing is mirrored until something actually plays.
  useEffect(() => {
    if (isPlay) {
      setEngaged(true);
    }
  }, [isPlay]);

  // player -> URL: reflect a track change the player drove itself
  // (next/prev/shuffle/auto-advance) once the user has engaged.
  useEffect(() => {
    if (!engaged) {
      return;
    }

    const current = list[currentIndex];

    if (current && current.id !== lastSyncedId.current) {
      lastSyncedId.current = current.id;
      onAudioChange(current.id);
    }
  }, [engaged, currentIndex, list, onAudioChange]);

  // URL -> player: an external change (browser back/forward, a shared link)
  // moves the player. Writes we made ourselves match `lastSyncedId` and are
  // skipped, so there's no feedback loop.
  useEffect(() => {
    if (activeAudioId === lastSyncedId.current) {
      return;
    }

    lastSyncedId.current = activeAudioId;

    const found = list.findIndex((a) => a.id === activeAudioId);

    if (found >= 0) {
      setIndex(found);
    }
  }, [activeAudioId, list]);

  // Changing the feeling filter resets to the first track of the new list,
  // matching the pre-URL behaviour.
  useEffect(() => {
    if (activeFeelingId) {
      setIndex(0);
    }
  }, [activeFeelingId]);

  const onItemSelect = (id: string) => {
    setEngaged(true);

    const found = list.findIndex((a) => a.id === id);

    setIndex(found < 0 ? 0 : found);
    lastSyncedId.current = id;
    onAudioChange(id);

    if (!isPlay) {
      onPlay();
    }
  };

  const hasNoItem = !list.length;
  const currentAudio =
    list[typeof currentIndex === 'number' ? currentIndex : 0];
  const showPlayingList = !isMobile && !hasNoItem && !!currentAudio;

  if (hasNoItem) {
    return <NoItem />;
  }

  return (
    <Grid container spacing={2}>
      {showPlayingList && (
        <Grid size={{ md: 8, sm: 6 }}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              maxHeight: '462px',
              overflowY: 'auto',
            }}
          >
            <Suspense fallback={<PlayingListSkeleton />}>
              <PlayingList
                audioList={list}
                onItemSelect={onItemSelect}
                currentId={currentAudio.id}
              />
            </Suspense>
          </Card>
        </Grid>
      )}
      <Grid
        container
        size={{
          md: 4,
          sm: 6,
          xs: 12,
        }}
        sx={{
          justifyContent: 'center',
        }}
      >
        <MusicWidget
          audioList={list}
          hookResult={hookResult}
          onItemSelect={onItemSelect}
        />
      </Grid>
    </Grid>
  );
};

const AudioList = (props: AudioListProps) => {
  const { queryRs } = props;
  const { isLoading } = queryRs;
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {!isMobile && (
          <Grid size={{ md: 8, sm: 6 }}>
            <PlayingListSkeleton />
          </Grid>
        )}
        <Grid
          container
          size={{
            md: 4,
            sm: 6,
            xs: 12,
          }}
          sx={{
            justifyContent: 'center',
          }}
        >
          <MusicWidgetSkeleton />
        </Grid>
      </Grid>
    );
  }

  return <Content {...props} />;
};

export { AudioList };
