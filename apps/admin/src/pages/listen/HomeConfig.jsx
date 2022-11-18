import pw from "a-promise-wrapper";

import { Helmet } from "react-helmet-async";
// @mui
import { Grid, Button, Container, Stack, Typography } from "@mui/material";
// components
import Iconify from "../../components/iconify";
import { BlogPostsSort, BlogPostsSearch } from "../../sections/@dashboard/blog";
// mock
import POSTS from "../../_mock/blog";
import { ListenCore } from "core";
import db from "../../providers/firestore";
import AudioCard from "./components/AudioCard";
import FullPageLoader from "../../components/@full-page-loader";
import React, { useState } from "react";
import AudioCRUDFormDialog from "./components/AudioCRUDFormDialog";
import { useAuthContext } from "../../providers/auth";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const {
  useListenHomeAudioList,
  useUploadHomeAudio,
  useUpdateHomeAudioItem,
  useDeleteHomeAudioItem,
} = ListenCore;
// ----------------------------------------------------------------------

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Popular" },
  { value: "oldest", label: "Oldest" },
];

// ----------------------------------------------------------------------

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function ListenHomeConfig() {
  const { user } = useAuthContext();
  const { values: audioList, loading } = useListenHomeAudioList(db);
  const [showForm, setShowForm] = useState(false);
  const [isCreate, setIsCreate] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [activeEditItem, setActiveEditItem] = useState();
  const createFunc = useUploadHomeAudio(db);
  const updateFunc = useUpdateHomeAudioItem(db);
  const deleteFunc = useDeleteHomeAudioItem(db);
  const { uid } = user;

  const handleCloseSuccess = () => setShowSuccess(false);
  const handleCloseError = () => setShowError(false);

  const onClickCreate = () => {
    setIsCreate(true);
    setShowForm(true);
  };

  const onClickEdit = (audioItem) => {
    // TODO
    setActiveEditItem(audioItem);
    setIsCreate(false);
    setShowForm(true);
  };

  const onCRUD = (isCreate) => async (data) => {
    const { id, src, name, artistName, image } = data;
    const createData = {
      src,
      name,
      artistName,
      image,
      uploaderId: uid,
    };
    const updateData = {
      id,
      src,
      name,
      artistName,
      image,
      editorId: uid,
    };
    const inputs = isCreate ? createData : updateData;
    const func = isCreate ? createFunc : updateFunc;

    const { error } = await pw(func(inputs));

    if (error) {
      return setShowError(true);
    }

    setShowSuccess(true);
    setShowForm(false);
  };

  const onDelete = async () => {
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
        <title> Listen: Home page configuration </title>
      </Helmet>

      <Container>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={5}
        >
          <Typography variant="h4" gutterBottom>
            Blog
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={onClickCreate}
          >
            New Audio
          </Button>
        </Stack>

        <Stack
          mb={5}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <BlogPostsSearch posts={POSTS} />
          <BlogPostsSort options={SORT_OPTIONS} />
        </Stack>

        <Grid container spacing={3}>
          {audioList &&
            audioList.map((audio, index) => (
              <AudioCard
                onEdit={onClickEdit}
                key={audio.id}
                audio={audio}
                index={index}
              />
            ))}
        </Grid>

        {showForm && (
          <AudioCRUDFormDialog
            open={showForm}
            onClose={() => setShowForm(false)}
            onConfirm={onCRUD}
            onDelete={onDelete}
            isCreate={isCreate}
            data={activeEditItem}
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
              Success!
            </Alert>
          </Snackbar>
        )}
      </Container>
    </>
  );
}
