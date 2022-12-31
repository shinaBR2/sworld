import * as yup from "yup";
import { Box, Button, Grid, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

const createSchema = yup
  .object({
    name: yup.string().required(),
  })
  .required();

const getDefaultValues = (data) => {
  if (!data) {
    return {
      name: "",
    };
  }

  return data;
};

const MockFormComponent = (props) => {
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
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
        )}
      />

      <Box mt={2}>
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
      </Box>
    </form>
  );
};

export default MockFormComponent;
