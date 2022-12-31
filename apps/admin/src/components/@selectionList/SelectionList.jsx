import {
  List,
  ListItemButton,
  ListItemIcon,
  Checkbox,
  ListItemText,
  ListItem,
} from "@mui/material";

const SelectionList = (props) => {
  const { list, selectedIds, onChange, renderLabel } = props;
  const handleToggle = (id) => () => {
    const currentIndex = selectedIds ? selectedIds.indexOf(id) : -1;
    const newSelectedIds = selectedIds ? [...selectedIds] : [];

    if (currentIndex === -1) {
      newSelectedIds.push(id);
    } else {
      newSelectedIds.splice(currentIndex, 1);
    }

    onChange(newSelectedIds);
  };

  return (
    <List>
      {list &&
        list.map((item) => {
          const { id } = item;
          const labelId = `selection-list-label-${item}`;
          const isSelected = !!selectedIds && selectedIds.indexOf(id) !== -1;

          return (
            <ListItem key={id} disablePadding>
              <ListItemButton role={undefined} onClick={handleToggle(id)} dense>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={isSelected}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ "aria-labelledby": labelId }}
                  />
                </ListItemIcon>
                <ListItemText id={id} primary={renderLabel(item)} />
              </ListItemButton>
            </ListItem>
          );
        })}
    </List>
  );
};

export default SelectionList;
