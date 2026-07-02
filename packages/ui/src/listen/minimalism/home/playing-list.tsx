import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SAudioPlayerAudioItem } from 'core';
import { ResponsiveAvatar } from '../../../universal';

interface PlayingListItemProps {
  audioList: SAudioPlayerAudioItem[];
  currentId: string;
  onItemSelect: (id: string) => void;
  // When provided (playlist mode), each track shows a remove action.
  onRemove?: (id: string) => void;
}

interface ItemProps {
  audio: SAudioPlayerAudioItem;
  isPlaying: boolean;
  onSelect: (id: string) => void;
  onRemove?: (id: string) => void;
}

const Item = (props: ItemProps) => {
  const { audio, isPlaying, onSelect, onRemove } = props;
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
      {onRemove && (
        <IconButton
          edge="end"
          aria-label={`remove ${name}`}
          onClick={(event) => {
            event.stopPropagation();
            onRemove(id);
          }}
        >
          <DeleteOutlineIcon />
        </IconButton>
      )}
    </ListItemButton>
  );
};

const PlayingList = (props: PlayingListItemProps) => {
  const { audioList, currentId, onItemSelect, onRemove } = props;

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
            onRemove={onRemove}
          />
        );
      })}
    </List>
  );
};

export default PlayingList;
