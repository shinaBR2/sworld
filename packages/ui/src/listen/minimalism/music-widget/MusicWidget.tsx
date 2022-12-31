import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Controls from "./Controls";
import Seeker from "./Seeker";
//@ts-ignore
import hooks from "core";
//@ts-ignore
import { SAudioPlayerAudioItem, SAudioPlayerLoopMode } from "core";
import { Box, Grid, Slide } from "@mui/material";
import PlaylistButton from "./PlaylistButton";
import { useRef, useState } from "react";
import {
  StyledCard,
  StyledCardActions,
  StyledCardMedia,
  StyledContent,
} from "./Styled";
import PlayingList from "./PlayingList";

const { useSAudioPlayer } = hooks;

interface MusicWidgetProps {
  audioList: SAudioPlayerAudioItem[];
  index?: number;
  shuffle?: boolean;
  loopMode?: SAudioPlayerLoopMode;
}

const MusicWidget = (props: MusicWidgetProps) => {
  const { audioList } = props;
  const [index, setIndex] = useState(0);
  const { getAudioProps, getSeekerProps, getControlsProps, playerState } =
    useSAudioPlayer({
      audioList,
      index,
    });
  const { isPlay, isShuffled, loopMode, audioItem } = playerState;
  const { onPlay, onPrev, onNext, onShuffle, onChangeLoopMode } =
    getControlsProps();
  const contentRef = useRef(null);
  const [showPlayinglist, setShowPlayinglist] = useState(false);

  if (!audioItem) {
    return null;
  }

  const { name, artistName, image } = audioItem;

  const onSelect = (id: string) => () => {
    const index = audioList.findIndex((a) => a.id === id);
    setIndex(index);

    if (!isPlay) {
      onPlay();
    }

    setShowPlayinglist(false);
  };

  const controlProps = {
    isPlay,
    shuffle: isShuffled,
    loopMode,
    handlePlay: onPlay,
    handlePrev: onPrev,
    handleNext: onNext,
    onShuffle,
    onChangeLoopMode,
  };

  return (
    <StyledCard>
      <StyledCardMedia component="img" alt={name} image={image} />
      <StyledContent ref={contentRef}>
        <CardContent>
          <Box
            component={Grid}
            container
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Typography gutterBottom variant="body2" component="p">
              {showPlayinglist ? "Playing list" : "Now playing"}
            </Typography>
            <PlaylistButton
              onClick={() => setShowPlayinglist(!showPlayinglist)}
            />
          </Box>
          <Typography gutterBottom variant="h4" component="strong">
            {artistName}
          </Typography>
          <Typography gutterBottom variant="h5" component="p">
            {name}
          </Typography>
          <Seeker {...getSeekerProps()} />
        </CardContent>
        <StyledCardActions>
          <Controls {...controlProps} />
        </StyledCardActions>
        <Slide
          direction="up"
          in={showPlayinglist}
          container={contentRef.current}
        >
          <PlayingList
            audioList={audioList}
            onSelect={onSelect}
            currentId={audioItem.id}
          />
        </Slide>
        <audio {...getAudioProps()} />
      </StyledContent>
    </StyledCard>
  );
};

export default MusicWidget;
