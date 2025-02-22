import GraphicEq from '@mui/icons-material/GraphicEq';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
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

const PlayingList = (props: PlayingListProps, ref: Ref<HTMLElement> | undefined) => {
  const { audioList, onSelect, currentId } = props;

  return (
    <StyledPlayingList ref={ref}>
      <Divider />
      <Box height="100%" pb={2} mb={2}>
        <List aria-label="audio tracks" role="listbox">
          {audioList.map(a => {
            const selected = a.id === currentId;

            return (
              <ListItemButton
                component="li"
                key={a.id}
                onClick={() => onSelect(a.id)}
                selected={selected}
                aria-selected={selected ? 'true' : false}
                role="option"
                aria-label="audio track"
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
