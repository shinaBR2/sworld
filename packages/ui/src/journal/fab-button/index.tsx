import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab';

interface FabButtonProps {
  onClick: () => void;
}

const FabButton = (props: FabButtonProps) => {
  const { onClick } = props;

  return (
    <Fab
      color="secondary"
      aria-label="add"
      onClick={onClick}
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        bgcolor: 'secondary.main',
      }}
    >
      <AddIcon />
    </Fab>
  );
};

export { FabButton };
