import { PlayArrowRounded } from "@mui/icons-material";
import {
  Divider,
  Box,
  MenuList,
  MenuItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { SAudioPlayerAudioItem } from "core";
import { forwardRef, Ref } from "react";
import { StyledPlayingList } from "./Styled";

interface PlayingListProps {
  audioList: SAudioPlayerAudioItem[];
  isSelected: (id: string) => boolean;
  onSelect: (id: string) => () => void;
}

// ts-sucks
const PlayingList = (
  props: PlayingListProps,
  ref: Ref<unknown> | undefined
) => {
  const { audioList, onSelect, isSelected } = props;

  return (
    <StyledPlayingList ref={ref}>
      <Divider />
      <Box height="100%" pb={2}>
        <MenuList>
          {audioList.map((a) => {
            const selected = isSelected(a.id);
            return (
              <MenuItem key={a.id} onClick={onSelect(a.id)} selected={selected}>
                <ListItemText>{a.name}</ListItemText>
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
