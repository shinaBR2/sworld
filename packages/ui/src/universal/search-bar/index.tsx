import { Search } from '@mui/icons-material';
import { Box, InputBase, IconButton } from '@mui/material';

const texts = {
  placeholder: 'Search...',
};

const SearchBar = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: '#f0f0f0',
        borderRadius: 2,
        px: 2,
        py: 0.5,
        width: '100%',
        maxWidth: '600px',
      }}
    >
      <InputBase placeholder={texts.placeholder} sx={{ flex: 1 }} />
      <IconButton>
        <Search />
      </IconButton>
    </Box>
  );
};

export default SearchBar;
