import {
  Headphones,
  KeyboardArrowDown,
  Link,
  OndemandVideo,
  PlayCircle,
} from '@mui/icons-material';
import {
  Select,
  MenuItem,
  Button,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useState } from 'react';

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

const siteIcons = {
  listen: <Headphones fontSize="small" />,
  watch: <OndemandVideo fontSize="small" />,
  play: <PlayCircle fontSize="small" />,
} as const;

type SiteName = 'listen' | 'watch' | 'play';

interface SiteChoicesProps {
  activeSite: string;
  sites: {
    listen: string;
    watch: string;
    play: string;
  };
}

const SiteChoices = (props: SiteChoicesProps) => {
  const { sites: siteUrls, activeSite } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const active = sites.find(site => site.value === activeSite);
  const activeSiteName = active?.name;
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        endIcon={<KeyboardArrowDown />}
        size="small"
        sx={{ ml: 1, minWidth: 100 }}
        startIcon={siteIcons[active?.value as SiteName]}
      >
        {activeSiteName}
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {sites.map(site => (
          <MenuItem
            key={site.value}
            component="a"
            href={siteUrls[site.value as SiteName]}
            selected={site.value === activeSite}
          >
            <ListItemIcon>{siteIcons[site.value as SiteName]}</ListItemIcon>
            <ListItemText>{site.name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default SiteChoices;
