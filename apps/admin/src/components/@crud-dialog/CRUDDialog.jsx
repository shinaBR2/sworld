import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Button, DialogActions, DialogContentText } from "@mui/material";

const CRUDDialog = (props) => {
  const { open, onClose, onConfirm, onDelete, isCreate, data, FormComponent } =
    props;
  const title = isCreate ? "Create" : "Edit";
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {title}
        {onClose ? (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </DialogTitle>
      <DialogContent>
        {showDeleteConfirm && (
          <DialogContentText>Are you sure to delete?</DialogContentText>
        )}
        {!showDeleteConfirm && (
          <FormComponent
            data={isCreate ? null : data}
            onDelete={handleDelete}
            onConfirm={onConfirm}
          />
        )}
      </DialogContent>
      {showDeleteConfirm && (
        <DialogActions>
          <Button onClick={cancelDelete} autoFocus>
            Cancel
          </Button>
          <Button onClick={onDelete} color="error" variant="outlined">
            Yes I understand the risk!
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CRUDDialog;
