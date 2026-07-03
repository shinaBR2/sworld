import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';

// The grid is filtered client-side over an in-memory list, so a short debounce
// is plenty to avoid re-filtering on every keystroke.
const DEBOUNCE_MS = 200;

interface HomeSearchProps {
  onQueryChange: (query: string) => void;
}

const HomeSearch = (props: HomeSearchProps) => {
  const { onQueryChange } = props;
  const [value, setValue] = useState('');

  useEffect(() => {
    const id = setTimeout(() => onQueryChange(value), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [value, onQueryChange]);

  return (
    <TextField
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder="Search videos"
      size="small"
      fullWidth
      sx={{ maxWidth: 360 }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        },

        htmlInput: { 'aria-label': 'Search videos' },
      }}
    />
  );
};

export { HomeSearch };
