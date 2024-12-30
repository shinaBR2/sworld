import IconButton from '@mui/material/IconButton';
import { ButtonProps } from '@mui/material';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';

const PlaylistButton = (props: ButtonProps) => {
  const { onClick, ...rest } = props;

  return (
    <IconButton aria-label="list audio" onClick={onClick} {...rest}>
      <LibraryMusicIcon />
    </IconButton>
  );
};

export default PlaylistButton;
