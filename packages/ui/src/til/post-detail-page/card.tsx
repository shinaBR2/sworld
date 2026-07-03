import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

interface PostDetailCardProps {
  children: React.ReactNode;
}

const PostDetailCard = (props: PostDetailCardProps) => {
  return (
    <Card sx={{ my: 3, border: 1, borderColor: 'divider' }}>
      <CardContent>{props.children}</CardContent>
    </Card>
  );
};

export { PostDetailCard };
