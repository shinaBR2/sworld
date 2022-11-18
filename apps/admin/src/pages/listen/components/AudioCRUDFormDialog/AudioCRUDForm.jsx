import * as yup from "yup";
import { Box, Button, Grid, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

const createSchema = yup
  .object({
    src: yup.string().required(),
    name: yup.string().required(),
    artistName: yup.string().required(),
    image: yup.string().required(),
  })
  .required();

const getDefaultValues = (data) => {
  if (!data) {
    return {
      src: "",
      name: "",
      artistName: "",
      image: "",
    };
  }

  return data;
};

const AudioCRUDForm = (props) => {
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
        name="src"
        control={control}
        render={({ field }) => (
          <TextField
            autoFocus
            margin="dense"
            id="src"
            label="Source"
            type="text"
            fullWidth
            variant="outlined"
            error={errors.src}
            helperText={errors.src && "Src is required"}
            {...field}
          />
        )}
      />
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
            error={errors.name}
            helperText={errors.name && "Name is required"}
            {...field}
          />
        )}
      />
      <Controller
        name="artistName"
        control={control}
        render={({ field }) => (
          <TextField
            autoFocus
            margin="dense"
            id="artistName"
            label="Artist name"
            type="text"
            fullWidth
            variant="outlined"
            error={errors.artistName}
            helperText={errors.artistName && "Artist name is required"}
            {...field}
          />
        )}
      />
      <Controller
        name="image"
        control={control}
        render={({ field }) => (
          <TextField
            autoFocus
            margin="dense"
            id="image"
            label="Thumbnail image"
            type="text"
            fullWidth
            variant="outlined"
            error={errors.image}
            helperText={errors.image && "Image is required"}
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

export default AudioCRUDForm;
