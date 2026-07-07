import Add from '@mui/icons-material/Add';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { ManageFeeling } from './types';

interface FeelingPickerProps {
  assignedTagIds: string[];
  feelings: ManageFeeling[];
  onAssign: (tagId: string) => void;
  onUnassign: (tagId: string) => void;
}

// Shows an audio's feelings as removable chips, plus an "Add" menu offering the
// feelings not yet assigned. The whole listen feeling vocabulary comes in via
// `feelings`; assignment is add/remove only (no tag creation here).
const FeelingPicker = (props: FeelingPickerProps) => {
  const { assignedTagIds, feelings, onAssign, onUnassign } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const assigned = feelings.filter((f) => assignedTagIds.includes(f.id));
  const available = feelings.filter((f) => !assignedTagIds.includes(f.id));

  const handleAdd = (tagId: string) => {
    onAssign(tagId);
    setAnchorEl(null);
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      sx={{ flexWrap: 'wrap', alignItems: 'center' }}
    >
      {assigned.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No feelings yet
        </Typography>
      ) : (
        assigned.map((feeling) => (
          <Chip
            key={feeling.id}
            label={feeling.name}
            size="small"
            onDelete={() => onUnassign(feeling.id)}
          />
        ))
      )}
      {available.length > 0 ? (
        <>
          <Chip
            icon={<Add />}
            label="Add feeling"
            size="small"
            variant="outlined"
            onClick={(event) => setAnchorEl(event.currentTarget)}
          />
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            {available.map((feeling) => (
              <MenuItem key={feeling.id} onClick={() => handleAdd(feeling.id)}>
                {feeling.name}
              </MenuItem>
            ))}
          </Menu>
        </>
      ) : null}
    </Stack>
  );
};

export { FeelingPicker };
