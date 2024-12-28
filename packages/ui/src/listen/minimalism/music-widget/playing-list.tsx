import { PlayArrowRounded } from '@mui/icons-material';
import {
  Divider,
  Box,
  MenuList,
  MenuItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { SAudioPlayerAudioItem } from 'core';
import { forwardRef, Ref } from 'react';
import { StyledPlayingList } from './Styled';

interface PlayingListProps {
  audioList: SAudioPlayerAudioItem[];
  currentId: string;
  onSelect: (id: string) => () => void;
}

// ts-sucks
const PlayingList = (
  props: PlayingListProps,
  ref: Ref<unknown> | undefined
) => {
  const { audioList, onSelect, currentId } = props;

  return (
    <StyledPlayingList ref={ref}>
      <Divider />
      <Box height="100%" pb={2} mb={2}>
        <MenuList>
          {audioList.map(a => {
            const selected = a.id === currentId;

            return (
              <MenuItem key={a.id} onClick={onSelect(a.id)} selected={selected}>
                <ListItemText
                  primaryTypographyProps={{
                    sx: {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '280px', // Adjust width as needed
                    },
                  }}
                >
                  {a.name}
                </ListItemText>
                {selected && (
                  <Typography variant="body2" color="text.secondary">
                    <PlayArrowRounded />
                  </Typography>
                )}
              </MenuItem>
            );
          })}
        </MenuList>
      </Box>
    </StyledPlayingList>
  );
};

export default forwardRef<HTMLElement, PlayingListProps>(PlayingList);
