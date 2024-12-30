import { StyledComponent } from '@emotion/styled';
import { Card, CardProps } from '@mui/material';
import { styled } from '@mui/material/styles';
// import styled from '@emotion/styled';

interface StyledAvatarProps extends CardProps {
  isActive: boolean;
}

const StyledAvatar: StyledComponent<StyledAvatarProps> = styled(
  ({ isActive, ...props }: StyledAvatarProps) => <Card {...props} />
)<{ isActive: boolean }>(({ theme, isActive }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '50%',
  height: '150px',
  verticalAlign: 'middle',
  backgroundColor: theme.palette.grey['A200'],
  textAlign: 'center',
  cursor: 'pointer',
  border: '2px solid',
  borderColor: isActive
    ? theme.palette.primary.main
    : theme.palette.grey['A200'],
}));

export { StyledAvatar };
