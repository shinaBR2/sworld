import React from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import {
  LibraryBooks as LibraryIcon,
  MenuBook as ReadingIcon,
  Favorite as WishlistIcon,
  BarChart as StatsIcon,
} from '@mui/icons-material';
import { useIsMobile } from '../../../universal/responsive';

interface MobileNavigationProps {
  value?: number;
  onChange?: (value: number) => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = props => {
  const { value = 0, onChange } = props;

  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <BottomNavigation
      value={value}
      onChange={(_, newValue) => onChange?.(newValue)}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: 1,
        borderColor: 'divider',
        zIndex: 1000,
      }}
    >
      <BottomNavigationAction label="Library" icon={<LibraryIcon />} />
      <BottomNavigationAction label="Reading" icon={<ReadingIcon />} />
      <BottomNavigationAction label="Wishlist" icon={<WishlistIcon />} />
      <BottomNavigationAction label="Stats" icon={<StatsIcon />} />
    </BottomNavigation>
  );
};

export { MobileNavigation };
