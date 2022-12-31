import pw from "a-promise-wrapper";

import { Helmet } from "react-helmet-async";
// @mui
import { Button, Container, Stack, Typography } from "@mui/material";
// components
import Iconify from "../../components/iconify";
// mock
import db from "../../providers/firestore";
import FullPageLoader from "../../components/@full-page-loader";
import React, { useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import CRUDDialog from "../@crud-dialog/CRUDDialog";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const CRUDPage = (props) => {
  const {
    htmlTitle,
    entityName,
    useLoadData,
    ListComponent,
    FormComponent,
    createFunc,
    updateFunc,
    deleteFunc,
    buildCRUDData,
  } = props;
  const { values, loading } = useLoadData(db);

  const [showForm, setShowForm] = useState(false);
  const [isCreate, setIsCreate] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [activeEditItem, setActiveEditItem] = useState();

  const handleCloseSuccess = () => setShowSuccess(false);
  const handleCloseError = () => setShowError(false);

  const onClickCreate = () => {
    setIsCreate(true);
    setShowForm(true);
  };

  const onClickEdit = (item) => {
    // TODO
    setActiveEditItem(item);
    setIsCreate(false);
    setShowForm(true);
  };

  const onCRUD = async (data) => {
    const inputs = buildCRUDData(isCreate, data);
    const func = isCreate ? createFunc : updateFunc;

    const { error } = await pw(func(inputs));

    if (error) {
      console.error(error);
      return setShowError(true);
    }

    setShowSuccess(true);
    setShowForm(false);
  };

  const onDelete = async () => {
    // TODO
    const { id } = activeEditItem;

    if (!id) {
      return;
    }

    const { error } = await pw(deleteFunc(id));

    if (error) {
      return setShowError(true);
    }

    setShowSuccess(true);
    setShowForm(false);
  };

  if (loading) {
    return <FullPageLoader open={loading} />;
  }

  return (
    <>
      <Helmet>
        <title>{htmlTitle}</title>
      </Helmet>

      <Container>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={5}
        >
          <Typography variant="h4" gutterBottom>
            {`${entityName} list`}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={onClickCreate}
          >
            {`New ${entityName}`}
          </Button>
        </Stack>

        {/* <Stack
          mb={5}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <BlogPostsSearch posts={POSTS} />
          <BlogPostsSort options={SORT_OPTIONS} />
        </Stack> */}
        <ListComponent data={values} onClickEdit={onClickEdit} />

        {showForm && (
          <CRUDDialog
            open={showForm}
            onClose={() => setShowForm(false)}
            onConfirm={onCRUD}
            onDelete={onDelete}
            isCreate={isCreate}
            data={activeEditItem}
            FormComponent={FormComponent}
          />
        )}

        {showSuccess && (
          <Snackbar
            open={showSuccess}
            autoHideDuration={6000}
            onClose={handleCloseSuccess}
          >
            <Alert
              onClose={handleCloseSuccess}
              severity="success"
              sx={{ width: "100%" }}
            >
              Success!
            </Alert>
          </Snackbar>
        )}
        {showError && (
          <Snackbar
            open={showError}
            autoHideDuration={6000}
            onClose={handleCloseError}
          >
            <Alert
              onClose={handleCloseError}
              severity="error"
              sx={{ width: "100%" }}
            >
              Error!
            </Alert>
          </Snackbar>
        )}
      </Container>
    </>
  );
};

export default CRUDPage;
