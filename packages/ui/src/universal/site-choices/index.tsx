import { MenuBook } from '@mui/icons-material';
import Headphones from '@mui/icons-material/Headphones';
import Home from '@mui/icons-material/Home';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import OndemandVideo from '@mui/icons-material/OndemandVideo';
import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';

const sites = [
  {
    name: 'Main',
    value: 'main',
  },
  {
    name: 'Watch',
    value: 'watch',
  },
  {
    name: 'Listen',
    value: 'listen',
  },
  {
    name: 'TIL',
    value: 'til',
  },
];

const siteIcons = {
  main: <Home fontSize="small" />,
  listen: <Headphones fontSize="small" />,
  watch: <OndemandVideo fontSize="small" />,
  til: <MenuBook fontSize="small" />,
} as const;

type SiteName = 'main' | 'listen' | 'watch' | 'til';

interface SiteChoicesProps {
  activeSite: string;
  sites: {
    main: string;
    listen: string;
    watch: string;
    til: string;
  };
}

const SiteChoices = (props: SiteChoicesProps) => {
  const { sites: siteUrls, activeSite } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const active = sites.find((site) => site.value === activeSite);
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
        aria-label="site choices"
        onClick={handleClick}
        endIcon={<KeyboardArrowDown />}
        size="small"
        sx={{ ml: 1, minWidth: 100 }}
        startIcon={siteIcons[active?.value as SiteName]}
      >
        {activeSiteName}
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {sites.map((site) => (
          <MenuItem
            key={site.value}
            component="a"
            aria-label={site.name}
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
