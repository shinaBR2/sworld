import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import hooks from 'core';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
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

  // The URL is the source of truth for which track is selected: derive the
  // player's index from `activeAudioId`. A missing/stale id falls back to the
  // first track. (This also replaces the old "reset to 0 when the feeling
  // filter changes" effect — a filter change that drops the active track
  // recomputes to 0 here for free.)
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

  // Once the user has engaged (started playback, or picked a track), mirror
  // every player-driven track change — next/prev, shuffle, auto-advance — back
  // to the URL. A freshly loaded page stays engaged=false so its URL is clean.
  const [engaged, setEngaged] = useState(false);

  useEffect(() => {
    if (isPlay) {
      setEngaged(true);
    }
  }, [isPlay]);

  useEffect(() => {
    if (!engaged) {
      return;
    }

    const current = list[currentIndex];

    if (current && current.id !== activeAudioId) {
      onAudioChange(current.id);
    }
  }, [engaged, currentIndex, list, activeAudioId, onAudioChange]);

  const onItemSelect = (id: string) => {
    setEngaged(true);
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
