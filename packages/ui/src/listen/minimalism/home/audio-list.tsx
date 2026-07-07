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
  // player's initial selection; `onAudioChange` writes the current track's id
  // back to the URL as the player moves (one-way — the URL never re-drives the
  // player).
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

  // Which track is selected, as a position in `list`. The player owns this from
  // here on; the URL is seeded into it once (below) and is otherwise a one-way
  // output, so nothing the URL does can feed back and fight the player.
  const [index, setIndex] = useState(0);

  const isMobile = useIsMobile();

  const hookResult = useSAudioPlayer({
    audioList: list,
    index,
  });
  const { getControlsProps, playerState } = hookResult;
  const { isPlay, currentIndex } = playerState;
  const { onPlay } = getControlsProps();

  // Seed the selection from the URL exactly once, when the list is first
  // available (deep link / refresh). `seededRef` also makes this a no-op on
  // every later `activeAudioId` change — including the ones our own mirror
  // causes — so the URL never re-drives the player. That one-way flow is what
  // makes the whole thing race-free. It also records the track we started on so
  // the mirror below knows not to re-write it.
  const seededRef = useRef(false);
  const lastSyncedId = useRef(activeAudioId);
  const seededTrackId = useRef<string | null>(null);
  const armed = useRef(false);
  const listRef = useRef(list);

  useEffect(() => {
    listRef.current = list;
  }, [list]);

  useEffect(() => {
    if (seededRef.current || !list.length) {
      return;
    }

    seededRef.current = true;

    const found = list.findIndex((a) => a.id === activeAudioId);

    if (found >= 0) {
      setIndex(found);
    }

    const startId = list[found >= 0 ? found : 0].id;
    seededTrackId.current = startId;
    lastSyncedId.current = startId;
  }, [list, activeAudioId]);

  // player -> URL (the only direction that writes): replace `?audio=` with the
  // current track whenever the player moves. It reads `list` through a ref and
  // depends only on `currentIndex`, so it fires on real track changes, not on
  // unrelated churn. It stays disarmed until the player has actually settled on
  // the seeded track — that skips the mount transient (currentIndex lags the
  // seed by a render) and, unlike a "skip first run" flag, survives StrictMode's
  // double effect invocation, so a freshly loaded page keeps a clean URL.
  useEffect(() => {
    const current = listRef.current[currentIndex];

    if (!current) {
      return;
    }

    if (!armed.current) {
      if (current.id === seededTrackId.current) {
        armed.current = true;
      }

      return;
    }

    if (current.id !== lastSyncedId.current) {
      lastSyncedId.current = current.id;
      onAudioChange(current.id);
    }
  }, [currentIndex, onAudioChange]);

  // Filtering rebuilds the list; reset to its first track (pre-URL behaviour).
  useEffect(() => {
    if (activeFeelingId) {
      setIndex(0);
    }
  }, [activeFeelingId]);

  const onItemSelect = (id: string) => {
    const found = list.findIndex((a) => a.id === id);

    setIndex(found < 0 ? 0 : found);

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
