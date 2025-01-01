import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SAudioPlayerAudioItem } from 'core';
import { ResponsiveAvatar } from '../../../universal';

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
        <ResponsiveAvatar src={image} alt={name} variant="rounded" />
      </ListItemAvatar>
      <ListItemText
        primary={name}
        secondary={
          <Stack
            component="span"
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <Typography component="span" variant="body2">
              {artistName}
            </Typography>
            {isPlaying && (
              <Box
                component="span"
                sx={{ display: 'inline-flex', alignItems: 'center' }}
              >
                • Now Playing
              </Box>
            )}
          </Stack>
        }
      />
      {/* <ListItemSecondaryAction>
        <Typography variant="caption" color="text.secondary">
          {'04:30'}
        </Typography>
      </ListItemSecondaryAction> */}
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
      {audioList.map(a => {
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
