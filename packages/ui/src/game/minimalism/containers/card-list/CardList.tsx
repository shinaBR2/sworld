// DON'T USE THIS GRID2
// styled_default is not a function
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import GameCard from '../../components/game-card/GameCard';

interface CardListProps {
  items: any[];
}

const CardList = (props: CardListProps) => {
  const { items } = props;

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        {items.map((item) => (
          <Grid
            key={item.id}
            size={{
              xs: 6,
              md: 3,
              xl: 3,
            }}
          >
            <GameCard {...item} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CardList;
