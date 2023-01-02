import * as yup from "yup";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Scrollbar from "../../../components/scrollbar/Scrollbar";
import Iconify from "../../../components/iconify/Iconify";
import { useState } from "react";
import FormDialog from "./FormDialog";

const createSchema = yup
  .object({
    isGlobal: yup.boolean().required(),
    uids: yup.string().required(),
  })
  .required();

const getDefaultValues = (data) => {
  if (!data) {
    return {
      isGlobal: false,
      uids: "",
    };
  }

  return data;
};

const EmptyTableBody = () => {
  return (
    <TableBody>
      <TableRow>
        <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
          <Paper
            sx={{
              textAlign: "center",
            }}
          >
            <Typography variant="h6" paragraph>
              Not found
            </Typography>

            <Typography variant="body2">No results found</Typography>
          </Paper>
        </TableCell>
      </TableRow>
    </TableBody>
  );
};

const renderUsers = (idMap) => {
  if (!idMap) {
    return null;
  }

  const ids = Object.keys(idMap);

  return (
    <>
      {ids.map((id) => (
        <Box mx={1}>
          <Chip key={id} label={id} />
        </Box>
      ))}
    </>
  );
};

const ListenFeatureFlags = (props) => {
  const { data, onSaveSingleItem, onDelete } = props;

  console.log(data);

  const useFormInputs = {
    defaultValues: getDefaultValues(data),
    resolver: !data ? yupResolver(createSchema) : undefined,
  };
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm(useFormInputs);

  const submitLabel = !!data ? "Update" : "Create";
  const isDebug = true;

  const [open, setOpen] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  const handleOpenMenu = (featureFlagItem) => (event) => {
    setOpen(event.currentTarget);
    setActiveItem(featureFlagItem);
  };
  const handleCloseMenu = () => {
    setOpen(null);
  };
  const handleOpenForm = () => {
    handleCloseMenu();
    setOpenForm(true);
  };
  const handleCloseForm = () => {
    setOpenForm(false);
  };
  const preSaveSingleItem = (data) => {
    onSaveSingleItem(activeItem.id, data);
  };

  const isEmpty = !data.length;

  if (isDebug) {
    return (
      <>
        <Card>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="normal">Id</TableCell>
                    <TableCell>Is Global</TableCell>
                    <TableCell>Allowed users</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>

                {!isEmpty && (
                  <TableBody>
                    {data.map((f) => {
                      const { allowedUserIds } = f;

                      return (
                        <TableRow key={f.id} hover>
                          <TableCell component="th" scope="row">
                            {f.id}
                          </TableCell>
                          <TableCell align="left">
                            <Checkbox checked={f.isGlobal} />
                          </TableCell>
                          <TableCell align="left">
                            {allowedUserIds
                              ? allowedUserIds.map((id) => (
                                  <Box m={1}>
                                    <Chip key={id} label={id} />
                                  </Box>
                                ))
                              : ""}
                          </TableCell>

                          <TableCell align="right">
                            <IconButton
                              size="large"
                              color="inherit"
                              onClick={handleOpenMenu(f)}
                            >
                              <Iconify icon={"eva:more-vertical-fill"} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                )}

                {isEmpty && <EmptyTableBody />}
              </Table>
            </TableContainer>
          </Scrollbar>
        </Card>

        <Popover
          open={Boolean(open)}
          anchorEl={open}
          onClose={handleCloseMenu}
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: {
              p: 1,
              width: 140,
              "& .MuiMenuItem-root": {
                px: 1,
                typography: "body2",
                borderRadius: 0.75,
              },
            },
          }}
        >
          <MenuItem onClick={handleOpenForm}>
            <Iconify icon={"eva:edit-fill"} sx={{ mr: 2 }} />
            Edit
          </MenuItem>
        </Popover>

        <FormDialog
          open={openForm}
          onClose={handleCloseForm}
          data={activeItem}
          onConfirm={preSaveSingleItem}
        />
      </>
    );
  }

  return (
    <Card>
      <Grid
        container
        component={"form"}
        onSubmit={handleSubmit(onSubmit)}
        spacing={2}
      >
        <Controller
          name="isGlobal"
          control={control}
          render={({ field }) => (
            <Grid item xs={4}>
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
            <Grid item xs={8}>
              <TextField
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
    </Card>
  );
};

export default ListenFeatureFlags;
