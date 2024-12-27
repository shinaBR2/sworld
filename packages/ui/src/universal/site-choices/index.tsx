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

interface SiteChoicesProps {
  activeSite: string;
}

const SiteChoices = (props: SiteChoicesProps) => {
  const { activeSite } = props;

  return (
    <Select
      defaultValue={activeSite}
      size="small"
      sx={{ ml: 1, minWidth: 100 }}
    >
      {sites.map(site => (
        <MenuItem
          key={site.value}
          value={site.value}
          selected={site.value === activeSite}
        >
          {site.name}
        </MenuItem>
      ))}
    </Select>
  );
};

export default SiteChoices;
