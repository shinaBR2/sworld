import { Alert, Box, CircularProgress } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { NO_SESSION, type TelegramVideoMessage } from '../background/telegram';
import { TelegramLogin } from './TelegramLogin';
import { TelegramPicker } from './TelegramPicker';
import { listVideos } from './telegramRequests';

type Mode = 'loading' | 'login' | 'picker' | 'error';

/**
 * The Telegram section of the popup, shown when the active tab is a Telegram
 * channel. Lists the channel's videos; if the user has no authorized session yet
 * the `list` action returns `NO_SESSION` (SWO-494) and we show the login prompt
 * instead — on success we re-list, switching to the picker without a page reload.
 * The background owns the channelId, so this component only asks for "the current
 * channel's videos".
 */
const TelegramPanel = () => {
  const [mode, setMode] = useState<Mode>('loading');
  const [videos, setVideos] = useState<TelegramVideoMessage[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // `cursor` undefined = first page (replaces the list); a cursor appends the
  // next page. Only the first page flips the whole panel into the loading/error
  // state — an append-page failure must never tear down the already-loaded
  // picker (and the user's in-progress selection), so those branches surface a
  // non-destructive inline error and leave the picker in place.
  const load = useCallback(async (cursor?: string) => {
    if (cursor) {
      setLoadingMore(true);
      setLoadMoreError(null);
    } else {
      setMode('loading');
    }

    const res = await listVideos(cursor);

    if (cursor) {
      setLoadingMore(false);
    }

    if (!res) {
      if (cursor) {
        setLoadMoreError('Could not load more videos. Try again.');
        return;
      }
      setError('The extension could not reach the background service.');
      setMode('error');
      return;
    }

    if (res.success) {
      setVideos((prev) => (cursor ? [...prev, ...res.videos] : res.videos));
      setNextCursor(res.nextCursor);
      setMode('picker');
      return;
    }

    if (cursor) {
      setLoadMoreError(res.message || 'Could not load more videos. Try again.');
      return;
    }

    if (res.message === NO_SESSION) {
      setMode('login');
      return;
    }

    setError(res.message || 'Could not load this channel.');
    setMode('error');
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (mode === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (mode === 'login') {
    return <TelegramLogin onAuthenticated={() => load()} />;
  }

  if (mode === 'error') {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <TelegramPicker
      videos={videos}
      nextCursor={nextCursor}
      loadingMore={loadingMore}
      loadMoreError={loadMoreError}
      onLoadMore={() => load(nextCursor)}
    />
  );
};

export { TelegramPanel };
