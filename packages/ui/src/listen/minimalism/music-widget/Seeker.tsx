import { styled, type Theme, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

interface Props {
  max: number;
  position: number;
  setPosition: (value: number) => void;
  formatDuration: (value: number) => string;
}

// https://mui.com/material-ui/react-slider/#music-player
const getStyles = (theme: Theme) => {
  return {
    color: theme.palette.primary.main,
    height: 4,
    '& .MuiSlider-thumb': {
      width: 12,
      height: 12,
      backgroundColor: theme.palette.primary.main,
      transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
      '&:before': {
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.2)',
      },
      '&:hover, &.Mui-focusVisible': {
        boxShadow: `0px 0px 0px 8px ${theme.palette.primary.main}29`,
      },
      '&.Mui-active': {
        width: 18,
        height: 18,
      },
    },
    '& .MuiSlider-rail': {
      opacity: 0.24,
    },
  };
};
const getInfoStyles = () => {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mt: -2,
  };
};

const TinyText = styled(Typography)(({ theme }) => {
  return {
    fontSize: '0.75rem',
    fontWeight: 500,
    letterSpacing: 0.2,
    color: theme.palette.text.secondary,
  };
});

const Seeker = (props: Props) => {
  const theme = useTheme();
  const { max, position, setPosition, formatDuration } = props;

  const onChange = (_: Event, value: number | number[]) => {
    setPosition(value as number);
  };

  return (
    <Box sx={{ position: 'relative' }} aria-label="audio time seeker">
      <Slider
        aria-label="time indicator"
        size="small"
        value={position}
        min={0}
        step={1}
        max={max}
        onChange={onChange}
        sx={getStyles(theme)}
      />
      <Box sx={getInfoStyles()}>
        <TinyText aria-label="start">{formatDuration(position)}</TinyText>
        <TinyText aria-label="end">-{formatDuration(max - position)}</TinyText>
      </Box>
    </Box>
  );
};

export default Seeker;
