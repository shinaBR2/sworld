import * as React from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import { StyledAvatar } from './Styled';

export interface ChooseAvatarProps {
  open: boolean;
  onSubmit: (value: string) => void;
}

const ChooseAvatar = (props: ChooseAvatarProps) => {
  const { open, onSubmit } = props;
  const [selectedAvatar, setSelectedAvatar] = React.useState('');

  const handleSelect = (gender: string) => {
    setSelectedAvatar(gender);
  };

  const handleSubmit = () => {
    if (selectedAvatar) {
      onSubmit(selectedAvatar);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogTitle>Select Avatar</DialogTitle>

        <Stack direction="row" spacing={2}>
          <StyledAvatar isActive={selectedAvatar == 'male'} onClick={() => handleSelect('male')}>
            <img src="/assets/male.png" alt="Male" />
          </StyledAvatar>
          <StyledAvatar isActive={selectedAvatar == 'female'} onClick={() => handleSelect('female')}>
            <img src="/assets/female.png" alt="Female" />
          </StyledAvatar>
        </Stack>

        <DialogActions>
          <Button variant="contained" fullWidth onClick={handleSubmit} disabled={!selectedAvatar}>
            Explore the world
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default ChooseAvatar;
