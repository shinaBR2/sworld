import * as React from "react";
import CRUDDialog from "../../../../components/@crud-dialog/CRUDDialog";
import FeelingCRUDForm from "./FeelingCRUDForm";

const FeelingCRUDFormDialog = (props) => {
  const { open, onClose, onConfirm, onDelete, isCreate, data } = props;

  return (
    <CRUDDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm(isCreate)}
      onDelete={onDelete}
      isCreate={isCreate}
      data={data}
      FormComponent={FeelingCRUDForm}
    />
  );
};

export default FeelingCRUDFormDialog;
