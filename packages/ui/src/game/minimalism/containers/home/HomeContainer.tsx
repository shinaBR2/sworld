import {
  Container,
  Box,
  Typography,
  Stack,
  Chip,
  Grid,
  Card,
} from '@mui/material';
import { Helmet } from 'react-helmet';
import CardList from '../card-list/CardList';

interface HomeContainerProps {
  gameList: any[];
}

const HomeContainer = (props: HomeContainerProps) => {
  const { gameList } = props;
  const htmlTitle = 'Games';

  return (
    <Container maxWidth="xl">
      {/* <Helmet>
        <title>{htmlTitle}</title>
      </Helmet> */}

      <Box my={4}>
        <Typography variant="h3" component="h1" fontWeight={700}>
          Just play
        </Typography>
      </Box>
      <CardList items={gameList} />
    </Container>
  );
};

export default HomeContainer;
