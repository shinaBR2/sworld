import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { SAudioPlayerAudioItem } from 'core';
import { ResponsiveAvatar } from '../../../universal';

// Three bars dancing at their own tempo — the "this one is playing" signal that
// reads without needing the text label. Purely decorative; the accessible
// "Now Playing" label lives in visually-hidden text alongside it.
const equalize = keyframes`
  0%, 100% { transform: scaleY(0.35); }
  50% { transform: scaleY(1); }
`;

// Off-screen but readable by screen readers — the standard sr-only pattern.
const srOnly = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

const NowPlayingIndicator = () => (
  <>
    <Box
      component="span"
      aria-hidden
      sx={{
        display: 'inline-flex',
        alignItems: 'flex-end',
        gap: '2px',
        height: 12,
      }}
    >
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          component="span"
          sx={{
            width: '3px',
            height: '100%',
            borderRadius: '2px',
            bgcolor: 'primary.main',
            transformOrigin: 'bottom',
            animation: `${equalize} 0.9s ease-in-out ${i * 0.18}s infinite`,
          }}
        />
      ))}
    </Box>
    <Box component="span" sx={srOnly}>
      Now Playing
    </Box>
  </>
);

// A song with no artwork gets a theme-tinted tile with its initial — never the
// grey silhouette that reads as "failed to load".
const initialOf = (name: string) => name?.trim().charAt(0).toUpperCase() || '♪';

interface PlayingListItemProps {
  audioList: SAudioPlayerAudioItem[];
  currentId: string;
  onItemSelect: (id: string) => void;
}

interface ItemProps {
  audio: SAudioPlayerAudioItem;
  isPlaying: boolean;
  onSelect: (id: string) => void;
}

const Item = (props: ItemProps) => {
  const { audio, isPlaying, onSelect } = props;
  const { id, image, name, artistName } = audio;

  return (
    <ListItemButton
      aria-selected={isPlaying}
      sx={{
        borderLeft: isPlaying ? 4 : 0,
        borderColor: 'primary.main',
        bgcolor: isPlaying ? 'action.selected' : 'transparent',
      }}
      onClick={() => onSelect(id)}
    >
      <ListItemAvatar>
        <ResponsiveAvatar
          src={image}
          alt={name}
          variant="rounded"
          sx={{
            bgcolor: image ? undefined : 'primary.light',
            color: 'primary.dark',
            fontWeight: 600,
          }}
        >
          {initialOf(name)}
        </ResponsiveAvatar>
      </ListItemAvatar>
      <ListItemText
        primary={name}
        primaryTypographyProps={{
          fontWeight: 600,
          color: isPlaying ? 'primary.main' : 'text.primary',
          noWrap: true,
        }}
        secondary={
          <Stack
            component="span"
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <Typography component="span" variant="body2" color="text.secondary">
              {artistName}
            </Typography>
            {isPlaying && <NowPlayingIndicator />}
          </Stack>
        }
      />
    </ListItemButton>
  );
};

const PlayingList = (props: PlayingListItemProps) => {
  const { audioList, currentId, onItemSelect } = props;

  if (!audioList?.length) {
    return (
      <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>
        No audio tracks available
      </Typography>
    );
  }

  return (
    <List role="list" aria-label="playing list">
      {audioList.map((a) => {
        const { id } = a;

        return (
          <Item
            key={id}
            audio={a}
            isPlaying={id === currentId}
            onSelect={onItemSelect}
          />
        );
      })}
    </List>
  );
};

export default PlayingList;
