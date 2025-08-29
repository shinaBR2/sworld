import { styled, type Theme, useTheme } from '@mui/material';
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
    color: theme.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,0.87)',
    height: 8,
    '& .MuiSlider-thumb': {
      width: 16,
      height: 16,
      backgroundColor: '#fff',
      transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
      '&:before': {
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
      },
      '&:hover, &.Mui-focusVisible': {
        boxShadow: `0px 0px 0px 8px ${theme.palette.mode === 'dark' ? 'rgb(255 255 255 / 16%)' : 'rgb(0 0 0 / 16%)'}`,
      },
      '&.Mui-active': {
        width: 24,
        height: 24,
      },
    },
    '& .MuiSlider-rail': {
      opacity: 0.28,
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
  const { white } = theme.palette.common;

  return {
    fontSize: '0.75rem',
    opacity: 0.38,
    fontWeight: 500,
    letterSpacing: 0.2,
    color: white,
    [theme.breakpoints.down('sm')]: {
      color: white,
    },
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
