import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

interface PostMenuAction {
  label: string;
  onClick: () => void;
}

interface PostActionsMenuProps {
  anchorEl: HTMLElement | null;
  onOpen: (event: React.MouseEvent<HTMLElement>) => void;
  onClose: () => void;
  actions: PostMenuAction[];
}

const PostActionsMenu = (props: PostActionsMenuProps) => {
  const { anchorEl, onOpen, onClose, actions } = props;

  if (actions.length === 0) {
    return null;
  }

  return (
    <>
      <IconButton onClick={onOpen} size="small">
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {actions.map((action) => (
          <MenuItem key={action.label} onClick={action.onClick}>
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export { PostActionsMenu };
export type { PostMenuAction };
