import { Helmet } from "react-helmet-async";
import { Alert, Button, Container, Stack, Typography } from "@mui/material";
import db from "../../providers/firestore";
import React, { useEffect, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import SelectionList from "../../components/@selectionList";
import { Entity, ListenCore } from "core";
import pw from "a-promise-wrapper";
import { LoadingButton } from "@mui/lab";
import { callable } from "../../firebase";

const { EntityFeeling } = Entity;
const { useListenHomeFeelingList } = ListenCore;
const { useListenEntityList } = EntityFeeling;

const ListenHomeConfigFeelingList = () => {
  const { values: feelingList } = useListenEntityList(db);
  const { values: homeFeelingList } = useListenHomeFeelingList(db);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedIds, setSelectedIds] = useState();

  const renderLabel = (item) => {
    const { value } = item;

    return value;
  };

  const onSave = async () => {
    const feelings = selectedIds.map((id) => {
      const item = feelingList.find((f) => f.id === id);

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
      feelings: feelings.filter(Boolean),
    };

    setIsSaving(true);

    const { data, error } = await pw(
      callable("admin-listen-homepage-saveFeelings", inputs)
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
    const ids = homeFeelingList ? homeFeelingList.map((f) => f.id) : [];
    setSelectedIds(ids);
  }, [homeFeelingList]);

  const handleCloseSuccess = () => setShowSuccess(false);
  const handleCloseError = () => setShowError(false);

  return (
    <>
      <Helmet>
        <title> Listen: Home page feeling list </title>
      </Helmet>

      <Container>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={5}
        >
          <Typography variant="h4" gutterBottom>
            Homepage feeling list
          </Typography>
        </Stack>

        <SelectionList
          list={feelingList}
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

export default ListenHomeConfigFeelingList;
