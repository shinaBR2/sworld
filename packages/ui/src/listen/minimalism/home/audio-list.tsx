import { Theme } from '@mui/material';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import hooks, { listenQueryHooks } from 'core';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import MusicWidget from '../music-widget';
import { MusicWidgetSkeleton } from '../music-widget/music-widget-skeleton';
import { PlayingListSkeleton } from './playing-list-skeleton';

const { useSAudioPlayer } = hooks;

const NoItem = () => {
  return <Typography variant="body2">No audios found</Typography>;
};

interface AudioListProps {
  queryRs: ReturnType<typeof listenQueryHooks.useLoadAudios>;
  list: unknown[];
  activeFeelingId: string;
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
  const { list: originalList, activeFeelingId } = props;
  // TODO
  // memorize on parent
  const list = useMemo(() => {
    return originalList
      .map(i => toAudioItem(i))
      .filter(i => !activeFeelingId || i.tagIds.indexOf(activeFeelingId) > -1);
  }, [originalList, activeFeelingId]);

  const [index, setIndex] = useState(0);
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm')
  );

  const hookResult = useSAudioPlayer({
    audioList: list,
    index,
  });
  const { getControlsProps, playerState } = hookResult;
  const { isPlay, currentIndex } = playerState;
  const { onPlay } = getControlsProps();

  const onItemSelect = (id: string) => {
    const index = list.findIndex(a => a.id === id);

    if (index < 0) {
      setIndex(0);
    } else {
      setIndex(index);
    }

    if (!isPlay) {
      onPlay();
    }
  };

  useEffect(() => {
    if (activeFeelingId) {
      setIndex(0);
    }
  }, [activeFeelingId]);

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
        <Grid item md={8} sm={6} xs={0}>
          <Card sx={{ height: '100%', maxHeight: '37vh', overflowY: 'auto' }}>
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
      <Grid item md={4} sm={6} xs={12} container justifyContent="center">
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
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm')
  );

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {!isMobile && (
          <Grid item md={8} sm={6} xs={0}>
            <PlayingListSkeleton />
          </Grid>
        )}

        <Grid item md={4} sm={6} xs={12} container justifyContent="center">
          <MusicWidgetSkeleton />
        </Grid>
      </Grid>
    );
  }

  return <Content {...props} />;
};

export { AudioList };
