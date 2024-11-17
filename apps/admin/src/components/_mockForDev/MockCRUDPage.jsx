import { Auth } from 'core';
import CRUDPage from "../@crud-page";
import MockFormComponent from "./MockFormComponent";
import MockListComponent from "./MockListComponent";

const MockCRUDPage = () => {
  const { user } = Auth.useAuthContext();

  const htmlTitle = "Entity: Audio";
  const entityName = "Audio";
  const useLoadData = () => {
    /**
     * TODO
     *
     * Update this logic to get data from hooks
     */
    return { values: [], loading: true };
  };
  const createFunc = async () => {};
  const updateFunc = async () => {};
  const deleteFunc = async () => {};
  const buildCRUDData = (isCreate, data) => {
    /**
     * TODO
     *
     * Update this logic
     */
    console.log(isCreate);
    const { uid } = user;
    console.log(`Who did action: ${uid}`);
    return { ...data };
  };

  return (
    <CRUDPage
      htmlTitle={htmlTitle}
      entityName={entityName}
      useLoadData={useLoadData}
      createFunc={createFunc}
      updateFunc={updateFunc}
      deleteFunc={deleteFunc}
      buildCRUDData={buildCRUDData}
      ListComponent={MockListComponent}
      FormComponent={MockFormComponent}
    />
  );
};

export default MockCRUDPage;
