import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material';
import PauseRounded from '@mui/icons-material/PauseRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import RepeatIcon from '@mui/icons-material/Repeat';
import RepeatOnIcon from '@mui/icons-material/RepeatOn';
import RepeatOneIcon from '@mui/icons-material/RepeatOne';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import ShuffleOnIcon from '@mui/icons-material/ShuffleOn';
import SkipNextRounded from '@mui/icons-material/SkipNextRounded';
import SkipPreviousRounded from '@mui/icons-material/SkipPreviousRounded';
//@ts-ignore
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
  gap: 2,
});

const getMainButtonStyles = () => ({
  fontSize: '3rem',
  p: 0,
  color: 'white',
  '&:hover': {
    bgcolor: 'rgba(255,255,255,0.1)',
  },
});

const getSideButtonStyles = (isActive = false) => ({
  color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
  fontSize: '1.75rem',
  '&:hover': {
    color: 'white',
    bgcolor: 'rgba(255,255,255,0.1)',
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

  const renderIcon = () => {
    if (isPlay) {
      return <PauseRounded sx={getMainButtonStyles()} />;
    }

    return <PlayArrowRounded sx={getMainButtonStyles()} />;
  };

  const renderLoopMode = () => {
    if (loopMode === SAudioPlayerLoopMode.All) {
      return <RepeatOnIcon fontSize="large" />;
    } else if (loopMode === SAudioPlayerLoopMode.One) {
      return <RepeatOneIcon fontSize="large" />;
    } else {
      return <RepeatIcon fontSize="large" />;
    }
  };

  const renderShuffle = () => {
    if (shuffle) {
      return <ShuffleOnIcon fontSize="large" />;
    }

    return <ShuffleIcon fontSize="large" />;
  };

  return (
    <Box sx={getWrapperStyles()}>
      <IconButton
        size="small"
        aria-label="toggle loop mode"
        onClick={onChangeLoopMode}
        sx={getSideButtonStyles()}
      >
        {renderLoopMode()}
      </IconButton>
      <Box sx={getCenterControlsStyles()}>
        <IconButton
          size="small"
          aria-label="previous song"
          onClick={handlePrev}
          sx={getMainButtonStyles()}
        >
          <SkipPreviousRounded fontSize="large" />
        </IconButton>
        <IconButton
          size="medium"
          aria-label={isPlay ? 'pause' : 'play'}
          onClick={handlePlay}
          sx={getMainButtonStyles()}
        >
          {renderIcon()}
        </IconButton>
        <IconButton
          size="small"
          aria-label="next song"
          onClick={handleNext}
          sx={getMainButtonStyles()}
        >
          <SkipNextRounded fontSize="large" />
        </IconButton>
      </Box>
      <IconButton
        size="small"
        aria-label="shuffle"
        onClick={onShuffle}
        sx={getSideButtonStyles()}
      >
        {renderShuffle()}
      </IconButton>
    </Box>
  );
};

export default Controls;
