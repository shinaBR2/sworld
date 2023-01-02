import * as React from "react";
import * as yup from "yup";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  Checkbox,
  DialogActions,
  DialogContentText,
  FormControlLabel,
  Grid,
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

const delimiter = ",";
const obj = {
  isGlobal: yup.boolean().required(),
  uids: yup.string().required(),
};
const schema = yup.object(obj).required();

const getDefaultValues = (data) => {
  if (!data) {
    return {
      isGlobal: false,
      uids: "",
    };
  }

  const { isGlobal, allowedUserIds } = data;

  return {
    isGlobal: !!isGlobal,
    uids: allowedUserIds
      ? allowedUserIds.join(delimiter).replace(/,\s*$/, "")
      : "",
  };
};

const FormComponent = (props) => {
  const { data, onConfirm } = props;
  const useFormInputs = {
    defaultValues: getDefaultValues(data),
    resolver: !data ? yupResolver(schema) : undefined,
  };
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm(useFormInputs);
  const preSubmit = (data) => {
    const { isGlobal, uids: idString } = data;
    const newData = {
      isGlobal,
      allowedUserIds: idString.split(delimiter),
    };

    onConfirm(newData);
  };

  return (
    <Grid
      container
      component={"form"}
      onSubmit={handleSubmit(preSubmit)}
      spacing={2}
    >
      <Controller
        name="isGlobal"
        control={control}
        render={({ field }) => (
          <Grid item xs={12}>
            <FormControlLabel
              value="end"
              control={<Checkbox {...field} checked={field.value} />}
              label="Is global?"
              labelPlacement="end"
            />
          </Grid>
        )}
      />
      <Controller
        name="uids"
        control={control}
        render={({ field }) => (
          <Grid item xs={12}>
            <TextField
              multiline
              maxRows={3}
              autoFocus
              margin="dense"
              label="User ids"
              type="text"
              fullWidth
              variant="outlined"
              error={!!errors.value}
              helperText={
                errors.value
                  ? "Value is required"
                  : "User ids separated by comma"
              }
              {...field}
            />
          </Grid>
        )}
      />

      <Grid item xs={12} mt={2}>
        <Grid container justifyContent="flex-end">
          <Button color="primary" type="submit">
            Save
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

const FormDialog = (props) => {
  const { open, onClose, onConfirm, data } = props;
  const title = "Edit";

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
        <FormComponent data={data} onConfirm={onConfirm} />
      </DialogContent>
    </Dialog>
  );
};

export default FormDialog;
