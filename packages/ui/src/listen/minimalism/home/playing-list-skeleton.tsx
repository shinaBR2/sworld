import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';

const SKELETON_ITEMS_COUNT = 10;
const PRIMARY_TEXT_WIDTH = '80%';
const SECONDARY_TEXT_WIDTH = '60%';

const PlayingListSkeleton = () => {
  return (
    <Card
      sx={{ height: '100%', maxHeight: '462px', overflowY: 'auto' }}
      aria-label="Loading content"
    >
      <List>
        {Array.from({ length: SKELETON_ITEMS_COUNT }, (_, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={<Skeleton variant="text" width={PRIMARY_TEXT_WIDTH} />}
              secondary={
                <Skeleton variant="text" width={SECONDARY_TEXT_WIDTH} />
              }
            />
          </ListItem>
        ))}
      </List>
    </Card>
  );
};

export { PlayingListSkeleton };
