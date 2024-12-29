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
import { StyledPlayingList } from './Styled';

interface PlayingListProps {
  audioList: SAudioPlayerAudioItem[];
  currentId: string;
  onSelect: (id: string) => () => void;
}

const PlayingList = (
  props: PlayingListProps,
  ref: Ref<unknown> | undefined
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
                onClick={onSelect(a.id)}
                selected={selected}
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
                      animation: 'pulse 1s infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 0.6 },
                        '50%': { opacity: 1 },
                        '100%': { opacity: 0.6 },
                      },
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
