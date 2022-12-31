// @mui
import { Alert, Container, Stack, Typography } from "@mui/material";
// components
// mock
import { Entity, ListenCore } from "core";
import db from "../../providers/firestore";
import React, { useEffect, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import { Helmet } from "react-helmet-async";
import pw from "a-promise-wrapper";
import SelectionList from "../../components/@selectionList";
import { LoadingButton } from "@mui/lab";
import { callable } from "../../firebase";

const { EntityAudio } = Entity;
const { useListenHomeAudioList } = ListenCore;
const { useListenEntityList } = EntityAudio;

// ----------------------------------------------------------------------

const ListenHomeConfigAudioList = () => {
  const { values: audioList } = useListenEntityList(db);
  const { values: homeAudioList } = useListenHomeAudioList(db);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedIds, setSelectedIds] = useState();

  const renderLabel = (item) => {
    const { name, artistName } = item;

    return `${name} - by ${artistName}`;
  };

  const onSave = async () => {
    const audios = selectedIds.map((id) => {
      const item = audioList.find((f) => f.id === id);

      if (!item) {
        return undefined;
      }

      const { id: _id, ...rest } = item;

      return {
        id,
        value: rest,
      };
    });
    const inputs = {
      audios: audios.filter(Boolean),
    };

    setIsSaving(true);

    console.log(inputs);

    const { data, error } = await pw(
      callable("admin-listen-homepage-saveAudios", inputs)
    );

    if (error) {
      setShowError(true);
      setIsSaving(false);
      return console.error(error);
    }

    console.log(`success: ${JSON.stringify(data)}`);
    setShowSuccess(true);
    setIsSaving(false);
  };

  useEffect(() => {
    const ids = homeAudioList ? homeAudioList.map((f) => f.id) : [];
    setSelectedIds(ids);
  }, [homeAudioList]);

  const handleCloseSuccess = () => setShowSuccess(false);
  const handleCloseError = () => setShowError(false);

  return (
    <>
      <Helmet>
        <title> Listen: Home page audio list </title>
      </Helmet>

      <Container>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={5}
        >
          <Typography variant="h4" gutterBottom>
            Homepage audio list
          </Typography>
        </Stack>

        <SelectionList
          list={audioList}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
          renderLabel={renderLabel}
        />
        <LoadingButton
          loading={isSaving}
          variant="contained"
          // startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={onSave}
        >
          Save
        </LoadingButton>

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

export default ListenHomeConfigAudioList;
