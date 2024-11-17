import CRUDPage from "../../../components/@crud-page";
import { Auth } from 'core';

import { Entity } from "core";
import db from "../../../providers/firestore";
import AudioList from "./components/AudioList";
import AudioCRUDForm from "./components/AudioCRUDForm";
const { EntityAudio } = Entity;

const { useListenEntityList, useAddEntity, useUpdateEntity, useDeleteEntity } =
  EntityAudio;

const EntityAudioPage = () => {
  const { user } = Auth.useAuthContext();

  const htmlTitle = "Entity: Audio";
  const entityName = "Audio";
  const createFunc = useAddEntity(db);
  const updateFunc = useUpdateEntity(db);
  const deleteFunc = useDeleteEntity(db);
  const buildCRUDData = (isCreate, data) => {
    const { uid } = user;

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

    return isCreate ? createData : updateData;
  };

  return (
    <CRUDPage
      htmlTitle={htmlTitle}
      entityName={entityName}
      useLoadData={useListenEntityList}
      createFunc={createFunc}
      updateFunc={updateFunc}
      deleteFunc={deleteFunc}
      buildCRUDData={buildCRUDData}
      ListComponent={AudioList}
      FormComponent={AudioCRUDForm}
    />
  );
};

export default EntityAudioPage;
