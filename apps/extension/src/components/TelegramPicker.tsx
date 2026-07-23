import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import type { TelegramVideoMessage } from '../background/telegram';
import { importArchive } from './telegramRequests';

interface TelegramPickerProps {
  videos: TelegramVideoMessage[];
  nextCursor?: string;
  loadingMore: boolean;
  loadMoreError?: string | null;
  onLoadMore: () => void;
}

// Seconds → `mm:ss` (or `h:mm:ss` past an hour). `undefined` → no duration shown.
const formatDuration = (seconds?: number): string | undefined => {
  if (seconds === undefined) return undefined;
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

// Best human-readable label: caption, else filename, else the date. Both text
// fields are trimmed so a whitespace-only value falls through, and an
// unparseable date falls back to a generic label rather than "Invalid Date".
const labelFor = (video: TelegramVideoMessage): string => {
  const caption = video.caption?.trim();
  if (caption) return caption;
  const filename = video.filename?.trim();
  if (filename) return filename;
  const date = new Date(video.date);
  return Number.isNaN(date.getTime())
    ? 'Untitled video'
    : date.toLocaleDateString();
};

/**
 * Paginated, checkable list of a Telegram channel's videos. The list itself
 * (and pagination) is owned by `TelegramPanel`; this component owns selection and
 * the import trigger + its success/pending feedback. Mirrors `RecentTab`'s
 * List/ListItem structure, swapping the secondary action for a `Checkbox`.
 */
const TelegramPicker = ({
  videos,
  nextCursor,
  loadingMore,
  loadMoreError,
  onLoadMore,
}: TelegramPickerProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [feedback, setFeedback] = useState<{
    severity: 'success' | 'error';
    text: string;
  } | null>(null);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleImport = async () => {
    if (selected.size === 0) return;
    // Snapshot the selection at click time: the user can toggle items while the
    // request is in flight, so the count in the message and the ids we clear on
    // success must be exactly what was imported — not the live set.
    const ids = [...selected];
    setImporting(true);
    setFeedback(null);
    const res = await importArchive(ids);
    setImporting(false);
    if (res?.success) {
      setFeedback({
        severity: 'success',
        text: `Import started for ${ids.length} video(s).`,
      });
      setSelected((prev) => {
        const next = new Set(prev);
        for (const id of ids) next.delete(id);
        return next;
      });
    } else {
      setFeedback({
        severity: 'error',
        text: res?.message ?? 'Could not start the import.',
      });
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {feedback && (
        <Alert severity={feedback.severity} sx={{ mb: 1 }}>
          {feedback.text}
        </Alert>
      )}
      {videos.length === 0 ? (
        // Empty page — but a `nextCursor` may still point at a later page with
        // videos, so keep "Load more" below reachable rather than dead-ending.
        <Typography align="center" sx={{ color: 'text.secondary', py: 2 }}>
          No videos found in this channel.
        </Typography>
      ) : (
        <List disablePadding>
          {videos.map((video) => {
            const duration = formatDuration(video.durationSeconds);
            return (
              <ListItem key={video.id} disablePadding divider>
                <ListItemButton onClick={() => toggle(video.id)} dense>
                  <Checkbox
                    edge="start"
                    checked={selected.has(video.id)}
                    tabIndex={-1}
                    disableRipple
                    slotProps={{ input: { 'aria-label': labelFor(video) } }}
                  />
                  {video.thumbnailDataUri && (
                    <ListItemAvatar>
                      <Avatar
                        variant="rounded"
                        src={video.thumbnailDataUri}
                        alt=""
                      />
                    </ListItemAvatar>
                  )}
                  <ListItemText
                    primary={labelFor(video)}
                    secondary={duration}
                    slotProps={{ primary: { noWrap: true } }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      )}

      {loadMoreError && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {loadMoreError}
        </Alert>
      )}

      {nextCursor && (
        <Button
          fullWidth
          onClick={onLoadMore}
          disabled={loadingMore}
          sx={{ mt: 1 }}
        >
          Load more
        </Button>
      )}

      {videos.length > 0 && (
        <Button
          variant="contained"
          fullWidth
          onClick={handleImport}
          disabled={importing || selected.size === 0}
          sx={{ mt: 1 }}
        >
          {`Import ${selected.size} selected`}
        </Button>
      )}
    </Box>
  );
};

export { TelegramPicker, formatDuration, labelFor };
