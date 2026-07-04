import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardList from '../card-list/CardList';

interface HomeContainerProps {
  gameList: any[];
}

const HomeContainer = (props: HomeContainerProps) => {
  const { gameList } = props;
  // const htmlTitle = 'Games';

  return (
    <Container maxWidth="xl">
      {/* <Helmet>
        <title>{htmlTitle}</title>
      </Helmet> */}
      <Box
        sx={{
          my: 4,
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
          }}
        >
          Just play
        </Typography>
      </Box>
      <CardList items={gameList} />
    </Container>
  );
};

export default HomeContainer;
