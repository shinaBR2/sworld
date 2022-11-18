import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import AudioCRUDForm from "./AudioCRUDForm";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

const AudioCRUDFormDialog = (props) => {
  const { open, onClose, onConfirm, onDelete, isCreate, data } = props;
  const title = isCreate ? "Upload audio" : "Edit audio";

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
        <AudioCRUDForm
          data={isCreate ? null : data}
          onConfirm={onConfirm(isCreate)}
          onDelete={onDelete}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AudioCRUDFormDialog;
