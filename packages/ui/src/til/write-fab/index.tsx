import EditIcon from '@mui/icons-material/Edit';
import Fab from '@mui/material/Fab';
import Zoom from '@mui/material/Zoom';
import type { RequiredLinkComponentWithoutLinkProps } from '../../watch/videos/types';

const label = 'Write a new post';

const WriteFab = (props: RequiredLinkComponentWithoutLinkProps) => {
  const { LinkComponent } = props;

  return (
    <Zoom in>
      <Fab
        color="primary"
        aria-label={label}
        component={LinkComponent}
        to="/write"
        sx={{
          position: 'fixed',
          bottom: (theme) => theme.spacing(3),
          right: (theme) => theme.spacing(3),
          zIndex: (theme) => theme.zIndex.speedDial,
        }}
      >
        <EditIcon />
      </Fab>
    </Zoom>
  );
};

export { WriteFab };
