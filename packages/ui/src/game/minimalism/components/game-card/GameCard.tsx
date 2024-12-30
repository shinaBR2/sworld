import { Link } from '@tanstack/react-router';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import { StyledCard } from './Styled';

interface GameCardProps {
  id: string;
  url: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
}

const GameCard = (props: GameCardProps) => {
  const { id, url, name, imageUrl } = props;

  return (
    <StyledCard key={id}>
      <CardActionArea LinkComponent={Link} href={url}>
        {/* <CardHeader title={name} /> */}
        <CardMedia component="img" image={imageUrl} alt={name} />
        {/* <CardContent>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent> */}
      </CardActionArea>
    </StyledCard>
  );
};

export default GameCard;
