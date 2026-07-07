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

  const isMobile = useIsMobile();

  const hookResult = useSAudioPlayer({ audioList: list });
  const { getControlsProps, playerState } = hookResult;
  const { isPlay, audioItem } = playerState;
  const { onPlay, onSelect } = getControlsProps();
  // The player's actual current track. Keying the mirror on this (not a numeric
  // index) is what makes a feeling filter that swaps the track at a given
  // position still update the URL.
  const currentTrackId = audioItem?.id;

  // Seed the player's selection from the URL exactly once, when the list is
  // first available (deep link / refresh). `seededRef` also makes this a no-op
  // on every later `activeAudioId` change — including the ones our own mirror
  // causes — so the URL never re-drives the player. That one-way flow is what
  // makes the whole thing race-free. `lastSyncedId` starts at whatever the URL
  // started as, so a matching deep link isn't rewritten.
  const seededRef = useRef(false);
  const lastSyncedId = useRef(activeAudioId);
  const seededTrackId = useRef<string | null>(null);
  const armed = useRef(false);
  const engaged = useRef(false);

  useEffect(() => {
    if (seededRef.current || !list.length) {
      return;
    }

    seededRef.current = true;
    lastSyncedId.current = activeAudioId;

    const found = list.findIndex((a) => a.id === activeAudioId);

    seededTrackId.current = list[found >= 0 ? found : 0].id;

    if (found >= 0) {
      onSelect(found);
    }
  }, [list, activeAudioId, onSelect]);

  // player -> URL (the only direction that writes): mirror the current track to
  // `?audio=`.
  useEffect(() => {
    if (!currentTrackId) {
      return;
    }

    // Skip the mount transient: don't mirror until the player has actually
    // settled on the track we seeded. This is ref state, so it's idempotent
    // across StrictMode's double effect invocation — a freshly loaded page
    // stays clean.
    if (!armed.current) {
      if (currentTrackId !== seededTrackId.current) {
        return;
      }

      armed.current = true;
    }

    // Engage once the user acts — playback started, or they moved off the track
    // the page loaded on (next/prev/select/shuffle). Latched, so returning to
    // the first track still mirrors, and next/prev while paused count too.
    if (isPlay || currentTrackId !== seededTrackId.current) {
      engaged.current = true;
    }

    if (!engaged.current) {
      return;
    }

    if (currentTrackId !== lastSyncedId.current) {
      lastSyncedId.current = currentTrackId;
      onAudioChange(currentTrackId);
    }
  }, [currentTrackId, isPlay, onAudioChange]);

  // Changing the feeling filter (setting OR clearing it) rebuilds the list;
  // reset to its first track. A ref tracks the previous value so this fires only
  // on an actual change, never on the initial mount (which would clobber the
  // deep-link seed above).
  const prevFeeling = useRef(activeFeelingId);

  useEffect(() => {
    if (prevFeeling.current === activeFeelingId) {
      return;
    }

    prevFeeling.current = activeFeelingId;
    onSelect(0);
  }, [activeFeelingId, onSelect]);

  const onItemSelect = (id: string) => {
    const found = list.findIndex((a) => a.id === id);

    if (found >= 0) {
      onSelect(found);
    }

    if (!isPlay) {
      onPlay();
    }
  };

  const hasNoItem = !list.length;
  const currentAudio = audioItem;
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
                currentId={currentAudio?.id ?? ''}
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
