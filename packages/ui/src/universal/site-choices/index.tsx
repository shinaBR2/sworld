import { Select, MenuItem } from '@mui/material';

const sites = [
  {
    name: 'Watch',
    value: 'watch',
  },
  {
    name: 'Listen',
    value: 'listen',
  },
  {
    name: 'Play',
    value: 'play',
  },
];

const SiteChoices = () => {
  return (
    <Select defaultValue="watch" size="small" sx={{ ml: 1, minWidth: 100 }}>
      {sites.map(site => (
        <MenuItem key={site.value} value={site.value}>
          {site.name}
        </MenuItem>
      ))}
    </Select>
  );
};

export default SiteChoices;
