import CRUDPage from "../../../components/@crud-page";
import { useAuthContext } from "../../../providers/auth";

import { Entity } from "core";
import FeelingCRUDForm from "./components/FeelingCRUDForm";
import db from "../../../providers/firestore";
import FeelingList from "./components/FeelingList";
const { EntityFeeling } = Entity;

const { useListenEntityList, useAddEntity, useUpdateEntity, useDeleteEntity } =
  EntityFeeling;

const EntityFeelingPage = () => {
  const { user } = useAuthContext();

  const htmlTitle = "Entity: Feeling";
  const entityName = "Feeling";
  const createFunc = useAddEntity(db);
  const updateFunc = useUpdateEntity(db);
  const deleteFunc = useDeleteEntity(db);
  const buildCRUDData = (isCreate, data) => {
    const { uid } = user;

    const { id, name, value } = data;
    const createData = {
      name,
      value,
      creatorId: uid,
    };
    const updateData = {
      id,
      name,
      value,
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
      ListComponent={FeelingList}
      FormComponent={FeelingCRUDForm}
    />
  );
};

export default EntityFeelingPage;
