import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';

const ALL_VALUE = 'all';
const ALL_LABEL = 'All Photos';
// The switcher bar sits between the header and the scroll region: fixed height
// (never scrolls), left-aligned so the select keeps its natural width.
const BAR_SX = {
  flexShrink: 0,
  alignItems: 'flex-start',
  px: { xs: 2, sm: 3 },
  py: 2,
} as const;
const SELECT_SX = { minWidth: '12rem' } as const;

interface CollectionSelectAlbum {
  id: string;
  title: string;
}

interface LookCollectionSelectProps {
  // 'all' for the full timeline, or an album id.
  value: string;
  albums: CollectionSelectAlbum[];
  onSelect: (value: string) => void;
}

// The top-of-body collection switcher: "All Photos" (the full timeline) plus
// every album by title. Selecting one hands the value back to the caller, which
// owns the routing — mirrors Listen's collection select.
const LookCollectionSelect = (props: LookCollectionSelectProps) => {
  const { value, albums, onSelect } = props;

  const handleChange = (event: SelectChangeEvent) => {
    onSelect(event.target.value);
  };

  return (
    <Stack sx={BAR_SX}>
      <Select
        value={value}
        onChange={handleChange}
        size="small"
        aria-label="collection"
        sx={SELECT_SX}
        renderValue={(selected) => {
          if (selected === ALL_VALUE) {
            return ALL_LABEL;
          }
          const album = albums.find((item) => item.id === selected);
          // While the albums list is still loading (or for a stale/deleted id)
          // we have no title — show nothing rather than leak a raw uuid into
          // the switcher. On a deep-link/refresh the id fills in as a title
          // once the list resolves.
          return album ? album.title : '';
        }}
      >
        <MenuItem value={ALL_VALUE}>{ALL_LABEL}</MenuItem>
        {albums.map((album) => (
          <MenuItem key={album.id} value={album.id}>
            {album.title}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );
};

export { LookCollectionSelect };
export type { CollectionSelectAlbum, LookCollectionSelectProps };
