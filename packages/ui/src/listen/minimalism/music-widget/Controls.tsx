import PauseRounded from '@mui/icons-material/PauseRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import RepeatIcon from '@mui/icons-material/Repeat';
import RepeatOnIcon from '@mui/icons-material/RepeatOn';
import RepeatOneIcon from '@mui/icons-material/RepeatOne';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import ShuffleOnIcon from '@mui/icons-material/ShuffleOn';
import SkipNextRounded from '@mui/icons-material/SkipNextRounded';
import SkipPreviousRounded from '@mui/icons-material/SkipPreviousRounded';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

//@ts-expect-error
// import { SAudioPlayerLoopMode } from "core";

// ts sucks
enum SAudioPlayerLoopMode {
  None = 'none',
  All = 'all',
  One = 'one',
}

const getWrapperStyles = () => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  gap: 1,
});

const getCenterControlsStyles = () => ({
  display: 'flex',
  alignItems: 'center',
  gap: 1,
});

// The play/pause button is the one filled focal point.
const getPlayButtonStyles = () => ({
  width: 56,
  height: 56,
  bgcolor: 'primary.main',
  color: 'primary.contrastText',
  '&:hover': {
    bgcolor: 'primary.dark',
  },
});

// Prev / next — plain, quiet.
const getStepButtonStyles = () => ({
  color: 'text.primary',
  '&:hover': {
    bgcolor: 'action.hover',
  },
});

// Loop / shuffle — secondary, dimmed until active.
const getSideButtonStyles = (isActive = false) => ({
  color: isActive ? 'primary.main' : 'text.secondary',
  '&:hover': {
    color: 'text.primary',
    bgcolor: 'action.hover',
  },
});

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

  const renderLoopMode = () => {
    if (loopMode === SAudioPlayerLoopMode.All) {
      return <RepeatOnIcon />;
    } else if (loopMode === SAudioPlayerLoopMode.One) {
      return <RepeatOneIcon />;
    } else {
      return <RepeatIcon />;
    }
  };

  const renderShuffle = () => {
    if (shuffle) {
      return <ShuffleOnIcon />;
    }

    return <ShuffleIcon />;
  };

  return (
    <Box sx={getWrapperStyles()} role="group" aria-label="playback controls">
      <IconButton
        size="small"
        aria-label="toggle loop mode"
        onClick={onChangeLoopMode}
        sx={getSideButtonStyles(
          loopMode !== undefined && loopMode !== SAudioPlayerLoopMode.None,
        )}
      >
        {renderLoopMode()}
      </IconButton>
      <Box sx={getCenterControlsStyles()}>
        <IconButton
          aria-label="previous audio"
          onClick={handlePrev}
          sx={getStepButtonStyles()}
        >
          <SkipPreviousRounded fontSize="large" />
        </IconButton>
        <IconButton
          aria-label={isPlay ? 'pause' : 'play'}
          onClick={handlePlay}
          sx={getPlayButtonStyles()}
        >
          {isPlay ? (
            <PauseRounded fontSize="large" />
          ) : (
            <PlayArrowRounded fontSize="large" />
          )}
        </IconButton>
        <IconButton
          aria-label="next audio"
          onClick={handleNext}
          sx={getStepButtonStyles()}
        >
          <SkipNextRounded fontSize="large" />
        </IconButton>
      </Box>
      <IconButton
        size="small"
        aria-label="shuffle"
        onClick={onShuffle}
        sx={getSideButtonStyles(shuffle)}
      >
        {renderShuffle()}
      </IconButton>
    </Box>
  );
};

export default Controls;
