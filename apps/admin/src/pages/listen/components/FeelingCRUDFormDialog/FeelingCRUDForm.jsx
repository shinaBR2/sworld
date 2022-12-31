import * as yup from "yup";
import { Box, Button, Grid, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

const createSchema = yup
  .object({
    name: yup.string().required(),
    value: yup.string().required(),
  })
  .required();

const getDefaultValues = (data) => {
  if (!data) {
    return {
      name: "",
      value: "",
    };
  }

  return data;
};

const FeelingCRUDForm = (props) => {
  const { data, onConfirm, onDelete } = props;
  const useFormInputs = {
    defaultValues: getDefaultValues(data),
    resolver: !data ? yupResolver(createSchema) : undefined,
  };
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm(useFormInputs);
  const onSubmit = (data) => {
    onConfirm(data);
  };

  const submitLabel = !!data ? "Update" : "Create";

  return (
    <Grid
      container
      component={"form"}
      onSubmit={handleSubmit(onSubmit)}
      spacing={2}
    >
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <Grid item xs={6}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Name"
              type="text"
              fullWidth
              variant="outlined"
              error={!!errors.name}
              helperText={errors.name && "Name is required"}
              {...field}
            />
          </Grid>
        )}
      />
      <Controller
        name="value"
        control={control}
        render={({ field }) => (
          <Grid item xs={6}>
            <TextField
              autoFocus
              margin="dense"
              id="value"
              label="Value"
              type="text"
              fullWidth
              variant="outlined"
              error={!!errors.value}
              helperText={errors.value && "Value is required"}
              {...field}
            />
          </Grid>
        )}
      />

      <Grid item mt={2}>
        <Grid container justifyContent="space-between">
          {data && (
            <Button color="error" onClick={onDelete}>
              Delete
            </Button>
          )}
          <Button color="primary" type="submit">
            {submitLabel}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default FeelingCRUDForm;
