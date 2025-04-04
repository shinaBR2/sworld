import MenuItem, { MenuItemProps } from '@mui/material/MenuItem';
import Typography, { TypographyProps } from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

const NotificationMenuItem = styled(MenuItem, {
  shouldForwardProp: prop => prop !== 'isRead',
})<{ isRead: boolean }>(({ isRead, theme }) => ({
  whiteSpace: 'normal',
  backgroundColor: isRead ? 'inherit' : theme.palette.action.hover,
})) as React.ComponentType<MenuItemProps & { isRead: boolean }>;

const NotificationBox = styled(Box)(() => ({
  padding: '8px 0',
})) as typeof Box;

const NotificationTitle = styled(Typography, {
  shouldForwardProp: prop => prop !== 'isRead',
})<{ isRead: boolean }>(({ isRead }) => ({
  fontWeight: isRead ? 'normal' : 'bold',
})) as React.ComponentType<TypographyProps & { isRead: boolean }>;

const NotificationMessage = styled(Typography)(() => ({
  variant: 'body2',
  color: 'text.secondary',
})) as typeof Typography;

export { NotificationMenuItem, NotificationBox, NotificationTitle, NotificationMessage };
