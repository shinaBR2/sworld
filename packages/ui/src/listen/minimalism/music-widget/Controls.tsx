import { Box, IconButton, useTheme } from "@mui/material";
import PauseRounded from "@mui/icons-material/PauseRounded";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import FastForwardRounded from "@mui/icons-material/FastForwardRounded";
import FastRewindRounded from "@mui/icons-material/FastRewindRounded";
import RepeatIcon from "@mui/icons-material/Repeat";
import RepeatOnIcon from "@mui/icons-material/RepeatOn";
import RepeatOneIcon from "@mui/icons-material/RepeatOne";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import ShuffleOnIcon from "@mui/icons-material/ShuffleOn";
//@ts-ignore
// import { SAudioPlayerLoopMode } from "core";

// ts sucks
enum SAudioPlayerLoopMode {
  None = "none",
  All = "all",
  One = "one",
}

const getWrapperStyles = () => {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    mt: -1,
  };
};
const getButtonStyles = () => {
  return { fontSize: "3rem" };
};

interface Props {
  isPlay: boolean;
  shuffle?: boolean;
  loopMode?: SAudioPlayerLoopMode;
  onShuffle?: () => void;
  onChangeLoopMode?: () => void;
  handlePlay: () => void;
  handlePrev: () => void;
  handleNext: () => void;
}

// https://mui.com/material-ui/react-slider/#music-player
const Controls = (props: Props) => {
  const theme = useTheme();
  const {
    isPlay,
    shuffle,
    onShuffle,
    loopMode,
    onChangeLoopMode,
    handlePlay,
    handlePrev,
    handleNext,
  } = props;
  const iconColor = theme.palette.mode === "dark" ? "#fff" : "#000";

  const renderIcon = () => {
    if (isPlay) {
      return <PauseRounded sx={getButtonStyles()} htmlColor={iconColor} />;
    }

    return <PlayArrowRounded sx={getButtonStyles()} htmlColor={iconColor} />;
  };

  const renderLoopMode = () => {
    if (loopMode === SAudioPlayerLoopMode.All) {
      return <RepeatOnIcon fontSize="large" htmlColor={iconColor} />;
    } else if (loopMode === SAudioPlayerLoopMode.One) {
      return <RepeatOneIcon fontSize="large" htmlColor={iconColor} />;
    } else {
      return <RepeatIcon fontSize="large" htmlColor={iconColor} />;
    }
  };

  const renderShuffle = () => {
    if (shuffle) {
      return <ShuffleOnIcon fontSize="large" htmlColor={iconColor} />;
    }

    return <ShuffleIcon fontSize="large" htmlColor={iconColor} />;
  };

  return (
    <Box sx={getWrapperStyles()}>
      <IconButton aria-label="loop mode" onClick={onChangeLoopMode}>
        {renderLoopMode()}
      </IconButton>
      <IconButton aria-label="previous song" onClick={handlePrev}>
        <FastRewindRounded fontSize="large" htmlColor={iconColor} />
      </IconButton>
      <IconButton
        size="large"
        aria-label={isPlay ? "pause" : "play"}
        onClick={handlePlay}
      >
        {renderIcon()}
      </IconButton>
      <IconButton aria-label="next song" onClick={handleNext}>
        <FastForwardRounded fontSize="large" htmlColor={iconColor} />
      </IconButton>
      <IconButton aria-label="loop mode" onClick={onShuffle}>
        {renderShuffle()}
      </IconButton>
    </Box>
  );
};

export default Controls;
