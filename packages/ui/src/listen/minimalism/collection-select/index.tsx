import AddIcon from '@mui/icons-material/Add';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import type { SelectChangeEvent } from '@mui/material/Select';
import Select from '@mui/material/Select';

const ALL_VALUE = 'all';
const NEW_VALUE = '__new__';

interface CollectionSelectPlaylist {
  id: string;
  title: string;
}

interface CollectionSelectProps {
  value: 'all' | string;
  playlists: CollectionSelectPlaylist[];
  onSelect: (value: 'all' | string) => void;
  onCreateNew: () => void;
  // Only signed-in users can create playlists; hide the option otherwise.
  canCreate?: boolean;
}

const CollectionSelect = (props: CollectionSelectProps) => {
  const { value, playlists, onSelect, onCreateNew, canCreate = true } = props;

  const handleChange = (event: SelectChangeEvent) => {
    const next = event.target.value;

    if (next === NEW_VALUE) {
      onCreateNew();
      return;
    }

    onSelect(next);
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      size="small"
      aria-label="collection"
      renderValue={(selected) => {
        if (selected === ALL_VALUE) {
          return 'All';
        }

        const playlist = playlists.find((p) => p.id === selected);
        // Surface an unknown/stale id rather than masking it as "All".
        return playlist ? playlist.title : String(selected);
      }}
    >
      <MenuItem value={ALL_VALUE}>All</MenuItem>
      {playlists.map((playlist) => (
        <MenuItem key={playlist.id} value={playlist.id}>
          {playlist.title}
        </MenuItem>
      ))}
      {canCreate && <Divider />}
      {canCreate && (
        <MenuItem value={NEW_VALUE}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>New playlist…</ListItemText>
        </MenuItem>
      )}
    </Select>
  );
};

export { CollectionSelect };
export type { CollectionSelectPlaylist, CollectionSelectProps };
