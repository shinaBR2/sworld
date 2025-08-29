import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import type { ButtonProps } from '@mui/material';
import IconButton from '@mui/material/IconButton';

const PlaylistButton = (props: ButtonProps) => {
  const { onClick, ...rest } = props;

  return (
    <IconButton aria-label="toggle playing list" onClick={onClick} {...rest}>
      <LibraryMusicIcon />
    </IconButton>
  );
};

export default PlaylistButton;
