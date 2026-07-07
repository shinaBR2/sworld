import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import hooks from 'core';
import { lazy, Suspense, useEffect, useMemo, useRef } from 'react';
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
  // player's index; `onAudioChange` reports the current track's id back up
  // (`replace` = false pushes a history entry, true replaces the current one).
  activeAudioId: string;
  onAudioChange: (id: string, replace: boolean) => void;
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

  // The URL is the source of truth for the selected track: derive the player's
  // flat index from `activeAudioId` (a missing/stale id falls back to the first
  // track). The player now addresses tracks by flat position, so a mirrored id
  // fed back through here resolves to the same track — the round-trip is
  // idempotent, which is what lets both directions share one piece of state
  // without any anti-loop bookkeeping. Filtering by feeling recomputes here too:
  // the active track is kept if still present, otherwise it falls back to first.
  const index = useMemo(() => {
    const found = list.findIndex((a) => a.id === activeAudioId);

    return found < 0 ? 0 : found;
  }, [list, activeAudioId]);

  const isMobile = useIsMobile();

  const hookResult = useSAudioPlayer({
    audioList: list,
    index,
  });
  const { getControlsProps, playerState } = hookResult;
  const { isPlay, currentIndex } = playerState;
  const { onPlay } = getControlsProps();

  // `lastSyncedId` is the track the URL and player currently agree on. Both the
  // URL->player and player->URL directions update it, so neither treats the
  // other's change as new work to undo.
  const lastSyncedId = useRef(activeAudioId);
  // Whether we're past the initial mount settle — a freshly loaded page mustn't
  // write the default first track into the URL before the user does anything.
  const hasSettled = useRef(false);

  // An external URL change (browser back/forward, a shared link) is the source
  // of truth: record it so the mirror below doesn't mistake it for a
  // player-driven change and revert it.
  useEffect(() => {
    lastSyncedId.current = activeAudioId;
  }, [activeAudioId]);

  // player -> URL: mirror a track change the player made itself (next/prev,
  // shuffle, auto-advance). Depending only on `currentIndex` is deliberate — it
  // means this never runs on the same commit an external URL change arrives
  // (when `currentIndex` still lags a render behind), which is what stops
  // back/forward navigation from oscillating. Uses replace so a run of
  // auto-advances doesn't bury the back button.
  useEffect(() => {
    if (!hasSettled.current) {
      hasSettled.current = true;

      return;
    }

    const current = list[currentIndex];

    if (current && current.id !== lastSyncedId.current) {
      lastSyncedId.current = current.id;
      onAudioChange(current.id, true);
    }
  }, [currentIndex, list, onAudioChange]);

  const onItemSelect = (id: string) => {
    // An explicit pick is a real navigation, so push a history entry (the back
    // button returns to the previous track); player-driven changes replace.
    lastSyncedId.current = id;
    onAudioChange(id, false);

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
