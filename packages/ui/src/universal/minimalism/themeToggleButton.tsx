import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useGlassmorphismTheme } from './glassmorphismProvider';

interface ThemeToggleButtonProps {
  size?: 'small' | 'medium' | 'large';
}

const ThemeToggleButton = (props: ThemeToggleButtonProps) => {
  const { size = 'medium' } = props;
  const { mode, toggleTheme } = useGlassmorphismTheme();

  return (
    <Tooltip
      title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <IconButton onClick={toggleTheme} size={size} aria-label="toggle theme">
        {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
      </IconButton>
    </Tooltip>
  );
};

export { ThemeToggleButton };
