import Box from '@mui/material/Box';
import { PostActionsMenu, type PostMenuAction } from './actions-menu';
import { PostMetadata } from './metadata';

interface PostViewHeaderProps {
  title: string;
  readTimeInMinutes: number;
  createdAt?: string;
  status?: string;
  menuAnchorEl: HTMLElement | null;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  onMenuClose: () => void;
  actions: PostMenuAction[];
}

const PostViewHeader = (props: PostViewHeaderProps) => {
  const {
    title,
    readTimeInMinutes,
    createdAt,
    status,
    menuAnchorEl,
    onMenuOpen,
    onMenuClose,
    actions,
  } = props;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 1,
      }}
    >
      <Box sx={{ flex: 1 }}>
        <PostMetadata
          title={title}
          readTimeInMinutes={readTimeInMinutes}
          createdAt={createdAt}
          status={status}
        />
      </Box>
      <PostActionsMenu
        anchorEl={menuAnchorEl}
        onOpen={onMenuOpen}
        onClose={onMenuClose}
        actions={actions}
      />
    </Box>
  );
};

export { PostViewHeader };
