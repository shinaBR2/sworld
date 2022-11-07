import { Box, IconButton, useTheme } from "@mui/material";
import PauseRounded from "@mui/icons-material/PauseRounded";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import FastForwardRounded from "@mui/icons-material/FastForwardRounded";
import FastRewindRounded from "@mui/icons-material/FastRewindRounded";

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
  handlePlay: () => void;
  handlePrev: () => void;
  handleNext: () => void;
}

// https://mui.com/material-ui/react-slider/#music-player
const Controls = (props: Props) => {
  const theme = useTheme();
  const { isPlay, handlePlay, handlePrev, handleNext } = props;
  const iconColor = theme.palette.mode === "dark" ? "#fff" : "#000";

  const renderIcon = () => {
    if (isPlay) {
      return <PauseRounded sx={getButtonStyles()} htmlColor={iconColor} />;
    }

    return <PlayArrowRounded sx={getButtonStyles()} htmlColor={iconColor} />;
  };

  return (
    <Box sx={getWrapperStyles()}>
      <IconButton aria-label="previous song" onClick={handlePrev}>
        <FastRewindRounded fontSize="large" htmlColor={iconColor} />
      </IconButton>
      <IconButton aria-label={isPlay ? "pause" : "play"} onClick={handlePlay}>
        {renderIcon()}
      </IconButton>
      <IconButton aria-label="next song" onClick={handleNext}>
        <FastForwardRounded fontSize="large" htmlColor={iconColor} />
      </IconButton>
    </Box>
  );
};

export default Controls;
