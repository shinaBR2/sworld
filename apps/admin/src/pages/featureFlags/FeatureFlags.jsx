import { Helmet } from "react-helmet-async";
import { Container, Box, Tabs, Tab, Snackbar, Alert } from "@mui/material";
import React, { useState } from "react";
import ListenFeatureFlags from "./Listen";
import { Entity } from "core";
import db from "../../providers/firestore";
import FullPageLoader from "../../components/@full-page-loader";
import pw from "a-promise-wrapper";
import { useAuthContext } from "../../providers/auth";

const { useListenFeatureFlag, useSaveFeatureFlag } = Entity.EntityFeatureFlag;

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const FeatureFlags = () => {
  const { user } = useAuthContext();
  const [tabValue, setTabValue] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCloseSuccess = () => setShowSuccess(false);
  const handleCloseError = () => setShowError(false);

  const handleChange = (_event, newValue) => {
    setTabValue(newValue);
  };

  const pathConfig = {
    path: "configs",
    pathSegments: ["listen", "features"],
  };
  const { values: listenData, loading: listenLoading } = useListenFeatureFlag(
    db,
    pathConfig
  );
  const saveFunc = useSaveFeatureFlag(db, pathConfig);

  const onSaveSingleItem = async (id, data) => {
    const { uid } = user;

    const newData = {
      ...data,
      editorId: uid,
    };

    const { error } = await pw(saveFunc(id, newData));

    if (error) {
      setShowError(true);
      return console.error(error);
    }

    setShowSuccess(true);
  };

  if (listenLoading) {
    return <FullPageLoader open={listenLoading} />;
  }

  return (
    <>
      <Helmet>
        <title> Feature Flag Configuration </title>
      </Helmet>
      <Container maxWidth="xl">
        <h1>Feature flag configuration</h1>

        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleChange}>
              <Tab label="Listen" />
              <Tab label="Coming soon" disabled />
            </Tabs>
          </Box>
          <TabPanel value={tabValue} index={0}>
            <ListenFeatureFlags
              data={listenData}
              onSaveSingleItem={onSaveSingleItem}
            />
          </TabPanel>
        </Box>

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

export default FeatureFlags;
