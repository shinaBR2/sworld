import { GraphicEq } from '@mui/icons-material';
import {
  Divider,
  Box,
  ListItemText,
  List,
  ListItemButton,
} from '@mui/material';
import { SAudioPlayerAudioItem } from 'core';
import { forwardRef, Ref } from 'react';
import { pulseAnimation, StyledPlayingList } from './Styled';

/**
 * Props for the PlayingList component
 * @property {SAudioPlayerAudioItem[]} audioList - List of audio items to display
 * @property {string} currentId - ID of the currently selected audio item
 * @property {(id: string) => void} onSelect - Callback when an audio item is selected
 */
interface PlayingListProps {
  audioList: SAudioPlayerAudioItem[];
  currentId: string;
  onSelect: (id: string) => void;
}

const PlayingList = (
  props: PlayingListProps,
  ref: Ref<HTMLElement> | undefined
) => {
  const { audioList, onSelect, currentId } = props;

  return (
    <StyledPlayingList ref={ref}>
      <Divider />
      <Box height="100%" pb={2} mb={2}>
        <List aria-label="audio tracks">
          {audioList.map(a => {
            const selected = a.id === currentId;

            return (
              <ListItemButton
                component="li"
                key={a.id}
                onClick={() => onSelect(a.id)}
                selected={selected}
                aria-current={selected ? 'true' : undefined}
                role="option"
                sx={{
                  pl: 2,
                  pr: 1,
                }}
              >
                <ListItemText
                  primaryTypographyProps={{
                    sx: {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
                >
                  {a.name}
                </ListItemText>
                {selected && (
                  <GraphicEq
                    sx={{
                      color: 'primary.main',
                      animation: `${pulseAnimation} 1s infinite`,
                    }}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </StyledPlayingList>
  );
};

export default forwardRef<HTMLElement, PlayingListProps>(PlayingList);
