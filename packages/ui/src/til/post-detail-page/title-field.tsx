import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';

interface PostTitleFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const PostTitleField = (props: PostTitleFieldProps) => {
  const { value, onChange, placeholder } = props;

  return (
    <Container
      maxWidth={false}
      sx={{ py: 2, borderBottom: 1, borderColor: 'divider' }}
    >
      <TextField
        fullWidth
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        variant="standard"
        InputProps={{ style: { fontSize: '1.5rem', fontWeight: 600 } }}
      />
    </Container>
  );
};

export { PostTitleField };
